import { withApiLinks } from "@/lib/api-meta";
import {
  clinicPaBulkSetStatus,
  clinicPaBulkSetUrgency,
  clinicPaMarkPayerTouched,
} from "@/lib/clinic-pa-store";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(withApiLinks({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const b = body as Record<string, unknown>;
  const action = typeof b.action === "string" ? b.action : "";
  const ids = Array.isArray(b.caseIds) ? b.caseIds : [];
  const caseIds = ids
    .map((x) => (typeof x === "string" ? x : ""))
    .filter(Boolean)
    .slice(0, 200);

  if (action === "mark_payer_touched") {
    const res = await clinicPaMarkPayerTouched(caseIds);
    return Response.json(withApiLinks(res));
  }
  if (action === "set_status_rfi") {
    const res = await clinicPaBulkSetStatus(caseIds, "rfi");
    return Response.json(withApiLinks(res));
  }
  if (action === "set_urgency_expedited") {
    const res = await clinicPaBulkSetUrgency(caseIds, "expedited");
    return Response.json(withApiLinks(res));
  }

  return Response.json(withApiLinks({ error: "Unknown action" }), { status: 400 });
}

