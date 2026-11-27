import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { bannerImage, getStorefront, managedMetadata } from "@/features/storefront/cms";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/storefront/ContactForm";
import { Icon, type IconName } from "@/components/storefront/Icon";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { whatsappHref } from "@/features/storefront/brand";
import { getSupportGuide } from "@/features/storefront/support-guides";
import "./contact.css";

const helpLinks: { href: string; id: string; label: string; icon: IconName }[] = [
  { href: "/faq", id: "browse-faqs", label: "Browse FAQs", icon: "plus" },
  { href: "/shipping", id: "delivery-information", label: "Delivery information", icon: "truck" },
  { href: "/returns", id: "returns-information", label: "Returns and refunds", icon: "refresh" },
];

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("contact", {
    title: "Contact us",
    description: "Get in touch with the 20ISH team.",
  });
}

type ContactSearchParams = Promise<{ collection?: string | string[] }>;

export default function ContactPage({ searchParams }: { searchParams: ContactSearchParams }) {
  return <Suspense fallback={<RouteSkeleton />}><ContactContent searchParams={searchParams} /></Suspense>;
}

async function ContactContent({ searchParams }: { searchParams: ContactSearchParams }) {
  const [{ banners, pages, copy }, { collection }] = await Promise.all([getStorefront(), searchParams]);
  const page = pages.find(({ slug }) => slug === "contact");
  const guide = typeof collection === "string" ? getSupportGuide(collection) : undefined;
  return (
    <article className="contact-editorial">
      <header className="contact-hero">
        <ImageCanvas src={bannerImage(banners, "contact", "/20ish-contact-editorial.webp")} className="contact-hero-image" alt="" sizes="100vw" />
        <div className="contact-hero-inner container-shell">
          <nav className="content-page-topline" aria-label="Breadcrumb">
            <Link href="/"><StorefrontText id="contact.home" fallback="Home" /></Link>
            <span aria-hidden="true">/</span><span aria-current="page"><StorefrontText id="contact.contact-us" fallback="Contact us" /></span>
          </nav>
          <div className="contact-hero-copy">
            <span className="eyebrow"><StorefrontText id="contact.we-re-all-ears" fallback="20ISH Customer Care" /></span>
            <h1>{page?.title ?? <><StorefrontText id="contact.say-hello" fallback="Contact" />{" "}<StorefrontText id="contact.we-like-hellos" fallback="20ISH" /></>}</h1>
            <p className="cms-page-copy">{page?.content ?? <StorefrontText id="contact.questions-ideas-or-feedback-leave-us-a" fallback="Have a question about a find, a personalised gift or something else? Send a message to the 20ISH team." />}</p>
          </div>
        </div>
      </header>

      <div className="contact-content container-shell">
        <section className="contact-message" aria-labelledby="contact-message-title">
          <h2 id="contact-message-title"><StorefrontText id="contact.drop-us-a-note" fallback="Send us a message" /></h2>
          <ContactForm key={guide?.slug ?? "general"} collection={guide?.title} />
        </section>
        <aside className="contact-help" aria-labelledby="contact-help-title">
          <h2 id="contact-help-title"><StorefrontText id="contact.help-heading" fallback="Useful information" /></h2>
          <div className="contact-direct">
            <a className="contact-whatsapp" href={whatsappHref(copy)}>
              <Icon name="whatsapp" size={23} />
              <StorefrontText id="contact.whatsapp" fallback="Chat on WhatsApp" />
              <Icon name="arrow-right" size={16} />
            </a>
          </div>
          <nav aria-labelledby="contact-help-title">
            {helpLinks.map(({ href, id, label, icon }) => (
              <Link key={href} href={href}>
                <Icon name={icon} size={18} />
                <span><StorefrontText id={`contact.${id}`} fallback={label} /></span>
                <Icon name="arrow-right" size={16} />
              </Link>
            ))}
          </nav>
          <div className="contact-privacy">
            <Icon name="shield" size={19} />
            <div>
              <h3><StorefrontText id="contact.a-small-heads-up" fallback="Before you send" /></h3>
              <p><StorefrontText id="contact.message-privacy" fallback="Please leave passwords and payment details out of your message." /></p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
