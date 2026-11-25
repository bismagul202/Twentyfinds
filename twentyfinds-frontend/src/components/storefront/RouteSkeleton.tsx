import { StorefrontText } from "@/features/storefront/StorefrontCopy";
export function RouteSkeleton() {
  return (
    <div className="route-loading container-shell" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p><StorefrontText id="loading.finding-the-good-stuff" fallback="Finding the good stuff..." /></p>
      <div className="loading-skeleton-grid" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </div>
  );
}
