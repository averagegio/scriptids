import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { IntelligenceClient } from "./IntelligenceClient";

export const metadata: Metadata = {
  title: "Drug intelligence",
  description:
    "Explore summarized side-effect reports by medicine—for learning, not treatment decisions.",
};

export default function IntelligencePage() {
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

      <div className="mt-10">
        <IntelligenceClient />
      </div>
    </main>
  );
}
