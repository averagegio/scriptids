import { withApiLinks } from "@/lib/api-meta";
import {
  clinicPaCreateCase,
  clinicPaListCases,
  type ClinicPaCaseCreateInput,
} from "@/lib/clinic-pa-store";
import type { InsuranceType } from "@/lib/types";

function isInsurance(x: unknown): x is InsuranceType {
  return x === "commercial" || x === "medicare" || x === "medicaid";
}

export async function GET() {
  const cases = await clinicPaListCases();
  return Response.json(withApiLinks({ cases }));
}

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
  const title = typeof b.title === "string" ? b.title : "";
  const owner = typeof b.owner === "string" ? b.owner : undefined;
  const medication = typeof b.medication === "string" ? b.medication : "";
  const insuranceType = b.insuranceType;
  const urgency =
    b.urgency === "standard" || b.urgency === "expedited" ? b.urgency : "standard";

  if (!title.trim()) {
    return Response.json(withApiLinks({ error: "title required" }), { status: 400 });
  }
  if (!medication.trim()) {
    return Response.json(withApiLinks({ error: "medication required" }), {
      status: 400,
    });
  }
  if (!isInsurance(insuranceType)) {
    return Response.json(
      withApiLinks({ error: "insuranceType must be commercial | medicare | medicaid" }),
      { status: 400 },
    );
  }

  const input: ClinicPaCaseCreateInput = {
    title,
    owner,
    medication,
    dose: typeof b.dose === "string" ? b.dose : undefined,
    quantity: typeof b.quantity === "string" ? b.quantity : undefined,
    daysSupply: typeof b.daysSupply === "string" ? b.daysSupply : undefined,
    indication: typeof b.indication === "string" ? b.indication : undefined,
    insuranceType,
    payerOrPbm: typeof b.payerOrPbm === "string" ? b.payerOrPbm : undefined,
    urgency,
    notes: typeof b.notes === "string" ? b.notes : undefined,
  };

  const created = await clinicPaCreateCase(input);
  return Response.json(withApiLinks({ case: created }), { status: 201 });
}

