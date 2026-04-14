"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BackNav } from "../components/BackNav";

export function CheckoutClient() {
  const sp = useSearchParams();
  const success = sp.get("success") === "1";
  const canceled = sp.get("canceled") === "1";

  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Payments are processed securely by Stripe.
      </p>

      {success && (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Payment successful
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Thanks—your subscription is active. You can head back to Scripti.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Go to Scripti
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              Back to pricing
            </Link>
          </div>
        </div>
      )}

      {canceled && (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Checkout canceled
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            No worries—nothing was charged. You can try again any time.
          </p>
          <div className="mt-4">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Return to pricing →
            </Link>
          </div>
        </div>
      )}

      {!success && !canceled && (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--foreground)]">
            Choose a plan to start checkout.
          </p>
          <div className="mt-4">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Go to pricing →
            </Link>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-[var(--muted)]">
        Scriptids does not store your full payment details. Manage billing
        through Stripe.
      </p>
    </main>
  );
}

