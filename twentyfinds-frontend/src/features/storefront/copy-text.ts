export type Values = Record<string, string | number>;

export function formatStorefrontCopy(copy: Record<string, string>, id: string, fallback: string, values: Values = {}) {
  return (copy[id] ?? fallback).replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (token, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : token
  );
}

