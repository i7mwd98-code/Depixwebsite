"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";
import { MAX_QUANTITY, priceLines } from "@/lib/pricing";

const STORAGE_KEY = "bind-cart-v1";

type CartContext = {
  lines: CartLine[];
  /** False until the saved cart has been read from the browser. */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQuantity: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);

const sameLine = (a: CartLine, b: CartLine) =>
  a.productId === b.productId && a.variantId === b.variantId && (a.inscription ?? "") === (b.inscription ?? "");

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser storage after hydration
      if (saved) setLines(priceLines(JSON.parse(saved)).map(({ productId, variantId, quantity, inscription }) => ({
          productId,
          variantId,
          quantity,
          ...(typeof inscription === "string" && inscription ? { inscription: inscription.slice(0, 40) } : {}),
        })));
    } catch {
      // A broken or unavailable saved cart is ignored.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage may be unavailable (private mode); the cart still works for this visit.
    }
  }, [lines, ready]);

  const add = useCallback((line: CartLine) => {
    setLines((current) => {
      const index = current.findIndex((l) => sameLine(l, line));
      if (index === -1) return [...current, line];
      return current.map((l, i) =>
        i === index ? { ...l, quantity: Math.min(l.quantity + line.quantity, MAX_QUANTITY) } : l,
      );
    });
  }, []);

  const setQuantity = useCallback((index: number, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((_, i) => i !== index)
        : current.map((l, i) => (i === index ? { ...l, quantity: Math.min(quantity, MAX_QUANTITY) } : l)),
    );
  }, []);

  const remove = useCallback((index: number) => setLines((c) => c.filter((_, i) => i !== index)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContext>(() => {
    const priced = priceLines(lines);
    return {
      lines,
      ready,
      count: priced.reduce((n, l) => n + l.quantity, 0),
      subtotal: priced.reduce((n, l) => n + l.lineTotal, 0),
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
