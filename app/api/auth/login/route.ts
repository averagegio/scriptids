import { withApiLinks } from "@/lib/api-meta";
import { makeDemoToken, validateAuthInput } from "@/lib/auth-demo";

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

  const token = makeDemoToken(v.email);
  return Response.json(
    withApiLinks({
      success: true,
      token,
      user: { email: v.email },
      message:
        "You're signed in. This early version may not keep accounts the same way a finished product will.",
    }),
  );
}
