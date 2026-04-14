import { withApiLinks } from "@/lib/api-meta";
import { analyzeScriptiInput, buildSymptomAssistantReply } from "@/lib/symptom-agent";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

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

  const messages = (body as { messages?: ChatMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      withApiLinks({ error: "messages[] required" }),
      { status: 400 },
    );
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return Response.json(
      withApiLinks({ error: "No user message with content" }),
      { status: 400 },
    );
  }

  const reply = buildSymptomAssistantReply(lastUser.content);
  const agent = analyzeScriptiInput(lastUser.content);
  return Response.json(withApiLinks({ reply, agent }));
}
