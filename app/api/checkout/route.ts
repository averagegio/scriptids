import { withApiLinks } from "@/lib/api-meta";
import { PRICING_PLANS } from "@/lib/pricing-data";

type CheckoutItem = {
  id: string;
  name: string;
  priceUsd: number;
  quantity: number;
};

function base64UrlEncodeUtf8(input: string) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecodeUtf8(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(normalized, "base64").toString("utf8");
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
  const planId = typeof b.planId === "string" ? b.planId : "";
  const itemsRaw = Array.isArray(b.items) ? b.items : [];
  const nextRaw = typeof b.next === "string" ? b.next : "";
  const next = nextRaw.startsWith("/") ? nextRaw : "";

  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return Response.json(withApiLinks({ error: "Unknown planId" }), {
      status: 400,
    });
  }
  if (plan.priceMonthlyUsd === 0) {
    return Response.json(
      withApiLinks({ error: "Free plan does not require checkout" }),
      { status: 400 },
    );
  }

  const items: CheckoutItem[] = itemsRaw
    .map((x) => x as Record<string, unknown>)
    .map((x) => ({
      id: typeof x.id === "string" ? x.id : "",
      name: typeof x.name === "string" ? x.name : "",
      priceUsd: typeof x.priceUsd === "number" ? x.priceUsd : 0,
      quantity: typeof x.quantity === "number" ? x.quantity : 1,
    }))
    .filter((x) => x.id && x.name && x.priceUsd > 0 && x.quantity > 0);

  const session = {
    kind: "scriptids_manual_checkout",
    sessionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    planId: plan.id,
    planName: plan.name,
    planPriceMonthlyUsd: plan.priceMonthlyUsd,
    items,
    next,
  };

  const token = base64UrlEncodeUtf8(JSON.stringify(session));
  return Response.json(
    withApiLinks({
      checkoutUrl: `/checkout?session=${encodeURIComponent(token)}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
    }),
  );
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(withApiLinks({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const b = body as Record<string, unknown>;
  const session = typeof b.session === "string" ? b.session : "";
  if (!session) {
    return Response.json(withApiLinks({ error: "session required" }), {
      status: 400,
    });
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(base64UrlDecodeUtf8(session));
  } catch {
    return Response.json(withApiLinks({ error: "Invalid session" }), {
      status: 400,
    });
  }

  const s = decoded as Record<string, unknown>;
  const sessionId = typeof s.sessionId === "string" ? s.sessionId : "";
  if (!sessionId) {
    return Response.json(withApiLinks({ error: "Invalid session" }), {
      status: 400,
    });
  }

  const planId = typeof s.planId === "string" ? s.planId : "";
  const nextRaw = typeof s.next === "string" ? s.next : "";
  const next = nextRaw.startsWith("/") ? nextRaw : "";

  return Response.json(
    withApiLinks({
      status: "confirmed",
      orderId: `ord_${sessionId}`,
      planId,
      next,
    }),
  );
}

