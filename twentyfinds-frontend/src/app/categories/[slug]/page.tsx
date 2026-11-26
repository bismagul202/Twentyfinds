import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { getStorefront } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { ShopListing } from "@/components/storefront/ShopListing";
import { categoryBranch } from "@/features/storefront/catalogue";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { categories as sampleCategories } from "@/features/storefront/data";

export function generateStaticParams() {
  return sampleCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getStorefront();
  const category = categories.find((item) => item.slug === slug);

  return {
    title: category?.name ?? "Category",
    description: category?.description,
  };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories, products, copy, previewCatalog } = await getStorefront();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const descendants = categoryBranch(categories, slug);
  const branch = categories.filter((item) => descendants.has(item.slug));
  const categoryProducts = previewCatalog ? [] : products.filter((product) => descendants.has(product.categorySlug));
  const parent = categories.find((item) => item.slug === category.parentSlug);
  const subcategories = categories.filter((item) => item.parentSlug === category.slug);

  return (
    <div className="category-page container-shell">
      <nav className="content-page-topline" aria-label={formatStorefrontCopy(copy, "category.breadcrumb", "Breadcrumb")}>
        <Link href="/"><StorefrontText id="category.home" fallback="Home" /></Link><span aria-hidden="true">/</span>
        <Link href="/shop"><StorefrontText id="category.shop-all" fallback="Shop all" /></Link><span aria-hidden="true">/</span>
        {parent && <><Link href={`/categories/${parent.slug}`}>{parent.name}</Link><span aria-hidden="true">/</span></>}
        <span aria-current="page">{category.name}</span>
      </nav>
      <header className={`category-hero category-hero-${category.tint}`}>
        <ImageCanvas src={category.image} alt="" className="category-hero-image" />
        <div className="category-hero-copy">
          <span className="eyebrow"><StorefrontText id="category.the-category-edit" fallback="The category edit ·" />{" "}{category.mark}</span>
          <h1>{category.name}</h1>
          <p>{category.description}<StorefrontText id="category.find-your-next-little-favourite-always-under" fallback=". Find your next little favourite, always under £20." /></p>
        </div>
        <span className="category-hero-price"><StorefrontText id="category.everything" fallback="everything" /><br /><strong><StorefrontText id="category.under-20" fallback="under £20" /></strong></span>
      </header>
      {subcategories.length > 0 && (
        <nav className="cms-subcategories catalogue-category-links" aria-label={formatStorefrontCopy(copy, "category.subcategories-label", "Subcategories")}>
          {subcategories.map((item) => <Link className="text-link" key={item.slug} href={`/categories/${item.slug}`}>{item.name}</Link>)}
        </nav>
      )}
      <div className="category-products-heading">
        <div><span className="eyebrow"><StorefrontText id="category.good-things-live-here" fallback="Good things live here" /></span><h2><StorefrontText id="category.shop" fallback="Shop" />{" "}{category.name}</h2></div>
      </div>
      <ShopListing key={slug} categories={branch} products={categoryProducts} collection />
      <div className="category-back-link"><Link href="/shop"><StorefrontText id="category.explore-all-finds" fallback="Explore all finds" />{" "}<span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
