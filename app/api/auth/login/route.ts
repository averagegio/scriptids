import { withApiLinks } from "@/lib/api-meta";
import { makeSessionToken, validateAuthInput } from "@/lib/auth-session";

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
  const v = validateAuthInput(b.email, b.password);
  if (!v.ok) {
    return Response.json(withApiLinks({ error: v.error }), { status: 400 });
  }

  const token = makeSessionToken(v.email);
  return Response.json(
    withApiLinks({
      success: true,
      token,
      user: { email: v.email },
      message:
        "You're signed in. Sessions are device-local until full account verification is enabled.",
    }),
  );
}
