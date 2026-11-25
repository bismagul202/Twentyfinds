"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";

export function NewsletterForm() {
  const copy = useStorefrontCopy();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setSubmitted(false);
      setMessage(copy("newsletter.invalid-email", "Pop in a valid email address and we'll save you a spot."));
      return;
    }

    setSubmitted(true);
    setMessage(copy("newsletter.success", "Thanks! This preview doesn't save email addresses."));
    setEmail("");
  }

  return (
    <form className="newsletter-form" onSubmit={subscribe} noValidate>
      <label className="sr-only" htmlFor="newsletter-email"><StorefrontText id="newsletter.email-address" fallback="Email address" /></label>
      <input
        id="newsletter-email"
        type="email"
        autoComplete="email"
        placeholder={copy("newsletter.your-email-address", "Your email address")}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-describedby={message ? "newsletter-message" : undefined}
      />
      <button type="submit" className="button button-dark">
        {submitted ? <StorefrontText id="newsletter.thanks" fallback="Thanks!" /> : <StorefrontText id="newsletter.count-me-in" fallback="Count me in" />}
        <Icon name={submitted ? "check" : "arrow-right"} size={17} />
      </button>
      {message && (
        <p
          id="newsletter-message"
          className={`form-message ${submitted ? "is-success" : "is-error"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
