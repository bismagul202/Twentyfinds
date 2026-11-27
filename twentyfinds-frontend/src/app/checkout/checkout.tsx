"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/storefront/Icon";
import { ImageCanvas } from "@/components/storefront/ImageCanvas";
import { whatsappHref } from "@/features/storefront/brand";
import { useStorefront } from "@/features/storefront/StorefrontProvider";
import type { StoreProduct } from "@/features/storefront/data";
import { apiUrlFor } from "@/lib/api";

type Options = { deliveryPence: number };
type Order = {
  orderNumber: string;
  status: string;
  paymentMethod: "cod" | "card";
  paymentStatus: "pending" | "paid" | "expired";
  totalPence: number;
  paymentUrl: string | null;
};
type CheckoutCatalogue = { products: StoreProduct[]; copy: Record<string, string> };
type Attempt = { fingerprint: string; token: string; lines: Record<string, number>; awaitingPayment?: boolean };

const attemptKey = "20ish.checkout-attempt";
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const money = (pence: number) => gbp.format(pence / 100);
const isPlacedOrder = (status: string) => ["confirmed", "in_progress", "delivered"].includes(status);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrlFor(path), {
    ...init,
    cache: "no-store",
    headers: { Accept: "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const firstError = Object.values(body?.errors ?? {}).flat()[0];
    throw new Error(typeof firstError === "string" ? firstError
      : response.status < 500 && body?.message ? body.message
        : "Checkout is temporarily unavailable. Please try again.");
  }
  return body as T;
}

function readAttempt(): Attempt | null {
  try {
    return JSON.parse(sessionStorage.getItem(attemptKey) ?? "null");
  } catch {
    return null;
  }
}

function writeAttempt(attempt: Attempt | null) {
  try {
    if (attempt) sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
    else sessionStorage.removeItem(attemptKey);
  } catch {
    // A browser with storage disabled can still place an order.
  }
}

export function CheckoutForm() {
  const { cart, setCartQuantity, removePurchased } = useStorefront();
  const router = useRouter();
  const [options, setOptions] = useState<Options>();
  const [store, setStore] = useState<CheckoutCatalogue>();
  const [customerName, setCustomerName] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order>();
  const activeAttempt = useRef<Attempt | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    const attempt = readAttempt();
    if (attempt?.awaitingPayment) {
      router.replace(`/checkout?resume=${attempt.token}`);
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      request<Options>("checkout", { signal }),
      request<CheckoutCatalogue>("storefront", { signal }),
    ]).then(([settings, catalogue]) => {
      setOptions(settings);
      setStore(catalogue);
    }).catch(() => {
      if (!signal.aborted) setError("Could not load checkout. Reload the page to try again.");
    });
    return () => controller.abort();
  }, [router]);

  const catalogue = new Map(store?.products.map((product) => [product.slug, product]));
  const lines = Object.entries(cart).sort(([a], [b]) => a.localeCompare(b)).map(([key, quantity]) => {
    const [slug, variantId] = key.split(":");
    const product = catalogue.get(slug);
    const variant = product?.variants?.find(({ id }) => String(id) === variantId);
    const price = variantId ? variant?.price : product?.variants?.length ? undefined : product?.price;
    return {
      key, slug, quantity, variantId: variant?.id ?? null,
      image: product?.image,
      name: variant ? `${product?.name} — ${variant.name}` : product?.name ?? "Unavailable item",
      unitPence: price === undefined ? null : Math.round(price * 100),
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + (line.unitPence ?? 0) * line.quantity, 0);
  const unavailable = lines.some(({ unitPence }) => unitPence === null);
  const total = subtotal + (options?.deliveryPence ?? 0);
  const orderBlocked = unavailable || lines.length > 30;
  const onlineMessage = [
    "Hi 20ISH! I'd like to place an order and pay online.",
    `Customer: ${customerName.trim()}`,
    "",
    ...lines.map(({ name, quantity, unitPence }) => `• ${name} × ${quantity} — ${money((unitPence ?? 0) * quantity)}`),
    "",
    `UK delivery: ${money(options?.deliveryPence ?? 0)}`,
    `Order total: ${money(total)}`,
    "",
    "Could you please share the payment account details and confirm how I can complete the order?",
  ].join("\n");
  const onlineHref = `${whatsappHref(store?.copy ?? {})}?text=${encodeURIComponent(onlineMessage)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!options || unavailable || !lines.length || lines.length > 30 || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const payload = {
      ...fields,
      payment_method: "cod",
      delivery_pence: options.deliveryPence,
      items: lines.map(({ slug, variantId, quantity, unitPence }) => ({
        slug, variant_id: variantId, quantity, unit_pence: unitPence,
      })),
    };
    try {
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
      const fingerprint = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const previous = activeAttempt.current ?? readAttempt();
      const attempt = previous?.fingerprint === fingerprint
        ? previous
        : { fingerprint, token: crypto.randomUUID(), lines: { ...cart } };
      activeAttempt.current = attempt;
      writeAttempt(attempt);
      const result = await request<Order>("checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, token: attempt.token }),
      });
      if (isPlacedOrder(result.status)) {
        removePurchased(attempt.lines);
      }
      activeAttempt.current = null;
      writeAttempt(null);
      setOrder(result);
      router.replace(`/checkout?order=${attempt.token}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not place the order. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (order) return <OrderSummary order={order} />;
  if (!options) return error ? <p role="alert">{error}</p> : <p role="status">Loading checkout…</p>;
  if (!lines.length) return (
    <section className="checkout-result checkout-empty">
      <Icon name="bag" size={30} />
      <h1>Your bag is empty</h1>
      <Link className="button button-blue" href="/shop">Continue shopping</Link>
    </section>
  );

  return (
    <>
      <header className="checkout-heading">
        <Link href="/shop" className="checkout-back">← Continue shopping</Link>
        <h1>Checkout</h1>
        <p>Enter your UK delivery details and pay when your order arrives.</p>
      </header>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-delivery">
          <fieldset className="checkout-card checkout-fields" disabled={busy}>
            <legend>Contact &amp; delivery</legend>
            <label className="checkout-wide">
              Full name
              <input ref={nameInput} name="delivery_full_name" value={customerName}
                onChange={(event) => setCustomerName(event.target.value)} autoComplete="name"
                pattern={String.raw`.*\S.*`} title="Enter your full name" maxLength={255} required />
            </label>
            <label>Email address<input name="customer_email" type="email" autoComplete="email" maxLength={254} required /></label>
            <label>Phone<input name="delivery_phone" type="tel" autoComplete="tel" maxLength={32} required /></label>
            <label className="checkout-wide">Address line 1<input name="delivery_address_line_1" autoComplete="address-line1" maxLength={255} required /></label>
            <label className="checkout-wide">Address line 2 (optional)<input name="delivery_address_line_2" autoComplete="address-line2" maxLength={255} /></label>
            <label>Town or city<input name="delivery_city" autoComplete="address-level2" maxLength={255} required /></label>
            <label>Postcode<input name="delivery_postcode" autoComplete="postal-code" maxLength={8} required /></label>
            <label className="checkout-wide">Delivery country<input value="United Kingdom" readOnly /></label>
          </fieldset>
          <section className="checkout-payment" aria-labelledby="checkout-payment">
            <span className="checkout-payment-icon"><Icon name="truck" size={23} /></span>
            <div><h2 id="checkout-payment">Cash on delivery</h2><p>Pay the full amount in cash when your order arrives.</p></div>
          </section>
        </div>
        <aside className="checkout-sidebar">
        <section className="checkout-summary checkout-card" aria-labelledby="checkout-summary">
          <h2 id="checkout-summary">Order summary</h2>
          <ul>
            {lines.map(({ key, name, quantity, unitPence, image }) => (
              <li key={key}>
                {image ? <ImageCanvas src={image} alt="" className="checkout-item-image" sizes="52px" /> : <span className="checkout-item-image checkout-item-placeholder"><Icon name="bag" size={20} /></span>}
                <span className="checkout-item-name">{name}<small>Qty {quantity}</small></span>
                {unitPence === null
                  ? <button type="button" disabled={busy} onClick={() => setCartQuantity(key, 0)}>Remove</button>
                  : <strong>{money(unitPence * quantity)}</strong>}
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div><dt>UK flat delivery</dt><dd>{money(options.deliveryPence)}</dd></div>
            <div className="checkout-total"><dt>Total to pay</dt><dd>{money(total)}</dd></div>
          </dl>
          {unavailable && <p>Remove unavailable items before placing your order.</p>}
          {lines.length > 30 && <p>Reduce your bag to 30 different items or options per order.</p>}
          {error && <p role="alert">{error}</p>}
          <button className="button button-blue" disabled={busy || orderBlocked}>
            {busy ? "Placing order…" : "Place cash on delivery order"}
          </button>
        </section>
        <section className="checkout-online checkout-card" aria-labelledby="checkout-online">
          <h2 id="checkout-online">Prefer to pay online?</h2>
          <p>Enter your name above, then ask our team on WhatsApp for payment details and order confirmation.</p>
          {orderBlocked || busy
            ? <button className="checkout-whatsapp" type="button" disabled><Icon name="whatsapp" size={20} /> Contact the team</button>
            : <a className="checkout-whatsapp" href={onlineHref} target="_blank" rel="noopener noreferrer" onClick={(event) => {
              if (customerName.trim()) return;
              event.preventDefault();
              nameInput.current?.focus();
              nameInput.current?.reportValidity();
            }}><Icon name="whatsapp" size={20} /> Contact the team</a>}
        </section>
        </aside>
      </form>
    </>
  );
}

function OrderSummary({ order, resume = false, retry = false }: { order: Order; resume?: boolean; retry?: boolean }) {
  const confirmed = isPlacedOrder(order.status);
  const headings: Record<string, string> = {
    confirmed: "Order confirmed",
    in_progress: "Order in progress",
    delivered: "Order delivered",
    cancelled: "Payment session closed",
  };
  return (
    <section className="checkout-result">
      <h1>{headings[order.status] ?? "Awaiting payment"}</h1>
      <p>Order reference <strong>{order.orderNumber}</strong></p>
      <p>Total <strong>{money(order.totalPence)}</strong></p>
      {confirmed && <p>{order.paymentStatus === "paid" ? "Your payment has been received." : order.status === "delivered" ? "Cash payment is pending confirmation." : "Pay in cash when your order arrives."}</p>}
      {!confirmed && order.status !== "cancelled" && <p role="status">
        {resume ? "Your order is awaiting card payment." : "We’re waiting for Stripe to confirm the payment."}
      </p>}
      {resume && order.paymentUrl && <a className="button button-blue" href={order.paymentUrl}>Resume payment</a>}
      {retry && <button className="button button-blue" type="button" onClick={() => window.location.reload()}>Check payment status</button>}
      {order.status === "cancelled" && <Link className="button button-blue" href="/checkout">Return to checkout</Link>}
      {confirmed && <Link className="button button-blue" href="/shop">Continue shopping</Link>}
    </section>
  );
}

export function OrderResult({ token, resume }: { token: string; resume: boolean }) {
  const { removePurchased } = useStorefront();
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let checks = 0;
    async function check() {
      try {
        const result = await request<Order>(`checkout/${encodeURIComponent(token)}`, { signal: controller.signal });
        setOrder(result);
        if (!resume && result.status === "pending" && ++checks < 20) {
          timer = setTimeout(check, 1500);
        } else if (!resume && result.status === "pending") {
          setRetry(true);
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Could not check the order.");
      }
    }
    void check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [token, resume]);

  useEffect(() => {
    if (!order || (!isPlacedOrder(order.status) && order.status !== "cancelled")) return;
    const attempt = readAttempt();
    if (attempt?.token !== token) return;
    if (isPlacedOrder(order.status)) removePurchased(attempt.lines);
    writeAttempt(null);
  }, [order, token, removePurchased]);

  async function cancelPayment() {
    setCancelling(true);
    setCancelError("");
    try {
      setOrder(await request<Order>(`checkout/${encodeURIComponent(token)}/cancel`, { method: "POST" }));
    } catch (failure) {
      setCancelError(failure instanceof Error ? failure.message : "Could not cancel the payment.");
    } finally {
      setCancelling(false);
    }
  }

  if (error) return <p role="alert">{error} <Link href="/checkout">Return to checkout</Link></p>;
  if (!order) return <p role="status">Checking your order…</p>;
  return (
    <>
      <OrderSummary order={order} resume={resume && !cancelling} retry={retry} />
      {resume && order.status === "pending" && (
        <div className="checkout-result-actions">
          <button className="button" type="button" disabled={cancelling} onClick={cancelPayment}>
            {cancelling ? "Cancelling…" : "Cancel payment and keep bag"}
          </button>
          {cancelError && <p role="alert">{cancelError}</p>}
        </div>
      )}
    </>
  );
}
