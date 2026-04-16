import type { Metadata } from "next";
import { Suspense } from "react";
import { BackNav } from "../components/BackNav";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Consumer plans for Scripti and prior authorization tools, plus clinic SaaS pricing.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Pricing
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Consumer plans cover Scripti, prior authorization tools, and drug
        intelligence. Clinic SaaS plans are priced separately and usually include
        a monthly platform fee plus a per prior authorization case fee.
      </p>

      <div className="mt-10">
        <Suspense
          fallback={
            <p className="text-center text-sm text-[var(--muted)]">
              Loading plans…
            </p>
          }
        >
          <PricingClient defaultSection="all" />
        </Suspense>
      </div>
    </main>
  );
}
