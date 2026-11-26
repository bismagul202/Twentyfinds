import { StorefrontText } from "@/features/storefront/StorefrontCopy";

export function NewsletterForm() {
  return (
    <div className="newsletter-availability">
      <p id="newsletter-availability">
        <StorefrontText id="newsletter.unavailable" fallback="Newsletter sign-up is currently unavailable." />
      </p>
      <button type="button" className="button" disabled aria-describedby="newsletter-availability">
        <StorefrontText id="newsletter.count-me-in" fallback="Subscribe" />
      </button>
    </div>
  );
}
