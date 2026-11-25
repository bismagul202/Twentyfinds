import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import type { ReactNode } from "react";
import type { StoreProduct } from "@/features/storefront/data";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  emptyTitle = <StorefrontText id="product-grid.empty-title" fallback="No finds just yet" />,
  emptyMessage = <StorefrontText id="product-grid.empty-description" fallback="Try another search or browse a different category." />,
}: {
  products: StoreProduct[];
  emptyTitle?: ReactNode;
  emptyMessage?: ReactNode;
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-mark">20</span>
        <h2>{emptyTitle}</h2>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
