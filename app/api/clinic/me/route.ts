import { withApiLinks } from "@/lib/api-meta";
import { getBearerToken, parseEmailFromSessionToken } from "@/lib/auth-token";
import { getClinicAccessByEmail } from "@/lib/clinic-access";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  const email = parseEmailFromSessionToken(token);
  if (!email) {
    return Response.json(withApiLinks({ signedIn: false }), { status: 200 });
  }
  try {
    const access = await getClinicAccessByEmail(email);
    return Response.json(
      withApiLinks({
        signedIn: true,
        email,
        clinicAccess: access
          ? { planId: access.planId, status: access.status, updatedAt: access.updatedAt }
          : null,
      }),
    );
  } catch (e) {
    return Response.json(
      withApiLinks({
        signedIn: true,
        email,
        clinicAccess: null,
        warning: e instanceof Error ? e.message : "Could not load clinic access",
      }),
    );
  }
}

