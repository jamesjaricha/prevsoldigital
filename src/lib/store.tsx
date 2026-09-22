"use client";

/**
 * Shopping cart, persisted to localStorage.
 *
 * The cart is intentionally client-side and unauthenticated so visitors can
 * shop before signing in. It carries no pricing authority: the checkout server
 * action re-prices every line from the product catalogue before creating an
 * order, so a tampered cart cannot change what is charged.
 *
 * localStorage is treated as the source of truth and read through
 * `useSyncExternalStore`. That keeps server and first-client renders identical
 * (both see the empty server snapshot) and swaps in the stored value at
 * hydration, without the extra render an effect-based load would cause.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const CART_KEY = "prevsol.cart.v1";

/* ------------------------------------------------------- external store */

const listeners = new Set<() => void>();

/** Cached snapshots — `useSyncExternalStore` requires referential stability. */
const snapshots: Record<string, string | null> = {};

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Keep other tabs in sync.
  const onStorage = () => {
    for (const key of Object.keys(snapshots)) delete snapshots[key];
    callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function emitChange(key: string) {
  delete snapshots[key];
  for (const listener of listeners) listener();
}

/** Reads a key, memoising the raw string so the snapshot stays stable. */
function readKey(key: string): string | null {
  if (!(key in snapshots)) {
    try {
      snapshots[key] = window.localStorage.getItem(key) ?? "";
    } catch {
      snapshots[key] = "";
    }
  }
  return snapshots[key];
}

function writeKey(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — state still applies for this render pass.
  }
  emitChange(key);
}

/** On the server there is no storage, so every snapshot is null. */
const getServerSnapshot = () => null;

/* -------------------------------------------------------------------- cart */

export type CartItem = {
  /** Unique per line: product slug, or `domain:example.co.zw`. */
  id: string;
  name: string;
  /** Sub-label, e.g. "Domain registration · 1 year". */
  detail?: string;
  price: number;
  per: string | null;
  quantity: number;
  href?: string;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  /** Set when an item was just added, so the header can flash a confirmation. */
  lastAdded: string | null;
  /** False until hydration completes, so the UI can avoid a flash of empty. */
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

/** Zimbabwe VAT, applied to the discounted subtotal. */
const TAX_RATE = 0.15;
/** Orders over this threshold get a small volume discount. */
const DISCOUNT_THRESHOLD = 1000;
const DISCOUNT_RATE = 0.05;

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as CartItem).id === "string" &&
        typeof (i as CartItem).price === "number" &&
        typeof (i as CartItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readKey(CART_KEY),
    getServerSnapshot,
  );
  const items = useMemo(() => parseCart(raw), [raw]);
  const ready = raw !== null;

  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const add = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const current = parseCart(readKey(CART_KEY));
      const existing = current.find((i) => i.id === item.id);
      writeKey(
        CART_KEY,
        existing
          ? current.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...current, { ...item, quantity }],
      );
      setLastAdded(item.id);
      // Clear the "just added" flash after a moment.
      setTimeout(() => setLastAdded(null), 2500);
    },
    [],
  );

  const remove = useCallback((id: string) => {
    writeKey(
      CART_KEY,
      parseCart(readKey(CART_KEY)).filter((i) => i.id !== id),
    );
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const current = parseCart(readKey(CART_KEY));
    writeKey(
      CART_KEY,
      quantity <= 0
        ? current.filter((i) => i.id !== id)
        : current.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }, []);

  const clear = useCallback(() => writeKey(CART_KEY, []), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount =
      subtotal >= DISCOUNT_THRESHOLD
        ? Math.round(subtotal * DISCOUNT_RATE * 100) / 100
        : 0;
    const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
    return {
      items,
      add,
      remove,
      setQuantity,
      clear,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      discount,
      tax,
      total: Math.round((subtotal - discount + tax) * 100) / 100,
      lastAdded,
      ready,
    };
  }, [items, add, remove, setQuantity, clear, lastAdded, ready]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Formats a number as USD, the currency used throughout the pricing table. */
export function money(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
