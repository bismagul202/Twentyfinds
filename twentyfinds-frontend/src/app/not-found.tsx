import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fallback-page container-shell">
      <span className="fallback-mark">404 ✳</span>
      <h1><StorefrontText id="not-found.well-this-is-a-little-lost" fallback="Well, this is a little lost." /></h1>
      <p><StorefrontText id="not-found.we-couldn-t-find-that-page-it" fallback="We couldn't find that page. It might have moved, or it might be on its way." /></p>
      <div className="fallback-actions">
        <Link href="/shop" className="button button-dark"><StorefrontText id="not-found.shop-the-good-stuff" fallback="Shop the good stuff" />{" "}<span aria-hidden="true">↗</span></Link>
        <Link href="/" className="text-link"><StorefrontText id="not-found.back-to-home" fallback="Back to home" /></Link>
      </div>
    </div>
  );
}
