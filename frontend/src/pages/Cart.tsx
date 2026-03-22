import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShoppingBag, Minus, Plus, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

declare global {
  interface Window { Razorpay?: any; }
}

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const shippingFee = totalPrice >= 999 ? 0 : 99;
  const displayTotal = totalPrice + shippingFee;

  const handleCheckout = async () => {
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    if (!user) {
      toast.error("Please sign in to complete your purchase");
      navigate("/auth");
      return;
    }

    setIsCheckingOut(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Unable to load Razorpay. Please try again.");
        return;
      }

      // ─── FIX #4: Send item IDs + quantities only – NO client-computed price ─
      // BEFORE: body: JSON.stringify({ amount: grandTotal, ... })
      //         → a user could open DevTools and change grandTotal to ₹1
      // FIX:    Server receives item IDs and re-calculates the price itself
      //         from the database. The client cannot manipulate the total.
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          currency: "INR",
          notes: { user_email: user.email },
        }),
      });

      const order = await response.json();

      if (!response.ok || !order?.id) {
        toast.error(order?.error || "Failed to start payment. Please try again.");
        return;
      }

      // Use the server-verified amount (not our local total)
      const verifiedAmount = order.verified_amount ?? displayTotal;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,          // server-computed, in paise
        currency: order.currency,
        name: "Crystara",
        description: "Crystal purchase",
        order_id: order.id,
        prefill: { email: user.email ?? "" },
        theme: { color: "#7C3AED" },
        handler: async (razorpayResponse: any) => {
          try {
            // 1. Verify signature
            const verifyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.valid) {
              toast.error("Payment verification failed. Contact support if charged.");
              return;
            }

            // 2. Fetch shipping address
            let shippingAddress = {};
            try {
              const profileRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile`, {
                headers: { Authorization: `Bearer ${session?.access_token}` },
              });
              if (profileRes.ok) {
                const { profile: p } = await profileRes.json();
                if (p?.address_street)
                  shippingAddress = { street: p.address_street, city: p.address_city, state: p.address_state, zip: p.address_pincode };
              }
            } catch { /* non-critical */ }

            // 3. Save order (amount comes from server-verified total, not client)
            const saveRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                orderId: razorpayResponse.razorpay_order_id,
                paymentId: razorpayResponse.razorpay_payment_id,
                amount: Math.round(verifiedAmount * 100),
                items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                shippingAddress,
                status: "completed",
              }),
            });
            if (!saveRes.ok) console.error("Failed to save order record");

            toast.success("Payment successful! Thank you for your purchase.");
            clearCart();
            navigate("/orders");
          } catch (error) {
            console.error(error);
            toast.error("Something went wrong while verifying your payment.");
          }
        },
        modal: { ondismiss: () => toast.info("Payment cancelled") },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while initiating payment.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-center mb-3">
            Your <span className="text-gradient-mystic">Cart</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8 md:mb-12 text-sm md:text-base">
            Review your selected crystals before checkout
          </p>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 md:py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6 text-sm">Discover our collection of healing crystals</p>
              <Link to="/shop"><Button className="gap-2">Continue Shopping <ArrowRight size={18} /></Button></Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex gap-3 md:gap-4 p-3 md:p-4 bg-card rounded-xl border border-border">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <p className="text-[10px] md:text-xs text-muted-foreground uppercase">{item.category}</p>
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-serif font-semibold text-sm md:text-base truncate hover:text-primary">{item.name}</h3>
                          </Link>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => removeFromCart(item.id)}>
                          <X size={14} />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-md">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={12} /></Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={12} /></Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-sm md:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                          {item.originalPrice && <p className="text-xs text-muted-foreground line-through">₹{(item.originalPrice * item.quantity).toLocaleString()}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive text-xs">
                  Clear Cart
                </Button>
              </div>

              <div className="bg-card p-5 md:p-6 rounded-xl border border-border h-fit sticky top-24">
                <h3 className="text-lg font-serif font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary">{totalPrice >= 999 ? "Free" : "₹99"}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary text-lg">₹{displayTotal.toLocaleString()}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">Free shipping on orders above ₹999</p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
