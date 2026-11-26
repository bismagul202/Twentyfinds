import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import type { ReactNode } from "react";

export function RouteSkeleton({
  message = <StorefrontText id="loading.finding-the-good-stuff" fallback="Finding the good stuff..." />,
}: { message?: ReactNode }) {
  return (
    <div className="route-loading container-shell" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
      <div className="loading-skeleton-grid" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </div>
  );
}
