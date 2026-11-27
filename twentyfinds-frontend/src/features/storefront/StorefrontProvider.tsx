"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type StorefrontContextValue = {
  cart: Readonly<Record<string, number>>;
  wishlist: readonly string[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (productSlug: string, quantity?: number) => void;
  setCartQuantity: (key: string, quantity: number) => void;
  removePurchased: (purchased: Record<string, number>) => void;
  toggleWishlist: (productSlug: string) => void;
  isWishlisted: (productSlug: string) => boolean;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

const cartStorageKey = "20ish.cart";
const emptyCart: Record<string, number> = {};
let cartSnapshot = emptyCart;
let cartJson: string | null = null;

function getCartSnapshot() {
  try {
    const json = window.localStorage.getItem(cartStorageKey);
    if (json === cartJson) return cartSnapshot;
    cartJson = json;
    const stored: unknown = JSON.parse(json ?? "{}");
    cartSnapshot = stored && typeof stored === "object" && !Array.isArray(stored)
      ? Object.fromEntries(Object.entries(stored).filter(([key, quantity]) =>
        /^[a-z0-9-]+(?::[1-9]\d*)?$/.test(key) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99))
      : emptyCart;
  } catch {
    // Keep the in-memory bag available if browser storage is blocked.
  }
  return cartSnapshot;
}

function subscribeToCart(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === cartStorageKey || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(cartStorageKey, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(cartStorageKey, notify);
  };
}

function updateCart(update: (current: Record<string, number>) => Record<string, number>) {
  const current = getCartSnapshot();
  const next = update(current);
  if (next === current) return;
  cartSnapshot = next;
  try {
    const json = JSON.stringify(next);
    window.localStorage.setItem(cartStorageKey, json);
    cartJson = json;
  } catch {
    // The bag can still be used for the current page session.
  }
  window.dispatchEvent(new Event(cartStorageKey));
}

function removePurchased(purchased: Record<string, number>) {
  updateCart((current) => {
    const next = { ...current };
    for (const [key, quantity] of Object.entries(purchased)) {
      if (current[key] === quantity) delete next[key];
    }
    return next;
  });
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribeToCart, getCartSnapshot, () => emptyCart);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = useCallback((productSlug: string, quantity = 1) => {
    updateCart((current) => ({
      ...current,
      [productSlug]: Math.min(99, (current[productSlug] ?? 0) + quantity),
    }));
  }, []);

  const setCartQuantity = useCallback((key: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99) return;
    updateCart((current) => {
      if (!Object.hasOwn(current, key) || current[key] === quantity) return current;
      const next = { ...current };
      if (quantity === 0) delete next[key];
      else next[key] = quantity;
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((productSlug: string) => {
    setWishlist((current) =>
      current.includes(productSlug)
        ? current.filter((slug) => slug !== productSlug)
        : [...current, productSlug],
    );
  }, []);

  const isWishlisted = useCallback(
    (productSlug: string) => wishlist.includes(productSlug),
    [wishlist],
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount: Object.values(cart).reduce((total, quantity) => total + quantity, 0),
      wishlistCount: wishlist.length,
      addToCart,
      setCartQuantity,
      removePurchased,
      toggleWishlist,
      isWishlisted,
    }),
    [addToCart, cart, isWishlisted, setCartQuantity, toggleWishlist, wishlist],
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }

  return context;
}
