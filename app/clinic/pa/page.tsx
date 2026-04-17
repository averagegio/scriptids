import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "@/app/components/BackNav";

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
            href="/signup?next=%2Fclinic%2Fpa%2Fdashboard"
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Sign up
          </Link>
          <Link
            href="/login?next=%2Fclinic%2Fpa%2Fdashboard"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            Log in
          </Link>
          <Link
            href="/pricing/clinics?next=%2Fclinic%2Fpa%2Fdashboard"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            Clinic pricing
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            What you can do
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]">
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span> Case queue with statuses and SLA hints
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span> Assign ownership, track tasks, and manage follow-ups
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span> Upload paperwork images per case (non-identifying)
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/signup?next=%2Fclinic%2Fpa%2Fdashboard"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Create clinic account
            </Link>
            <Link
              href="/login?next=%2Fclinic%2Fpa%2Fdashboard"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              Sign in
            </Link>
          </div>
        </section>
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Dashboard
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--foreground)]">
            Already have access?
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Go straight to the workflow dashboard.
          </p>
          <div className="mt-4">
            <Link
              href="/clinic/pa/dashboard"
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              Open dashboard →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

