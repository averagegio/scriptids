import { withApiLinks } from "@/lib/api-meta";
import { PRICING_PLANS } from "@/lib/pricing-data";

export async function GET() {
  return Response.json(
    withApiLinks({
      currency: "USD",
      billing: "monthly where applicable; enterprise custom",
      plans: PRICING_PLANS,
    }),
  );
}
