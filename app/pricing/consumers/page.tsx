import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "@/app/components/BackNav";
import { PricingClient } from "../PricingClient";

export const metadata: Metadata = {
  title: "Consumer pricing",
  description: "Consumer plans for Scripti, prior auth tools, and drug intelligence.",
};

export default function ConsumerPricingPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const plan = typeof searchParams?.plan === "string" ? searchParams?.plan : null;
  const nextRaw = searchParams?.next;
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : null;
  const section =
    typeof searchParams?.section === "string" ? searchParams?.section : null;
  const reason =
    typeof searchParams?.reason === "string" ? searchParams?.reason : null;
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Consumers
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Pricing
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Choose a consumer plan for Scripti, prior auth help, and drug intelligence.
          </p>
        </div>
        <Link
          href="/pricing/clinics"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
        >
          Clinic pricing →
        </Link>
      </div>

      <div className="mt-10">
        <PricingClient
          defaultSection="consumers"
          emphasizedPlanId={plan}
          next={next}
          section={section}
          reason={reason}
        />
      </div>
    </main>
  );
}

