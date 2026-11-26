"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import type { StoreProduct } from "@/features/storefront/data";
import { Icon } from "./Icon";
import { ImageCanvas } from "./ImageCanvas";

export type ShoppingPanelProduct = Pick<StoreProduct, "slug" | "name" | "image" | "price" | "variants">;

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const formatMoney = (pence: number) => gbp.format(pence / 100);

function unitPence(price: number | undefined) {
  return typeof price === "number" && Number.isFinite(price) && price >= 0.01 && price <= 19.99
    ? Math.round(price * 100) : null;
}

function ShoppingItem({ product, onNavigate, children }: {
  product?: ShoppingPanelProduct;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <li className="shopping-item">
      {product?.image
        ? <ImageCanvas src={product.image} alt="" className="shopping-item-image" />
        : <span className="shopping-item-image shopping-item-placeholder"><Icon name="bag" size={22} /></span>}
      <div className="shopping-item-content">
        {product
          ? <Link className="shopping-item-name" href={`/products/${product.slug}`} onClick={onNavigate}>{product.name}</Link>
          : <span className="shopping-item-name"><StorefrontText id="shopping.unavailable-item" fallback="Item unavailable" /></span>}
        {children}
      </div>
    </li>
  );
}

export function ShoppingPanel({ mode, products, onNavigate }: {
  mode: "bag" | "wishlist";
  products: ShoppingPanelProduct[];
  onNavigate: () => void;
}) {
  const copy = useStorefrontCopy();
  const { cart, cartCount, setCartQuantity, wishlist, toggleWishlist } = useStorefront();
  const heading = useRef<HTMLHeadingElement>(null);
  const catalogue = new Map(products.map((product) => [product.slug, product]));
  const isCart = mode === "bag";
  const empty = isCart ? cartCount === 0 : wishlist.length === 0;
  const lines = isCart ? Object.entries(cart).map(([key, quantity]) => {
    const [slug, variantId] = key.split(":");
    const product = catalogue.get(slug);
    const variant = product?.variants?.find(({ id }) => String(id) === variantId);
    const price = unitPence(variantId === undefined ? product?.price : variant?.price);
    return { key, quantity, product, variant, price };
  }) : [];
  const subtotal = lines.reduce((sum, { price, quantity }) => sum + (price ?? 0) * quantity, 0);
  const missingPrice = lines.some(({ price }) => price === null);
  const hasPrice = lines.some(({ price }) => price !== null);

  function removeButton(name: string | undefined, remove: () => void) {
    return (
      <button type="button" className="shopping-remove"
        aria-label={name ? copy("shopping.remove-name", "Remove {name}", { name }) : copy("shopping.remove-item", "Remove item")}
        onClick={() => { heading.current?.focus(); remove(); }}>
        <StorefrontText id="shopping.remove" fallback="Remove" />
      </button>
    );
  }

  return (
    <section aria-labelledby="shopping-panel-title">
      <h2 id="shopping-panel-title" ref={heading} tabIndex={-1}>
        {isCart
          ? <StorefrontText id="header.your-shopping-cart" fallback="Your shopping cart" />
          : <StorefrontText id="header.your-wishlist" fallback="Your wishlist" />}
      </h2>
      <p className="shopping-count" role="status">
        {isCart
          ? empty
            ? <StorefrontText id="header.your-cart-is-ready-for-a-good" fallback="Your cart is empty." />
            : <StorefrontText id="header.cartcount-item-value-in-your-cart" fallback="{cartCount} item{value} in your cart" values={{ cartCount, value: cartCount === 1 ? "" : "s" }} />
          : empty
            ? <StorefrontText id="header.a-little-list-of-lovely-things" fallback="Your wishlist is empty." />
            : <StorefrontText id="header.wishlistcount-find-value-saved" fallback="{wishlistCount} find{value} saved" values={{ wishlistCount: wishlist.length, value: wishlist.length === 1 ? "" : "s" }} />}
      </p>

      {!empty && (isCart ? (
        <ul className="shopping-items">
          {lines.map(({ key, quantity, product, variant, price }) => (
            <ShoppingItem key={key} product={product} onNavigate={onNavigate}>
              {variant && <p>{variant.name}</p>}
              {price === null ? (
                <p><StorefrontText id="shopping.price-unavailable" fallback="Price unavailable" /></p>
              ) : (
                <div className="shopping-prices">
                  <span>{formatMoney(price * quantity)}</span>
                  {quantity > 1 && <span className="shopping-unit-price"><StorefrontText
                    id="shopping.unit-price" fallback="{price} each" values={{ price: formatMoney(price) }}
                  /></span>}
                </div>
              )}
              <div className="shopping-item-actions">
                <div className="shopping-quantity" role="group" aria-label={copy("product.quantity", "Quantity")}>
                  <button type="button" aria-label={copy("product.decrease-quantity", "Decrease quantity")}
                    disabled={quantity <= 1} onClick={() => setCartQuantity(key, quantity - 1)}><Icon name="minus" size={15} /></button>
                  <span aria-live="polite">{quantity}</span>
                  <button type="button" aria-label={copy("product.increase-quantity", "Increase quantity")}
                    disabled={price === null || quantity >= Number.MAX_SAFE_INTEGER}
                    onClick={() => setCartQuantity(key, quantity + 1)}><Icon name="plus" size={15} /></button>
                </div>
                {removeButton(product && (variant ? `${product.name} (${variant.name})` : product.name), () => setCartQuantity(key, 0))}
              </div>
            </ShoppingItem>
          ))}
        </ul>
      ) : (
        <ul className="shopping-items">
          {wishlist.map((slug) => {
            const product = catalogue.get(slug);
            const price = product?.variants?.length
              ? unitPence(Math.min(...product.variants.map((variant) => variant.price))) : unitPence(product?.price);
            return (
              <ShoppingItem key={slug} product={product} onNavigate={onNavigate}>
                {price !== null && <p className="shopping-prices">{(product?.variants?.length ?? 0) > 1
                  && <StorefrontText id="product-card.from" fallback="From " />}{formatMoney(price)}</p>}
                {removeButton(product?.name, () => toggleWishlist(slug))}
              </ShoppingItem>
            );
          })}
        </ul>
      ))}

      {isCart && !empty && (
        <div className="shopping-summary">
          <h3><StorefrontText id="shopping.order-summary" fallback="Order summary" /></h3>
          <dl>
            <div>
              <dt><StorefrontText id="shopping.subtotal" fallback="Subtotal" /></dt>
              <dd aria-live="polite">{hasPrice ? formatMoney(subtotal) : <StorefrontText id="shopping.price-unavailable" fallback="Price unavailable" />}</dd>
            </div>
            <div>
              <dt><StorefrontText id="shopping.shipping" fallback="Delivery" /></dt>
              <dd><StorefrontText id="shopping.shipping-unavailable" fallback="Delivery charges pending confirmation" /></dd>
            </div>
          </dl>
          {missingPrice && hasPrice && <p><StorefrontText id="shopping.subtotal-excludes-unavailable" fallback="The subtotal excludes unavailable items." /></p>}
          <Link href="/shipping" className="text-link" onClick={onNavigate}>
            <StorefrontText id="shopping.delivery-information" fallback="View delivery information" /><Icon name="arrow-right" size={15} />
          </Link>
          <button className="button button-blue shopping-checkout" type="button" disabled aria-describedby="shopping-checkout-note">
            <StorefrontText id="shopping.checkout" fallback="Checkout" />
          </button>
          <p id="shopping-checkout-note">
            <StorefrontText id="header.checkout-is-not-enabled-in-this-storefront" fallback="Checkout is currently unavailable on 20ISH." />
          </p>
        </div>
      )}
      {!isCart && <p><StorefrontText id="header.your-saved-finds-stay-in-this-browsing" fallback="Your saved finds are kept while you browse 20ISH in this tab." /></p>}
      {isCart && empty && <p><StorefrontText id="header.checkout-is-not-enabled-in-this-storefront" fallback="Checkout is currently unavailable on 20ISH." /></p>}
      <Link href="/shop" className="text-link shopping-continue" onClick={onNavigate}>
        <StorefrontText id="header.continue-shopping" fallback="Continue shopping" /><Icon name="arrow-right" size={16} />
      </Link>
    </section>
  );
}
