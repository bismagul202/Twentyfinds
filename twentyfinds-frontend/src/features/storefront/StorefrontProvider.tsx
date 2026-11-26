"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StorefrontContextValue = {
  cart: Readonly<Record<string, number>>;
  wishlist: readonly string[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (productSlug: string, quantity?: number) => void;
  setCartQuantity: (key: string, quantity: number) => void;
  toggleWishlist: (productSlug: string) => void;
  isWishlisted: (productSlug: string) => boolean;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = useCallback((productSlug: string, quantity = 1) => {
    setCart((current) => ({
      ...current,
      [productSlug]: (current[productSlug] ?? 0) + quantity,
    }));
  }, []);

  const setCartQuantity = useCallback((key: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 0) return;
    setCart((current) => {
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
