"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PRIOR_AUTH_TEMPLATES, type PriorAuthTemplateId } from "@/lib/pa-templates";
import type { InsuranceType, PriorAuthOptimization, PriorAuthPrediction } from "@/lib/types";

const INSURANCE: { value: InsuranceType; label: string }[] = [
  { value: "commercial", label: "Commercial" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
];

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void (async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          } catch {
            // Clipboard can fail in some browser contexts; no-op.
          }
        })();
      }}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function PriorAuthForm() {
  const [medication, setMedication] = useState("Ozempic");
  const [dose, setDose] = useState("");
  const [quantity, setQuantity] = useState("");
  const [daysSupply, setDaysSupply] = useState("");
  const [indication, setIndication] = useState("Type 2 diabetes");
  const [insurance, setInsurance] = useState<InsuranceType>("commercial");
  const [triedFirstLine, setTriedFirstLine] = useState(true);

  const [signedIn, setSignedIn] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  const [result, setResult] = useState<PriorAuthPrediction | null>(null);
  const [optimization, setOptimization] = useState<PriorAuthOptimization | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<
    { id: string; originalName: string; url: string; createdAt: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [templateId, setTemplateId] = useState<PriorAuthTemplateId>("universal");

  useEffect(() => {
    const read = () => {
      try {
        const token = window.localStorage.getItem("scriptids_token");
        const plan = window.localStorage.getItem("scriptids_plan");
        setSignedIn(Boolean(token));
        setPlanId(plan);
      } catch {
        setSignedIn(false);
        setPlanId(null);
      }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const hasPaPlus = planId === "pa-plus" || planId === "pro";

  const selectedTemplate = useMemo(
    () => PRIOR_AUTH_TEMPLATES.find((t) => t.id === templateId) ?? PRIOR_AUTH_TEMPLATES[0]!,
    [templateId],
  );

  useEffect(() => {
    if (!signedIn || !hasPaPlus) return;
    void (async () => {
      try {
        const res = await fetch("/api/uploads");
        const json = (await res.json()) as {
          uploads?: { id: string; originalName: string; url: string; createdAt: string }[];
        };
        if (!res.ok) return;
        const list = Array.isArray(json.uploads) ? json.uploads : [];
        setUploads(
          list
            .map((u) => ({
              id: u.id,
              originalName: u.originalName,
              url: `/api/uploads/${encodeURIComponent(u.id)}`,
              createdAt: u.createdAt,
            }))
            .slice(0, 12),
        );
      } catch {
        // ignore
      }
    })();
  }, [hasPaPlus, signedIn]);

  const exportText = useMemo(() => {
    if (!result || !optimization) return "";
    const lines: string[] = [];
    lines.push("Prior auth prep (copy/paste)");
    lines.push("");
    lines.push(`Form style: ${selectedTemplate.name}`);
    lines.push("");
    lines.push(`Medication: ${medication || "—"}`);
    if (dose.trim()) lines.push(`Dose/frequency: ${dose.trim()}`);
    if (quantity.trim()) lines.push(`Quantity: ${quantity.trim()}`);
    if (daysSupply.trim()) lines.push(`Days supply: ${daysSupply.trim()}`);
    lines.push(`Indication/diagnosis: ${indication || "—"}`);
    lines.push(`Insurance type: ${insurance}`);
    lines.push(`Tried first-line/preferred options: ${triedFirstLine ? "Yes" : "No/Not sure"}`);
    lines.push("");
    lines.push("Clinical rationale:");
    lines.push(optimization.autofill.clinicalRationale);
    lines.push("");
    lines.push("Common form fields:");
    lines.push(`- Diagnosis: ${optimization.autofill.fields.diagnosis || "—"}`);
    lines.push(`- Requested drug & dose: ${optimization.autofill.fields.requestedDrugAndDose || "—"}`);
    lines.push(`- Prior therapies tried: ${optimization.autofill.fields.priorTherapiesTried || "—"}`);
    lines.push(`- Contraindications/failures: ${optimization.autofill.fields.contraindicationsOrFailures || "—"}`);
    lines.push("");
    lines.push("Checklist:");
    const merged = Array.from(
      new Set([...optimization.autofill.documentationChecklist, ...selectedTemplate.checklist]),
    );
    merged.forEach((d) => lines.push(`- ${d}`));
    lines.push("");
    lines.push("Suggested next steps:");
    result.nextSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    if (uploads.length) {
      lines.push("");
      lines.push("Attached paperwork images:");
      uploads.forEach((u) => lines.push(`- ${u.originalName}`));
    }
    return lines.join("\n");
  }, [
    daysSupply,
    dose,
    indication,
    insurance,
    medication,
    optimization,
    quantity,
    result,
    selectedTemplate,
    triedFirstLine,
    uploads,
  ]);

  const openPrintPack = useCallback(() => {
    if (!result || !optimization) return;
    try {
      const payload = {
        createdAt: new Date().toISOString(),
        template: selectedTemplate,
        medication,
        dose: dose || undefined,
        quantity: quantity || undefined,
        daysSupply: daysSupply || undefined,
        indication: indication || undefined,
        insurance,
        triedFirstLine,
        prediction: result,
        optimization,
        uploads,
      };
      window.sessionStorage.setItem("scriptids_prior_auth_print_pack_v1", JSON.stringify(payload));
      window.open("/prior-auth/print", "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  }, [
    daysSupply,
    dose,
    indication,
    insurance,
    medication,
    optimization,
    quantity,
    result,
    selectedTemplate,
    triedFirstLine,
    uploads,
  ]);

  const runPrediction = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/prior-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medication,
          dose,
          quantity,
          daysSupply,
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
  }, [daysSupply, dose, medication, indication, insurance, quantity, triedFirstLine]);

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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Dose / frequency (optional)
            <input
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g. 0.5 mg weekly"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Quantity (optional)
            <input
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 2 pens"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Days supply (optional)
            <input
              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              value={daysSupply}
              onChange={(e) => setDaysSupply(e.target.value)}
              placeholder="e.g. 28"
              inputMode="numeric"
            />
          </label>
        </div>

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
            {!signedIn && (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--foreground)]">
                  The predictor is free.{" "}
                  <Link
                    href="/signup?next=%2Fprior-auth"
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    Sign up
                  </Link>{" "}
                  to unlock Prior Auth Plus (copy/paste wording, a simple action plan,
                  alternatives, and optional paperwork uploads).
                </p>
              </div>
            )}
            {signedIn && !hasPaPlus && (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--foreground)]">
                  Want the extra tools?{" "}
                  <Link
                    href="/pricing/consumers?plan=pa-plus&next=%2Fprior-auth"
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    Upgrade to Prior Auth Plus
                  </Link>
                  .
                </p>
              </div>
            )}

            <p className="mt-1 text-sm text-[var(--muted)]">
              How confident we are in this estimate:{" "}
              <strong className="text-[var(--foreground)]">
                {result.confidencePct}%
              </strong>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">
              {result.summary}
            </p>

            {optimization && signedIn && hasPaPlus && (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Prior Auth Plus tools
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Estimated approval likelihood:{" "}
                    <strong className="text-[var(--foreground)]">
                      {optimization.approvalLikelihoodPct}%
                    </strong>
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Form style
                    <select
                      className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value as PriorAuthTemplateId)}
                    >
                      {PRIOR_AUTH_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-sm text-[var(--muted)]">{selectedTemplate.description}</p>
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
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-[var(--muted)]">
                          Clinical rationale
                        </p>
                        <CopyButton
                          text={optimization.autofill.clinicalRationale}
                          label="Copy"
                        />
                      </div>
                      <div className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)] whitespace-pre-wrap">
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

                <div className="mt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Action plan (for you)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exportText ? <CopyButton text={exportText} label="Copy pack" /> : null}
                      <button
                        type="button"
                        onClick={() => openPrintPack()}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted-bg)]"
                      >
                        Print pack
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-3">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          Message to your prescriber’s office
                        </p>
                        <CopyButton text={optimization.actionPlan.messageToPrescriber} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--foreground)] whitespace-pre-wrap">
                        {optimization.actionPlan.messageToPrescriber}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          Call script: insurer / PBM
                        </p>
                        <CopyButton text={optimization.actionPlan.insurerCallScript} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--foreground)] whitespace-pre-wrap">
                        {optimization.actionPlan.insurerCallScript}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          Call script: pharmacy
                        </p>
                        <CopyButton text={optimization.actionPlan.pharmacyCallScript} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--foreground)] whitespace-pre-wrap">
                        {optimization.actionPlan.pharmacyCallScript}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Quick checklist
                      </p>
                      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-[var(--foreground)]">
                        {optimization.actionPlan.checklist.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Paperwork uploads (Plus)
                    </p>
                    <span className="text-xs text-[var(--muted)]">Images only</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Upload photos of forms, rejection screenshots, or anything your doctor asked you to
                    gather—so it’s easy to keep everything together while you work the case.
                    Avoid patient identifiers if possible.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void (async () => {
                          setUploading(true);
                          setError(null);
                          try {
                            const form = new FormData();
                            form.append("file", f);
                            const res = await fetch("/api/uploads", {
                              method: "POST",
                              body: form,
                            });
                            const json = (await res.json()) as {
                              upload?: { id: string; originalName: string; url: string; createdAt: string };
                              error?: string;
                            };
                            if (!res.ok) throw new Error(json.error || res.statusText);
                            if (!json.upload) throw new Error("Missing upload");
                            setUploads((prev) => [json.upload!, ...prev].slice(0, 12));
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploading(false);
                            // allow uploading same file again
                            e.target.value = "";
                          }
                        })();
                      }}
                      className="block w-full max-w-sm text-sm text-[var(--muted)] file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--foreground)] hover:file:bg-[var(--muted-bg)]"
                    />
                    {uploads.length ? (
                      <span className="text-xs text-[var(--muted)]">
                        {uploads.length} uploaded
                      </span>
                    ) : null}
                  </div>

                  {uploads.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {uploads.map((u) => (
                        <div
                          key={u.id}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-[var(--foreground)] line-clamp-2">
                              {u.originalName}
                            </p>
                            <button
                              type="button"
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                              onClick={() => setUploads((prev) => prev.filter((x) => x.id !== u.id))}
                            >
                              Hide
                            </button>
                          </div>
                          <a
                            href={u.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]"
                          >
                            <img
                              src={u.url}
                              alt={u.originalName}
                              className="h-36 w-full object-cover"
                              loading="lazy"
                            />
                          </a>
                          <p className="mt-2 text-xs text-[var(--muted)]">
                            Uploaded {new Date(u.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
                      <p className="text-sm text-[var(--muted)]">
                        No uploads yet.
                      </p>
                    </div>
                  )}
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

            {optimization && !signedIn && (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      Prior Auth Plus
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      The predictor is free. Create an account to unlock Prior Auth Plus:
                      copy/paste wording, a simple action plan, alternatives, optional paperwork
                      uploads, and a print-friendly pack.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/signup?next=%2Fprior-auth"
                      className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/login?next=%2Fprior-auth"
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {optimization && signedIn && !hasPaPlus && (
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      Upgrade to Prior Auth Plus
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Subscribe to unlock copy/paste wording, a simple action plan,
                      alternative suggestions, optional paperwork uploads, and a print-friendly pack.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/pricing/consumers?plan=pa-plus&next=%2Fprior-auth"
                      className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                    >
                      View plans
                    </Link>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Preview
                  </p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">
                    Approval likelihood drivers, a copy-ready clinical rationale paragraph,
                    and a checklist tailored to your medication and coverage.
                  </p>
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
