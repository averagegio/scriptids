"use client";

import { useCallback, useState } from "react";
import type { InsuranceType, PriorAuthOptimization, PriorAuthPrediction } from "@/lib/types";

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
  const [optimization, setOptimization] = useState<PriorAuthOptimization | null>(null);
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
        optimization?: PriorAuthOptimization;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || res.statusText);
      if (!data.prediction) throw new Error("Missing prediction");
      setResult(data.prediction);
      setOptimization(data.optimization ?? null);
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
          Enter what&apos;s on the prescription (or what your doctor plans to
          prescribe), then run the prediction. Results are estimates—not a
          guarantee from your insurer.
        </p>

        <label className="mt-6 block text-sm font-medium text-[var(--foreground)]">
          Medication on the prescription
          <input
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="e.g. Humira, metformin"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-[var(--foreground)]">
          What the prescription is for (optional)
          <input
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            placeholder="Condition or reason your prescriber noted"
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
            My prescriber already tried lower-cost options before this
            prescription, when that was appropriate
          </span>
        </label>

        <button
          type="button"
          onClick={() => void runPrediction()}
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {pending ? "Working…" : "Run prior authorization prediction"}
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
              Run the prediction to see an estimate
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

            {optimization && (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Prior auth form optimizer
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Estimated approval likelihood:{" "}
                    <strong className="text-[var(--foreground)]">
                      {optimization.approvalLikelihoodPct}%
                    </strong>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Why we think that
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--foreground)]">
                    {optimization.drivers.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Auto-fill (copy/paste)
                  </p>
                  <div className="mt-2 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[var(--muted)]">
                        Clinical rationale
                      </p>
                      <div className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)]">
                        {optimization.autofill.clinicalRationale}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs font-medium text-[var(--muted)]">
                          Diagnosis
                        </p>
                        <p className="mt-1 text-sm text-[var(--foreground)]">
                          {optimization.autofill.fields.diagnosis || "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs font-medium text-[var(--muted)]">
                          Requested drug &amp; dose
                        </p>
                        <p className="mt-1 text-sm text-[var(--foreground)]">
                          {optimization.autofill.fields.requestedDrugAndDose || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs font-medium text-[var(--muted)]">
                          Prior therapies tried
                        </p>
                        <p className="mt-1 text-sm text-[var(--foreground)]">
                          {optimization.autofill.fields.priorTherapiesTried || "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs font-medium text-[var(--muted)]">
                          Contraindications / failures
                        </p>
                        <p className="mt-1 text-sm text-[var(--foreground)]">
                          {optimization.autofill.fields.contraindicationsOrFailures || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Alternatives to ask about
                  </p>
                  <div className="mt-2 grid gap-3">
                    {optimization.alternatives.map((a) => (
                      <div
                        key={a.name}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {a.name}
                          </p>
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                            {a.type.replaceAll("-", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {a.whyItMayHelp}
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--foreground)]">
                          {a.questionsToAsk.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
            Tap{" "}
            <strong className="text-[var(--foreground)]">
              Run prior authorization prediction
            </strong>{" "}
            after filling in the form.
          </p>
        )}
      </div>
    </div>
  );
}
