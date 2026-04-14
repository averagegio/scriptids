import { analyzeScriptiInput, buildSymptomAssistantReply } from "./symptom-agent";
import type { ScriptiAgentMeta } from "./symptom-agent";
import { answerWithOpenAI } from "./scripti-llm";
import { answerWithGatewayAndPerplexity } from "./scripti-gateway";
import { tavilySearch, type WebSource } from "./web-search";

export type ScriptiResponse = {
  reply: string;
  agent: ScriptiAgentMeta;
  sources?: WebSource[];
  mode: "fallback" | "web";
};

export async function runScripti(userText: string): Promise<ScriptiResponse> {
  const agent = analyzeScriptiInput(userText);

  const hasGatewayAuth = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
  if (hasGatewayAuth) {
    const gw = await answerWithGatewayAndPerplexity({ userText });
    const reply =
      gw.answerMarkdown +
      "\n\n---\n\n**Not medical advice.** Scriptids cannot diagnose or prescribe. Always confirm safety, interactions, and dosing with a licensed clinician or pharmacist.";
    return { reply, agent, sources: gw.sources, mode: "web" };
  }

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (!hasOpenAI) {
    return {
      reply: buildSymptomAssistantReply(userText),
      agent,
      mode: "fallback",
    };
  }

  const hasParallel = Boolean(process.env.PARALLEL_API_KEY);
  const sources = hasParallel ? await tavilySearch(userText) : [];
  const llm = await answerWithOpenAI({ userText, sources });
  const reply =
    llm.answerMarkdown +
    "\n\n---\n\n**Not medical advice.** Scriptids cannot diagnose or prescribe. Always confirm safety, interactions, and dosing with a licensed clinician or pharmacist.";

  return {
    reply,
    agent,
    sources: llm.sources,
    mode: hasParallel ? "web" : "fallback",
  };
}

