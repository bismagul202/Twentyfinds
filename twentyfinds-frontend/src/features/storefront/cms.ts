import { formatStorefrontCopy } from "./copy-text";
import type { Metadata } from "next";
import { cache } from "react";
import { categories, products, type StoreCategory, type StoreProduct } from "./data";

export type CmsPage = {
  slug: string;
  title: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

type CmsBanner = {
  title: string;
  image: string;
  href: string | null;
  placement: string;
};

type Storefront = {
  categories: StoreCategory[];
  products: StoreProduct[];
  banners: CmsBanner[];
  pages: CmsPage[];
  copy: Record<string, string>;
  previewCatalog?: boolean;
};

export const getStorefront = cache(async (): Promise<Storefront> => {
  const endpoint = process.env.STOREFRONT_CMS_URL;
  if (!endpoint) return { categories, products, banners: [], pages: [], copy: {} };

  const response = await fetch(new URL("storefront", endpoint.replace(/\/?$/, "/")), {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("The storefront CMS is unavailable.");
  const storefront: Storefront = await response.json();
  if (process.env.STOREFRONT_PREVIEW_CATALOG !== "true" || storefront.products.length) {
    return storefront;
  }

  const publishedCategorySlugs = new Set(storefront.categories.map((category) => category.slug));
  return {
    ...storefront,
    previewCatalog: true,
    categories: [...storefront.categories, ...categories.filter((category) => !publishedCategorySlugs.has(category.slug))],
    products: products.filter((product) => product.collections.includes("new")).slice(0, 6).map((product) => ({
      ...product,
      compareAt: undefined,
      label: "Sample",
      rating: 0,
      reviewCount: 0,
      collections: ["new"],
    })),
  };
});

export async function getCmsPage(slug: string) {
  return (await getStorefront()).pages.find((page) => page.slug === slug);
}

export async function managedMetadata(slug: string, fallback: Metadata): Promise<Metadata> {
  const { pages, copy } = await getStorefront();
  const page = pages.find((item) => item.slug === slug);
  const title = typeof fallback.title === "string"
    ? formatStorefrontCopy(copy, `${slug}.seo-title`, fallback.title)
    : fallback.title;
  const description = typeof fallback.description === "string"
    ? formatStorefrontCopy(copy, `${slug}.seo-description`, fallback.description)
    : fallback.description;
  return { ...fallback, title: page?.metaTitle ?? page?.title ?? title, description: page?.metaDescription ?? description };
}
