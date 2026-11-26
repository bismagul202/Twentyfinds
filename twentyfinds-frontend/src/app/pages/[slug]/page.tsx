import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage, PublishedPage } from "@/components/storefront/ContentPage";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { getCmsPage, managedMetadata } from "@/features/storefront/cms";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { getSupportGuide } from "@/features/storefront/support-guides";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSupportGuide(slug);
  if (guide) return managedMetadata(slug, { title: guide.title, description: guide.intro });
  const page = await getCmsPage(slug);
  return { title: page?.metaTitle ?? page?.title, description: page?.metaDescription };
}

async function PageContent({ params }: Props) {
  const { slug } = await params;
  const page = await getCmsPage(slug);
  if (["homepage", "site-announcement", "site-footer"].includes(slug)) notFound();
  if (page) return <PublishedPage page={page} />;

  const guide = getSupportGuide(slug);
  if (!guide) notFound();
  return (
    <ContentPage
      title={<StorefrontText id={`${slug}.title`} fallback={guide.title} />}
      intro={<StorefrontText id={`${slug}.intro`} fallback={guide.intro} />}
      sections={guide.sections.map(({ id, title, body }) => ({
        title: <StorefrontText id={`${slug}.${id}-title`} fallback={title} />,
        body: <StorefrontText id={`${slug}.${id}-body`} fallback={body} />,
      }))}
      links={[
        { href: guide.browseHref, label: <StorefrontText id={`${slug}.browse`} fallback={guide.browseLabel} /> },
        { href: "/contact", label: <StorefrontText id="content.contact-us" fallback="Contact us" /> },
      ]}
    />
  );
}

export default function CmsPageRoute(props: Props) {
  return <Suspense fallback={<RouteSkeleton />}><PageContent {...props} /></Suspense>;
}
