"use client";

import { createContext, useContext, type ReactNode } from "react";

import { formatStorefrontCopy, type Values } from "./copy-text";

const StorefrontCopyContext = createContext<Record<string, string>>({});

export function StorefrontCopyProvider({ copy, children }: {
  copy: Record<string, string>;
  children: ReactNode;
}) {
  return <StorefrontCopyContext.Provider value={copy}>{children}</StorefrontCopyContext.Provider>;
}

export function useStorefrontCopy() {
  const copy = useContext(StorefrontCopyContext);
  return (id: string, fallback: string, values?: Values) => formatStorefrontCopy(copy, id, fallback, values);
}

export function StorefrontText({ id, fallback, values }: { id: string; fallback: string; values?: Values }) {
  return useStorefrontCopy()(id, fallback, values);
}
