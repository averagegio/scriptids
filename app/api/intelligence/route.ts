import { withApiLinks } from "@/lib/api-meta";
import { searchDrugProfiles } from "@/lib/mock-intelligence";
import type { DrugIntelligenceProfile, SideEffectSignal } from "@/lib/types";

type OpenFdaCountRow = { term: string; count: number };

function formatYyyymmdd(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function escapeOpenFdaTerm(term: string) {
  // openFDA query strings use quotes for phrase matching.
  return term.replaceAll(`"`, "");
}

function buildDrugSearchClause(input: string) {
  const q = escapeOpenFdaTerm(input.trim());
  // Try to match both "as reported" medicinalproduct and normalized openfda fields.
  // NOTE: field presence varies across reports, so OR is important.
  return [
    `patient.drug.medicinalproduct:"${q}"`,
    `patient.drug.openfda.brand_name:"${q}"`,
    `patient.drug.openfda.generic_name:"${q}"`,
  ].join(" OR ");
}

async function openFdaFetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      // openFDA asks for contact info in User-Agent in some contexts; harmless here.
      "User-Agent": "scriptids (drug intelligence demo)",
    },
    // This data is not truly realtime; cache a bit to reduce rate-limits.
    next: { revalidate: 60 * 60 * 6 },
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const err = json as { error?: { message?: string } };
    throw new Error(err?.error?.message || res.statusText);
  }
  return json as any;
}

async function openFdaTotal(search: string) {
  const apiKey = process.env.OPENFDA_API_KEY;
  const qs = new URLSearchParams();
  qs.set("search", search);
  qs.set("limit", "1");
  if (apiKey) qs.set("api_key", apiKey);
  const url = `https://api.fda.gov/drug/event.json?${qs.toString()}`;
  const json = (await openFdaFetchJson(url)) as { meta?: { results?: { total?: number } } };
  return Number(json?.meta?.results?.total ?? 0);
}

async function openFdaTopReactions(search: string, limit: number) {
  const apiKey = process.env.OPENFDA_API_KEY;
  const qs = new URLSearchParams();
  qs.set("search", search);
  qs.set("count", "patient.reaction.reactionmeddrapt.exact");
  qs.set("limit", String(Math.min(25, Math.max(1, limit))));
  if (apiKey) qs.set("api_key", apiKey);
  const url = `https://api.fda.gov/drug/event.json?${qs.toString()}`;
  const json = (await openFdaFetchJson(url)) as { results?: OpenFdaCountRow[] };
  return (json.results ?? []).filter((r) => r?.term && typeof r.count === "number");
}

function trendFromWindows(recent: number, prior: number): SideEffectSignal["trend"] {
  if (prior <= 0) return recent > 0 ? "up" : "flat";
  const ratio = recent / prior;
  if (ratio >= 1.15) return "up";
  if (ratio <= 0.85) return "down";
  return "flat";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitRaw = searchParams.get("limit");
  const limit =
    typeof limitRaw === "string" && /^\d+$/.test(limitRaw)
      ? Math.min(50, Math.max(1, Number(limitRaw)))
      : 50;

  const trimmed = q.trim();
  if (!trimmed) {
    // The UI is "search-first"; do not show a dataset until a user submits a query.
    return Response.json(withApiLinks({ profiles: [], query: q, limit }));
  }

  // Try live openFDA/FAERS-backed results first; fall back to our mock dataset.
  try {
    const drugClause = buildDrugSearchClause(trimmed);
    const totalSignals = await openFdaTotal(drugClause);

    // Get top reactions by count, then compute both share% and "recent vs prior" trend.
    const top = await openFdaTopReactions(drugClause, 8);
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const recentStart = new Date(end);
    recentStart.setUTCDate(recentStart.getUTCDate() - 90);
    const priorStart = new Date(end);
    priorStart.setUTCDate(priorStart.getUTCDate() - 180);
    const priorEnd = new Date(end);
    priorEnd.setUTCDate(priorEnd.getUTCDate() - 90);

    const recentRange = `receivedate:[${formatYyyymmdd(recentStart)} TO ${formatYyyymmdd(end)}]`;
    const priorRange = `receivedate:[${formatYyyymmdd(priorStart)} TO ${formatYyyymmdd(priorEnd)}]`;

    const topSignals: SideEffectSignal[] = [];
    for (const row of top.slice(0, 6)) {
      const term = String(row.term);
      const reports = Number(row.count);
      const sharePct =
        totalSignals > 0 ? Math.max(1, Math.round((reports / totalSignals) * 100)) : 0;

      const reactionClause = `patient.reaction.reactionmeddrapt.exact:"${escapeOpenFdaTerm(term)}"`;
      const recent = await openFdaTotal(`(${drugClause}) AND (${reactionClause}) AND ${recentRange}`);
      const prior = await openFdaTotal(`(${drugClause}) AND (${reactionClause}) AND ${priorRange}`);
      const trend = trendFromWindows(recent, prior);

      topSignals.push({ term: term.toLowerCase(), reports, sharePct, trend });
    }

    const profile: DrugIntelligenceProfile = {
      id: `openfda_${trimmed.toLowerCase().replace(/\s+/g, "-")}`,
      genericName: trimmed.toLowerCase(),
      brandNames: [],
      therapeuticClass: "FAERS (openFDA)",
      totalSignals,
      lastUpdated: new Date().toISOString().slice(0, 10),
      topSignals,
      notes:
        "Live counts are based on public FAERS reports via openFDA. Reporting does not prove causation, duplicates can exist, and recent periods may be incomplete—use for learning and discussion, not personal medical decisions.",
    };

    return Response.json(withApiLinks({ profiles: [profile], query: q, limit, source: "openfda" }));
  } catch {
    const profiles = searchDrugProfiles(trimmed).slice(0, limit);
    return Response.json(withApiLinks({ profiles, query: q, limit, source: "mock" }));
  }
}
