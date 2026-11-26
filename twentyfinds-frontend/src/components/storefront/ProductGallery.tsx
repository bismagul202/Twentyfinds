"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";
import type { StoreProduct } from "@/features/storefront/data";
import { Icon } from "./Icon";
import { ImageCanvas } from "./ImageCanvas";

export function ProductGallery({ product }: { product: StoreProduct }) {
  const copy = useStorefrontCopy();
  const photos = product.images?.filter(({ src }) => Boolean(src)) ?? [];
  if (!photos.length && product.image) photos.push({ src: product.image, alt: product.name });
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = photos[selected];
  const multiple = photos.length > 1;
  const priceMark = copy("product.under-20", "");
  const priceMarkCaption = copy("product.always", "");

  function move(direction: number) {
    setSelected((index) => (index + direction + photos.length) % photos.length);
    setZoomed(false);
  }

  function handleArrows(event: KeyboardEvent) {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || zoomed) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    <div className="product-gallery" role="group" aria-label={copy("product.product-images", "Product images")} onKeyDown={handleArrows}>
      <div className="product-detail-image-wrap">
        {photo ? (
          <button type="button" className="product-gallery-open" aria-haspopup="dialog"
            onClick={() => { setZoomed(false); dialog.current?.showModal(); }}>
            <ImageCanvas src={photo.src} alt={photo.alt || product.name} className="product-detail-image" />
            <span className="product-gallery-zoom"><Icon name="search" size={17} /><StorefrontText id="product.zoom-image" fallback="Zoom image" /></span>
          </button>
        ) : (
          <div className="product-gallery-missing">
            <StorefrontText id="product.image-unavailable" fallback="Product image unavailable" />
          </div>
        )}
        {product.label && <span className="product-detail-sticker">{product.label}</span>}
        {(priceMark || priceMarkCaption) && (
          <span className="product-detail-price-mark">{priceMark || "under £20"}<br />{priceMarkCaption || "always ✳"}</span>
        )}
      </div>
      {multiple && (
        <div className="cms-product-thumbnails">
          {photos.map(({ src }, index) => (
            <button key={`${src}-${index}`} type="button"
              aria-label={copy("product.view-product-photo-value", "View product photo {value}", { value: index + 1 })}
              aria-pressed={selected === index} onClick={() => setSelected(index)}>
              <ImageCanvas src={src} alt="" />
            </button>
          ))}
        </div>
      )}
      {photo && (
        <dialog ref={dialog} className="product-gallery-dialog" aria-label={copy("product.image-viewer", "Product image viewer")}
          onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
          <div className="product-gallery-tools">
            {multiple && (
              <>
                <button type="button" aria-label={copy("product.previous-photo", "Previous photo")} onClick={() => move(-1)}>
                  <Icon name="arrow-right" size={18} className="product-gallery-previous" />
                </button>
                <span role="status">{selected + 1} / {photos.length}</span>
                <button type="button" aria-label={copy("product.next-photo", "Next photo")} onClick={() => move(1)}><Icon name="arrow-right" size={18} /></button>
              </>
            )}
            <button type="button" className="product-zoom-toggle" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}>
              <Icon name={zoomed ? "minus" : "plus"} size={17} />
              {zoomed ? <StorefrontText id="product.zoom-out" fallback="Zoom out" /> : <StorefrontText id="product.zoom-in" fallback="Zoom in" />}
            </button>
            <button type="button" autoFocus aria-label={copy("product.close-image-viewer", "Close image viewer")} onClick={() => dialog.current?.close()}>
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="product-gallery-viewport" tabIndex={zoomed ? 0 : undefined} key={selected}>
            <ImageCanvas src={photo.src} alt={photo.alt || product.name}
              className={`product-gallery-full-image${zoomed ? " is-zoomed" : ""}`} />
          </div>
        </dialog>
      )}
    </div>
  );
}
