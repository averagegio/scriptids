import { withApiLinks } from "@/lib/api-meta";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INTENTS = ["support", "partnership", "press", "other"] as const;

/** Contact form intake. Check Vercel logs or connect Resend / Zendesk later. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      withApiLinks({ error: "Invalid request" }),
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 200) : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const message =
    typeof b.message === "string" ? b.message.trim().slice(0, 5000) : "";
  const intent =
    typeof b.intent === "string" && INTENTS.includes(b.intent as (typeof INTENTS)[number])
      ? b.intent
      : "other";

  if (!name) {
    return Response.json(withApiLinks({ error: "Please add your name." }), {
      status: 400,
    });
  }
  if (!EMAIL.test(email)) {
    return Response.json(withApiLinks({ error: "Please enter a valid email." }), {
      status: 400,
    });
  }
  if (message.length < 10) {
    return Response.json(
      withApiLinks({ error: "Please write a bit more in your message (at least 10 characters)." }),
      { status: 400 },
    );
  }

  console.info("[contact]", {
    name,
    email,
    intent,
    messagePreview: message.slice(0, 120),
    at: new Date().toISOString(),
  });

  return Response.json(
    withApiLinks({
      ok: true,
      message:
        "Thanks for reaching out. We read every message and will get back to you soon.",
    }),
  );
}
