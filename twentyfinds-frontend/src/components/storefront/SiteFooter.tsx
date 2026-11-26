import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import { storefrontBrand } from "@/features/storefront/brand";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import type { StoreCategory } from "@/features/storefront/data";
import type { CmsPage } from "@/features/storefront/cms";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { NewsletterForm } from "./NewsletterForm";
import { Icon } from "./Icon";
import { supportGuides } from "@/features/storefront/support-guides";
import { departmentGroups } from "@/features/storefront/navigation";

const footerLinks = [
  { id: "explore", heading: "Explore", links: [
    ["shop-all", "Shop all", "/shop"], ["new-arrivals", "New arrivals", "/shop?sort=new"],
    ["best-sellers", "Best sellers", "/shop?sort=bestsellers"], ["special-offers", "Special offers", "/shop?deals=1"],
  ] },
  { id: "categories", heading: "Shop categories", links: [] },
  { id: "customer-care", heading: "Customer care", links: [
    ["contact", "Contact us", "/contact"], ["faq", "FAQs", "/faq"],
    ["shipping", "Delivery information", "/shipping"], ["returns", "Returns and refunds", "/returns"],
  ] },
  { id: "about", heading: "About", links: [
    ["our-story", "About 20ISH", "/about"],
  ] },
];

export function SiteFooter({ pages, categories, copy }: { pages: CmsPage[]; categories: StoreCategory[]; copy: Record<string, string> }) {
  const text = (id: string, fallback: string) => formatStorefrontCopy(copy, id, fallback);
  const reserved = new Set(["homepage", "site-announcement", "site-footer", "about", "contact", "faq", "shipping", "returns", "privacy", "terms"]);
  supportGuides.forEach(({ slug }) => reserved.add(slug));
  const footerCopy = pages.find((page) => page.slug === "site-footer");
  const departments = categories.filter((category) => !category.parentSlug).slice(0, 6);
  const categoryLinks = departments.length
    ? departments.map(({ slug, name }) => ({ href: `/categories/${slug}`, label: name }))
    : departmentGroups.flatMap(({ items }) => items).slice(0, 6).map(({ href, label }) => ({ href, label }));
  const published = pages.filter((page) => !reserved.has(page.slug));
  return (
    <footer className="site-footer storefront-footer">
      <div className="footer-main container-shell">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup" aria-label={text("footer.brand-home", `${storefrontBrand.name} home`)}>
            <BrandLogo copyId="footer.twentyfinds" size={128} />
          </Link>
          <div className="footer-brand-copy">
            <p>{footerCopy?.title ?? <StorefrontText id="footer.everyday-finds-for-a-life-well-lived" fallback={storefrontBrand.secondaryTagline} />}</p>
            <p className="footer-note">
              {footerCopy?.content ?? <StorefrontText id="footer.a-considered-collection-of-little-things-to" fallback="A considered collection of little things to love, all under £20." />}
            </p>
          </div>
        </div>
        <div className="footer-navigation">
          {footerLinks.map((column) => (
            <nav className="footer-column" key={column.id} aria-label={text(`footer.heading-${column.id}`, column.heading)}>
              <h2>{text(`footer.heading-${column.id}`, column.heading)}</h2>
              {column.id === "categories"
                ? categoryLinks.map(({ href, label }) => (
                    <Link href={href} key={href}>{label}</Link>
                  ))
                : column.links.map(([id, label, href]) => (
                    <Link href={href} key={href}>{text(`footer.link-${id}`, label)}</Link>
                  ))}
              {column.id === "about" && supportGuides.map(({ slug, title, linkId }) => (
                <Link key={slug} href={`/pages/${slug}`}>
                  {text(`footer.link-${linkId}`, pages.find((page) => page.slug === slug)?.title ?? title)}
                </Link>
              ))}
            </nav>
          ))}
          {published.length > 0 && (
            <nav className="footer-column footer-published-links" aria-label={text("footer.more-information", "More information")}>
              <h2><StorefrontText id="footer.more-information" fallback="More information" /></h2>
              {published.map((page) => <Link href={`/pages/${page.slug}`} key={page.slug}>{page.title}</Link>)}
            </nav>
          )}
        </div>
      </div>

      <section className="footer-newsletter">
        <div className="container-shell footer-newsletter-inner">
          <div className="footer-newsletter-heading">
            <span className="footer-newsletter-icon"><Icon name="mail" size={24} /></span>
            <div>
              <span className="eyebrow"><StorefrontText id="footer.a-little-note-from-us" fallback="The 20ISH newsletter" /></span>
              <h2><StorefrontText id="footer.good-finds-delivered-to-your-inbox" fallback="Good finds, delivered to your inbox." /></h2>
            </div>
          </div>
          <div className="footer-newsletter-form">
            <NewsletterForm />
            <span><StorefrontText id="footer.no-spam-just-the-occasional-lovely-thing" fallback="Collection news and updates from 20ISH." /></span>
          </div>
        </div>
      </section>

      <div className="footer-bottom">
        <div className="container-shell footer-bottom-inner">
          <span><StorefrontText id="footer.2026-twentyfinds-storefront-preview" fallback="© 2026 20ISH" /></span>
          <nav className="footer-policy-links" aria-label={text("footer.policies", "Policies")}>
            <Link href="/privacy">{text("footer.link-privacy", "Privacy Policy")}</Link>
            <Link href="/terms">{text("footer.link-terms", "Terms and Conditions")}</Link>
          </nav>
          <span><StorefrontText id="footer.prices-shown-in-gbp" fallback="Prices shown in GBP (£)" /></span>
        </div>
      </div>
    </footer>
  );
}
