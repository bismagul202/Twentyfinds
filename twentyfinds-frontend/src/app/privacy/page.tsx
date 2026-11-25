import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { ContentPage, ManagedContent } from "@/components/storefront/ContentPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("privacy", {
    title: "Privacy policy",
    description: "Privacy information for the TWENTYFINDS storefront preview.",
  });
}

export default function PrivacyPage() {
  return (
    <ManagedContent slug="privacy">
      <ContentPage
        eyebrow={<StorefrontText id="privacy.your-details-matter" fallback="Your details matter" />}
        title={<StorefrontText id="privacy.privacy-policy" fallback="Privacy policy" />}
        intro={<StorefrontText id="privacy.this-preview-uses-sample-products-and-does" fallback="This preview uses sample products and does not provide account, checkout or newsletter services." />}
        note={<StorefrontText id="privacy.this-is-placeholder-content-not-a-final" fallback="This is placeholder content, not a final privacy notice. A complete policy must be reviewed and published before launch." />}
        sections={[
          {
            title: <StorefrontText id="privacy.information-in-this-preview" fallback="Information in this preview" />,
            body: <StorefrontText id="privacy.you-can-interact-with-local-demo-controls" fallback="You can interact with local demo controls such as saved products and a preview bag. These controls are not connected to an account or backend service." />,
          },
          {
            title: <StorefrontText id="privacy.forms" fallback="Forms" />,
            body: <StorefrontText id="privacy.the-newsletter-and-contact-forms-provide-on" fallback="We store contact details and messages submitted through the contact form so our team can review enquiries. The newsletter form is a preview." />,
          },
          {
            title: <StorefrontText id="privacy.cookies-and-analytics" fallback="Cookies and analytics" />,
            body: <StorefrontText id="privacy.this-storefront-preview-does-not-implement-analytics" fallback="This storefront preview does not implement analytics, advertising pixels or customer tracking features." />,
          },
          {
            title: <StorefrontText id="privacy.before-launch" fallback="Before launch" />,
            body: <StorefrontText id="privacy.a-final-privacy-notice-will-explain-the" fallback="A final privacy notice will explain the personal data collected, the reasons for processing, retention, sharing and how to exercise applicable rights." />,
          },
        ]}
      />
    </ManagedContent>
  );
}
