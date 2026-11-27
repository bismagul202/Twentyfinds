import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm, OrderResult } from "./checkout";
import "./checkout.css";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type SearchParams = Promise<{ order?: string | string[]; resume?: string | string[] }>;

async function CheckoutContent({ searchParams }: { searchParams: SearchParams }) {
  const { order, resume } = await searchParams;
  const token = typeof order === "string" ? order : typeof resume === "string" ? resume : null;
  return token ? <OrderResult key={token} token={token} resume={typeof resume === "string"} /> : <CheckoutForm />;
}

export default function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="container-shell checkout-page">
      <Suspense fallback={<p role="status">Loading checkout…</p>}>
        <CheckoutContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
