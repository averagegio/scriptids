import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return stripe;
}

export function getStripePriceIdForPlan(planId: string) {
  const envKey = `STRIPE_PRICE_${planId.replaceAll("-", "_").toUpperCase()}`;
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`Missing ${envKey}`);
  }
  return priceId;
}

