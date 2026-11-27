import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublishedPage } from "@/components/storefront/ContentPage";
import { Icon } from "@/components/storefront/Icon";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { ShopListing } from "@/components/storefront/ShopListing";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { bannerImage, getCmsPage, getStorefront, managedMetadata } from "@/features/storefront/cms";
import { categoryBranch, filterCatalogue } from "@/features/storefront/catalogue";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { getSupportGuide, supportGuides } from "@/features/storefront/support-guides";
import "./guide.css";

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
  if (["homepage", "site-announcement", "site-footer"].includes(slug)) notFound();
  const { pages, categories, products, banners, previewCatalog, publishedCategorySlugs } = await getStorefront();
  const page = pages.find((item) => item.slug === slug);
  const guide = getSupportGuide(slug);
  if (!guide) {
    if (page) return <PublishedPage page={page} />;
    notFound();
  }
  const title = page?.title ?? <StorefrontText id={`${slug}.title`} fallback={guide.title} />;
  const category = categories.find(({ slug }) =>
    guide.categorySlugs.some((candidate) => candidate === slug) && (!publishedCategorySlugs || publishedCategorySlugs.includes(slug)),
  );
  const branch = category && categoryBranch(categories, category.slug);
  const collection = previewCatalog ? [] : products.filter((product) => branch?.has(product.categorySlug));
  if (!branch && !previewCatalog) {
    const matching = new Set(guide.searchTerms.flatMap((query) => filterCatalogue(products, categories, {
      query, category: "all", budget: "all", sort: "featured", dealsOnly: false,
    })).map(({ slug }) => slug));
    collection.push(...products.filter((product) => matching.has(product.slug)));
  }
  const browseHref = category ? `/categories/${category.slug}` : guide.browseHref;
  const enquiryHref = `/contact?collection=${slug}#contact-message-title`;
  const collectionCategories = new Set(collection.map((product) => product.categorySlug));
  const filterCategories = categories.filter(({ slug }) => branch ? branch.has(slug) : collectionCategories.has(slug));
  return (
    <article className={`collection-guide collection-guide--${slug}`}>
      <header className="collection-guide-hero">
        <div className="collection-guide-intro">
          <nav className="content-page-topline" aria-label="Breadcrumb">
            <Link href="/"><StorefrontText id="content.home" fallback="Home" /></Link>
            <span aria-hidden="true">/</span><span aria-current="page">{title}</span>
          </nav>
          <h1>{title}</h1>
          {!page && <p><StorefrontText id={`${slug}.intro`} fallback={guide.intro} /></p>}
          <div className="collection-guide-actions">
            <Link href={browseHref} className="button button-light">
              <StorefrontText id={`${slug}.browse`} fallback={guide.browseLabel} />
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link href={enquiryHref} className="text-link"><StorefrontText id={`${slug}.ask`} fallback="Ask about this collection" /></Link>
          </div>
        </div>
        <ImageCanvas className="collection-guide-hero-image" src={bannerImage(banners, slug, guide.image)} alt="" sizes="(max-width: 720px) 100vw, 52vw" />
      </header>
      <section className="collection-guide-shop" aria-label="Shop the collection">
        <nav className="collection-guide-filters container-shell" aria-label="Browse by item type">
          {guide.browseOptions.map((option) => {
            const query = !category && "fallbackQuery" in option ? option.fallbackQuery : option.query;
            const params = new URLSearchParams({ q: query });
            if (category) params.set("category", category.slug);
            return (
              <Link key={option.query} href={`/shop?${params}`}>
                <StorefrontText id={`${slug}.browse-${option.query.replaceAll(" ", "-")}`} fallback={option.label} />
                <Icon name="arrow-right" size={15} />
              </Link>
            );
          })}
        </nav>
        <ShopListing
          key={slug}
          categories={filterCategories}
          products={collection}
          collection
          heading={<StorefrontText id={`${slug}.shop-title`} fallback="Shop the collection" />}
          emptyState={{
            title: <StorefrontText id={`${slug}.empty-title`} fallback="No items published yet" />,
            message: <Link href={enquiryHref} className="text-link"><StorefrontText id={`${slug}.empty-message`} fallback="Ask us about something you have in mind" /><Icon name="arrow-right" size={16} /></Link>,
          }}
        />
      </section>
      <div className="collection-guide-body container-shell">
        {page ? <p className="cms-page-copy">{page.content}</p> : guide.sections.map(({ id, title: heading, body }) => (
          <section className="collection-guide-topic" key={id}>
            <h2><StorefrontText id={`${slug}.${id}-title`} fallback={heading} /></h2>
            <p><StorefrontText id={`${slug}.${id}-body`} fallback={body} /></p>
          </section>
        ))}
        <nav className="collection-guide-related" aria-label="Explore more collections">
          <h2><StorefrontText id="content.explore-more-collections" fallback="Explore more collections" /></h2>
          {supportGuides.filter((item) => item.slug !== slug).map((item) => (
            <Link key={item.slug} href={`/pages/${item.slug}`} className="text-link">
              <StorefrontText id={`about.guide-${item.slug}`} fallback={item.title} />
              <Icon name="arrow-right" size={16} />
            </Link>
          ))}
        </nav>
      </div>
    </article>
  );
}

export default function CmsPageRoute(props: Props) {
  return <Suspense fallback={<RouteSkeleton />}><PageContent {...props} /></Suspense>;
}
