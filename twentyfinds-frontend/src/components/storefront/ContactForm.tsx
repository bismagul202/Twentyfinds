"use client";
import { StorefrontText, useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

import { apiUrlFor } from "@/lib/api";
import { useRef, useState, type FormEvent } from "react";

export function ContactForm() {
  const copy = useStorefrontCopy();
  const submitting = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "invalid" | "error">("idle");

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    submitting.current = true;
    setStatus("sending");

    try {
      const response = await fetch(apiUrlFor("contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        setStatus(response.status === 422 ? "invalid" : "error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form className="contact-form" onSubmit={submitForm}>
      <div className="form-field-row">
        <label><StorefrontText id="contact.your-name" fallback="Your name" /><input name="name" autoComplete="name" maxLength={120} required placeholder={copy("contact.e-g-alex-taylor", "e.g. Alex Taylor")} />
        </label>
        <label><StorefrontText id="contact.email-address" fallback="Email address" /><input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            placeholder={copy("contact.you-example-com", "you@example.com")}
          />
        </label>
      </div>
      <label><StorefrontText id="contact.what-can-we-help-with" fallback="What can we help with?" /><select name="topic" defaultValue="general">
          <option value="general"><StorefrontText id="contact.a-general-question" fallback="A general question" /></option>
          <option value="order"><StorefrontText id="contact.an-order-question" fallback="An order question" /></option>
          <option value="product"><StorefrontText id="contact.a-product-question" fallback="A product question" /></option>
          <option value="feedback"><StorefrontText id="contact.feedback-or-something-else" fallback="Feedback or something else" /></option>
        </select>
      </label>
      <label><StorefrontText id="contact.your-message" fallback="Your message" /><textarea name="message" rows={5} minLength={5} maxLength={4000} required placeholder={copy("contact.write-your-message-here", "Write your message here...")} />
      </label>
      <div hidden aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <button type="submit" className="button button-dark" disabled={status === "sending"}>
        {status === "sending"
          ? <StorefrontText id="contact.sending" fallback="Sending..." />
          : <StorefrontText id="contact.send-a-note" fallback="Send a note" />}
      </button>
      {status === "sent" && (
        <p className="form-message is-success" role="status"><StorefrontText id="contact.message-received" fallback="Thanks. We've received your message." /></p>
      )}
      {status === "invalid" && (
        <p className="form-message" role="alert"><StorefrontText id="contact.check-message" fallback="Check your email address and message, then try again." /></p>
      )}
      {status === "error" && (
        <p className="form-message" role="alert"><StorefrontText id="contact.submit-error" fallback="We couldn't send your message. Please try again in a few minutes." /></p>
      )}
    </form>
  );
}
