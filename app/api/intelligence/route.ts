import { withApiLinks } from "@/lib/api-meta";
import { searchDrugProfiles } from "@/lib/mock-intelligence";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const profiles = searchDrugProfiles(q);
  return Response.json(withApiLinks({ profiles, query: q }));
}
