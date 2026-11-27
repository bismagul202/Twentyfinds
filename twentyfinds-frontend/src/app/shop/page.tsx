import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { bannerImage, getStorefront, managedMetadata } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/ShopListing";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { Icon } from "@/components/storefront/Icon";
import { getHomeDepartments } from "@/features/storefront/home-departments";
import { newIn } from "@/features/storefront/navigation";
import Link from "next/link";
import "./shop.css";

export async function generateMetadata({ searchParams }: { searchParams: ShopSearchParams }): Promise<Metadata> {
  const { sort, q } = await searchParams;
  if ((Array.isArray(sort) ? sort[0] : sort) === "new" && !(Array.isArray(q) ? q[0] : q)?.trim()) {
    return managedMetadata("new-in", {
      title: "New In",
      description: "Discover the latest arrivals at 20ISH, from fashion and stationery to thoughtful gifts.",
    });
  }
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
  const [params, { categories, products, banners, previewCatalog, publishedCategorySlugs }] = await Promise.all([searchParams, getStorefront()]);
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const budget = Array.isArray(params.budget) ? params.budget[0] : params.budget;
  const deals = Array.isArray(params.deals) ? params.deals[0] : params.deals;
  const isSearch = Boolean(query?.trim());
  const newOnly = sort === "new";
  const view = isSearch ? "search" : newOnly ? "new" : "all";
  const publishedProducts = previewCatalog ? [] : products;
  const departments = view === "all"
    ? getHomeDepartments(categories.filter(({ slug }) => !publishedCategorySlugs || publishedCategorySlugs.includes(slug))).slice(0, 5)
    : [];

  return (
    <div className={`shop-view shop-view--${view}`}>
      <header className="shop-view-hero">
        {view === "all" && (
          <ImageCanvas src={bannerImage(banners, "shop", "/twentyfinds-hero-departments.webp")} alt="" className="shop-view-image" sizes="100vw" />
        )}
        <div className="shop-view-hero-inner container-shell">
          <div className="shop-view-hero-copy">
          <nav className="content-page-topline" aria-label="Breadcrumb">
            <Link href="/"><StorefrontText id="content.home" fallback="Home" /></Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{view === "search" ? <StorefrontText id="shop.search-results" fallback="Search results" />
              : view === "new" ? <StorefrontText id="header.new-arrivals" fallback="New In" />
              : <StorefrontText id="shop.shop-all" fallback="Shop all" />}</span>
          </nav>
          <h1>{view === "search" ? <StorefrontText id="shop.search-results" fallback="Search results" />
            : view === "new" ? <StorefrontText id="header.new-arrivals" fallback="New In" />
            : <StorefrontText id="shop.shop-all" fallback="Shop all" />}</h1>
          <p>{view === "search" ? <StorefrontText id="shop.results-for" fallback="Results for “{query}”" values={{ query: query?.trim() ?? "" }} />
            : view === "new" ? <StorefrontText id="shop.new-in-intro" fallback="The latest additions to 20ISH. Find pieces to wear, stationery to use and gifts worth keeping." />
            : <StorefrontText id="shop.little-things-you-ll-love-with-nothing" fallback="Browse fashion, home, stationery and gifts, all under £20." />}</p>
          </div>
          {view === "new" && (
            <ImageCanvas src={bannerImage(banners, "new-in", "/20ish-new-in-editorial.webp")} alt="" className="shop-new-in-image" sizes="(max-width: 680px) 90vw, 52vw" />
          )}
        </div>
      </header>
      {!newOnly && <div className="shop-view-navigation container-shell">
        <nav className="shop-view-switch" aria-label="Shop views">
          <Link href="/shop" aria-current={view === "all" ? "page" : undefined}><StorefrontText id="shop.shop-all" fallback="Shop all" /></Link>
          <Link href={newIn.href} aria-current={view === "new" ? "page" : undefined}><StorefrontText id="header.new-arrivals" fallback="New In" /></Link>
        </nav>
        {departments.length > 0 && (
          <nav className="shop-view-departments" aria-label="Browse categories">
            {departments.map(({ id, name, href }) => <Link key={id} href={href}>{name}<Icon name="arrow-right" size={14} /></Link>)}
          </nav>
        )}
      </div>}
      <ShopListing
        key={JSON.stringify([query, category, sort, budget, deals])}
        categories={categories}
        products={newOnly ? publishedProducts.filter((product) => product.collections.includes("new")) : publishedProducts}
        newOnly={newOnly}
        initialCategory={category}
        initialQuery={query}
        initialSort={sort}
        initialBudget={budget}
        initialDeals={deals === "1" || deals === "true"}
      />
    </div>
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
