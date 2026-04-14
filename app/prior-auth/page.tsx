import type { Metadata } from "next";
import { BackNav } from "../components/BackNav";
import { PriorAuthForm } from "./PriorAuthForm";

export const metadata: Metadata = {
  title: "Prior authorization prediction",
  description:
    "Preview whether prior authorization may apply to a prescription and what to have ready.",
};

export default function PriorAuthPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <BackNav />
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
        Prior authorization prediction
      </h1>
      <div className="mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          <strong className="font-medium text-[var(--foreground)]">
            Prior authorization
          </strong>{" "}
          means your health plan may require a review and paperwork{" "}
          <em>before</em> they cover certain prescriptions. Your prescriber
          usually starts that process—it is not something you did wrong. Plans
          use it for some specialty or higher-cost medications to confirm the
          prescription matches their rules.
        </p>
        <p>
          This tool looks at the medication on your prescription, your coverage
          type, and a few other hints to suggest whether that extra step is{" "}
          <em>likely</em>, what documents often help, and roughly how long
          reviews can take. Your real plan always decides; think of this as a
          planning guide, not a promise from your insurer.
        </p>
      </div>
      <div className="mt-10">
        <PriorAuthForm />
      </div>
    </main>
  );
}
