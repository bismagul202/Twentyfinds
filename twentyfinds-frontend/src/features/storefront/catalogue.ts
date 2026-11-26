import { getProductPrice, type StoreCategory, type StoreProduct } from "./data";

export function categoryBranch(categories: StoreCategory[], slug: string) {
  const branch = new Set([slug]);
  for (const parent of branch) {
    for (const category of categories) {
      if (category.parentSlug === parent) branch.add(category.slug);
    }
  }
  return branch;
}

const budgets = new Map([["under-5", 5], ["under-10", 10], ["under-20", 20]]);
const sorts = new Set(["featured", "new", "trending", "bestsellers", "price-low", "price-high"]);

export function catalogueBudget(value: string) {
  return budgets.has(value) ? value : "all";
}

export function catalogueSort(value: string) {
  return sorts.has(value) ? value : "featured";
}

function normaliseSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s-]+/g, " ").trim();
}

export function filterCatalogue(
  products: StoreProduct[],
  categories: StoreCategory[],
  { query, category, budget, sort, dealsOnly }: {
    query: string; category: string; budget: string; sort: string; dealsOnly: boolean;
  },
) {
  const search = normaliseSearch(query);
  const branch = category === "all" ? null : categoryBranch(categories, category);
  const names = new Map(categories.map(({ slug, name }) => [slug, name]));
  const limit = budgets.get(budget);
  const collection = sort === "bestsellers" ? "bestseller" : sort === "new" || sort === "trending" ? sort : null;
  const matches = products.filter((product) => {
    const price = getProductPrice(product);
    return (!branch || branch.has(product.categorySlug))
      && (limit === undefined || price < limit)
      && (!dealsOnly || product.compareAt !== undefined)
      && (!collection || product.collections.includes(collection))
      && (!search || normaliseSearch([
        product.name, product.description, product.categorySlug, product.categoryName, names.get(product.categorySlug),
      ].join(" ")).includes(search));
  });
  if (sort === "price-low" || sort === "price-high") {
    const direction = sort === "price-low" ? 1 : -1;
    matches.sort((a, b) => direction * (getProductPrice(a) - getProductPrice(b)));
  }
  return matches;
}
