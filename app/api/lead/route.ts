import { withApiLinks } from "@/lib/api-meta";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Captures newsletter / update interest. Wire to your CRM or webhook in production. */
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
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const segment =
    typeof b.segment === "string" && ["patient", "clinician", "organization"].includes(b.segment)
      ? b.segment
      : "unspecified";

  if (!EMAIL.test(email)) {
    return Response.json(withApiLinks({ error: "Please enter a valid email." }), {
      status: 400,
    });
  }

  console.info("[lead]", { email, segment, at: new Date().toISOString() });

  return Response.json(
    withApiLinks({
      ok: true,
      message: "Thanks—you're on the list. We'll only email about Scriptids updates.",
    }),
  );
}
