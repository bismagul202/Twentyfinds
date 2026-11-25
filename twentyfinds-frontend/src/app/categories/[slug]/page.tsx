import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { getStorefront } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { ProductGrid } from "@/components/storefront/ProductGrid";
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
  const { categories, products, copy } = await getStorefront();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const descendants = new Set([category.slug]);
  const queue = [category.slug];
  for (const parent of queue) {
    for (const child of categories.filter((item) => item.parentSlug === parent)) {
      if (descendants.has(child.slug)) continue;
      descendants.add(child.slug);
      queue.push(child.slug);
    }
  }
  const categoryProducts = products.filter((product) => descendants.has(product.categorySlug));
  const subcategories = categories.filter((item) => item.parentSlug === category.slug);

  return (
    <div className="category-page container-shell">
      <div className="content-page-topline">
        <Link href="/"><StorefrontText id="category.home" fallback="Home" /></Link><span>/</span><Link href="/shop"><StorefrontText id="category.shop-all" fallback="Shop all" /></Link><span>/</span><span>{category.name}</span>
      </div>
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
        <nav className="cms-subcategories" aria-label={formatStorefrontCopy(copy, "category.subcategories-label", "Subcategories")}>
          {subcategories.map((item) => <Link className="text-link" key={item.slug} href={`/categories/${item.slug}`}>{item.name}</Link>)}
        </nav>
      )}
      <div className="category-products-heading">
        <div><span className="eyebrow"><StorefrontText id="category.good-things-live-here" fallback="Good things live here" /></span><h2><StorefrontText id="category.shop" fallback="Shop" />{" "}{category.name}</h2></div>
        <span>{categoryProducts.length} {categoryProducts.length === 1 ? <StorefrontText id="category.find" fallback="find" /> : <StorefrontText id="category.finds" fallback="finds" />}</span>
      </div>
      <ProductGrid
        products={categoryProducts}
        emptyTitle={<StorefrontText id="category.more-finds-are-on-the-way" fallback="More finds are on the way" />}
        emptyMessage={<StorefrontText id="category.we-re-making-room-for-this-category" fallback="We're making room for this category. Come back soon, or explore everything else." />}
      />
      <div className="category-back-link"><Link href="/shop"><StorefrontText id="category.explore-all-finds" fallback="Explore all finds" />{" "}<span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
