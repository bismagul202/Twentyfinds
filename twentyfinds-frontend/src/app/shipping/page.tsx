import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { HelpPage } from "@/components/storefront/HelpPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("shipping", {
    title: "Shipping & delivery",
    description: "Shipping and delivery information for 20ISH.",
  });
}

export default function ShippingPage() {
  return (
      <HelpPage
        slug="shipping"
        icon="truck"
        eyebrow={<StorefrontText id="shipping.the-delivery-details" fallback="The delivery details" />}
        title={<StorefrontText id="shipping.shipping-delivery" fallback="Delivery information" />}
        intro={<StorefrontText id="shipping.we-re-working-on-getting-the-useful" fallback="Delivery options, charges and estimated times are still being confirmed for the UK store." />}
        note={<StorefrontText id="shipping.draft-information-for-the-storefront-preview-no" fallback="20ISH delivery information is being finalised. Order placement is currently unavailable." />}
        sections={[
          {
            title: <StorefrontText id="shipping.where-we-plan-to-deliver" fallback="Where we plan to deliver" />,
            body: <StorefrontText id="shipping.twentyfinds-is-being-developed-for-uk-customers" fallback="20ISH is being developed for UK customers. The confirmed delivery areas and any international options will be listed here before launch." />,
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
            body: <StorefrontText id="shipping.if-you-have-a-question-about-delivery" fallback="Use the contact form for general delivery enquiries." />,
          },
        ]}
        links={[
          { href: "/contact", label: <StorefrontText id="content.contact-us" fallback="Contact us" /> },
          { href: "/returns", label: <StorefrontText id="shipping.returns-link" fallback="Returns and refunds" /> },
        ]}
      />
  );
}
