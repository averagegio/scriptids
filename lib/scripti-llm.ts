import type { WebSource } from "./web-search";

export type LlmResult = {
  answerMarkdown: string;
  sources: WebSource[];
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function answerWithOpenAI(args: {
  userText: string;
  sources: WebSource[];
}): Promise<LlmResult> {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const sourcesText = args.sources
    .map((s, i) => {
      const snip = s.snippet ? `\nSnippet: ${s.snippet}` : "";
      return `[${i + 1}] ${s.title}\nURL: ${s.url}${snip}`;
    })
    .join("\n\n");

  const hasSources = args.sources.length > 0;
  const system = [
    "You are Scripti, an educational assistant for over-the-counter (OTC) medication categories and next-step navigation.",
    "Do NOT diagnose, prescribe, provide dosing, or give treatment instructions.",
    "Be calm, plain-language, and consumer-friendly.",
    "If the user mentions urgent symptoms, tell them to seek emergency care.",
    hasSources
      ? "Use the provided web sources for factual claims and include citations like [1], [2] inline."
      : "Do not claim you searched the web. If you are not sure about a factual claim, say so.",
    hasSources ? "If sources do not support a claim, say you’re not sure." : "",
    "Output Markdown only.",
  ]
    .filter(Boolean)
    .join(" ");

  const user = [
    `User message: ${args.userText}`,
    "",
    "Web sources:",
    sourcesText || "(none)",
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const json = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(json?.error?.message || res.statusText);
  }

  const answerMarkdown =
    String(json?.choices?.[0]?.message?.content || "").trim() ||
    "I couldn’t generate an answer right now.";

  return { answerMarkdown, sources: args.sources };
}

