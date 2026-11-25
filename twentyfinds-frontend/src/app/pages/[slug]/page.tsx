import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedPage } from "@/components/storefront/ContentPage";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { getCmsPage } from "@/features/storefront/cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getCmsPage((await params).slug);
  return { title: page?.metaTitle ?? page?.title, description: page?.metaDescription };
}

async function PageContent({ params }: Props) {
  const page = await getCmsPage((await params).slug);
  if (!page || ["homepage", "site-announcement", "site-footer"].includes(page.slug)) notFound();
  return <PublishedPage page={page} />;
}

export default function CmsPageRoute(props: Props) {
  return <Suspense fallback={<RouteSkeleton />}><PageContent {...props} /></Suspense>;
}
