"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  cartItemCount,
  cartSubtotal,
  normalizeQuantity,
  readStoredCart,
  setCartLineQuantity,
  upsertCartLine,
  writeStoredCart,
  type CartLine,
} from "@/lib/cart";

type CartContextValue = {
  items: CartLine[];
  ready: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => number;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStoredCart(items);
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      itemCount: cartItemCount(items),
      subtotal: cartSubtotal(items),
      addItem(item, quantity = 1) {
        const existing = items.find((line) => line.sku === item.sku);
        const nextQuantity = (existing?.quantity ?? 0) + normalizeQuantity(quantity);
        setItems((current) => upsertCartLine(current, { ...item, quantity }));
        return nextQuantity;
      },
      updateQuantity(sku, quantity) {
        setItems((current) => setCartLineQuantity(current, sku, quantity));
      },
      removeItem(sku) {
        setItems((current) => current.filter((line) => line.sku !== sku));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
