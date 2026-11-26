import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { ContentPage, ManagedContent } from "@/components/storefront/ContentPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("privacy", {
    title: "Privacy policy",
    description: "Privacy information for 20ISH.",
  });
}

export default function PrivacyPage() {
  return (
    <ManagedContent slug="privacy">
      <ContentPage
        eyebrow={<StorefrontText id="privacy.your-details-matter" fallback="Your details matter" />}
        title={<StorefrontText id="privacy.privacy-policy" fallback="Privacy Policy" />}
        intro={<StorefrontText id="privacy.this-preview-uses-sample-products-and-does" fallback="This page describes the 20ISH cart, wishlist and contact form." />}
        note={<StorefrontText id="privacy.this-is-placeholder-content-not-a-final" fallback="Preview information only. The full privacy notice is pending owner review and publication." />}
        sections={[
          {
            title: <StorefrontText id="privacy.information-in-this-preview" fallback="Information in this preview" />,
            body: <StorefrontText id="privacy.you-can-interact-with-local-demo-controls" fallback="The preview cart and wishlist are held in memory and reset when you refresh or open a new tab." />,
          },
          {
            title: <StorefrontText id="privacy.forms" fallback="Forms" />,
            body: <StorefrontText id="privacy.the-newsletter-and-contact-forms-provide-on" fallback="The contact form submits your name, email address, topic and message for enquiry handling. Newsletter sign-up is unavailable." />,
          },
          {
            title: <StorefrontText id="privacy.cookies-and-analytics" fallback="Cookies and analytics" />,
            body: <StorefrontText id="privacy.this-storefront-preview-does-not-implement-analytics" fallback="20ISH currently uses no analytics, advertising pixels or customer tracking features on this site." />,
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
