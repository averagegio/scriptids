import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { PriorAuthForm } from "./PriorAuthForm";

export const metadata: Metadata = {
  title: "PA predictor",
  description:
    "Estimate whether your plan may require prior authorization and what to have ready.",
};

export default function PriorAuthPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        PA predictor
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Enter your drug and coverage type to get a simple read on whether extra
        insurance approval is likely, what documents often help, and how long
        reviews can take. Your real plan rules always win—this is a planning
        aid only.
      </p>
      <div className="mt-10">
        <PriorAuthForm />
      </div>
    </main>
  );
}
