import type { Metadata } from "next";
import Link from "next/link";
import { BackNav } from "../components/BackNav";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple plans for Scriptids—Scripti, prior authorization prediction, and drug intelligence.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Pricing
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Choose a level that matches how you use Scriptids. Organization pricing
        is tailored to your team.
      </p>
      <div className="mt-10">
        <PricingClient />
      </div>
      <p className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-center text-sm text-[var(--muted)]">
        Need a custom bundle for your clinic, hub, or employer program?{" "}
        <Link href="/contact" className="font-semibold text-[var(--accent)] hover:underline">
          Talk to us
        </Link>
        .
      </p>
    </main>
  );
}
