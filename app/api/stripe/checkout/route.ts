import { withApiLinks } from "@/lib/api-meta";
import { CONSUMER_PLANS } from "@/lib/pricing-data";
import { getStripe, getStripePriceIdForPlan } from "@/lib/stripe";

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
  const planId = typeof b.planId === "string" ? b.planId : "";

  const plan = CONSUMER_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return Response.json(withApiLinks({ error: "Unknown planId" }), {
      status: 400,
    });
  }
  if (plan.priceMonthlyUsd === 0) {
    return Response.json(withApiLinks({ error: "Free plan does not require checkout" }), {
      status: 400,
    });
  }
  if (plan.priceMonthlyUsd === null) {
    return Response.json(withApiLinks({ error: "Custom plan cannot be checked out here" }), {
      status: 400,
    });
  }

  const stripe = getStripe();
  const price = getStripePriceIdForPlan(planId);

  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://scriptids.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?canceled=1`,
    metadata: {
      planId,
      product: "scriptids_consumer",
    },
    allow_promotion_codes: true,
  });

  return Response.json(withApiLinks({ url: session.url }));
}

