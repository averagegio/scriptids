import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BackNav } from "@/app/components/BackNav";
import { PricingClient } from "../PricingClient";

export const metadata: Metadata = {
  title: "Clinic pricing",
  description: "Clinic SaaS pricing for prior authorization workflow tools.",
};

export default function ClinicPricingPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Clinics
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Pricing
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            Self-serve plans for clinic prior auth workflow. After checkout, your account
            is activated and you can start using the workflow dashboard immediately.
          </p>
        </div>
        <Link
          href="/pricing/consumers"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
        >
          Consumer pricing →
        </Link>
      </div>

      <div className="mt-10">
        <Suspense
          fallback={
            <p className="text-center text-sm text-[var(--muted)]">
              Loading plans…
            </p>
          }
        >
          <PricingClient defaultSection="clinics" />
        </Suspense>
      </div>
    </main>
  );
}

