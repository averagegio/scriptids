export type WebSource = {
  title: string;
  url: string;
  snippet?: string;
};

export async function tavilySearch(query: string): Promise<WebSource[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("Missing TAVILY_API_KEY");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
    }),
  });
  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(json?.message || json?.error || res.statusText);
  }
  const results = Array.isArray(json?.results) ? json.results : [];
  return results
    .map((r: any) => ({
      title: String(r?.title || "").trim(),
      url: String(r?.url || "").trim(),
      snippet: r?.content ? String(r.content).trim() : undefined,
    }))
    .filter((s: WebSource) => s.title && s.url);
}

