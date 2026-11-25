"use client";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="fallback-page container-shell">
      <span className="fallback-mark"><StorefrontText id="errors.oops" fallback="Oops ✳" /></span>
      <h1><StorefrontText id="errors.that-didn-t-go-to-plan" fallback="That didn't go to plan." /></h1>
      <p><StorefrontText id="errors.something-unexpected-happened-give-it-another-go" fallback="Something unexpected happened. Give it another go, or head back to the good stuff." /></p>
      <div className="fallback-actions">
        <button type="button" className="button button-dark" onClick={() => retry()}><StorefrontText id="errors.try-again" fallback="Try again" /><span aria-hidden="true">↻</span>
        </button>
        <Link href="/shop" className="text-link"><StorefrontText id="errors.browse-the-shop" fallback="Browse the shop" />{" "}<span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  );
}
