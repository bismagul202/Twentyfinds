import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { getStorefront, managedMetadata } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/ShopListing";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("shop", {
    title: "Shop all",
    description: "Browse the latest 20ISH — everyday finds, all under £20.",
  });
}

type ShopSearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  budget?: string | string[];
  deals?: string | string[];
}>;

async function ShopResults({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const [params, { categories, products, previewCatalog }] = await Promise.all([searchParams, getStorefront()]);
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const budget = Array.isArray(params.budget) ? params.budget[0] : params.budget;
  const deals = Array.isArray(params.deals) ? params.deals[0] : params.deals;

  return (
    <ShopListing
      key={JSON.stringify([query, category, sort, budget, deals])}
      categories={categories}
      products={previewCatalog ? [] : products}
      initialCategory={category}
      initialQuery={query}
      initialSort={sort}
      initialBudget={budget}
      initialDeals={deals === "1" || deals === "true"}
    />
  );
}

function ShopFallback() {
  return (
    <RouteSkeleton message={<StorefrontText id="shop.finding-the-good-stuff" fallback="Finding the good stuff..." />} />
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
