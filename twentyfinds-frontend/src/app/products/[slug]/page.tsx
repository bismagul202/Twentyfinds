import { getStorefront } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/storefront/ProductDetails";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { products as sampleProducts } from "@/features/storefront/data";

export function generateStaticParams() {
  return sampleProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getStorefront();
  const product = products.find((item) => item.slug === slug);

  return {
    title: product?.name ?? "Product",
    description: product?.description,
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
  const { products } = await getStorefront();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
