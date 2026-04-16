"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { BackNav } from "../components/BackNav";

export function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const success = sp.get("success") === "1";
  const canceled = sp.get("canceled") === "1";
  const plan = sp.get("plan") ?? "";
  const session = sp.get("session") ?? "";
  const nextRaw = sp.get("next") ?? "";
  const next = nextRaw.startsWith("/") ? nextRaw : "";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const planOk =
      plan.length > 0 &&
      plan.length <= 80 &&
      /^[a-z][a-z0-9-]*$/i.test(plan);
    if (success && planOk) {
      try {
        window.localStorage.setItem("scriptids_plan", plan);
      } catch {
        // ignore
      }
    }
    if (!success || !next) return;
    const t = window.setTimeout(() => router.push(next), 900);
    return () => window.clearTimeout(t);
  }, [next, plan, router, success]);

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
            {next ? (
              <Link
                href={next}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Continue
              </Link>
            ) : (
              <Link
                href="/chat"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Go to Scripti
              </Link>
            )}
            <Link
              href="/pricing"
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              Back to pricing
            </Link>
          </div>
        </div>
      )}

      {!success && !canceled && session && (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Confirm checkout
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Card processing is not available in this environment, so checkout completes with a confirmation step instead. Confirm to activate your plan.
          </p>
          {error && (
            <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                void (async () => {
                  setError(null);
                  setPending(true);
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ session }),
                    });
                    const json = (await res.json()) as
                      | { status?: string; planId?: string; next?: string; error?: string }
                      | undefined;
                    if (!res.ok) throw new Error(json?.error || res.statusText);
                    const confirmedPlan = json?.planId;
                    const confirmedNext = json?.next;
                    if (confirmedPlan) {
                      try {
                        window.localStorage.setItem("scriptids_plan", confirmedPlan);
                      } catch {
                        // ignore
                      }
                    }
                    const dest = confirmedNext && confirmedNext.startsWith("/") ? confirmedNext : next;
                    router.push(dest || "/prior-auth");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Checkout failed");
                  } finally {
                    setPending(false);
                  }
                })();
              }}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Confirming…" : "Confirm subscription"}
            </button>
            <Link
              href={
                next
                  ? `/pricing?${new URLSearchParams({ plan: "pa-plus", next }).toString()}`
                  : "/pricing"
              }
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
              href={
                next
                  ? `/pricing/consumers?${new URLSearchParams({ plan: "pa-plus", next }).toString()}`
                  : "/pricing/consumers"
              }
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

