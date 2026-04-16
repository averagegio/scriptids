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

  const name =
    typeof b.name === "string" && b.name.trim() ? b.name.trim() : undefined;
  const token = makeSessionToken(v.email);

  return Response.json(
    withApiLinks({
      success: true,
      token,
      user: { email: v.email, name },
      message:
        "Welcome—your workspace is ready. Email verification and long-term account storage will roll out as the release completes.",
    }),
  );
}
