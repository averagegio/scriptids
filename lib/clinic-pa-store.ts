import { promises as fs } from "node:fs";
import path from "node:path";
import type { ClinicPaCase, ClinicPaStatus, ClinicPaTask, InsuranceType } from "./types";

type StoreShape = {
  version: 1;
  cases: ClinicPaCase[];
};

function dataDir() {
  return path.join(process.cwd(), ".data");
}

function storePath() {
  return path.join(dataDir(), "clinic-pa.json");
}

async function ensureStore(): Promise<StoreShape> {
  await fs.mkdir(dataDir(), { recursive: true });
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.cases)) return parsed;
  } catch {
    // ignore
  }
  const fresh: StoreShape = { version: 1, cases: [] };
  await fs.writeFile(storePath(), JSON.stringify(fresh, null, 2), "utf8");
  return fresh;
}

async function writeStore(next: StoreShape) {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(next, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function defaultTasksForCase(): ClinicPaTask[] {
  const t = (label: string): ClinicPaTask => ({
    id: newId("task"),
    label,
    done: false,
    createdAt: nowIso(),
  });
  return [
    t("Verify coverage requirements (PA / step therapy / quantity limits)"),
    t("Draft clinical rationale + fill common PA form fields"),
    t("Confirm preferred alternatives (if any)"),
    t("Submit via required channel (ePA / portal / fax)"),
    t("Follow up if no response within SLA"),
  ];
}

export type ClinicPaCaseCreateInput = {
  title: string;
  owner?: string;
  medication: string;
  dose?: string;
  quantity?: string;
  daysSupply?: string;
  indication?: string;
  insuranceType: InsuranceType;
  payerOrPbm?: string;
  urgency?: "standard" | "expedited";
  notes?: string;
};

export type ClinicPaCasePatch = Partial<
  Pick<
    ClinicPaCase,
    | "title"
    | "owner"
    | "medication"
    | "dose"
    | "quantity"
    | "daysSupply"
    | "indication"
    | "insuranceType"
    | "payerOrPbm"
    | "urgency"
    | "notes"
    | "authorizationNumber"
    | "denialReason"
  >
> & {
  status?: ClinicPaStatus;
};

export async function clinicPaListCases() {
  const store = await ensureStore();
  return store.cases.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function clinicPaGetCase(id: string) {
  const store = await ensureStore();
  return store.cases.find((c) => c.id === id) ?? null;
}

export async function clinicPaCreateCase(input: ClinicPaCaseCreateInput) {
  const store = await ensureStore();
  const createdAt = nowIso();
  const c: ClinicPaCase = {
    id: newId("case"),
    createdAt,
    updatedAt: createdAt,
    status: "draft",
    title: input.title.trim(),
    owner: input.owner?.trim() || undefined,
    medication: input.medication.trim(),
    dose: input.dose?.trim() || undefined,
    quantity: input.quantity?.trim() || undefined,
    daysSupply: input.daysSupply?.trim() || undefined,
    indication: input.indication?.trim() || undefined,
    insuranceType: input.insuranceType,
    payerOrPbm: input.payerOrPbm?.trim() || undefined,
    urgency: input.urgency ?? "standard",
    notes: input.notes?.trim() || undefined,
    tasks: defaultTasksForCase(),
  };
  const next: StoreShape = { ...store, cases: [c, ...store.cases] };
  await writeStore(next);
  return c;
}

function applyStatusSideEffects(c: ClinicPaCase, status: ClinicPaStatus) {
  const t = nowIso();
  if (status === "submitted" && !c.submittedAt) c.submittedAt = t;
  if (status === "rfi") c.lastPayerTouchAt = t;
  if ((status === "approved" || status === "denied") && !c.determinationAt)
    c.determinationAt = t;
  if (status === "closed" && !c.closedAt) c.closedAt = t;
}

export async function clinicPaUpdateCase(id: string, patch: ClinicPaCasePatch) {
  const store = await ensureStore();
  const idx = store.cases.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const existing = store.cases[idx]!;
  const updated: ClinicPaCase = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
    title: typeof patch.title === "string" ? patch.title.trim() : existing.title,
    owner: typeof patch.owner === "string" ? patch.owner.trim() : existing.owner,
    medication:
      typeof patch.medication === "string"
        ? patch.medication.trim()
        : existing.medication,
    dose: typeof patch.dose === "string" ? patch.dose.trim() : existing.dose,
    quantity:
      typeof patch.quantity === "string" ? patch.quantity.trim() : existing.quantity,
    daysSupply:
      typeof patch.daysSupply === "string"
        ? patch.daysSupply.trim()
        : existing.daysSupply,
    indication:
      typeof patch.indication === "string"
        ? patch.indication.trim()
        : existing.indication,
    payerOrPbm:
      typeof patch.payerOrPbm === "string"
        ? patch.payerOrPbm.trim()
        : existing.payerOrPbm,
    notes: typeof patch.notes === "string" ? patch.notes.trim() : existing.notes,
    authorizationNumber:
      typeof patch.authorizationNumber === "string"
        ? patch.authorizationNumber.trim()
        : existing.authorizationNumber,
    denialReason:
      typeof patch.denialReason === "string"
        ? patch.denialReason.trim()
        : existing.denialReason,
  };

  if (patch.status && patch.status !== existing.status) {
    updated.status = patch.status;
    applyStatusSideEffects(updated, patch.status);
  }

  const nextCases = [...store.cases];
  nextCases[idx] = updated;
  await writeStore({ ...store, cases: nextCases });
  return updated;
}

export async function clinicPaToggleTask(caseId: string, taskId: string, done: boolean) {
  const store = await ensureStore();
  const idx = store.cases.findIndex((c) => c.id === caseId);
  if (idx === -1) return null;
  const existing = store.cases[idx]!;
  const tasks = existing.tasks.map((t) =>
    t.id === taskId
      ? { ...t, done, doneAt: done ? nowIso() : undefined }
      : t,
  );
  const updated: ClinicPaCase = { ...existing, tasks, updatedAt: nowIso() };
  const nextCases = [...store.cases];
  nextCases[idx] = updated;
  await writeStore({ ...store, cases: nextCases });
  return updated;
}

export async function clinicPaMarkPayerTouched(caseIds: string[]) {
  const store = await ensureStore();
  const set = new Set(caseIds.filter(Boolean));
  if (set.size === 0) return { updated: 0 };
  const t = nowIso();
  let updatedCount = 0;
  const nextCases = store.cases.map((c) => {
    if (!set.has(c.id)) return c;
    updatedCount += 1;
    return {
      ...c,
      updatedAt: t,
      lastPayerTouchAt: t,
    };
  });
  await writeStore({ ...store, cases: nextCases });
  return { updated: updatedCount };
}

export async function clinicPaBulkSetStatus(caseIds: string[], status: ClinicPaStatus) {
  const store = await ensureStore();
  const set = new Set(caseIds.filter(Boolean));
  if (set.size === 0) return { updated: 0 };
  let updatedCount = 0;
  const nextCases = store.cases.map((c) => {
    if (!set.has(c.id)) return c;
    const next: ClinicPaCase = { ...c, status, updatedAt: nowIso() };
    if (c.status !== status) {
      applyStatusSideEffects(next, status);
    }
    updatedCount += 1;
    return next;
  });
  await writeStore({ ...store, cases: nextCases });
  return { updated: updatedCount };
}

export async function clinicPaBulkSetUrgency(
  caseIds: string[],
  urgency: ClinicPaCase["urgency"],
) {
  const store = await ensureStore();
  const set = new Set(caseIds.filter(Boolean));
  if (set.size === 0) return { updated: 0 };
  let updatedCount = 0;
  const t = nowIso();
  const nextCases = store.cases.map((c) => {
    if (!set.has(c.id)) return c;
    updatedCount += 1;
    return { ...c, urgency, updatedAt: t };
  });
  await writeStore({ ...store, cases: nextCases });
  return { updated: updatedCount };
}

