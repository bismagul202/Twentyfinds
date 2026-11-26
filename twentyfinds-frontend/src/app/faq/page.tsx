import { HelpPage } from "@/components/storefront/HelpPage";
import { Icon } from "@/components/storefront/Icon";
import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("faq", {
    title: "FAQs",
    description: "Answers to common questions about 20ISH.",
  });
}

const questions = [
  { id: 1, question: "What is 20ISH?", answer: "We're creating a UK-focused multi-category online store for fashion, home, beauty, gadgets, toys and more — with every product priced under £20." },
  { id: 2, question: "Can I place an order?", answer: "You can browse 20ISH. Checkout, payments and order placement are currently unavailable." },
  { id: 3, question: "Where do you deliver?", answer: "Delivery areas, shipping services and timings are still being confirmed. We'll publish the final details before the store opens." },
  { id: 4, question: "Where can I see product prices and options?", answer: "Published product pages show prices in GBP and list any available options." },
  { id: 5, question: "How do returns work?", answer: "Our returns page is currently draft content. A confirmed returns process will be published before orders are accepted." },
  { id: 6, question: "How can I get in touch?", answer: "Send your question through the contact page. The 20ISH team can review your message." },
  { id: 7, question: "Can I request personalisation or wedding items?", answer: "The Personalisation and Wedding & Nikah guides explain what to look for in published listings. Use the contact form for questions about an item." },
  { id: 8, question: "Will my cart and wishlist be saved?", answer: "Items stay in your cart and wishlist as you browse 20ISH. Refreshing the page or opening a new tab starts an empty list." },
];

const groups = [
  { id: "shopping", title: "Shopping at 20ISH", questions: [1, 2, 4, 7, 8] },
  { id: "support", title: "Delivery, returns and support", questions: [3, 5, 6] },
];

export default function FaqPage() {
  return (
    <HelpPage
      slug="faq"
      icon="mail"
      title={<StorefrontText id="faq.good-question" fallback="FAQs" />}
      eyebrow={<StorefrontText id="faq.the-useful-bits" fallback="20ISH Customer Care" />}
      intro={<StorefrontText id="faq.here-are-a-few-things-you-might" fallback="Find answers about shopping, personalisation, delivery and returns." />}
      linksTitle={<StorefrontText id="faq.still-curious" fallback="Still need help?" />}
      links={[
        { href: "/contact", label: <StorefrontText id="faq.drop-us-a-note" fallback="Contact us" /> },
        { href: "/shipping", label: <StorefrontText id="footer.link-shipping" fallback="Delivery information" /> },
        { href: "/returns", label: <StorefrontText id="footer.link-returns" fallback="Returns and refunds" /> },
      ]}
    >
      {groups.map((group) => (
        <section className="help-faq-group" key={group.id}>
          <h2><StorefrontText id={`faq.group-${group.id}`} fallback={group.title} /></h2>
          {questions.filter(({ id }) => group.questions.includes(id)).map((item) => (
            <details className="help-faq-item" key={item.id}>
              <summary>
                <StorefrontText id={`faq.question-${item.id}`} fallback={item.question} />
                <Icon name="chevron-down" size={18} />
              </summary>
              <p><StorefrontText id={`faq.answer-${item.id}`} fallback={item.answer} /></p>
            </details>
          ))}
        </section>
      ))}
    </HelpPage>
  );
}
