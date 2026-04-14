export type WebSource = {
  title: string;
  url: string;
  snippet?: string;
};

export async function tavilySearch(query: string): Promise<WebSource[]> {
  const key = process.env.PARALLEL_API_KEY;
  if (!key) throw new Error("Missing PARALLEL_API_KEY");

  const res = await fetch("https://api.parallel.ai/v1beta/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key },
    body: JSON.stringify({
      mode: "fast",
      objective: query,
      max_results: 5,
      excerpts: { max_chars_per_result: 1500 },
      fetch_policy: { max_age_seconds: 3600, timeout_seconds: 30, disable_cache_fallback: false },
    }),
  });
  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(json?.error?.message || json?.message || res.statusText);
  }
  const results = Array.isArray(json?.results) ? json.results : [];
  return results
    .map((r: any) => ({
      title: String(r?.title || "").trim(),
      url: String(r?.url || "").trim(),
      snippet: Array.isArray(r?.excerpts) ? r.excerpts.filter(Boolean).join("\n\n").trim() : undefined,
    }))
    .filter((s: WebSource) => s.title && s.url);
}

