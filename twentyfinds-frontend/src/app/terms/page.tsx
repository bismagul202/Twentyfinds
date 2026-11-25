import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { ContentPage, ManagedContent } from "@/components/storefront/ContentPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("terms", {
    title: "Terms & conditions",
    description: "Terms information for the TWENTYFINDS storefront preview.",
  });
}

export default function TermsPage() {
  return (
    <ManagedContent slug="terms">
      <ContentPage
        eyebrow={<StorefrontText id="terms.the-important-bits" fallback="The important bits" />}
        title={<StorefrontText id="terms.terms-conditions" fallback={"Terms & conditions"} />}
        intro={<StorefrontText id="terms.welcome-to-the-twentyfinds-storefront-preview-this" fallback="Welcome to the TWENTYFINDS storefront preview. This site is for browsing the planned customer experience only." />}
        note={<StorefrontText id="terms.placeholder-content-only-final-terms-require-review" fallback="Placeholder content only — final terms require review before the store accepts orders." />}
        sections={[
          {
            title: <StorefrontText id="terms.preview-use" fallback="Preview use" />,
            body: <StorefrontText id="terms.products-prices-descriptions-and-availability-shown-here" fallback="Products, prices, descriptions and availability shown here are illustrative demo content. No purchase contract can be formed through this preview." />,
          },
          {
            title: <StorefrontText id="terms.prices-and-products" fallback="Prices and products" />,
            body: <StorefrontText id="terms.the-intended-store-policy-is-to-price" fallback="The intended store policy is to price every product from £0.01 to £19.99. Sample prices on this site do not represent a confirmed offer or stock availability." />,
          },
          {
            title: <StorefrontText id="terms.accounts-and-checkout" fallback="Accounts and checkout" />,
            body: <StorefrontText id="terms.account-creation-checkout-payment-processing-order-placement" fallback="Account creation, checkout, payment processing, order placement and delivery booking are not available." />,
          },
          {
            title: <StorefrontText id="terms.final-terms" fallback="Final terms" />,
            body: <StorefrontText id="terms.the-live-store-will-publish-complete-terms" fallback="The live store will publish complete terms covering ordering, payment, delivery, returns, product information and applicable customer rights before launch." />,
          },
        ]}
      />
    </ManagedContent>
  );
}
