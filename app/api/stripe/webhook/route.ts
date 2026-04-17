import { headers } from "next/headers";
import Stripe from "stripe";
import { withApiLinks } from "@/lib/api-meta";
import { getStripe } from "@/lib/stripe";
import { upsertClinicAccess } from "@/lib/clinic-access";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = requireEnv("STRIPE_WEBHOOK_SECRET");

  const rawBody = await request.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return Response.json(withApiLinks({ error: "Missing stripe-signature" }), {
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (e) {
    return Response.json(
      withApiLinks({ error: e instanceof Error ? e.message : "Invalid signature" }),
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const planId = typeof s.metadata?.planId === "string" ? s.metadata.planId : null;
      const product = typeof s.metadata?.product === "string" ? s.metadata.product : "";
      if (product === "scriptids_clinic" && planId && typeof s.customer_email === "string") {
        await upsertClinicAccess({
          email: s.customer_email.toLowerCase(),
          planId,
          status: "active",
          stripeCustomerId: typeof s.customer === "string" ? s.customer : null,
          stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : null,
        });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const statusActive = sub.status === "active" || sub.status === "trialing";
      const planId = typeof sub.metadata?.planId === "string" ? sub.metadata.planId : null;
      const email =
        typeof sub.metadata?.email === "string"
          ? sub.metadata.email
          : null;
      // If you later store customer->email mapping, you can remove reliance on metadata here.
      if (email && email.includes("@")) {
        await upsertClinicAccess({
          email: email.toLowerCase(),
          planId,
          status: statusActive ? "active" : "inactive",
          stripeCustomerId: typeof sub.customer === "string" ? sub.customer : null,
          stripeSubscriptionId: sub.id,
        });
      }
    }
  } catch (e) {
    return Response.json(
      withApiLinks({ error: e instanceof Error ? e.message : "Webhook error" }),
      { status: 500 },
    );
  }

  return Response.json(withApiLinks({ received: true }));
}

