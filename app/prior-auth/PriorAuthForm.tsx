"use client";

import { useCallback, useState } from "react";
import type { InsuranceType, PriorAuthPrediction } from "@/lib/types";

const INSURANCE: { value: InsuranceType; label: string }[] = [
  { value: "commercial", label: "Commercial" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
];

export function PriorAuthForm() {
  const [medication, setMedication] = useState("Ozempic");
  const [indication, setIndication] = useState("Type 2 diabetes");
  const [insurance, setInsurance] = useState<InsuranceType>("commercial");
  const [triedFirstLine, setTriedFirstLine] = useState(true);

  const [result, setResult] = useState<PriorAuthPrediction | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrediction = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/prior-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medication,
          indication,
          insurance,
          triedFirstLine,
        }),
      });
      const data = (await res.json()) as {
        prediction?: PriorAuthPrediction;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || res.statusText);
      if (!data.prediction) throw new Error("Missing prediction");
      setResult(data.prediction);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }, [medication, indication, insurance, triedFirstLine]);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Tell us about the prescription
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Adjust the fields, then run the predictor. Results are estimates based
          on typical patterns—not a guarantee from your insurer.
        </p>

        <label className="mt-6 block text-sm font-medium text-[var(--foreground)]">
          Medication name
          <input
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="e.g. Humira, metformin"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-[var(--foreground)]">
          Condition or diagnosis (optional)
          <input
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            placeholder="What it’s for"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-[var(--foreground)]">
            Insurance type
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {INSURANCE.map(({ value, label }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  insurance === value
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                <input
                  type="radio"
                  name="insurance"
                  className="sr-only"
                  checked={insurance === value}
                  onChange={() => setInsurance(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-[var(--border)] accent-[var(--accent)]"
            checked={triedFirstLine}
            onChange={(e) => setTriedFirstLine(e.target.checked)}
          />
          <span>
            We already tried lower-cost or first-choice options when appropriate
          </span>
        </label>

        <button
          type="button"
          onClick={() => void runPrediction()}
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {pending ? "Working…" : "Run predictor"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            What we think
          </h2>
          {result ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                result.paLikely
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                  : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
              }`}
            >
              {result.paLikely
                ? "Extra approval likely"
                : "May not need extra approval"}
            </span>
          ) : (
            <span className="text-xs text-[var(--muted)]">
              Run the predictor to see an estimate
            </span>
          )}
        </div>

        {result ? (
          <>
            <p className="mt-1 text-sm text-[var(--muted)]">
              How confident we are in this estimate:{" "}
              <strong className="text-[var(--foreground)]">
                {result.confidencePct}%
              </strong>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">
              {result.summary}
            </p>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Paperwork that often helps
              </h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--foreground)]">
                {result.expectedDocuments.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Typical review time (calendar days)
              </h3>
              <p className="mt-2 text-sm text-[var(--foreground)]">
                {result.estimatedTurnaroundDays.min}–
                {result.estimatedTurnaroundDays.max} days
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Suggested next steps
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-[var(--foreground)]">
                {result.nextSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Tap <strong className="text-[var(--foreground)]">Run predictor</strong>{" "}
            after filling in the form.
          </p>
        )}
      </div>
    </div>
  );
}
