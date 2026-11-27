import Link from "next/link";
import { departmentGroups } from "@/features/storefront/navigation";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { bannerImage, type CmsBanner } from "@/features/storefront/cms";
import { Icon } from "./Icon";
import { ImageCanvas } from "./ImageCanvas";

const studios = [
  {
    id: "handmade",
    title: "Handmade Studio",
    description: "Crochet bags, flowers, bracelets, keychains and pipe cleaner crafts.",
    linkText: "Explore handmade",
    image: "/twentyfinds-category-crochet.webp",
  },
  {
    id: "personalise",
    title: "Personalisation Studio",
    description: "Customised gifts, name-based keepsakes and accessories with a personal touch.",
    linkText: "Explore personalisation",
    image: "/20ish-personalisation-studio.webp",
  },
  {
    id: "wedding-nikah",
    title: "Wedding & Nikah",
    description: "Cards, certificates, favours and wedding crafts for the day you celebrate together.",
    linkText: "Explore Wedding & Nikah",
    image: "/20ish-wedding-nikah.webp",
  },
] as const;

const occasions = [
  { label: "Birthdays", slug: "birthdays", query: "birthday" },
  { label: "Weddings", slug: "weddings", query: "wedding" },
  { label: "Eid", slug: "eid", query: "eid" },
  { label: "Christmas", slug: "christmas", query: "christmas" },
  { label: "Graduation", slug: "graduation", query: "graduation" },
  { label: "Other occasions", slug: "other-occasions", query: "gift" },
];

const gifting = departmentGroups.find(({ id }) => id === "gifting")?.items ?? [];

export function SignatureCollections({ categorySlugs, banners }: { categorySlugs: string[]; banners: CmsBanner[] }) {
  const categories = new Set(categorySlugs);

  function collectionHref(id: string, fallback: string) {
    const item = gifting.find((entry) => entry.id === id);
    const slug = item?.slugs?.find((candidate) => categories.has(candidate));
    return slug ? `/categories/${slug}` : item?.href ?? fallback;
  }

  return (
    <section className="signature-collections container-shell" aria-labelledby="signature-collections-title">
      <h2 id="signature-collections-title">
        <StorefrontText id="homepage.signature-collections" fallback="Signature collections" />
      </h2>
      <div className="signature-studios">
        {studios.map(({ id, title, description, linkText, image }) => (
          <article className="signature-studio" key={id}>
            <ImageCanvas src={bannerImage(banners, `studio-${id}`, image)} className="signature-studio-image" alt="" sizes="(max-width: 760px) 38vw, 400px" />
            <div className="signature-studio-copy">
              <h3><StorefrontText id={`homepage.signature-${id}-title`} fallback={title} /></h3>
              <p><StorefrontText id={`homepage.signature-${id}-description`} fallback={description} /></p>
              <Link href={collectionHref(id, "/shop")} className="text-link">
                <StorefrontText id={`homepage.signature-${id}-link`} fallback={linkText} />
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <nav className="signature-occasions" aria-labelledby="signature-occasions-title">
        <h3 id="signature-occasions-title"><StorefrontText id="homepage.shop-by-occasion" fallback="Shop by Occasion" /></h3>
        <ul>
          {occasions.map(({ label, slug, query }) => {
            const search = `/shop?q=${query}`;
            const href = categories.has(slug) ? `/categories/${slug}`
              : slug === "weddings" ? collectionHref("wedding-nikah", search)
              : slug === "other-occasions" ? collectionHref("gifts-occasions", search) : search;
            return (
              <li key={slug}>
                <Link href={href}><StorefrontText id={`homepage.occasion-${slug}`} fallback={label} /></Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="signature-features">
        <section className="everyday-edit" aria-labelledby="everyday-edit-title">
          <div className="everyday-edit-copy">
            <h3 id="everyday-edit-title">
              <StorefrontText id="homepage.gifts-under-10" fallback="Gifts under &pound;10" />
            </h3>
            <Link href="/shop?budget=under-10" className="everyday-edit-link">
              <StorefrontText id="homepage.shop-gifts-under-10" fallback="Shop under &pound;10" />
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          <ImageCanvas src={bannerImage(banners, "budget-10", "/twentyfinds-hero-wide.webp")} alt="" className="everyday-edit-image" />
        </section>
        <section className="signature-story" aria-labelledby="signature-story-title">
          <h3 id="signature-story-title"><StorefrontText id="homepage.family-made-title" fallback="The family behind 20ISH" /></h3>
          <p><StorefrontText
            id="homepage.family-made-description"
            fallback="20ISH is a family-run shop. Pieces made by our family sit alongside thoughtful gifts and useful everyday finds. We believe little things can feel special without costing a lot."
          /></p>
          <Link href="/about" className="text-link">
            <StorefrontText id="homepage.family-made-link" fallback="Read our story" /><Icon name="arrow-right" size={16} />
          </Link>
        </section>
      </div>
    </section>
  );
}
