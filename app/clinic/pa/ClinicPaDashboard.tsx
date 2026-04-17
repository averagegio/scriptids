"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClinicPaCase, ClinicPaStatus, InsuranceType } from "@/lib/types";
import Link from "next/link";

const STATUS_LABEL: Record<ClinicPaStatus, string> = {
  draft: "Draft",
  needs_patient_info: "Needs patient info",
  needs_clinical_info: "Needs clinical info",
  ready_to_submit: "Ready to submit",
  submitted: "Submitted",
  rfi: "Payer requested info",
  approved: "Approved",
  denied: "Denied",
  closed: "Closed",
};

const STATUS_GROUPS: { title: string; statuses: ClinicPaStatus[] }[] = [
  { title: "Intake", statuses: ["draft", "needs_patient_info", "needs_clinical_info"] },
  { title: "Submission", statuses: ["ready_to_submit", "submitted", "rfi"] },
  { title: "Outcomes", statuses: ["approved", "denied", "closed"] },
];

const INSURANCE: { value: InsuranceType; label: string }[] = [
  { value: "commercial", label: "Commercial" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
];

function isClinicPlan(planId: string | null) {
  return planId === "clinic-starter" || planId === "clinic-growth" || planId === "clinic-enterprise";
}

function isGrowthPlan(planId: string | null) {
  return planId === "clinic-growth" || planId === "clinic-enterprise";
}

function parseEmailFromSessionToken(token: string | null) {
  if (!token) return null;
  // Session token format: sid.<urlEncodedEmail>.<base36Timestamp>
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const kind = parts[0];
  const encodedEmail = parts[1] ?? "";
  try {
    const email = decodeURIComponent(encodedEmail);
    if (!email.includes("@")) return null;
    // Prefer the current prefix, but still accept older three-part tokens with the same payload shape.
    if (kind === "sid") return email;
    if (encodedEmail.includes("%40")) return email;
    return null;
  } catch {
    return null;
  }
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function caseSlaHint(c: ClinicPaCase) {
  if (c.status === "submitted" || c.status === "rfi") {
    const base = c.lastPayerTouchAt ?? c.submittedAt ?? c.updatedAt;
    const baseDate = new Date(base);
    const days = c.urgency === "expedited" ? 3 : 7;
    const due = new Date(baseDate);
    due.setDate(due.getDate() + days);
    const msLeft = due.getTime() - Date.now();
    const dLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    if (dLeft <= 0) return "Follow-up due";
    if (dLeft === 1) return "Follow-up tomorrow";
    return `Follow-up in ${dLeft}d`;
  }
  return null;
}

function followUpDue(c: ClinicPaCase) {
  if (!(c.status === "submitted" || c.status === "rfi")) return false;
  const base = c.lastPayerTouchAt ?? c.submittedAt ?? c.updatedAt;
  const baseDate = new Date(base);
  const days = c.urgency === "expedited" ? 3 : 7;
  const due = new Date(baseDate);
  due.setDate(due.getDate() + days);
  return due.getTime() <= Date.now();
}

export function ClinicPaDashboard() {
  const [cases, setCases] = useState<ClinicPaCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [planId, setPlanId] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [view, setView] = useState<"all" | "followup">("all");
  const [onlyMine, setOnlyMine] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPending, setBulkPending] = useState(false);

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [medication, setMedication] = useState("");
  const [indication, setIndication] = useState("");
  const [insuranceType, setInsuranceType] = useState<InsuranceType>("commercial");
  const [payerOrPbm, setPayerOrPbm] = useState("");
  const [urgency, setUrgency] = useState<"standard" | "expedited">("standard");

  const [selected, setSelected] = useState<ClinicPaCase | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    try {
      setPlanId(window.localStorage.getItem("scriptids_plan"));
      const token = window.localStorage.getItem("scriptids_token");
      setSignedIn(Boolean(token));
      setUserId(parseEmailFromSessionToken(token));
    } catch {
      setPlanId(null);
      setSignedIn(false);
      setUserId(null);
    }
  }, []);

  const allowed = signedIn && isClinicPlan(planId);
  const growth = allowed && isGrowthPlan(planId);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/pa/cases");
      const raw = await res.text();
      const json = (raw ? JSON.parse(raw) : {}) as {
        cases?: ClinicPaCase[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || res.statusText);
      setCases(Array.isArray(json.cases) ? json.cases : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allowed) return;
    void refresh();
  }, [allowed]);

  const filtered = useMemo(() => {
    let next = cases;
    if (view === "followup") {
      next = next.filter((c) => c.status === "submitted" || c.status === "rfi");
      next = next.filter((c) => followUpDue(c));
    }
    if (onlyMine && userId) {
      next = next.filter((c) => (c.owner ?? "").toLowerCase() === userId.toLowerCase());
    }
    const t = q.trim().toLowerCase();
    if (!t) return next;
    return next.filter((c) => {
      const hay = [
        c.title,
        c.owner ?? "",
        c.medication,
        c.indication ?? "",
        c.payerOrPbm ?? "",
        c.status,
        c.urgency,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(t);
    });
  }, [cases, onlyMine, q, userId, view]);

  const followUpDueCount = useMemo(
    () => cases.filter((c) => followUpDue(c)).length,
    [cases],
  );

  useEffect(() => {
    // Keep selection coherent when changing views/filters.
    setSelectedIds([]);
  }, [q, onlyMine, view]);

  const grouped = useMemo(() => {
    const by: Record<ClinicPaStatus, ClinicPaCase[]> = {
      draft: [],
      needs_patient_info: [],
      needs_clinical_info: [],
      ready_to_submit: [],
      submitted: [],
      rfi: [],
      approved: [],
      denied: [],
      closed: [],
    };
    for (const c of filtered) by[c.status].push(c);
    return by;
  }, [filtered]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const bulkMarkTouched = async () => {
    if (!growth) return;
    if (selectedIds.length === 0) return;
    setBulkPending(true);
    setError(null);
    try {
      const res = await fetch("/api/clinic/pa/cases/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_payer_touched", caseIds: selectedIds }),
      });
      const json = (await res.json()) as { updated?: number; error?: string };
      if (!res.ok) throw new Error(json.error || res.statusText);
      setSelectedIds([]);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBulkPending(false);
    }
  };

  const bulkAction = async (action: "set_status_rfi" | "set_urgency_expedited") => {
    if (!growth) return;
    if (selectedIds.length === 0) return;
    setBulkPending(true);
    setError(null);
    try {
      const res = await fetch("/api/clinic/pa/cases/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, caseIds: selectedIds }),
      });
      const json = (await res.json()) as { updated?: number; error?: string };
      if (!res.ok) throw new Error(json.error || res.statusText);
      setSelectedIds([]);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBulkPending(false);
    }
  };

  const createCase = async () => {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/clinic/pa/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          owner: growth ? (owner || userId || undefined) : undefined,
          medication,
          indication: indication || undefined,
          insuranceType,
          payerOrPbm: payerOrPbm || undefined,
          urgency,
        }),
      });
      const json = (await res.json()) as { case?: ClinicPaCase; error?: string };
      if (!res.ok) throw new Error(json.error || res.statusText);
      setTitle("");
      setOwner("");
      setMedication("");
      setIndication("");
      setPayerOrPbm("");
      setUrgency("standard");
      setInsuranceType("commercial");
      setCreateOpen(false);
      await refresh();
      if (json.case) setSelected(json.case);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const updateSelected = async (patch: Partial<ClinicPaCase> & { status?: ClinicPaStatus }) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinic/pa/cases/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json()) as { case?: ClinicPaCase; error?: string };
      if (!res.ok) throw new Error(json.error || res.statusText);
      if (!json.case) throw new Error("Missing case");
      setSelected(json.case);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (taskId: string, done: boolean) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinic/pa/cases/${encodeURIComponent(selected.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_task", taskId, done }),
      });
      const json = (await res.json()) as { case?: ClinicPaCase; error?: string };
      if (!res.ok) throw new Error(json.error || res.statusText);
      if (!json.case) throw new Error("Missing case");
      setSelected(json.case);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadPaperwork = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const raw = await res.text();
      const json = (raw ? JSON.parse(raw) : {}) as {
        upload?: { id: string; originalName: string; createdAt: string };
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || res.statusText);
      const up = json.upload;
      if (!up?.id) throw new Error("Upload failed");

      const res2 = await fetch(
        `/api/clinic/pa/cases/${encodeURIComponent(selected.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_attachment",
            uploadId: up.id,
            originalName: up.originalName,
            createdAt: up.createdAt,
          }),
        },
      );
      const raw2 = await res2.text();
      const json2 = (raw2 ? JSON.parse(raw2) : {}) as {
        case?: ClinicPaCase;
        error?: string;
      };
      if (!res2.ok) throw new Error(json2.error || res2.statusText);
      if (json2.case) setSelected(json2.case);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    if (!selected) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/clinic/pa/cases/${encodeURIComponent(selected.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove_attachment", attachmentId }),
        },
      );
      const raw = await res.text();
      const json = (raw ? JSON.parse(raw) : {}) as {
        case?: ClinicPaCase;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || res.statusText);
      if (json.case) setSelected(json.case);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUploading(false);
    }
  };

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Clinic workflow is a contracted feature
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in and activate a clinic plan to use the prior auth workflow dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {!signedIn ? (
            <>
              <Link
                href="/login?next=%2Fclinic%2Fpa"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup?next=%2Fclinic%2Fpa"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                Sign up
              </Link>
            </>
          ) : (
            <Link
              href="/pricing/clinics"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Start a clinic plan
            </Link>
          )}
          <Link
            href="/pricing"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            View pricing
          </Link>
        </div>
        {signedIn && !isClinicPlan(planId) && (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Clinic plan required
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]">
              This workspace unlocks with an active clinic plan. If you already purchased one, finish checkout and return here, or choose a clinic plan from pricing.
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              If you are testing locally and need to force a plan id, set{" "}
              <code className="rounded bg-[var(--muted-bg)] px-1 font-mono text-xs">
                localStorage.scriptids_plan
              </code>{" "}
              to{" "}
              <code className="rounded bg-[var(--muted-bg)] px-1 font-mono text-xs">
                clinic-starter
              </code>{" "}
              or{" "}
              <code className="rounded bg-[var(--muted-bg)] px-1 font-mono text-xs">
                clinic-growth
              </code>
              .
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Case queue</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Keep work moving. No patient identifiers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setCreateOpen(true)}
            >
              New case
            </button>
            <button
              type="button"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              onClick={() => void refresh()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2 sm:w-[min(28rem,100%)]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, medication, payer, status…"
          />
          <span className="text-xs text-[var(--muted)]">
            {filtered.length} case{filtered.length === 1 ? "" : "s"}
          </span>
          {growth && (
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setView("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "all"
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setView("followup")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "followup"
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                Follow-up due ({followUpDueCount})
              </button>
              <button
                type="button"
                onClick={() => setOnlyMine((v) => !v)}
                disabled={!userId}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                  onlyMine
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)]"
                }`}
              >
                My cases
              </button>
            </div>
          )}
        </div>

        {growth && view === "followup" && selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
            <p className="text-sm text-[var(--foreground)]">
              <strong>{selectedIds.length}</strong> selected
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bulkPending}
                onClick={() => void bulkMarkTouched()}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {bulkPending ? "Updating…" : "Mark payer touched today"}
              </button>
              <button
                type="button"
                disabled={bulkPending}
                onClick={() => void bulkAction("set_status_rfi")}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-50"
              >
                Set status → RFI
              </button>
              <button
                type="button"
                disabled={bulkPending}
                onClick={() => void bulkAction("set_urgency_expedited")}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-50"
              >
                Set urgency → Expedited
              </button>
              <button
                type="button"
                disabled={bulkPending}
                onClick={() => setSelectedIds([])}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-50"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}
        {loading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">Loading cases…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-sm font-semibold text-[var(--foreground)]">No cases yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Create your first case to see it flow through intake → submission → outcomes.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {STATUS_GROUPS.map((g) => (
              <section key={g.title}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {g.title}
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {g.statuses.reduce((acc, s) => acc + grouped[s].length, 0)}
                  </span>
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {g.statuses.flatMap((s) => grouped[s]).map((c) => {
                    const sla = caseSlaHint(c);
                    const canSelect = growth && view === "followup" && followUpDue(c);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected(c)}
                        className={`text-left rounded-2xl border p-4 transition-colors hover:bg-[var(--muted-bg)] ${
                          selected?.id === c.id
                            ? "border-[var(--accent)] bg-[var(--accent-muted)]/20"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {canSelect && (
                              <label
                                className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  className="size-4 rounded border-[var(--border)] accent-[var(--accent)]"
                                  checked={selectedSet.has(c.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedIds((prev) => {
                                      if (checked) return Array.from(new Set([...prev, c.id]));
                                      return prev.filter((x) => x !== c.id);
                                    });
                                  }}
                                />
                                Select
                              </label>
                            )}
                            <p className="text-sm font-semibold text-[var(--foreground)] line-clamp-2">
                              {c.title}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {c.medication}
                              {c.indication ? ` · ${c.indication}` : ""}
                            </p>
                          </div>
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                            {c.urgency}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--muted-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--foreground)]">
                            {STATUS_LABEL[c.status]}
                          </span>
                          {growth && c.owner ? (
                            <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[11px] font-semibold text-[var(--foreground)]">
                              {c.owner}
                            </span>
                          ) : null}
                          {sla ? (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                              {sla}
                            </span>
                          ) : null}
                          <span className="text-[11px] text-[var(--muted)]">
                            Updated {fmtDate(c.updatedAt)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Case details
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Update status, tasks, and key notes.
            </p>
          </div>
          {selected ? (
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--muted)] hover:bg-[var(--muted-bg)]"
              onClick={() => setSelected(null)}
            >
              Clear
            </button>
          ) : null}
        </div>

        {!selected ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-sm text-[var(--muted)]">
              Select a case from the queue to view details.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Title
                <input
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={selected.title}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                  onBlur={() => void updateSelected({ title: selected.title })}
                />
              </label>
              {growth && (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Owner (Growth)
                    <input
                      className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                      value={selected.owner ?? ""}
                      onChange={(e) => setSelected({ ...selected, owner: e.target.value })}
                      onBlur={() => void updateSelected({ owner: selected.owner ?? "" })}
                      placeholder={userId ?? "e.g. pa-team@clinic.com"}
                    />
                  </label>
                  <div className="pt-6">
                    <button
                      type="button"
                      disabled={!userId || saving}
                      onClick={() => void updateSelected({ owner: userId ?? "" })}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-60"
                    >
                      Assign to me
                    </button>
                  </div>
                </div>
              )}
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Status
                <select
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={selected.status}
                  onChange={(e) =>
                    void updateSelected({ status: e.target.value as ClinicPaStatus })
                  }
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Payer / PBM (optional)
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    value={selected.payerOrPbm ?? ""}
                    onChange={(e) =>
                      setSelected({ ...selected, payerOrPbm: e.target.value })
                    }
                    onBlur={() =>
                      void updateSelected({ payerOrPbm: selected.payerOrPbm ?? "" })
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Urgency
                  <select
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    value={selected.urgency}
                    onChange={(e) =>
                      void updateSelected({
                        urgency: e.target.value as "standard" | "expedited",
                      })
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="expedited">Expedited</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Submitted
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">
                    {fmtDate(selected.submittedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Determination
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">
                    {fmtDate(selected.determinationAt)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Tasks
              </p>
              <div className="mt-2 space-y-2">
                {selected.tasks.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border-[var(--border)] accent-[var(--accent)]"
                      checked={t.done}
                      disabled={saving}
                      onChange={(e) => void toggleTask(t.id, e.target.checked)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--foreground)]">{t.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Added {fmtDate(t.createdAt)}
                        {t.doneAt ? ` · Done ${fmtDate(t.doneAt)}` : ""}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Notes (avoid patient identifiers)
              </p>
              <textarea
                className="mt-2 min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                value={selected.notes ?? ""}
                onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                onBlur={() => void updateSelected({ notes: selected.notes ?? "" })}
                placeholder="Example: “Portal requires BMI and A1c; attach last visit note.”"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Paperwork uploads
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Upload non-identifying screenshots (portal requirements, payer messages, redacted forms).
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0];
                      if (!f) return;
                      void uploadPaperwork(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  {uploading ? "Uploading…" : "Upload image"}
                </label>
              </div>
              <div className="mt-3 space-y-2">
                {(selected.attachments ?? []).length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No paperwork uploaded yet.</p>
                ) : (
                  (selected.attachments ?? []).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="min-w-0">
                        <a
                          href={`/api/uploads/${encodeURIComponent(a.uploadId)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-sm font-semibold text-[var(--foreground)] hover:underline"
                        >
                          {a.originalName}
                        </a>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          Added {fmtDate(a.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={uploading}
                        className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--muted)] hover:bg-[var(--muted-bg)] disabled:opacity-60"
                        onClick={() => void removeAttachment(a.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {(selected.status === "approved" || selected.status === "denied") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Authorization # (if approved)
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    value={selected.authorizationNumber ?? ""}
                    onChange={(e) =>
                      setSelected({ ...selected, authorizationNumber: e.target.value })
                    }
                    onBlur={() =>
                      void updateSelected({
                        authorizationNumber: selected.authorizationNumber ?? "",
                      })
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Denial reason (if denied)
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    value={selected.denialReason ?? ""}
                    onChange={(e) =>
                      setSelected({ ...selected, denialReason: e.target.value })
                    }
                    onBlur={() =>
                      void updateSelected({ denialReason: selected.denialReason ?? "" })
                    }
                  />
                </label>
              </div>
            )}

            {saving ? (
              <p className="text-sm text-[var(--muted)]">Saving…</p>
            ) : null}
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  New PA case
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Create a workflow record. Do not enter patient identifiers.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                onClick={() => setCreateOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                Title
                <input
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ozempic PA — Dr. Smith"
                />
              </label>
              {growth && (
                <label className="block text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                  Owner (Growth)
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder={userId ?? "e.g. pa-team@clinic.com"}
                  />
                </label>
              )}
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Medication
                <input
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  placeholder="e.g. Ozempic"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Indication (optional)
                <input
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="e.g. Type 2 diabetes"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Insurance type
                <select
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
                >
                  {INSURANCE.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Payer / PBM (optional)
                <input
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={payerOrPbm}
                  onChange={(e) => setPayerOrPbm(e.target.value)}
                  placeholder="e.g. Express Scripts"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Urgency
                <select
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as "standard" | "expedited")}
                >
                  <option value="standard">Standard</option>
                  <option value="expedited">Expedited</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void createCase()}
                disabled={creating || !title.trim() || !medication.trim()}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create case"}
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

