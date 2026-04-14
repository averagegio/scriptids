import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { SymptomSearchBar } from "../components/SymptomSearchBar";

export const metadata: Metadata = {
  title: "Scripti — symptom search",
  description:
    "Ask Scripti about symptoms in plain language and see general types of medicines people discuss with clinicians.",
};

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Scripti
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        Type how you feel in everyday words. Scripti suggests broad categories of
        OTC medicines and self-care options that often come up for similar
        symptoms—so you have something informed to discuss with your clinician or
        pharmacist. Scripti does not diagnose you, prescribe medicines, or tell
        you what to take.
      </p>
      <p className="mt-3 text-xs text-[var(--muted)]">
        If you choose to shop, you&apos;ll be sent to a separate pharmacy partner
        site. Scriptids does not sell or dispense drugs.
      </p>
      <div className="mt-8">
        <SymptomSearchBar />
      </div>
    </main>
  );
}
