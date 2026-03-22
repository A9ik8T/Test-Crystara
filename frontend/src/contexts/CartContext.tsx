import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subCategory?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOCAL_KEY = "crystara-cart";

function readLocal(): CartItem[] {
  try {
    const s = localStorage.getItem(LOCAL_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function writeLocal(items: CartItem[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); } catch { /* quota */ }
}

// ─── FIX #5: Cross-device cart sync via Supabase ─────────────────────────────
// BEFORE: Cart only lived in localStorage – empty on every new device/browser.
// FIX:    When a user is logged in their cart is stored in a `carts` table in
//         Supabase (one row per user_id).  Local storage is still used as a
//         fast offline cache so the cart loads instantly on first render.
//
// MIGRATION: run this SQL in your Supabase dashboard once:
//   CREATE TABLE IF NOT EXISTS carts (
//     user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
//     items   JSONB NOT NULL DEFAULT '[]',
//     updated_at TIMESTAMPTZ DEFAULT now()
//   );
//   ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Users can only access their own cart"
//     ON carts FOR ALL USING (auth.uid() = user_id);

async function loadRemoteCart(userId: string): Promise<CartItem[] | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data.items as CartItem[];
}

async function saveRemoteCart(userId: string, items: CartItem[]) {
  await supabase.from("carts").upsert(
    { user_id: userId, items, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readLocal);
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth state so we know whether to sync remotely
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // When the user logs in, merge local cart with remote cart
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const remote = await loadRemoteCart(userId);
      if (remote && remote.length > 0) {
        setItems((local) => {
          // Merge: remote is the source of truth, but keep local-only items
          const merged = [...remote];
          for (const localItem of local) {
            if (!merged.find((r) => r.id === localItem.id)) merged.push(localItem);
          }
          writeLocal(merged);
          return merged;
        });
      } else {
        // First login on this device – push local cart to remote
        setItems((local) => {
          if (local.length > 0) saveRemoteCart(userId, local);
          return local;
        });
      }
    })();
  }, [userId]);

  // Persist every cart change
  const persist = useCallback(
    (newItems: CartItem[]) => {
      writeLocal(newItems);
      if (userId) saveRemoteCart(userId, newItems);
    },
    [userId]
  );

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const next = existing
        ? prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...item, quantity }];
      persist(next);
      toast.success(existing ? `Updated quantity for ${item.name}` : `${item.name} added to cart`);
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) toast.info(`${item.name} removed from cart`);
      const next = prev.filter((i) => i.id !== id);
      persist(next);
      return next;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    setItems((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, quantity } : i);
      persist(next);
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    persist([]);
    toast.info("Cart cleared");
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
