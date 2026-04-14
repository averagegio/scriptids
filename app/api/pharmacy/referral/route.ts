import { withApiLinks } from "@/lib/api-meta";

type ReferralKind = "otc" | "rx";

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
  const kind = (b.kind as ReferralKind) || "otc";
  const query = typeof b.query === "string" ? b.query : "";
  const planId = typeof b.planId === "string" ? b.planId : "";

  if (kind !== "otc" && kind !== "rx") {
    return Response.json(withApiLinks({ error: "kind must be otc | rx" }), {
      status: 400,
    });
  }

  const otcBase = process.env.PARTNER_OTC_URL || "https://examplepharmacy.com/otc";
  const rxBase = process.env.PARTNER_RX_URL || "https://examplepharmacy.com/rx";
  const coupon = process.env.PARTNER_COUPON_CODE || "";

  const url = new URL(kind === "otc" ? otcBase : rxBase);
  url.searchParams.set("utm_source", "scriptids");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", kind === "otc" ? "scripti_free" : "scripti_plus");
  if (query.trim()) url.searchParams.set("q", query.trim());

  // If a partner coupon exists, pass it along for OTC flows.
  if (kind === "otc" && coupon) url.searchParams.set("coupon", coupon);

  // Plus gate signal (purely informational for partner; no PHI).
  if (kind === "rx") url.searchParams.set("tier", planId || "unknown");

  return Response.json(
    withApiLinks({
      kind,
      url: url.toString(),
      coupon: kind === "otc" ? coupon || undefined : undefined,
      note:
        kind === "otc"
          ? "Scripti suggestions are educational and not medical advice. You are leaving Scriptids to shop on a separate, licensed pharmacy partner site."
          : "Scriptids does not provide medical care or prescriptions. You are leaving Scriptids to continue with a licensed pharmacy partner.",
    }),
  );
}

