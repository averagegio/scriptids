import type { Metadata } from "next";
import { DRUG_PROFILES } from "@/lib/mock-intelligence";
import { BackNav } from "../components/BackNav";
import { IntelligenceClient } from "./IntelligenceClient";

export const metadata: Metadata = {
  title: "Drug intelligence",
  description:
    "Explore summarized side-effect reports by medicine—for learning, not treatment decisions.",
};

export default function IntelligencePage() {
  const total = DRUG_PROFILES.reduce((a, d) => a + d.totalSignals, 0);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Drug intelligence
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Search a drug to see how often different side effects show up in
        summarized reports. This is for context only—it is not personalized
        medical advice and it does not replace your doctor or the official drug
        information.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Medicines in this guide
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {DRUG_PROFILES.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Reports summarized
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {total.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            How to use this
          </p>
          <p className="mt-2 text-sm leading-snug text-[var(--foreground)]">
            Compare trends, then talk to your clinician or pharmacist about your
            own situation.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <IntelligenceClient />
      </div>
    </main>
  );
}
