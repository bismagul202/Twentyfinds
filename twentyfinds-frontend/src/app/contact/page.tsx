import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import { Suspense } from "react";
import { getCmsPage } from "@/features/storefront/cms";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/storefront/ContactForm";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("contact", {
    title: "Contact us",
    description: "Get in touch with the TWENTYFINDS team.",
  });
}

export default function ContactPage() {
  return <Suspense><ContactContent /></Suspense>;
}

async function ContactContent() {
  const page = await getCmsPage("contact");
  return (
    <div className="contact-page container-shell">
      <div className="content-page-topline"><Link href="/"><StorefrontText id="contact.home" fallback="Home" /></Link><span>/</span><span><StorefrontText id="contact.contact-us" fallback="Contact us" /></span></div>
      <div className="contact-layout">
        <div className="contact-intro">
          <span className="eyebrow"><StorefrontText id="contact.we-re-all-ears" fallback="We're all ears" /></span>
          <h1>{page?.title ?? <><StorefrontText id="contact.say-hello" fallback="Say hello." /><br /><span><StorefrontText id="contact.we-like-hellos" fallback="We like hellos." /></span></>}</h1>
          <p className="cms-page-copy">{page?.content ?? <StorefrontText id="contact.questions-ideas-or-feedback-leave-us-a" fallback="Questions, ideas or feedback? Leave us a note." />}</p>
          <div className="contact-side-note">
            <span>✳</span>
            <p><strong><StorefrontText id="contact.a-small-heads-up" fallback="A small heads-up" /></strong><br /><StorefrontText id="contact.message-privacy" fallback="Please leave passwords and payment details out of your message." /></p>
          </div>
        </div>
        <div className="contact-form-card">
          <h2><StorefrontText id="contact.drop-us-a-note" fallback="Drop us a note" /></h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
