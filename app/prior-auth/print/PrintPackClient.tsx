"use client";

import { useEffect, useMemo, useState } from "react";
import type { PriorAuthOptimization, PriorAuthPrediction } from "@/lib/types";
import type { PriorAuthTemplate } from "@/lib/pa-templates";

type PrintPayload = {
  createdAt: string;
  template: PriorAuthTemplate;
  medication: string;
  dose?: string;
  quantity?: string;
  daysSupply?: string;
  indication?: string;
  insurance: string;
  triedFirstLine: boolean;
  prediction: PriorAuthPrediction;
  optimization: PriorAuthOptimization;
  uploads: { id: string; originalName: string; url: string; createdAt: string }[];
};

const STORAGE_KEY = "scriptids_prior_auth_print_pack_v1";

export function PrintPackClient() {
  const [payload, setPayload] = useState<PrintPayload | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PrintPayload;
      setPayload(parsed);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      setPayload(null);
    }
  }, []);

  const mergedChecklist = useMemo(() => {
    if (!payload) return [];
    const base = payload.optimization.autofill.documentationChecklist;
    const extra = payload.template.checklist;
    return Array.from(new Set([...base, ...extra]));
  }, [payload]);

  useEffect(() => {
    if (!payload) return;
    const t = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(t);
  }, [payload]);

  if (!payload) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10 text-sm text-[var(--muted)]">
        Nothing to print. Go back to Prior Auth and tap “Print pack”.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--foreground)]">
      <header className="border-b border-black pb-4">
        <h1 className="text-2xl font-semibold">Prior authorization pack</h1>
        <p className="mt-2 text-sm text-black/70">
          Generated {new Date(payload.createdAt).toLocaleString()} · Template:{" "}
          <span className="font-semibold">{payload.template.name}</span>
        </p>
        <p className="mt-3 text-sm text-black/70">
          This is a planning document—not a guarantee from your insurer. Avoid including
          patient identifiers unless you truly need them.
        </p>
      </header>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Prescription details</h2>
        <p>
          <span className="font-semibold">Medication:</span> {payload.medication || "—"}
        </p>
        {payload.dose ? (
          <p>
            <span className="font-semibold">Dose / frequency:</span> {payload.dose}
          </p>
        ) : null}
        {payload.quantity ? (
          <p>
            <span className="font-semibold">Quantity:</span> {payload.quantity}
          </p>
        ) : null}
        {payload.daysSupply ? (
          <p>
            <span className="font-semibold">Days supply:</span> {payload.daysSupply}
          </p>
        ) : null}
        <p>
          <span className="font-semibold">Indication / diagnosis:</span>{" "}
          {payload.indication || "—"}
        </p>
        <p>
          <span className="font-semibold">Insurance type:</span> {payload.insurance}
        </p>
        <p>
          <span className="font-semibold">Tried first-line options:</span>{" "}
          {payload.triedFirstLine ? "Yes" : "No / not sure"}
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Estimate</h2>
        <p>
          <span className="font-semibold">Prior auth likely:</span>{" "}
          {payload.prediction.paLikely ? "Yes" : "Maybe / less likely"}
        </p>
        <p>
          <span className="font-semibold">Confidence:</span>{" "}
          {payload.prediction.confidencePct}%
        </p>
        <p className="leading-relaxed">{payload.prediction.summary}</p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Approval likelihood (Plus)</h2>
        <p>
          <span className="font-semibold">Estimated approval likelihood:</span>{" "}
          {payload.optimization.approvalLikelihoodPct}%
        </p>
        <ul className="list-disc pl-5">
          {payload.optimization.drivers.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Clinical rationale (copy/paste)</h2>
        <p className="whitespace-pre-wrap leading-relaxed">
          {payload.optimization.autofill.clinicalRationale}
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Common form fields</h2>
        <p>
          <span className="font-semibold">Diagnosis:</span>{" "}
          {payload.optimization.autofill.fields.diagnosis || "—"}
        </p>
        <p>
          <span className="font-semibold">Requested drug & dose:</span>{" "}
          {payload.optimization.autofill.fields.requestedDrugAndDose || "—"}
        </p>
        <p>
          <span className="font-semibold">Prior therapies tried:</span>{" "}
          {payload.optimization.autofill.fields.priorTherapiesTried || "—"}
        </p>
        <p>
          <span className="font-semibold">Contraindications / failures:</span>{" "}
          {payload.optimization.autofill.fields.contraindicationsOrFailures || "—"}
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Documentation checklist</h2>
        <ul className="list-disc pl-5">
          {mergedChecklist.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-base font-semibold">Next steps</h2>
        <ol className="list-decimal pl-5">
          {payload.prediction.nextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      {payload.uploads.length ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-base font-semibold">Uploaded paperwork images</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {payload.uploads.map((u) => (
              <figure key={u.id} className="break-inside-avoid border border-black/10 p-3">
                <figcaption className="mb-2 text-xs text-black/70">{u.originalName}</figcaption>
                <img src={u.url} alt={u.originalName} className="w-full object-contain" />
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
