import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans for Scriptids—Scripti, PA predictor, and drug intelligence.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Pricing
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Choose a level that matches how you use Scriptids. You can start free and
        move up when you need more depth. Organization pricing is tailored to
        your team.
      </p>
      <div className="mt-10">
        <PricingClient />
      </div>
    </main>
  );
}
