import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { getStorefront, managedMetadata } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/ShopListing";
import { Icon } from "@/components/storefront/Icon";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("shop", {
    title: "Shop all",
    description: "Browse the latest TWENTYFINDS — everyday finds, all under £20.",
  });
}

type ShopSearchParams = Promise<{
  q?: string | string[];
  sort?: string | string[];
  budget?: string | string[];
  deals?: string | string[];
}>;

async function ShopResults({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const [params, { categories, products }] = await Promise.all([searchParams, getStorefront()]);
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const budget = Array.isArray(params.budget) ? params.budget[0] : params.budget;
  const deals = Array.isArray(params.deals) ? params.deals[0] : params.deals;

  return (
    <ShopListing
      key={JSON.stringify([query, sort, budget, deals])}
      categories={categories}
      products={products}
      initialQuery={query}
      initialSort={sort}
      initialBudget={budget}
      initialDeals={deals === "1" || deals === "true"}
    />
  );
}

function ShopFallback() {
  return (
    <div className="shop-page container-shell loading-state" role="status">
      <Icon name="sparkles" size={22} />
      <span><StorefrontText id="shop.finding-the-good-stuff" fallback="Finding the good stuff..." /></span>
    </div>
  );
}

export default function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopResults searchParams={searchParams} />
    </Suspense>
  );
}
