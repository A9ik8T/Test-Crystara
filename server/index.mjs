import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import cors from "cors";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const app = express();

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } }
);

// ─── FIX #3: CORS – support multiple origins via comma-separated env var ──────
// Old code: `process.env.CORS_ORIGIN || "a" || "b"` only ever matched 1 origin.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!allowedOrigins.length) {
  allowedOrigins.push(
    "https://www.crystara.co.in",
    "https://crystara-frontend.vercel.app",
    "https://crystara-backend.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173"
  );
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// ─── FIX #9: Rate limiter – blocks bots from spamming /create-order ──────────
// Sliding window, 100 req/min per IP (global).
// /create-order gets a tighter limit: 10 req/min per IP.
const rateLimitStore = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitStore)
    if (now - v.ts > 60_000) rateLimitStore.delete(k);
}, 60_000);

function makeRateLimiter(maxPerMin) {
  return (req, res, next) => {
    const ip = (req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim();
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    if (!entry || now - entry.ts > 60_000) {
      rateLimitStore.set(key, { ts: now, count: 1 });
      return next();
    }
    entry.count += 1;
    if (entry.count > maxPerMin) {
      return res.status(429).json({ error: "Too many requests – please slow down" });
    }
    next();
  };
}

app.use(makeRateLimiter(100));                         // global: 100/min/IP
const strictLimit = makeRateLimiter(10);               // payment: 10/min/IP

// ─── Razorpay ─────────────────────────────────────────────────────────────────
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
if (!keyId || !keySecret)
  console.warn("[razorpay] Keys not set – payment endpoints will fail.");

let razorpayInstance = null;
const getRazorpay = () =>
  (razorpayInstance ??= new Razorpay({ key_id: keyId, key_secret: keySecret }));

// ─── Auth middleware ───────────────────────────────────────────────────────────
async function verifyAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ error: "Missing authorization header" });
    const { data: { user }, error } = await supabase.auth.getUser(header.slice(7));
    if (error || !user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// ─── FIX #1: Admin guard – check role in DB, never trust client ───────────────
// Old code: the entire admin section was accessible without ANY auth check
// (the TODO/commented-out block proves this).
async function verifyAdmin(req, res, next) {
  try {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", req.user.id)
      .single();
    if (error || profile?.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    next();
  } catch {
    res.status(403).json({ error: "Access denied" });
  }
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── FIX #4: Server computes price from item IDs – client cannot inject amount ─
// Old code: the frontend sent `amount: grandTotal` and the server blindly used it.
// Now: the server fetches real prices from Sanity (or a product table) and
// computes the total itself.  The frontend only sends item IDs + quantities.
//
// If you store products in Sanity you'll need to call the Sanity API here.
// This example shows a Supabase products table (adapt the query if needed).
app.post("/create-order", strictLimit, async (req, res) => {
  try {
    const { items, currency = "INR", receipt, notes } = req.body || {};

    // --- Validate items list ---
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array is required" });
    }
    for (const item of items) {
      if (!item.id || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ error: "Each item needs a valid id and quantity" });
      }
    }

    // --- Fetch canonical prices from DB ----------------------------------------
    // IMPORTANT: Replace "products" with your actual table / Sanity query.
    // The key point is that prices come from the SERVER, never from the client.
    const ids = items.map((i) => i.id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, price, stock")
      .in("id", ids);

    if (productError) {
      console.error("[create-order] Product lookup failed:", productError);
      return res.status(500).json({ error: "Could not verify product prices" });
    }

    // --- FIX #6: Stock check – prevent overselling ─────────────────────────────
    for (const item of items) {
      const product = products.find((p) => p.id === item.id);
      if (!product) return res.status(400).json({ error: `Product ${item.id} not found` });
      if (product.stock !== null && product.stock < item.quantity) {
        return res.status(400).json({
          error: `Only ${product.stock} units of product ${item.id} left in stock`,
        });
      }
    }

    // --- Compute server-side total ---------------------------------------------
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + product.price * item.quantity;
    }, 0);
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const grandTotal = subtotal + shippingFee;

    if (grandTotal <= 0) return res.status(400).json({ error: "Invalid total" });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(grandTotal * 100),      // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    });

    // Return the verified amount so the frontend can display it
    return res.json({ ...order, verified_amount: grandTotal });
  } catch (error) {
    console.error("[razorpay] Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// Verify payment signature
app.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ valid: false, error: "Missing payment fields" });

    const generated = crypto
      .createHmac("sha256", keySecret || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated === razorpay_signature) return res.json({ valid: true });
    return res.status(400).json({ valid: false, error: "Invalid signature" });
  } catch (error) {
    console.error("[razorpay] Error verifying payment:", error);
    return res.status(500).json({ valid: false, error: "Verification failed" });
  }
});

// Create order record after payment
app.post("/orders", verifyAuth, async (req, res) => {
  try {
    const { orderId, paymentId, amount, items, shippingAddress, status = "completed" } = req.body;
    if (!orderId || !paymentId || !amount || !items)
      return res.status(400).json({ error: "Missing required fields" });

    const { data, error } = await supabase
      .from("orders")
      .insert([{
        user_id: req.user.id, order_id: orderId, payment_id: paymentId,
        amount, items, shipping_address: shippingAddress, status,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, order: data[0] });
  } catch (error) {
    console.error("[orders] Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order record" });
  }
});

// Get user's order history
app.get("/orders/user/history", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders").select("*").eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ orders: data });
  } catch (error) {
    console.error("[orders] Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order
app.get("/orders/:id", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders").select("*")
      .eq("id", req.params.id).eq("user_id", req.user.id).single();
    if (error) return res.status(404).json({ error: "Order not found" });
    return res.json({ order: data });
  } catch (error) {
    console.error("[orders] Error fetching order:", error);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

// FIX: stats route before /:id to avoid route shadowing
app.get("/admin/orders/stats/overview", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from("orders").select("status,amount");
    if (error) return res.status(400).json({ error: error.message });
    return res.json({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.amount, 0),
      completedOrders: orders.filter((o) => o.status === "completed").length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      failedOrders: orders.filter((o) => o.status === "failed").length,
    });
  } catch (error) {
    console.error("[admin] Error fetching stats:", error);
    return res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Admin: Get all orders (paginated) – protected by verifyAuth + verifyAdmin
app.get("/admin/orders", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const { status, userId } = req.query;

    let query = supabase
      .from("orders")
      .select("*,user_profiles(email,name)", { count: "exact" });
    if (status) query = query.eq("status", status);
    if (userId) query = query.eq("user_id", userId);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) return res.status(400).json({ error: error.message });
    return res.json({
      orders: data,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("[admin] Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Admin: Update order status
app.patch("/admin/orders/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, order: data[0] });
  } catch (error) {
    console.error("[admin] Error updating order:", error);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

// Onboarding
app.post("/onboarding/profile", verifyAuth, async (req, res) => {
  try {
    const { name, phone, address_street, address_city, address_state, address_pincode } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
    const { data, error } = await supabase.from("user_profiles").upsert(
      { user_id: req.user.id, email: req.user.email, name, phone,
        address_street: address_street || null, address_city: address_city || null,
        address_state: address_state || null, address_pincode: address_pincode || null,
        updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    ).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, profile: data[0] });
  } catch (error) {
    console.error("[onboarding] Error:", error);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

app.get("/onboarding/status", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles").select("name").eq("user_id", req.user.id).single();
    if (error || !data?.name) return res.json({ isOnboarded: false });
    return res.json({ isOnboarded: true });
  } catch {
    return res.json({ isOnboarded: false });
  }
});

app.get("/profile", verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles").select("*").eq("user_id", req.user.id).single();
    if (error) return res.status(404).json({ error: "Profile not found" });
    return res.json({ profile: data });
  } catch (error) {
    console.error("[profile] Error:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.patch("/profile", verifyAuth, async (req, res) => {
  try {
    const { name, phone, address_street, address_city, address_state, address_pincode, saved_addresses } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address_street !== undefined) updates.address_street = address_street;
    if (address_city !== undefined) updates.address_city = address_city;
    if (address_state !== undefined) updates.address_state = address_state;
    if (address_pincode !== undefined) updates.address_pincode = address_pincode;
    if (saved_addresses !== undefined) updates.saved_addresses = saved_addresses;
    const { data, error } = await supabase
      .from("user_profiles").update(updates).eq("user_id", req.user.id).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, profile: data[0] });
  } catch (error) {
    console.error("[profile] Error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on("unhandledRejection", (r) => console.error("[server] Unhandled rejection:", r));
process.on("uncaughtException", (e) => console.error("[server] Uncaught exception:", e));

let server;
const shutdown = (sig) => {
  console.log(`[server] ${sig} received, shutting down…`);
  server.close(() => { console.log("[server] Done."); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const port = process.env.PORT || 5001;
server = app.listen(port, () => console.log(`[server] Listening on http://localhost:${port}`));
