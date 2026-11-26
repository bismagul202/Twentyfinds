"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import { useMemo, useRef, useState } from "react";
import type { StoreCategory, StoreProduct } from "@/features/storefront/data";
import { catalogueBudget, catalogueSort, filterCatalogue } from "@/features/storefront/catalogue";
import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import { Icon } from "./Icon";

export function ShopListing({
  categories,
  products,
  collection = false,
  initialCategory = "all",
  initialQuery = "",
  initialSort = "featured",
  initialBudget = "all",
  initialDeals = false,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  collection?: boolean;
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
  initialBudget?: string;
  initialDeals?: boolean;
}) {
  const copy = useStorefrontCopy();
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(
    categories.some(({ slug }) => slug === initialCategory) ? initialCategory : "all",
  );
  const [sort, setSort] = useState(catalogueSort(initialSort));
  const [budget, setBudget] = useState(catalogueBudget(initialBudget));
  const [dealsOnly, setDealsOnly] = useState(initialDeals);

  const visibleProducts = useMemo(() => filterCatalogue(products, categories, {
    query, category, budget, sort, dealsOnly,
  }), [budget, categories, category, dealsOnly, products, query, sort]);
  const activeFilters = Boolean(query.trim() || category !== "all" || budget !== "all" || sort !== "featured" || dealsOnly);
  const departments = categories.filter(({ parentSlug }) => !parentSlug);
  const countLabel = visibleProducts.length === 1 ? "find" : "finds";
  const countNamespace = collection ? "category" : "shop";
  const empty = products.length > 0
    ? {
      title: copy("shop.no-finds-for-that-one", "No finds for that one"),
      message: copy("shop.try-a-different-search-or-clear-a", "Try a different search or clear a filter to see more little favourites."),
    }
    : collection ? {
      title: copy("category.more-finds-are-on-the-way", "More finds are on the way"),
      message: copy("category.we-re-making-room-for-this-category", "We're making room for this category. Come back soon, or explore everything else."),
    } : {
      title: copy("shop.catalogue-empty", "No products to browse yet"),
      message: copy("shop.catalogue-empty-description", "Check back when new finds are published."),
    };

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setBudget("all");
    setSort("featured");
    setDealsOnly(false);
    searchInput.current?.focus();
  }

  return (
    <div className={collection ? "catalogue-results" : "shop-page container-shell catalogue-results"}>
      {!collection && <div className="shop-heading">
        <div>
          <span className="eyebrow"><StorefrontText id="shop.good-finds-all-in-one-place" fallback="Good finds, all in one place" /></span>
          <h1>{initialQuery.trim()
            ? <StorefrontText id="shop.search-results" fallback="Search results" />
            : <StorefrontText id="shop.shop-all" fallback="Shop all" />}</h1>
          <p><StorefrontText id="shop.little-things-you-ll-love-with-nothing" fallback="Little things you'll love, with nothing over £19.99." /></p>
        </div>
        <span className="shop-heading-sticker"><StorefrontText id="shop.all-under" fallback="All under" /><br />£20 ✳</span>
      </div>}
      {!collection && departments.length > 0 && (
        <details className="catalogue-departments">
          <summary><StorefrontText id="shop.browse-categories" fallback="Browse categories" /></summary>
          <nav className="catalogue-category-links" aria-label={copy("shop.browse-categories", "Browse categories")}>
            {departments.map(({ slug, name }) => <Link key={slug} href={`/categories/${slug}`}>{name}</Link>)}
          </nav>
        </details>
      )}

      <div className="shop-toolbar">
        <label className="shop-search">
          <Icon name="search" size={18} />
          <input
            ref={searchInput}
            type="search"
            aria-label={copy("shop.search-all-products", "Search all products")}
            placeholder={copy("shop.search-finds", "Search finds...")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {categories.length > (collection ? 1 : 0) && <label className="filter-select">
          <span className="sr-only"><StorefrontText id="shop.filter-by-category" fallback="Filter by category" /></span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all"><StorefrontText id="shop.all-categories" fallback="All categories" /></option>
            {categories.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>}
        <label className="filter-select">
          <span className="sr-only"><StorefrontText id="shop.filter-by-price" fallback="Filter by price" /></span>
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            <option value="all"><StorefrontText id="shop.any-price" fallback="Any price" /></option>
            <option value="under-5"><StorefrontText id="shop.under-5" fallback="Under £5" /></option>
            <option value="under-10"><StorefrontText id="shop.under-10" fallback="Under £10" /></option>
            <option value="under-20"><StorefrontText id="shop.under-20" fallback="Under £20" /></option>
          </select>
        </label>
        <label className="filter-select">
          <span className="sr-only"><StorefrontText id="shop.sort-products" fallback="Sort products" /></span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured"><StorefrontText id="shop.featured" fallback="Featured" /></option>
            <option value="new"><StorefrontText id="shop.new-arrivals" fallback="New arrivals" /></option>
            <option value="trending"><StorefrontText id="shop.trending" fallback="Trending" /></option>
            <option value="bestsellers"><StorefrontText id="shop.bestsellers" fallback="Bestsellers" /></option>
            <option value="price-low"><StorefrontText id="shop.price-low-to-high" fallback="Price: low to high" /></option>
            <option value="price-high"><StorefrontText id="shop.price-high-to-low" fallback="Price: high to low" /></option>
          </select>
        </label>
        <label className="deal-toggle">
          <input
            type="checkbox"
            checked={dealsOnly}
            onChange={(event) => setDealsOnly(event.target.checked)}
          />
          <span><StorefrontText id="shop.special-offers" fallback="Special offers" /></span>
        </label>
      </div>
      <div className="catalogue-results-bar">
        <p className="results-count" role="status" aria-atomic="true">
          {visibleProducts.length} {copy(`${countNamespace}.${countLabel}`, countLabel)}
        </p>
        {activeFilters && (
          <button type="button" className="text-link catalogue-clear" onClick={clearFilters}>
            <StorefrontText id="shop.clear-filters" fallback="Clear filters" />
          </button>
        )}
      </div>
      <ProductGrid products={visibleProducts} emptyTitle={empty.title} emptyMessage={empty.message} />
      {!collection && <p className="shop-price-note"><StorefrontText id="shop.every-product-is-priced-between-0-01" fallback="Every product is priced between £0.01 and £19.99." /></p>}
    </div>
  );
}
