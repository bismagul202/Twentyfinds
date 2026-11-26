import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { getCmsPage } from "@/features/storefront/cms";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import type { ContentSection } from "./ContentPage";
import { Icon, type IconName } from "./Icon";
import { RouteSkeleton } from "./RouteSkeleton";
import "./help-page.css";

type HelpPageProps = {
  slug: string;
  title: ReactNode;
  eyebrow: ReactNode;
  intro: ReactNode;
  icon: IconName;
  sections?: ContentSection[];
  children?: ReactNode;
  note?: ReactNode;
  links: { href: string; label: ReactNode }[];
  linksTitle?: ReactNode;
};

export function HelpPage(props: HelpPageProps) {
  return <Suspense fallback={<RouteSkeleton />}><HelpPageContent {...props} /></Suspense>;
}

async function HelpPageContent({ slug, title, eyebrow, intro, icon, sections, children, note, links, linksTitle }: HelpPageProps) {
  const page = await getCmsPage(slug);
  const pageTitle = page?.title ?? title;
  return (
    <article className="help-page">
      <header className="help-hero">
        <div className="container-shell help-hero-inner">
          <div className="help-hero-copy">
            <nav className="content-page-topline" aria-label="Breadcrumb">
              <Link href="/"><StorefrontText id={slug === "faq" ? "faq.home" : "content.home"} fallback="Home" /></Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{!page && slug === "faq" ? <StorefrontText id="faq.faqs" fallback="FAQs" /> : pageTitle}</span>
            </nav>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{pageTitle}</h1>
            {!page && <p>{intro}</p>}
          </div>
          <div className="help-hero-icon"><Icon name={icon} size={82} /></div>
        </div>
      </header>

      <div className="container-shell help-page-content">
        {!page && note && <p className="help-page-note"><Icon name="shield" size={19} />{note}</p>}
        <div className="help-page-details">
          {page ? <p className="cms-page-copy">{page.content}</p> : (
            children ?? sections?.map(({ title: heading, body }, index) => (
              <section className="help-page-topic" key={index}>
                <h2>{heading}</h2>
                <p>{body}</p>
              </section>
            ))
          )}
        </div>
        <aside className="help-page-links">
          <h2 id="help-links-title">{linksTitle ?? <StorefrontText id="content.more-help" fallback="More help" />}</h2>
          <nav aria-labelledby="help-links-title">
            {links.map(({ href, label }) => (
              <Link href={href} key={href}>{label}<Icon name="arrow-right" size={16} /></Link>
            ))}
          </nav>
        </aside>
      </div>
    </article>
  );
}
