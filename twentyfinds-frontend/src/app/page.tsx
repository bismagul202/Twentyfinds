import { DepartmentCarousel } from "@/components/storefront/DepartmentCarousel";
import { storefrontBrand } from "@/features/storefront/brand";
import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import type { ReactNode } from "react";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { Suspense } from "react";
import { getStorefront, managedMetadata } from "@/features/storefront/cms";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import Link from "next/link";
import { Icon } from "@/components/storefront/Icon";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SignatureCollections } from "@/components/storefront/SignatureCollections";
import type { StoreProduct } from "@/features/storefront/data";
import { departmentGroups, newIn } from "@/features/storefront/navigation";
import { getHomeDepartments } from "@/features/storefront/home-departments";

const personalisation = departmentGroups.flatMap(({ items }) => items)
  .find(({ id }) => id === "personalise");

function ProductSection({
  eyebrow,
  title,
  description,
  href,
  linkText,
  collection,
  emptyMessage,
  className = "",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  href: string;
  linkText: ReactNode;
  collection: StoreProduct[];
  emptyMessage?: ReactNode;
  className?: string;
}) {
  if (!collection.length && !emptyMessage) return null;

  return (
    <section className={`home-section container-shell ${className}`}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link href={href} className="text-link">
          {linkText} <Icon name="arrow-right" size={16} />
        </Link>
      </div>
      {collection.length > 0
        ? <ProductGrid products={collection} />
        : <p className="home-collection-empty">{emptyMessage}</p>}
    </section>
  );
}

export function generateMetadata() {
  return managedMetadata("homepage", {});
}

export default function Home() {
  return <Suspense fallback={<RouteSkeleton />}><HomeContent /></Suspense>;
}

async function HomeContent() {
  const { categories, products, banners, pages, copy, copyOverrides = Object.keys(copy), previewCatalog, publishedCategorySlugs } = await getStorefront();
  const text = (id: string, fallback: string) => formatStorefrontCopy(copy, id, fallback);
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const publishedSlugs = publishedCategorySlugs && new Set(publishedCategorySlugs);
  const displayCategories = getHomeDepartments(categories.filter(({ slug }) => !publishedSlugs || publishedSlugs.has(slug)));
  const hero = banners.find((banner) => ["homepage", "hero"].includes(banner.placement));
  const promotion = banners.find((banner) => banner.placement === "promotion");
  const home = pages.find((page) => page.slug === "homepage");
  const heroTitle = home?.title ?? (copyOverrides.includes("homepage.good-taste") ? copy["homepage.good-taste"] : hero?.title);
  const publishedProducts = previewCatalog ? [] : products;
  const trending = publishedProducts.filter(({ collections }) => collections.includes("trending"));
  const newArrivals = publishedProducts.filter(({ collections }) => collections.includes("new"));
  const personalisedSlug = personalisation?.slugs?.find((slug) => categoriesBySlug.has(slug));
  const personalisedHref = personalisedSlug ? `/categories/${personalisedSlug}` : personalisation?.href ?? "/shop?q=personalised";
  const hasLegacySecondaryCopy = !copyOverrides.includes("homepage.explore-personalised")
    && copyOverrides.includes("homepage.browse-categories");
  const deals = publishedProducts.filter((product) => product.compareAt !== undefined);

  return (
    <>
      <section className="campaign-hero">
        <div className="campaign-inner">
          <div className="campaign-hero-copy">
            <span className="campaign-eyebrow"><StorefrontText id="homepage.the-twentyfinds-edit" fallback="THE 20ISH EDIT" /></span>
            <h1>
              <span>{heroTitle ?? <StorefrontText id="homepage.good-taste" fallback={storefrontBrand.primaryTagline[0]} />}</span>
              <em><StorefrontText id="homepage.under-20" fallback={storefrontBrand.primaryTagline[1]} /></em>
            </h1>
            <p>{home?.content ?? <StorefrontText id="homepage.discover-fashion-homeware-and-everyday-essentials-worth" fallback="Discover stylish everyday essentials, handcrafted creations, personalised gifts and little luxuries — all under £20." />}</p>
            <div className="campaign-actions">
              <Link href={hero?.href ?? "/shop"} className="campaign-shop">
                <StorefrontText id="homepage.shop-all-finds" fallback="Shop All Finds" />
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href={hasLegacySecondaryCopy ? "#shop-by-category" : personalisedHref} className="campaign-browse">
                {hasLegacySecondaryCopy
                  ? <StorefrontText id="homepage.browse-categories" fallback="Browse categories" />
                  : <StorefrontText id="homepage.explore-personalised" fallback="Explore Personalised" />}
                <Icon name={hasLegacySecondaryCopy ? "chevron-down" : "arrow-right"} size={15} />
              </Link>
            </div>
          </div>
          <div className={hero?.image ? "campaign-visual" : "campaign-visual campaign-visual-departments"}>
            <ImageCanvas
              src={hero?.image ?? "/20ish-hero-banner.webp"}
              alt={hero?.title ?? text("homepage.hero-image-description", "Kitchenware, folded clothing, bags, stationery and wrapped gifts against a maroon backdrop")}
              className="campaign-photo"
            />
          </div>
        </div>
      </section>

      <nav className="home-service-links" aria-label={text("homepage.shopping-help", "Shopping help")}>
        <div className="container-shell">
          <Link href="/shipping"><Icon name="truck" size={19} />{text("homepage.delivery-label", "UK delivery")}</Link>
          <Link href="/returns"><Icon name="refresh" size={19} />{text("homepage.returns-label", "Returns information")}</Link>
          <Link href="/contact"><Icon name="user" size={19} />{text("homepage.support-label", "Customer support")}</Link>
        </div>
      </nav>

      <section className="category-section departments-section" id="shop-by-category" aria-labelledby="departments-title">
        <h2 id="departments-title" className="departments-heading">
          <StorefrontText id="homepage.shop-by-category" fallback="Shop by category" />
        </h2>
        {displayCategories.length > 0 && (
          <DepartmentCarousel>
            {displayCategories.map((category) => (
              <li key={category.id}>
                <Link className="department-tile" href={category.href}>
                  <div className="department-media">
                    <ImageCanvas src={category.image} alt="" className="department-image" sizes="(max-width: 450px) 44vw, 196px" />
                  </div>
                  <span className="department-caption">
                    <span className="department-name">{category.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </DepartmentCarousel>
        )}
      </section>

      <ProductSection
        eyebrow={<StorefrontText id="homepage.in-the-spotlight" fallback="In the spotlight" />}
        title={<StorefrontText id="homepage.trending-finds" fallback="Trending finds" />}
        description={<StorefrontText id="homepage.trending-description" fallback="A selection of standout finds from across the shop." />}
        href="/shop"
        linkText={<StorefrontText id="homepage.browse-all-finds" fallback="Browse all finds" />}
        collection={trending.slice(0, 4)}
        emptyMessage={<StorefrontText id="homepage.trending-empty" fallback="There are no trending finds to show yet." />}
        className="home-trending"
      />

      <ProductSection
        eyebrow={<StorefrontText id="homepage.just-arrived" fallback="Just arrived" />}
        title={<StorefrontText id="homepage.new-arrivals" fallback="New arrivals" />}
        description={<StorefrontText id="homepage.fresh-finds-for-your-home-your-plans" fallback="Fresh finds for your home, your plans and all the in-between." />}
        href={newIn.href}
        linkText={<StorefrontText id="homepage.shop-new-arrivals" fallback="Shop new arrivals" />}
        collection={newArrivals.slice(0, 6)}
        emptyMessage={<StorefrontText id="homepage.new-arrivals-empty" fallback="There are no new arrivals to show yet." />}
        className="home-new-arrivals"
      />

      <SignatureCollections categorySlugs={categories.map(({ slug }) => slug)} banners={banners} />

      {deals.length > 0 && promotion ? (
        <section className="editorial-campaign container-shell">
          <div className="editorial-campaign-copy">
            <span className="eyebrow"><StorefrontText id="homepage.a-little-more-for-a-little-less" fallback="A little more for a little less" /></span>
            <h2>{promotion.title}</h2>
            <p><StorefrontText id="homepage.explore-everyday-favourites-without-stretching-your-budget" fallback="Explore everyday favourites without stretching your budget. A thoughtful mix for you, your home and everyone you love." /></p>
            <Link href={promotion.href ?? "/shop?deals=1"} className="button button-light"><StorefrontText id="homepage.explore-deals" fallback="EXPLORE DEALS" /><Icon name="arrow-right" size={16} />
            </Link>
            <span className="editorial-campaign-footnote"><StorefrontText id="homepage.prices-shown-in-gbp" fallback="Prices shown in GBP." /></span>
          </div>
          <div className="editorial-campaign-image-wrap">
            <ImageCanvas
              src={promotion.image}
              alt={promotion.title}
              className="editorial-campaign-image"
            />
            <span className="editorial-image-caption"><StorefrontText id="homepage.the-everyday-edit-twentyfinds" fallback="The everyday edit · 20ISH" /></span>
          </div>
        </section>
      ) : (
        <ProductSection
          eyebrow={<StorefrontText id="homepage.a-little-something-for-less" fallback="A little something for less" />}
          title={<StorefrontText id="homepage.special-offers" fallback="Special offers" />}
          description={<StorefrontText id="homepage.selected-finds-with-an-even-lovelier-price" fallback="Selected finds with an even lovelier price." />}
          href="/shop?deals=1"
          linkText={<StorefrontText id="homepage.view-all-offers" fallback="View all offers" />}
          collection={deals.slice(0, 4)}
          className="offer-section"
        />
      )}

    </>
  );
}
