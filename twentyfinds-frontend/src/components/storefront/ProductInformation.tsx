"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

export function ProductInformation({ description, category, variant }: {
  description: string;
  category: string;
  variant?: string;
}) {
  const id = useId();
  const copy = useStorefrontCopy();
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Product details" },
    { id: "delivery", label: "Delivery & returns" },
  ];

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const targets: Record<string, number> = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = targets[event.key];
    if (typeof next !== "number") return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <div className="product-information">
      <div className="product-information-tabs" role="tablist" aria-label={copy("product.information", "Product information")}>
        {tabs.map((tab, index) => (
          <button key={tab.id} type="button" role="tab" id={`${id}-tab-${index}`}
            ref={(button) => { buttons.current[index] = button; }}
            aria-selected={active === index} aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}
            onKeyDown={(event) => onTabKeyDown(event, index)}>
            <StorefrontText id={`product.tab-${tab.id}`} fallback={tab.label} />
          </button>
        ))}
      </div>
      <div role="tabpanel" tabIndex={0} id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} hidden={active !== 0}>
        <p className="detail-description">
          {description.trim() || <StorefrontText id="product.description-unavailable" fallback="A description hasn’t been published for this item yet." />}
        </p>
      </div>
      <div role="tabpanel" tabIndex={0} id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} hidden={active !== 1}>
        <dl className="product-information-details">
          <div><dt><StorefrontText id="product.detail-category" fallback="Category" /></dt><dd>{category}</dd></div>
          {variant && <div><dt><StorefrontText id="product.option" fallback="Option" /></dt><dd>{variant}</dd></div>}
        </dl>
      </div>
      <div role="tabpanel" id={`${id}-panel-2`} aria-labelledby={`${id}-tab-2`} hidden={active !== 2}>
        <p className="detail-description"><StorefrontText id="product.delivery-summary" fallback="See our UK delivery and returns pages for the latest information." /></p>
        <div className="product-information-links">
          <Link href="/shipping" className="text-link"><StorefrontText id="product.delivery-details-at-checkout" fallback="Delivery information" /></Link>
          <Link href="/returns" className="text-link"><StorefrontText id="product.easy-returns-information" fallback="Returns information" /></Link>
        </div>
      </div>
    </div>
  );
}
