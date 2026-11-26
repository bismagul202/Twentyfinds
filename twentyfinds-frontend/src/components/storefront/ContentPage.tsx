import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { Suspense, type ReactNode } from "react";
import { getCmsPage, type CmsPage } from "@/features/storefront/cms";
import Link from "next/link";
import { Icon } from "./Icon";

export type ContentSection = {
  title: ReactNode;
  body: ReactNode;
};

export function PublishedPage({ page }: { page: CmsPage }) {
  return (
    <article className="content-page container-shell">
      <div className="content-page-topline"><Link href="/"><StorefrontText id="content.home" fallback="Home" /></Link><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></div>
      <header className="content-page-header"><h1>{page.title}</h1></header>
      <p className="cms-page-copy">{page.content}</p>
    </article>
  );
}

async function PageOverride({ slug, children }: { slug: string; children: ReactNode }) {
  const page = await getCmsPage(slug);
  return page ? <PublishedPage page={page} /> : children;
}

export function ManagedContent({ slug, children }: { slug: string; children: ReactNode }) {
  return <Suspense><PageOverride slug={slug}>{children}</PageOverride></Suspense>;
}

export function ContentPage({
  eyebrow = <StorefrontText id="content.default-eyebrow" fallback="The 20ISH edit" />,
  title,
  intro,
  sections,
  note,
  links,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  sections: ContentSection[];
  note?: ReactNode;
  links?: { href: string; label: ReactNode }[];
}) {
  return (
    <article className="content-page container-shell">
      <div className="content-page-topline">
        <Link href="/"><StorefrontText id="content.home" fallback="Home" /></Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </div>
      <header className="content-page-header">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {note && <p className="draft-note">{note}</p>}
      <div className="content-sections">
        {sections.map((section, index) => (
          <section className="content-section" key={index}>
            <div>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          </section>
        ))}
      </div>
      {links?.length ? (
        <div className="support-page-links">
          {links.map(({ href, label }, index) => (
            <Link key={href} href={href} className={index === 0 ? "button button-dark" : "text-link"}>
              {label}<Icon name="arrow-right" size={16} />
            </Link>
          ))}
        </div>
      ) : <div className="content-page-cta">
        <div>
          <span className="eyebrow"><StorefrontText id="content.fancy-a-little-browse" fallback="Fancy a little browse?" /></span>
          <h2><StorefrontText id="content.find-the-good-stuff" fallback="Find the good stuff." /></h2>
        </div>
        <Link href="/shop" className="button button-dark"><StorefrontText id="content.shop-all" fallback="Shop all" /><span aria-hidden="true">↗</span>
        </Link>
      </div>}
    </article>
  );
}
