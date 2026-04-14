import { withApiLinks } from "@/lib/api-meta";
import { CONSUMER_PLANS, ORGANIZATION_PLANS, PRICING_PLANS } from "@/lib/pricing-data";

export async function GET() {
  return Response.json(
    withApiLinks({
      currency: "USD",
      billing: "monthly where applicable; enterprise custom",
      consumerPlans: CONSUMER_PLANS,
      organizationPlans: ORGANIZATION_PLANS,
      plans: PRICING_PLANS,
    }),
  );
}
