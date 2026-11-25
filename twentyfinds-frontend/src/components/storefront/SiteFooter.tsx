import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import type { StoreCategory } from "@/features/storefront/data";
import type { CmsPage } from "@/features/storefront/cms";
import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

const footerLinks = [
  { id: "explore", heading: "Explore", links: [
    ["shop-all", "Shop all", "/shop"], ["new-arrivals", "New arrivals", "/shop?sort=new"],
    ["best-sellers", "Best sellers", "/shop?sort=bestsellers"], ["special-offers", "Special offers", "/shop?deals=1"],
  ] },
  { id: "categories", heading: "Shop categories", links: [] },
  { id: "customer-care", heading: "Customer care", links: [
    ["contact", "Contact us", "/contact"], ["faq", "FAQs", "/faq"],
    ["shipping", "Shipping information", "/shipping"], ["returns", "Returns information", "/returns"],
  ] },
  { id: "about", heading: "About", links: [
    ["our-story", "Our story", "/about"], ["privacy", "Privacy policy", "/privacy"], ["terms", "Terms & conditions", "/terms"],
  ] },
];

export function SiteFooter({ pages, categories, copy }: { pages: CmsPage[]; categories: StoreCategory[]; copy: Record<string, string> }) {
  const text = (id: string, fallback: string) => formatStorefrontCopy(copy, id, fallback);
  const reserved = new Set(["homepage", "site-announcement", "site-footer", "about", "contact", "faq", "shipping", "returns", "privacy", "terms"]);
  const footerCopy = pages.find((page) => page.slug === "site-footer");
  const departments = categories.filter((category) => !category.parentSlug).slice(0, 6);
  const published = pages.filter((page) => !reserved.has(page.slug));
  return (
    <footer className="site-footer storefront-footer">
      <section className="footer-newsletter">
        <div className="container-shell footer-newsletter-inner">
          <div>
            <span className="eyebrow"><StorefrontText id="footer.a-little-note-from-us" fallback="A little note from us" /></span>
            <h2><StorefrontText id="footer.good-finds-delivered-to-your-inbox" fallback="Good finds, delivered to your inbox." /></h2>
          </div>
          <div className="footer-newsletter-form">
            <NewsletterForm />
            <span><StorefrontText id="footer.no-spam-just-the-occasional-lovely-thing" fallback="No spam, just the occasional lovely thing. Preview sign-up only." /></span>
          </div>
        </div>
      </section>

      <div className="footer-main container-shell">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup" aria-label={text("footer.brand-home", "TWENTYFINDS home")}>
            <span className="brand-mark">20</span>
            <span className="brand-wordmark"><StorefrontText id="footer.twentyfinds" fallback="TWENTYFINDS" /></span>
          </Link>
          <p>{footerCopy?.title ?? <StorefrontText id="footer.everyday-finds-for-a-life-well-lived" fallback="Everyday finds for a life well lived." />}</p>
          <p className="footer-note">
            {footerCopy?.content ?? <StorefrontText id="footer.a-considered-collection-of-little-things-to" fallback="A considered collection of little things to love, all under £20." />}
          </p>

        </div>
        {published.length > 0 && (
          <div className="footer-column">
            <h2><StorefrontText id="footer.more-information" fallback="More information" /></h2>
            {published.map((page) => <Link href={`/pages/${page.slug}`} key={page.slug}>{page.title}</Link>)}
          </div>
        )}
        {footerLinks.filter((column) => column.id !== "categories" || departments.length > 0).map((column) => (
          <div className="footer-column" key={column.id}>
            <h2>{text(`footer.heading-${column.id}`, column.heading)}</h2>
            {column.id === "categories"
              ? departments.map((category) => (
                  <Link href={`/categories/${category.slug}`} key={category.slug}>{category.name}</Link>
                ))
              : column.links.map(([id, label, href]) => (
                  <Link href={href} key={href}>{text(`footer.link-${id}`, label)}</Link>
                ))}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="container-shell footer-bottom-inner">
          <span><StorefrontText id="footer.2026-twentyfinds-storefront-preview" fallback="© 2026 TWENTYFINDS. Storefront preview." /></span>
          <span><StorefrontText id="footer.prices-shown-in-gbp" fallback="Prices shown in GBP (£)" /></span>
        </div>
      </div>
    </footer>
  );
}
