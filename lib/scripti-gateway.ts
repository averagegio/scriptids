import type { WebSource } from "./web-search";
import { generateText, gateway } from "ai";

export type GatewayResult = {
  answerMarkdown: string;
  sources: WebSource[];
};

function getGatewayModelId() {
  const configured = (process.env.OPENAI_MODEL || "").trim();
  const model = configured || "gpt-4o-mini";
  // Route through AI Gateway's OpenAI provider by default.
  return `openai/${model}`;
}

function sourcesFromToolResults(toolResults: unknown): WebSource[] {
  const out: WebSource[] = [];
  if (!Array.isArray(toolResults)) return out;

  for (const tr of toolResults as any[]) {
    const result = tr?.result;
    const results = Array.isArray(result?.results) ? result.results : Array.isArray(result) ? result : [];
    for (const r of results) {
      const title = String(r?.title || "").trim();
      const url = String(r?.url || "").trim();
      const snippet =
        typeof r?.snippet === "string"
          ? r.snippet
          : typeof r?.content === "string"
            ? r.content
            : Array.isArray(r?.excerpts)
              ? r.excerpts.filter(Boolean).join("\n\n")
              : undefined;
      if (title && url) out.push({ title, url, snippet: snippet?.trim() || undefined });
    }
  }

  // De-dupe by URL
  const seen = new Set<string>();
  return out.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

export async function answerWithGatewayAndPerplexity(args: {
  userText: string;
}): Promise<GatewayResult> {
  const system = [
    "You are Scripti, an educational assistant for over-the-counter (OTC) medication categories and next-step navigation.",
    "Do NOT diagnose, prescribe, provide dosing, or give treatment instructions.",
    "Be calm, plain-language, and consumer-friendly.",
    "If the user mentions urgent symptoms, tell them to seek emergency care.",
    "Use web search results for factual claims and include citations like [1], [2] inline.",
    "If you cannot verify something with sources, say you’re not sure.",
    "Output Markdown only.",
  ].join(" ");

  const prompt = [
    system,
    "",
    "Task:",
    "1) Use web search to find relevant, reputable sources.",
    "2) Answer the user with skimmable bullets and a short 'Next steps' section.",
    "",
    `User message: ${args.userText}`,
  ].join("\n");

  const { text, toolResults } = await generateText({
    model: getGatewayModelId(),
    prompt,
    temperature: 0.2,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch({
        maxResults: 5,
        maxTokens: 15000,
        maxTokensPerPage: 2048,
        searchRecencyFilter: "year",
      }),
    },
    toolChoice: "auto",
  });

  const sources = sourcesFromToolResults(toolResults);
  const answerMarkdown = String(text || "").trim() || "I couldn’t generate an answer right now.";
  return { answerMarkdown, sources };
}

