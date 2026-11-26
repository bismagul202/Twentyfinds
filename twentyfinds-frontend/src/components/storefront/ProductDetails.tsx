"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StoreProduct } from "@/features/storefront/data";
import { getCategoryName } from "@/features/storefront/data";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import { Icon } from "./Icon";
import { ProductGallery } from "./ProductGallery";
import { ProductInformation } from "./ProductInformation";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function ProductDetails({ product }: { product: StoreProduct }) {
  const copy = useStorefrontCopy();
  const { addToCart, isWishlisted, toggleWishlist } = useStorefront();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const variant = product.variants?.find((option) => option.id === variantId);
  const sellingPrice = variant?.price ?? product.price;
  const canAdd = Number.isFinite(sellingPrice) && sellingPrice >= 0.01 && sellingPrice <= 19.99;
  const category = product.categoryName ?? getCategoryName(product.categorySlug);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const saved = isWishlisted(product.slug);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  function addProduct() {
    if (!canAdd) return;
    clearTimeout(feedbackTimer.current);
    addToCart(variant ? `${product.slug}:${variant.id}` : product.slug, quantity);
    setAdded(true);
    feedbackTimer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="product-detail-page container-shell">
      <nav className="content-page-topline" aria-label={copy("product.breadcrumb", "Breadcrumb")}>
        <Link href="/"><StorefrontText id="product.home" fallback="Home" /></Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop"><StorefrontText id="product.shop-all" fallback="Shop all" /></Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="product-detail-grid">
        <ProductGallery product={product} />
        <div className="product-detail-copy">
          <Link
            href={`/categories/${product.categorySlug}`}
            className="eyebrow detail-category"
          >
            {category}
          </Link>
          <h1>{product.name}</h1>
          {product.reviewCount > 0 && <div className="detail-rating">
            <span className="rating"><Icon name="star" size={15} /> {product.rating}</span>
            <span>{product.reviewCount}{" "}<StorefrontText id="product.happy-reviews" fallback="reviews" /></span>
          </div>}
          <div className="detail-price-row" aria-live="polite" aria-atomic="true">
            {canAdd ? (
              <>
                <strong>{gbp.format(sellingPrice)}</strong>
                {product.compareAt !== undefined && Number.isFinite(product.compareAt) && product.compareAt > sellingPrice && (
                  <del className="product-was-price">{gbp.format(product.compareAt)}</del>
                )}
                <span className="price-promise"><StorefrontText id="product.always-under-20" fallback="Always under £20" /></span>
              </>
            ) : <strong><StorefrontText id="product.price-unavailable" fallback="Price unavailable" /></strong>}
          </div>
          {!!product.variants?.length && (
            <label className="cms-variant-select"><StorefrontText id="product.option" fallback="Option" /><select value={variantId} onChange={(event) => { setVariantId(Number(event.target.value)); setAdded(false); }}>
                {product.variants.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
              </select>
            </label>
          )}
          <p className="product-quantity-label"><StorefrontText id="product.quantity" fallback="Quantity" /></p>
          <div className="detail-actions">
            <div className="quantity-control" role="group" aria-label={copy("product.quantity", "Quantity")}>
              <button
                type="button"
                aria-label={copy("product.decrease-quantity", "Decrease quantity")}
                disabled={quantity <= 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Icon name="minus" size={16} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label={copy("product.increase-quantity", "Increase quantity")}
                disabled={quantity >= Number.MAX_SAFE_INTEGER}
                onClick={() => setQuantity((current) => Math.min(Number.MAX_SAFE_INTEGER, current + 1))}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
            <button type="button" className="button button-blue add-to-bag" onClick={addProduct} disabled={!canAdd}>
              {added ? <StorefrontText id="product.added-to-your-bag" fallback="Added to your bag" /> : <StorefrontText id="product.add-to-bag" fallback="Add to bag" />}
              <Icon name={added ? "check" : "bag"} size={18} />
            </button>
            <button
              type="button"
              className={`detail-wishlist ${saved ? "is-saved" : ""}`}
              aria-label={saved ? copy("product.remove-from-saved-items", "Remove from saved items") : copy("product.save-to-wishlist", "Save to wishlist")}
              aria-pressed={saved}
              onClick={() => toggleWishlist(product.slug)}
            >
              <Icon name="heart" size={20} />
            </button>
          </div>
          <span className="sr-only" role="status">{added && <StorefrontText id="product.added-to-your-bag" fallback="Added to your bag" />}</span>
          <p className="preview-disclaimer"><StorefrontText id="product.store-preview-only-checkout-and-order-placement" fallback="Checkout and order placement are currently unavailable on 20ISH." /></p>
          <ProductInformation description={product.description} category={category} variant={variant?.name} />
        </div>
      </div>
    </div>
  );
}
