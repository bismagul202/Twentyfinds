import { DepartmentCarousel } from "@/components/storefront/DepartmentCarousel";
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
import { categories as editorialCategories, getProductPrice, type StoreProduct } from "@/features/storefront/data";

function ProductSection({
  eyebrow,
  title,
  description,
  href,
  linkText,
  collection,
  className = "",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  href: string;
  linkText: ReactNode;
  collection: StoreProduct[];
  className?: string;
}) {
  if (!collection.length) return null;

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
      <ProductGrid products={collection} />
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
  const { categories, products, banners, pages, copy, previewCatalog } = await getStorefront();
  const text = (id: string, fallback: string) => formatStorefrontCopy(copy, id, fallback);
  const featuredCategories = categories.filter((category) => !category.parentSlug).slice(0, 12);
  const departments = ["fashion-clothing", "home-living", "beauty-accessories", "kitchen-dining", "stationery-office", "handmade-crochet", "modest-fashion"];
  const editorial = departments.flatMap((slug) => editorialCategories.filter((category) => category.slug === slug));
  const fallbackImage = "/twentyfinds-campaign.webp";
  const editorialImage = (slug: string) => editorialCategories.find((category) => category.slug === slug)?.image ?? fallbackImage;
  const displayCategories = !previewCatalog && featuredCategories.length ? featuredCategories : editorial;
  const hero = banners.find((banner) => ["homepage", "hero"].includes(banner.placement));
  const promotion = banners.find((banner) => banner.placement === "promotion");
  const home = pages.find((page) => page.slug === "homepage");
  const heroTitle = home?.title ?? hero?.title ?? copy["homepage.good-taste"];
  const newArrivals = products.filter((product) =>
    product.collections.includes("new"),
  );
  const deals = products.filter((product) => product.compareAt !== undefined);

  return (
    <>
      <section className="campaign-hero">
        <div className="campaign-inner">
          <div className="campaign-hero-copy">
            <span className="campaign-eyebrow"><StorefrontText id="homepage.the-twentyfinds-edit" fallback="THE TWENTYFINDS EDIT" /></span>
            <h1>
              <span>{heroTitle ?? <StorefrontText id="homepage.good-taste" fallback="Good taste." />}</span>
              <em><StorefrontText id="homepage.under-20" fallback="Under &pound;20." /></em>
            </h1>
            <p>{home?.content ?? <StorefrontText id="homepage.discover-fashion-homeware-and-everyday-essentials-worth" fallback="Shop fashion, clothing, kitchen essentials, stationery and handmade crochet." />}</p>
            <div className="campaign-actions">
              <Link href={hero?.href ?? "/shop"} className="campaign-shop">
                <StorefrontText id="homepage.shop-all-finds" fallback="Shop all finds" />
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="#shop-by-category" className="campaign-browse">
                <StorefrontText id="homepage.browse-categories" fallback="Browse categories" />
                <Icon name="chevron-down" size={15} />
              </Link>
            </div>
          </div>
          <div className={hero?.image ? "campaign-visual" : "campaign-visual campaign-visual-departments"}>
            <ImageCanvas
              src={hero?.image ?? "/twentyfinds-hero-crochet.webp"}
              alt={hero?.title ?? text("homepage.hero-image-description", "Kitchen ceramics, fashion accessories, folded clothing, stationery and handmade crochet in warm sunlight")}
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
            {displayCategories.map((category) => {
              const tile = (
                <>
                  <div className="department-media">
                    <ImageCanvas src={category.image || editorialImage(category.slug)} alt="" className="department-image" />
                  </div>
                  <span className="department-caption">
                    <span className="department-name">{category.name}</span>
                  </span>
                </>
              );

              return (
                <li key={category.slug}>
                  {featuredCategories.length > 0 ? (
                    <Link className="department-tile" href={`/categories/${category.slug}`}>{tile}</Link>
                  ) : (
                    <div className="department-tile">{tile}</div>
                  )}
                </li>
              );
            })}
          </DepartmentCarousel>
        )}
      </section>

      <ProductSection
        eyebrow={<StorefrontText id="homepage.just-arrived" fallback="Just arrived" />}
        title={<StorefrontText id="homepage.new-arrivals" fallback="New arrivals" />}
        description={previewCatalog
          ? <StorefrontText id="homepage.sample-products-note" fallback="Sample products for preview." />
          : <StorefrontText id="homepage.fresh-finds-for-your-home-your-plans" fallback="Fresh finds for your home, your plans and all the in-between." />}
        href="/shop?sort=new"
        linkText={<StorefrontText id="homepage.shop-new-arrivals" fallback="Shop new arrivals" />}
        collection={newArrivals.slice(0, 6)}
        className="home-new-arrivals"
      />

      {products.some((product) => getProductPrice(product) < 10) && (
        <section className="everyday-edit container-shell" aria-labelledby="everyday-edit-title">
          <div className="everyday-edit-copy">
            <h2 id="everyday-edit-title">
              <StorefrontText id="homepage.gifts-under-10" fallback="Gifts under &pound;10" />
            </h2>
            <Link href="/shop?budget=under-10" className="everyday-edit-link">
              <StorefrontText id="homepage.shop-gifts-under-10" fallback="Shop under &pound;10" />
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          <ImageCanvas src="/twentyfinds-hero-wide.webp" alt="" className="everyday-edit-image" />
        </section>
      )}

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
            <span className="editorial-image-caption"><StorefrontText id="homepage.the-everyday-edit-twentyfinds" fallback="The everyday edit · TWENTYFINDS" /></span>
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
