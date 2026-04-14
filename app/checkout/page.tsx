import { Suspense } from "react";
import { CheckoutClient } from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
          <p className="text-sm text-[var(--muted)]">Loading checkout…</p>
        </main>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}

