import { ManagedContent } from "@/components/storefront/ContentPage";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import Link from "next/link";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("faq", {
    title: "FAQs",
    description: "Answers to common questions about the TWENTYFINDS store preview.",
  });
}

const questions = [
  { id: 1, question: "What is TWENTYFINDS?", answer: "We're creating a UK-focused multi-category online store for fashion, home, beauty, gadgets, toys and more — with every product priced under £20." },
  { id: 2, question: "Can I place an order?", answer: "Not yet. This is a front-end preview using sample products. Checkout, payment and order placement are not enabled." },
  { id: 3, question: "Where do you deliver?", answer: "Delivery areas, shipping services and timings are still being confirmed. We'll publish the final details before the store opens." },
  { id: 4, question: "Are the products and prices real?", answer: "The products and prices on this preview are sample content to demonstrate the storefront. Availability and final product information will be confirmed for launch." },
  { id: 5, question: "How do returns work?", answer: "Our returns page is currently draft content. A confirmed returns process will be published before orders are accepted." },
  { id: 6, question: "How can I get in touch?", answer: "Send your question through the contact page. The TWENTYFINDS team can review your message." },
];

export default function FaqPage() {
  return (
    <ManagedContent slug="faq">
    <div className="faq-page container-shell">
      <div className="content-page-topline"><Link href="/"><StorefrontText id="faq.home" fallback="Home" /></Link><span>/</span><span><StorefrontText id="faq.faqs" fallback="FAQs" /></span></div>
      <header className="content-page-header">
        <span className="eyebrow"><StorefrontText id="faq.the-useful-bits" fallback="The useful bits" /></span>
        <h1><StorefrontText id="faq.good-question" fallback="Good question." /></h1>
        <p><StorefrontText id="faq.here-are-a-few-things-you-might" fallback="Here are a few things you might be wondering about our little shop-in-progress." /></p>
      </header>
      <div className="faq-list">
        {questions.map((item, index) => (
          <details className="faq-item" key={item.id}>
            <summary><span className="faq-number">{String(index + 1).padStart(2, "0")}</span><span><StorefrontText id={`faq.question-${item.id}`} fallback={item.question} /></span><span className="faq-plus">+</span></summary>
            <p><StorefrontText id={`faq.answer-${item.id}`} fallback={item.answer} /></p>
          </details>
        ))}
      </div>
      <div className="faq-contact">
        <span><StorefrontText id="faq.still-curious" fallback="Still curious?" /></span>
        <Link href="/contact"><StorefrontText id="faq.drop-us-a-note" fallback="Drop us a note" />{" "}<span aria-hidden="true">↗</span></Link>
      </div>
    </div>
    </ManagedContent>
  );
}
