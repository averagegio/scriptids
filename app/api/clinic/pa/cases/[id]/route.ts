import { withApiLinks } from "@/lib/api-meta";
import {
  clinicPaGetCase,
  clinicPaToggleTask,
  clinicPaUpdateCase,
} from "@/lib/clinic-pa-store";
import type { ClinicPaStatus } from "@/lib/types";

function isStatus(x: unknown): x is ClinicPaStatus {
  return (
    x === "draft" ||
    x === "needs_patient_info" ||
    x === "needs_clinical_info" ||
    x === "ready_to_submit" ||
    x === "submitted" ||
    x === "rfi" ||
    x === "approved" ||
    x === "denied" ||
    x === "closed"
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const c = await clinicPaGetCase(id);
  if (!c) return Response.json(withApiLinks({ error: "Not found" }), { status: 404 });
  return Response.json(withApiLinks({ case: c }));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(withApiLinks({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const b = body as Record<string, unknown>;
  const status = b.status;
  if (status !== undefined && !isStatus(status)) {
    return Response.json(withApiLinks({ error: "Invalid status" }), { status: 400 });
  }

  const updated = await clinicPaUpdateCase(id, {
    title: typeof b.title === "string" ? b.title : undefined,
    owner: typeof b.owner === "string" ? b.owner : undefined,
    medication: typeof b.medication === "string" ? b.medication : undefined,
    dose: typeof b.dose === "string" ? b.dose : undefined,
    quantity: typeof b.quantity === "string" ? b.quantity : undefined,
    daysSupply: typeof b.daysSupply === "string" ? b.daysSupply : undefined,
    indication: typeof b.indication === "string" ? b.indication : undefined,
    payerOrPbm: typeof b.payerOrPbm === "string" ? b.payerOrPbm : undefined,
    urgency:
      b.urgency === "standard" || b.urgency === "expedited" ? b.urgency : undefined,
    notes: typeof b.notes === "string" ? b.notes : undefined,
    authorizationNumber:
      typeof b.authorizationNumber === "string" ? b.authorizationNumber : undefined,
    denialReason: typeof b.denialReason === "string" ? b.denialReason : undefined,
    status: status !== undefined ? (status as ClinicPaStatus) : undefined,
  });
  if (!updated) return Response.json(withApiLinks({ error: "Not found" }), { status: 404 });
  return Response.json(withApiLinks({ case: updated }));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(withApiLinks({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const b = body as Record<string, unknown>;
  if (b.action === "toggle_task") {
    const taskId = typeof b.taskId === "string" ? b.taskId : "";
    const done = b.done === true;
    if (!taskId) {
      return Response.json(withApiLinks({ error: "taskId required" }), { status: 400 });
    }
    const updated = await clinicPaToggleTask(id, taskId, done);
    if (!updated) {
      return Response.json(withApiLinks({ error: "Not found" }), { status: 404 });
    }
    return Response.json(withApiLinks({ case: updated }));
  }

  return Response.json(withApiLinks({ error: "Unknown action" }), { status: 400 });
}

