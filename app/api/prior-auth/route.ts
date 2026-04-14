import { withApiLinks } from "@/lib/api-meta";
import { predictPriorAuth } from "@/lib/mock-pa";
import { optimizePriorAuth } from "@/lib/pa-optimizer";
import type { InsuranceType, PriorAuthInput } from "@/lib/types";

function isInsurance(x: unknown): x is InsuranceType {
  return x === "commercial" || x === "medicare" || x === "medicaid";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      withApiLinks({ error: "Invalid JSON body" }),
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;
  const medication = typeof b.medication === "string" ? b.medication : "";
  const indication = typeof b.indication === "string" ? b.indication : "";
  const insurance = b.insurance;
  const triedFirstLine =
    b.triedFirstLine === true || b.triedFirstLine === false
      ? b.triedFirstLine
      : false;

  if (!isInsurance(insurance)) {
    return Response.json(
      withApiLinks({
        error: "insurance must be commercial | medicare | medicaid",
      }),
      { status: 400 },
    );
  }

  const input: PriorAuthInput = {
    medication,
    indication,
    insurance,
    triedFirstLine,
  };

  const prediction = predictPriorAuth(input);
  const optimization = optimizePriorAuth(input);
  return Response.json(withApiLinks({ prediction, optimization }));
}
