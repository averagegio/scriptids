import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "@/app/components/BackNav";
import { ClinicPaDashboard } from "./ClinicPaDashboard";

export const metadata: Metadata = {
  title: "Clinic prior auth workflow",
  description:
    "Clinic workflow dashboard for managing prior authorization cases without the back-and-forth.",
};

export default function ClinicPaPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Clinics
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Prior auth workflow
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
            Track cases, keep staff aligned on next steps, and reduce rework. This
            dashboard is designed for “workflow-lite” operations and should not
            contain patient identifiers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/pricing/clinics"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            Clinic pricing
          </Link>
          <Link
            href="/pricing/clinics"
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Start Clinic Starter / Growth
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <ClinicPaDashboard />
      </div>
    </main>
  );
}

