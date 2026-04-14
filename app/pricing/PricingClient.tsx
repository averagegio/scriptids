"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PricingPlan } from "@/lib/pricing-data";

type Payload = {
  currency?: string;
  billing?: string;
  plans?: PricingPlan[];
};

export function PricingClient() {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pricing");
        const json = (await res.json()) as Payload & { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load pricing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-center text-sm text-[var(--muted)]">Loading plans…</p>
    );
  }
  if (error) {
    return (
      <p className="text-center text-sm text-[var(--danger)]">{error}</p>
    );
  }

  const plans = data?.plans ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
              plan.featured
                ? "border-[var(--accent)] bg-[var(--accent-muted)]/30"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {plan.featured && (
              <span className="mb-2 w-fit rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Popular
              </span>
            )}
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {plan.name}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{plan.description}</p>
            <p className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
              {plan.priceMonthlyUsd === null
                ? "Custom"
                : plan.priceMonthlyUsd === 0
                  ? "$0"
                  : `$${plan.priceMonthlyUsd}`}
              {plan.priceMonthlyUsd !== null && (
                <span className="text-sm font-normal text-[var(--muted)]">
                  /mo
                </span>
              )}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--foreground)]">
              {plan.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-[var(--accent)]">·</span>
                  {h}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={pendingPlan !== null}
              className={`mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.featured
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              }`}
              onClick={async () => {
                setPendingPlan(plan.id);
                try {
                  if (plan.priceMonthlyUsd === 0) {
                    localStorage.setItem("scriptids_plan", plan.id);
                    router.push("/chat");
                    return;
                  }
                  if (plan.priceMonthlyUsd === null) {
                    router.push("/contact");
                    return;
                  }
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: plan.id }),
                  });
                  const json = (await res.json()) as
                    | { checkoutUrl?: string; error?: string }
                    | undefined;
                  if (!res.ok) throw new Error(json?.error || res.statusText);
                  localStorage.setItem("scriptids_plan", plan.id);
                  router.push(json?.checkoutUrl || "/checkout");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Checkout failed");
                } finally {
                  setPendingPlan(null);
                }
              }}
            >
              {plan.priceMonthlyUsd === 0
                ? "Choose plan"
                : pendingPlan === plan.id
                  ? "Starting checkout…"
                  : "Choose plan"}
            </button>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        Organization plans are estimates until you speak with us. All prices are
        in USD unless noted otherwise.
      </p>
    </div>
  );
}
