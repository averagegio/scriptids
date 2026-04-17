"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ORGANIZATION_PLANS, type PricingPlan } from "@/lib/pricing-data";

type Payload = {
  currency?: string;
  billing?: string;
  consumerPlans?: PricingPlan[];
  organizationPlans?: PricingPlan[];
  plans?: PricingPlan[];
};

type PricingClientProps = {
  defaultSection?: "all" | "consumers" | "clinics";
  emphasizedPlanId?: string | null;
  next?: string | null;
  section?: string | null;
  reason?: string | null;
};

function gridColsClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

function PlanGrid({
  plans,
  pendingPlan,
  onChoose,
  emphasizedPlanId,
}: {
  plans: PricingPlan[];
  pendingPlan: string | null;
  onChoose: (plan: PricingPlan) => void | Promise<void>;
  emphasizedPlanId?: string | null;
}) {
  return (
    <div className={`grid gap-6 ${gridColsClass(plans.length)}`}>
      {plans.map((plan) => (
        <article
          key={plan.id}
          data-plan-id={plan.id}
          className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
            emphasizedPlanId && plan.id === emphasizedPlanId
              ? "border-[var(--accent)] bg-[var(--accent-muted)]/30 ring-2 ring-[var(--accent)]"
              : plan.featured
                ? "border-[var(--accent)] bg-[var(--accent-muted)]/30"
                : "border-[var(--border)] bg-[var(--surface)]"
          }`}
        >
          {plan.featured && (
            <span className="mb-2 w-fit rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Popular
            </span>
          )}
          {emphasizedPlanId && plan.id === emphasizedPlanId && !plan.featured && (
            <span className="mb-2 w-fit rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Recommended
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
            onClick={() => void onChoose(plan)}
          >
            {pendingPlan === plan.id ? "Working…" : plan.cta}
          </button>
        </article>
      ))}
    </div>
  );
}

export function PricingClient({
  defaultSection = "all",
  emphasizedPlanId: emphasizedPlanIdProp = null,
  next: nextProp = null,
  section: sectionProp = null,
  reason: reasonProp = null,
}: PricingClientProps) {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const emphasizedPlanId = emphasizedPlanIdProp;
  const next = nextProp;
  const section = sectionProp;
  const planRequired = reasonProp === "plan_required";

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

  useEffect(() => {
    if (!emphasizedPlanId) return;
    const el = document.querySelector(
      `[data-plan-id="${CSS.escape(emphasizedPlanId)}"]`,
    );
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [emphasizedPlanId]);

  useEffect(() => {
    if (section !== "clinics") return;
    const el = document.querySelector('[data-section="clinics"]');
    if (!el) return;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [section]);

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

  const consumerPlans = (
    data?.consumerPlans?.length
      ? data.consumerPlans
      : (data?.plans ?? []).filter((p) => !p.id.startsWith("clinic-"))
  ).filter((p) => p.priceMonthlyUsd !== 0);
  const organizationPlans = data?.organizationPlans?.length
    ? data.organizationPlans
    : (data?.plans ?? []).filter((p) => p.id.startsWith("clinic-")).length
      ? (data?.plans ?? []).filter((p) => p.id.startsWith("clinic-"))
      : ORGANIZATION_PLANS;

  const choosePlan = async (plan: PricingPlan) => {
    setPendingPlan(plan.id);
    try {
      const isClinicSaaS = plan.id.startsWith("clinic-");
      if (isClinicSaaS) {
        const nextSafe =
          typeof next === "string" && next.startsWith("/") ? next : "/clinic/pa";
        if (plan.priceMonthlyUsd === null) {
          router.push("/contact");
          return;
        }
        let email = "";
        try {
          const token = window.localStorage.getItem("scriptids_token");
          if (token) {
            const parts = token.split(".");
            if (parts.length >= 3) {
              email = decodeURIComponent(parts[1] ?? "");
            }
          }
        } catch {
          // ignore
        }
        try {
          const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId: plan.id,
              next: nextSafe,
              email: email.includes("@") ? email : undefined,
            }),
          });
          const json = (await res.json()) as
            | { url?: string; error?: string }
            | undefined;
          if (!res.ok) throw new Error(json?.error || res.statusText);
          localStorage.setItem("scriptids_plan", plan.id);
          const url = json?.url;
          if (!url) throw new Error("Missing Stripe checkout url");
          window.location.assign(url);
          return;
        } catch {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planId: plan.id,
              next: nextSafe,
              items: [
                {
                  id: plan.id,
                  name: plan.name,
                  priceUsd: plan.priceMonthlyUsd,
                  quantity: 1,
                },
              ],
            }),
          });
          const json = (await res.json()) as
            | { checkoutUrl?: string; error?: string }
            | undefined;
          if (!res.ok) throw new Error(json?.error || res.statusText);
          localStorage.setItem("scriptids_plan", plan.id);
          const url = json?.checkoutUrl;
          if (!url) throw new Error("Missing checkout url");
          router.push(url);
          return;
        }
      }

      if (plan.priceMonthlyUsd === 0) {
        localStorage.setItem("scriptids_plan", plan.id);
        router.push("/chat");
        return;
      }
      if (plan.priceMonthlyUsd === null) {
        router.push("/contact");
        return;
      }
      const nextSafe = typeof next === "string" && next.startsWith("/") ? next : "";
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan.id,
            next: nextSafe,
          }),
        });
        const json = (await res.json()) as
          | { url?: string; error?: string }
          | undefined;
        if (!res.ok) throw new Error(json?.error || res.statusText);
        localStorage.setItem("scriptids_plan", plan.id);
        const url = json?.url;
        if (!url) throw new Error("Missing Stripe checkout url");
        window.location.assign(url);
        return;
      } catch {
        // Local fallback when Stripe isn't configured.
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan.id,
            next: nextSafe,
            items: [
              {
                id: plan.id,
                name: plan.name,
                priceUsd: plan.priceMonthlyUsd,
                quantity: 1,
              },
            ],
          }),
        });
        const json = (await res.json()) as
          | { checkoutUrl?: string; error?: string }
          | undefined;
        if (!res.ok) throw new Error(json?.error || res.statusText);
        localStorage.setItem("scriptids_plan", plan.id);
        const url = json?.checkoutUrl;
        if (!url) throw new Error("Missing checkout url");
        router.push(url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <div className="space-y-14">
      {(defaultSection === "all" || defaultSection === "consumers") && (
        <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            For consumers
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
            Scripti focuses on OTC education and routing. Affiliate revenue comes
            from general OTC categories (allergy, cold/flu, pain, GI, etc.) when
            users choose to shop on a licensed pharmacy partner site.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Explorer is free by default—no checkout needed.
          </p>
        </div>
        <PlanGrid
          plans={consumerPlans}
          pendingPlan={pendingPlan}
          onChoose={choosePlan}
          emphasizedPlanId={emphasizedPlanId}
        />
        </section>
      )}

      {(defaultSection === "all" || defaultSection === "clinics") && (
        <section className="space-y-4" data-section="clinics">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            For clinics (SaaS)
          </h2>
          {planRequired && (
            <p className="mt-2 max-w-3xl text-sm text-[var(--foreground)]">
              A clinic plan is required to access the workflow dashboard. Choose a plan to continue.
            </p>
          )}
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
            Clinic plans are contracted separately. In addition to the monthly
            platform fee, billing can include a per prior authorization case fee
            (typically $2–$10 depending on volume and services).
          </p>
        </div>
        {organizationPlans.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Clinic pricing is not available right now.
          </p>
        ) : (
          <PlanGrid
            plans={organizationPlans}
            pendingPlan={pendingPlan}
            onChoose={choosePlan}
            emphasizedPlanId={emphasizedPlanId}
          />
        )}
        </section>
      )}

      <p className="text-center text-xs text-[var(--muted)]">
        Organization plans are estimates until you speak with us. All prices are
        in USD unless noted otherwise.
      </p>
    </div>
  );
}

