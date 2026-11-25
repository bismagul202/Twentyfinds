"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import { useMemo, useState } from "react";
import { getProductPrice, type StoreCategory, type StoreProduct } from "@/features/storefront/data";
import { ProductGrid } from "./ProductGrid";
import { Icon } from "./Icon";

export function ShopListing({
  categories,
  products,
  initialQuery = "",
  initialSort = "featured",
  initialBudget = "all",
  initialDeals = false,
}: {
  categories: StoreCategory[];
  products: StoreProduct[];
  initialQuery?: string;
  initialSort?: string;
  initialBudget?: string;
  initialDeals?: boolean;
}) {
  const copy = useStorefrontCopy();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState(initialSort);
  const [budget, setBudget] = useState(initialBudget);
  const [dealsOnly, setDealsOnly] = useState(initialDeals);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const price = getProductPrice(product);
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.description} ${product.categorySlug}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        category === "all" || product.categorySlug === category;
      const matchesBudget =
        budget === "all" ||
        (budget === "under-5" && price < 5) ||
        (budget === "under-10" && price < 10) ||
        (budget === "under-20" && price < 20);
      const matchesDeals = !dealsOnly || product.compareAt !== undefined;
      const matchesSort =
        sort !== "bestsellers" || product.collections.includes("bestseller");

      return (
        matchesQuery &&
        matchesCategory &&
        matchesBudget &&
        matchesDeals &&
        matchesSort
      );
    });

    if (sort === "new") {
      return filtered.filter((product) => product.collections.includes("new"));
    }

    if (sort === "price-low") {
      return filtered.sort((first, second) => getProductPrice(first) - getProductPrice(second));
    }

    if (sort === "price-high") {
      return filtered.sort((first, second) => getProductPrice(second) - getProductPrice(first));
    }

    return filtered;
  }, [budget, category, dealsOnly, products, query, sort]);

  return (
    <div className="shop-page container-shell">
      <div className="shop-heading">
        <div>
          <span className="eyebrow"><StorefrontText id="shop.good-finds-all-in-one-place" fallback="Good finds, all in one place" /></span>
          <h1><StorefrontText id="shop.shop-all" fallback="Shop all" /></h1>
          <p><StorefrontText id="shop.little-things-you-ll-love-with-nothing" fallback="Little things you'll love, with nothing over £19.99." /></p>
        </div>
        <span className="shop-heading-sticker"><StorefrontText id="shop.all-under" fallback="All under" /><br />£20 ✳</span>
      </div>

      <div className="shop-toolbar">
        <label className="shop-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            aria-label={copy("shop.search-all-products", "Search all products")}
            placeholder={copy("shop.search-finds", "Search finds...")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only"><StorefrontText id="shop.filter-by-category" fallback="Filter by category" /></span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all"><StorefrontText id="shop.all-categories" fallback="All categories" /></option>
            {categories.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
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
        <span className="results-count">
          {visibleProducts.length} {visibleProducts.length === 1 ? <StorefrontText id="shop.find" fallback="find" /> : <StorefrontText id="shop.finds" fallback="finds" />}
        </span>
      </div>

      <ProductGrid
        products={visibleProducts}
        emptyTitle={<StorefrontText id="shop.no-finds-for-that-one" fallback="No finds for that one" />}
        emptyMessage={<StorefrontText id="shop.try-a-different-search-or-clear-a" fallback="Try a different search or clear a filter to see more little favourites." />}
      />
      <p className="shop-price-note"><StorefrontText id="shop.every-product-is-priced-between-0-01" fallback="Every product is priced between £0.01 and £19.99." /></p>
    </div>
  );
}
