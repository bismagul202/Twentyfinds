import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { HelpPage } from "@/components/storefront/HelpPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("returns", {
    title: "Returns & refunds",
    description: "Returns and refunds information for 20ISH.",
  });
}

export default function ReturnsPage() {
  return (
      <HelpPage
        slug="returns"
        icon="refresh"
        eyebrow={<StorefrontText id="returns.the-after-shopping-bits" fallback="The after-shopping bits" />}
        title={<StorefrontText id="returns.returns-refunds" fallback={"Returns & refunds"} />}
        intro={<StorefrontText id="returns.we-want-the-things-you-find-to" fallback="We want the things you find to feel right. The final returns process will be confirmed before the store opens." />}
        note={<StorefrontText id="returns.draft-information-for-the-storefront-preview-no" fallback="Preview information only. The returns and refunds policy is pending owner review." />}
        sections={[
          {
            title: <StorefrontText id="returns.our-approach" fallback="Our approach" />,
            body: <StorefrontText id="returns.we-ll-publish-a-clear-fair-returns" fallback="We'll publish a clear, fair returns policy that explains eligibility, time limits and how to start a return before accepting orders." />,
          },
          {
            title: <StorefrontText id="returns.starting-a-return" fallback="Starting a return" />,
            body: <StorefrontText id="returns.the-return-method-and-any-required-order" fallback="The return method and any required order details are still being prepared. Please check the final policy at launch for the exact steps." />,
          },
          {
            title: <StorefrontText id="returns.refund-timing" fallback="Refund timing" />,
            body: <StorefrontText id="returns.refund-methods-and-expected-processing-times-will" fallback="Refund methods and expected processing times will be shared alongside the final returns policy. No payment or refund processing is available in this preview." />,
          },
          {
            title: <StorefrontText id="returns.questions" fallback="Questions" />,
            body: <StorefrontText id="returns.for-now-explore-the-faqs-or-use" fallback="Check the FAQs or use the contact form for questions about the planned returns process." />,
          },
        ]}
        links={[
          { href: "/faq", label: <StorefrontText id="returns.faq-link" fallback="Read the FAQs" /> },
          { href: "/contact", label: <StorefrontText id="content.contact-us" fallback="Contact us" /> },
        ]}
      />
  );
}
