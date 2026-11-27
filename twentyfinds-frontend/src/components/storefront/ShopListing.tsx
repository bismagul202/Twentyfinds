"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { StoreCategory, StoreProduct } from "@/features/storefront/data";
import { catalogueBudget, catalogueSort, filterCatalogue } from "@/features/storefront/catalogue";
import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import { Icon } from "./Icon";

const pageSize = 10;

export function ShopListing({
  categories,
  products,
  collection = false,
  newOnly = false,
  heading,
  emptyState,
  initialCategory = "all",
  initialQuery = "",
  initialSort = "featured",
  initialBudget = "all",
  initialDeals = false,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  collection?: boolean;
  newOnly?: boolean;
  heading?: ReactNode;
  emptyState?: { title: ReactNode; message: ReactNode };
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
  initialBudget?: string;
  initialDeals?: boolean;
}) {
  const filtersId = useId();
  const copy = useStorefrontCopy();
  const searchInput = useRef<HTMLInputElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(
    categories.some(({ slug }) => slug === initialCategory) ? initialCategory : "all",
  );
  const [sort, setSort] = useState(catalogueSort(initialSort));
  const [budget, setBudget] = useState(catalogueBudget(initialBudget));
  const [dealsOnly, setDealsOnly] = useState(initialDeals);
  const defaultSort = newOnly ? "new" : "featured";

  const visibleProducts = useMemo(() => filterCatalogue(products, categories, {
    query, category, budget, sort, dealsOnly,
  }), [budget, categories, category, dealsOnly, products, query, sort]);
  const activeFilters = Boolean(query.trim() || category !== "all" || budget !== "all" || sort !== defaultSort || dealsOnly);
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const firstIndex = (currentPage - 1) * pageSize;
  const shownProducts = visibleProducts.slice(firstIndex, firstIndex + pageSize);
  const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])]
    .filter((number) => number >= 1 && number <= pageCount)
    .sort((a, b) => a - b);
  const departments = categories.filter(({ parentSlug }) => !parentSlug);
  const countLabel = visibleProducts.length === 1 ? "find" : "finds";
  const countNamespace = collection ? "category" : "shop";
  const empty = products.length > 0
    ? {
      title: copy("shop.no-finds-for-that-one", "No finds for that one"),
      message: copy("shop.try-a-different-search-or-clear-a", "Try a different search or clear a filter to see more little favourites."),
    }
    : emptyState ?? (collection ? {
      title: copy("category.more-finds-are-on-the-way", "More finds are on the way"),
      message: copy("category.we-re-making-room-for-this-category", "We're making room for this category. Come back soon, or explore everything else."),
    } : newOnly ? {
      title: copy("shop.new-in-empty", "No new arrivals yet"),
      message: copy("shop.new-in-empty-message", "New finds will appear here when they’re published."),
    } : {
      title: copy("shop.catalogue-empty", "No products to browse yet"),
      message: copy("shop.catalogue-empty-description", "Check back when new finds are published."),
    });

  function clearFilters() {
    setPage(1);
    setQuery("");
    setCategory("all");
    setBudget("all");
    setSort(defaultSort);
    setDealsOnly(false);
    searchInput.current?.focus();
  }

  function goToPage(target: number) {
    setPage(target);
    resultsHeading.current?.focus();
  }

  const filterControls = (
      <div className="shop-toolbar">
        <label className="shop-search">
          <Icon name="search" size={18} />
          <input
            ref={searchInput}
            type="search"
            aria-label={newOnly ? copy("shop.search-new-arrivals", "Search new arrivals") : copy("shop.search-all-products", "Search all products")}
            placeholder={newOnly ? copy("shop.search-new-arrivals", "Search new arrivals") : copy("shop.search-finds", "Search finds...")}
            value={query}
            onChange={(event) => { setPage(1); setQuery(event.target.value); }}
          />
        </label>
        {categories.length > (collection ? 1 : 0) && <label className="filter-select">
          <span className="catalogue-filter-label"><StorefrontText id="shop.filter-by-category" fallback="Filter by category" /></span>
          <select value={category} onChange={(event) => { setPage(1); setCategory(event.target.value); }}>
            <option value="all"><StorefrontText id="shop.all-categories" fallback="All categories" /></option>
            {categories.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>}
        <label className="filter-select">
          <span className="catalogue-filter-label"><StorefrontText id="shop.filter-by-price" fallback="Filter by price" /></span>
          <select value={budget} onChange={(event) => { setPage(1); setBudget(event.target.value); }}>
            <option value="all"><StorefrontText id="shop.any-price" fallback="Any price" /></option>
            <option value="under-5"><StorefrontText id="shop.under-5" fallback="Under £5" /></option>
            <option value="under-10"><StorefrontText id="shop.under-10" fallback="Under £10" /></option>
            <option value="under-20"><StorefrontText id="shop.under-20" fallback="Under £20" /></option>
          </select>
        </label>
        <label className="filter-select">
          <span className="catalogue-filter-label"><StorefrontText id="shop.sort-products" fallback="Sort products" /></span>
          <select value={sort} onChange={(event) => { setPage(1); setSort(event.target.value); }}>
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
            onChange={(event) => { setPage(1); setDealsOnly(event.target.checked); }}
          />
          <span><StorefrontText id="shop.special-offers" fallback="Special offers" /></span>
        </label>
      </div>
  );

  const results = (
    <>
      <div className="catalogue-listing-header">
        <h2 ref={resultsHeading} tabIndex={-1}>{heading ?? (newOnly
          ? <StorefrontText id="shop.latest-arrivals-heading" fallback="Latest arrivals" />
          : <StorefrontText id="shop.products-heading" fallback="Products" />)}</h2>
      </div>
      <div className="catalogue-results-bar">
        <p className="results-count" role="status" aria-atomic="true">
          {visibleProducts.length > 0
            ? copy("shop.paginated-results", "Showing {first}–{last} of {total}", {
              first: firstIndex + 1,
              last: firstIndex + shownProducts.length,
              total: visibleProducts.length,
            })
            : <>{visibleProducts.length} {copy(`${countNamespace}.${countLabel}`, countLabel)}</>}
        </p>
        {activeFilters && (
          <button type="button" className="text-link catalogue-clear" onClick={clearFilters}>
            <StorefrontText id="shop.clear-filters" fallback="Clear filters" />
          </button>
        )}
      </div>
      <ProductGrid products={shownProducts} emptyTitle={empty.title} emptyMessage={empty.message} />
      {pageCount > 1 && (
        <nav className="catalogue-pagination" aria-label={copy("shop.pagination", "Product pages")}>
          <button type="button" className="catalogue-page-step" disabled={currentPage === 1}
            aria-label={copy("shop.previous-page", "Previous page")} onClick={() => goToPage(currentPage - 1)}>
            <Icon name="arrow-right" className="catalogue-previous-arrow" size={16} />
            <span><StorefrontText id="shop.previous" fallback="Previous" /></span>
          </button>
          <div className="catalogue-page-numbers">
            {pages.map((number, index) => (
              <span key={number}>
                {index > 0 && number - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
                <button type="button" aria-current={number === currentPage ? "page" : undefined}
                  aria-label={copy("shop.page-number", "Page {number}", { number })} onClick={() => goToPage(number)}>
                  {number}
                </button>
              </span>
            ))}
          </div>
          <button type="button" className="catalogue-page-step" disabled={currentPage === pageCount}
            aria-label={copy("shop.next-page", "Next page")} onClick={() => goToPage(currentPage + 1)}>
            <span><StorefrontText id="shop.next" fallback="Next" /></span><Icon name="arrow-right" size={16} />
          </button>
        </nav>
      )}
      {!collection && <p className="shop-price-note"><StorefrontText id="shop.every-product-is-priced-between-0-01" fallback="Every product is priced between £0.01 and £19.99." /></p>}
    </>
  );

  return (
    <div className="catalogue-page catalogue-results">
      <div className="catalogue-listing">
        <aside className="catalogue-filter-sidebar" aria-labelledby={filtersId}>
          <h2 id={filtersId}><StorefrontText id="shop.search-and-filters" fallback="Search & filters" /></h2>
          {filterControls}
          {!collection && !newOnly && departments.length > 0 && (
            <details className="catalogue-departments">
              <summary><StorefrontText id="shop.browse-categories" fallback="Browse all categories" /></summary>
              <nav className="catalogue-category-links" aria-label={copy("shop.browse-categories", "Browse categories")}>
                {departments.map(({ slug, name }) => <Link key={slug} href={`/categories/${slug}`}>{name}</Link>)}
              </nav>
            </details>
          )}
        </aside>
        <div className="catalogue-listing-results">{results}</div>
      </div>
    </div>
  );
}
