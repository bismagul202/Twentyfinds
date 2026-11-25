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
  cartCount: number;
  wishlistCount: number;
  addToCart: (productSlug: string, quantity?: number) => void;
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
      cartCount: Object.values(cart).reduce((total, quantity) => total + quantity, 0),
      wishlistCount: wishlist.length,
      addToCart,
      toggleWishlist,
      isWishlisted,
    }),
    [addToCart, cart, isWishlisted, toggleWishlist, wishlist.length],
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
