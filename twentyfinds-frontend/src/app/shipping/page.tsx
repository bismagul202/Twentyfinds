import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { ContentPage, ManagedContent } from "@/components/storefront/ContentPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("shipping", {
    title: "Shipping & delivery",
    description: "Shipping and delivery information for TWENTYFINDS.",
  });
}

export default function ShippingPage() {
  return (
    <ManagedContent slug="shipping">
      <ContentPage
        eyebrow={<StorefrontText id="shipping.the-delivery-details" fallback="The delivery details" />}
        title={<StorefrontText id="shipping.shipping-delivery" fallback={"Shipping & delivery"} />}
        intro={<StorefrontText id="shipping.we-re-working-on-getting-the-useful" fallback="We're working on getting the useful details in place before TWENTYFINDS opens for orders." />}
        note={<StorefrontText id="shipping.draft-information-for-the-storefront-preview-no" fallback="Draft information for the storefront preview — no orders can currently be placed." />}
        sections={[
          {
            title: <StorefrontText id="shipping.where-we-plan-to-deliver" fallback="Where we plan to deliver" />,
            body: <StorefrontText id="shipping.twentyfinds-is-being-developed-for-uk-customers" fallback="TWENTYFINDS is being developed for UK customers. The confirmed delivery areas and any international options will be listed here before launch." />,
          },
          {
            title: <StorefrontText id="shipping.delivery-timing" fallback="Delivery timing" />,
            body: <StorefrontText id="shipping.delivery-services-and-estimated-dispatch-or-arrival" fallback="Delivery services and estimated dispatch or arrival times have not yet been confirmed. We'll share clear timing information at checkout when ordering is available." />,
          },
          {
            title: <StorefrontText id="shipping.delivery-costs" fallback="Delivery costs" />,
            body: <StorefrontText id="shipping.any-delivery-charges-free-delivery-thresholds-and" fallback="Any delivery charges, free-delivery thresholds and delivery options will be shown before an order is placed. There are no checkout or shipping charges in this preview." />,
          },
          {
            title: <StorefrontText id="shipping.need-a-hand" fallback="Need a hand?" />,
            body: <StorefrontText id="shipping.if-you-have-a-question-about-delivery" fallback="If you have a question about delivery, visit our contact page. The preview form is not connected to a support inbox yet." />,
          },
        ]}
      />
    </ManagedContent>
  );
}
