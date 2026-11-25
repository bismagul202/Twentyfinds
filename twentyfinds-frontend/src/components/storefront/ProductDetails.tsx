"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import Link from "next/link";
import { useState } from "react";
import type { StoreProduct } from "@/features/storefront/data";
import { getCategoryName } from "@/features/storefront/data";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import { Icon } from "./Icon";
import { ImageCanvas } from "./ImageCanvas";

export function ProductDetails({ product }: { product: StoreProduct }) {
  const copy = useStorefrontCopy();
  const { addToCart, isWishlisted, toggleWishlist } = useStorefront();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const variant = product.variants?.find((option) => option.id === variantId);
  const sellingPrice = variant?.price ?? product.price;
  const [selectedImage, setSelectedImage] = useState(0);
  const image = product.images?.[selectedImage];
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const saved = isWishlisted(product.slug);

  function addProduct() {
    addToCart(variant ? `${product.slug}:${variant.id}` : product.slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="product-detail-page container-shell">
      <div className="content-page-topline">
        <Link href="/"><StorefrontText id="product.home" fallback="Home" /></Link>
        <span>/</span>
        <Link href="/shop"><StorefrontText id="product.shop-all" fallback="Shop all" /></Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail-grid">
        <div className="product-detail-image-wrap">
          <ImageCanvas
            src={image?.src ?? product.image}
            alt={image?.alt ?? product.name}
            className="product-detail-image"
          />
          {product.images && product.images.length > 1 && (
            <div className="cms-product-thumbnails" aria-label={copy("product.product-images", "Product images")}>
              {product.images.map((photo, index) => (
                <button key={photo.src} type="button" aria-label={copy("product.view-product-photo-value", "View product photo {value}", { value: index + 1 })}
                  aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)}>
                  <ImageCanvas src={photo.src} alt="" />
                </button>
              ))}
            </div>
          )}
          {product.label && <span className="product-detail-sticker">{product.label}</span>}
          <span className="product-detail-price-mark"><StorefrontText id="product.under-20" fallback="under £20" /><br /><StorefrontText id="product.always" fallback="always ✳" /></span>
        </div>
        <div className="product-detail-copy">
          <Link
            href={`/categories/${product.categorySlug}`}
            className="eyebrow detail-category"
          >
            {product.categoryName ?? getCategoryName(product.categorySlug)}
          </Link>
          <h1>{product.name}</h1>
          {product.reviewCount > 0 && <div className="detail-rating">
            <span className="rating"><Icon name="star" size={15} /> {product.rating}</span>
            <span>{product.reviewCount}{" "}<StorefrontText id="product.happy-reviews" fallback="happy reviews" /></span>
          </div>}
          <div className="detail-price-row">
            <strong>£{sellingPrice.toFixed(2)}</strong>
            {product.compareAt !== undefined && product.compareAt > sellingPrice && (
              <span className="product-was-price">£{product.compareAt.toFixed(2)}</span>
            )}
            <span className="price-promise"><StorefrontText id="product.always-under-20" fallback="Always under £20" /></span>
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-perks">
            <span><Icon name="truck" size={18} />{" "}<StorefrontText id="product.delivery-details-at-checkout" fallback="Delivery details at checkout" /></span>
            <span><Icon name="refresh" size={18} />{" "}<StorefrontText id="product.easy-returns-information" fallback="Easy returns information" /></span>
          </div>
          {!!product.variants?.length && (
            <label className="cms-variant-select"><StorefrontText id="product.option" fallback="Option" /><select value={variantId} onChange={(event) => setVariantId(Number(event.target.value))}>
                {product.variants.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
              </select>
            </label>
          )}
          <div className="detail-actions">
            <div className="quantity-control" aria-label={copy("product.quantity", "Quantity")}>
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
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
            <button type="button" className="button button-blue add-to-bag" onClick={addProduct}>
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
          <p className="preview-disclaimer"><StorefrontText id="product.store-preview-only-checkout-and-order-placement" fallback="Store preview only — checkout and order placement are not enabled." /></p>
        </div>
      </div>
    </div>
  );
}
