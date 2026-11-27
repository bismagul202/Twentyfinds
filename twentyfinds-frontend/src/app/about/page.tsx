import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { bannerImage, getStorefront, managedMetadata } from "@/features/storefront/cms";
import { supportGuides } from "@/features/storefront/support-guides";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { Icon } from "@/components/storefront/Icon";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import "./about.css";

const shopLinks = [
  { id: "fashion", label: "Fashion", href: "/shop?q=fashion" },
  { id: "jewellery", label: "Jewellery", href: "/shop?q=jewellery" },
  { id: "stationery", label: "Stationery", href: "/shop?q=stationery" },
  { id: "personalised", label: "Personalised gifts", href: "/shop?q=personalised" },
];

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("about", {
    title: "About 20ISH",
    description: "Meet the team behind 20ISH and explore fashion, jewellery, stationery and personalised gifts under £20.",
  });
}

export default function AboutPage() {
  return <Suspense fallback={<RouteSkeleton />}><AboutContent /></Suspense>;
}

async function AboutContent() {
  const { banners, pages } = await getStorefront();
  const page = pages.find(({ slug }) => slug === "about");
  const title = page?.title ?? <StorefrontText id="about.good-things-should-feel-good" fallback="For the little things that mean more" />;

  return (
    <article className="about-page">
      <header className="about-hero">
        <div className="about-hero-copy">
          <nav className="content-page-topline" aria-label="Breadcrumb">
            <Link href="/"><StorefrontText id="content.home" fallback="Home" /></Link>
            <span aria-hidden="true">/</span><span aria-current="page"><StorefrontText id="about.breadcrumb" fallback="About 20ISH" /></span>
          </nav>
          <h1>{title}</h1>
          <p className="cms-page-copy">{page?.content ?? <StorefrontText id="about.twentyfinds-is-a-new-kind-of-happy" fallback="Our team brings together fashion, jewellery, stationery and personalised gifts, all under £20." />}</p>
          <Link href="/shop" className="button button-light">
            <StorefrontText id="content.shop-all" fallback="Shop all" /><Icon name="arrow-right" size={17} />
          </Link>
        </div>
        <ImageCanvas src={bannerImage(banners, "about", "/20ish-about-everyday-edit.webp")} alt="" className="about-hero-image" sizes="100vw" />
      </header>

      {!page && (
        <div className="about-body container-shell">
          <section className="about-story" aria-labelledby="about-story-title">
            <h2 id="about-story-title"><StorefrontText id="about.family-story-title" fallback="Why we built 20ISH" /></h2>
            <div className="about-story-copy">
              <p><StorefrontText id="about.family-story-opening" fallback="Some things earn a place in your everyday life. The earrings you put on without thinking. The notebook you carry everywhere. The accessory that makes an old outfit feel new again. We built 20ISH to make those small finds easier to come by." /></p>
              <p><StorefrontText id="about.family-story-business" fallback="Our team chooses the everyday finds and makes the personalised pieces. We want it to be just as easy to find something for yourself as it is to pick a gift that says, ‘I thought of you.’" /></p>
            </div>
          </section>

          <section className="about-edit" aria-labelledby="about-edit-title">
            <div className="about-edit-images">
              <ImageCanvas src={bannerImage(banners, "about-fashion", "/20ish-category-fashion.webp")} alt="" className="about-edit-fashion" sizes="(max-width: 720px) 54vw, 400px" />
              <ImageCanvas src={bannerImage(banners, "about-stationery", "/20ish-category-stationery.webp")} alt="" className="about-edit-stationery" sizes="(max-width: 720px) 34vw, 230px" />
            </div>
            <div className="about-edit-copy">
              <h2 id="about-edit-title"><StorefrontText id="about.a-whole-lot-of-everything" fallback="What are you in the mood for?" /></h2>
              <p><StorefrontText id="about.we-re-building-a-multi-category-store" fallback="An accessory to go with an outfit you already love. A fresh notebook for a new idea. Or a gift with their name on it. Pick what you’re looking for and start there." /></p>
              <nav className="about-shop-links" aria-label="Shop collections">
                {shopLinks.map(({ id, label, href }) => (
                  <Link href={href} key={id} className="text-link">
                    <StorefrontText id={`about.shop-${id}`} fallback={label} /><Icon name="arrow-right" size={16} />
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          <section className="about-guides" aria-labelledby="about-guides-title">
            <h2 id="about-guides-title"><StorefrontText id="about.explore-our-collections" fallback="A closer look at our collections" /></h2>
            <div className="about-guide-links">
              {supportGuides.map(({ slug, title }) => (
                <Link className="about-guide" href={`/pages/${slug}`} key={slug}>
                  <StorefrontText id={`about.guide-${slug}`} fallback={title} />
                  <Icon name="arrow-right" size={17} />
                </Link>
              ))}
            </div>
          </section>

          <aside className="about-preview">
            <h2><StorefrontText id="about.still-getting-ready" fallback="Still getting ready" /></h2>
            <p><StorefrontText id="about.twentyfinds-is-currently-a-storefront-preview-product" fallback="Browse the collections and add your favourites to your bag." />{" "}<StorefrontText id="about.this-is-a-demo-storefront-no-orders" fallback="You can check out as a guest." /></p>
          </aside>
        </div>
      )}
    </article>
  );
}
