import { getStorefront } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/storefront/ProductDetails";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { products as sampleProducts } from "@/features/storefront/data";
import { categoryBranch } from "@/features/storefront/catalogue";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { ProductGrid } from "@/components/storefront/ProductGrid";

export function generateStaticParams() {
  return sampleProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products, previewCatalog } = await getStorefront();
  const product = previewCatalog ? undefined : products.find((item) => item.slug === slug);

  return {
    title: product?.metaTitle ?? product?.name ?? "Product",
    description: product?.metaDescription ?? product?.description,
  };
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories, products, previewCatalog } = await getStorefront();
  const product = previewCatalog ? undefined : products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const category = categories.find(({ slug }) => slug === product.categorySlug);
  const branch = categoryBranch(categories, category?.parentSlug ?? product.categorySlug);
  const candidates = products.filter((item) => item.slug !== slug && branch.has(item.categorySlug));
  const related = [
    ...candidates.filter((item) => item.categorySlug === product.categorySlug),
    ...candidates.filter((item) => item.categorySlug !== product.categorySlug),
  ].slice(0, 4);

  return (
    <>
      <ProductDetails key={slug} product={product} />
      {related.length > 0 && (
        <section className="product-related container-shell" aria-labelledby="product-related-title">
          <h2 id="product-related-title"><StorefrontText id="product.related-products" fallback="Related finds" /></h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
