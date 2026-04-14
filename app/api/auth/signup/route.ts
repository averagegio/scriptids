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

  const name =
    typeof b.name === "string" && b.name.trim() ? b.name.trim() : undefined;
  const token = makeDemoToken(v.email);

  return Response.json(
    withApiLinks({
      success: true,
      token,
      user: { email: v.email, name },
      message:
        "Welcome! This early version may not store accounts permanently yet. We will email you when full accounts roll out.",
    }),
  );
}
