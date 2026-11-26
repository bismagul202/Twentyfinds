"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import Link from "next/link";
import { useState } from "react";
import { getProductPrice, type StoreProduct } from "@/features/storefront/data";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import { Icon } from "./Icon";
import { ImageCanvas } from "./ImageCanvas";

export function ProductCard({ product }: { product: StoreProduct }) {
  const copy = useStorefrontCopy();
  const { addToCart, isWishlisted, toggleWishlist } = useStorefront();
  const [added, setAdded] = useState(false);
  const saved = isWishlisted(product.slug);

  const defaultVariant = product.variants?.[0];
  const needsSelection = (product.variants?.length ?? 0) > 1;
  const price = getProductPrice(product);

  function addProduct() {
    addToCart(defaultVariant ? `${product.slug}:${defaultVariant.id}` : product.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link
          href={`/products/${product.slug}`}
          className="product-image-link"
          aria-label={copy("product-card.view-name", "View {name}", { name: product.name })}
        >
          <ImageCanvas
            src={product.image}
            alt=""
            className="product-photo"
            sizes="(max-width: 680px) 50vw, (max-width: 1000px) 34vw, 420px"
          />
        </Link>
        {product.label && <span className="product-label">{product.label}</span>}
        <button
          type="button"
          className={`wishlist-button ${saved ? "is-saved" : ""}`}
          aria-label={saved ? copy("product-card.remove-name-from-saved-items", "Remove {name} from saved items", { name: product.name }) : copy("product-card.save-name", "Save {name}", { name: product.name })}
          aria-pressed={saved}
          onClick={() => toggleWishlist(product.slug)}
        >
          <Icon name="heart" size={18} />
        </button>
        {needsSelection ? (
          <Link href={`/products/${product.slug}`} className="quick-add" aria-label={copy("product-card.choose-options-for-name", "Choose options for {name}", { name: product.name })}>
            <Icon name="arrow-right" size={17} /><span><StorefrontText id="product-card.options" fallback="Options" /></span>
          </Link>
        ) : <button
          type="button"
          className={`quick-add ${added ? "is-added" : ""}`}
          onClick={addProduct}
          aria-label={copy("product-card.add-name-to-bag", "Add {name} to bag", { name: product.name })}
        >
          <Icon name={added ? "check" : "plus"} size={18} />
          <span>{added ? <StorefrontText id="product-card.added" fallback="Added" /> : <StorefrontText id="product-card.add" fallback="Add" />}</span>
        </button>}
      </div>
      <div className="product-card-info">
        <div className="product-category-rating">
          <span>{product.categoryName ?? product.categorySlug.replaceAll("-", " ")}</span>
          {product.reviewCount > 0 && <span className="rating"><Icon name="star" size={13} /> {product.rating}</span>}
        </div>
        <Link href={`/products/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-price-row">
          <strong>{needsSelection ? <StorefrontText id="product-card.from" fallback="From " /> : ""}£{price.toFixed(2)}</strong>
          {!needsSelection && product.compareAt !== undefined && product.compareAt > price && (
            <span className="product-was-price">£{product.compareAt.toFixed(2)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
