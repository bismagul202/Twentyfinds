import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { ContentPage, ManagedContent } from "@/components/storefront/ContentPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("terms", {
    title: "Terms & conditions",
    description: "Terms and conditions for 20ISH.",
  });
}

export default function TermsPage() {
  return (
    <ManagedContent slug="terms">
      <ContentPage
        eyebrow={<StorefrontText id="terms.the-important-bits" fallback="The important bits" />}
        title={<StorefrontText id="terms.terms-conditions" fallback="Terms and Conditions" />}
        intro={<StorefrontText id="terms.welcome-to-the-twentyfinds-storefront-preview-this" fallback="Welcome to 20ISH. You can browse our catalogue online." />}
        note={<StorefrontText id="terms.placeholder-content-only-final-terms-require-review" fallback="Preview information only. The terms are pending owner review and publication." />}
        sections={[
          {
            title: <StorefrontText id="terms.preview-use" fallback="Preview use" />,
            body: <StorefrontText id="terms.products-prices-descriptions-and-availability-shown-here" fallback="The order summary shows product prices and delivery charges before you place your order." />,
          },
          {
            title: <StorefrontText id="terms.prices-and-products" fallback="Prices and products" />,
            body: <StorefrontText id="terms.the-intended-store-policy-is-to-price" fallback="Published individual product prices are shown in GBP and capped at £19.99." />,
          },
          {
            title: <StorefrontText id="terms.accounts-and-checkout" fallback="Accounts and checkout" />,
            body: <StorefrontText id="terms.account-creation-checkout-payment-processing-order-placement" fallback="You can place an order as a guest using the payment methods shown at checkout." />,
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
