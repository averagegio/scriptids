import { withApiLinks } from "@/lib/api-meta";
import { runScripti } from "@/lib/scripti-runtime";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(withApiLinks({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const messages = (body as { messages?: ChatMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(withApiLinks({ error: "messages[] required" }), {
      status: 400,
    });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return Response.json(withApiLinks({ error: "No user message with content" }), {
      status: 400,
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(sse(event, data)));

      try {
        send("meta", { status: "started" });
        const out = await runScripti(lastUser.content);

        // Stream the reply in chunks so the UI can "type".
        const text = out.reply || "";
        const chunkSize = 24;
        for (let i = 0; i < text.length; i += chunkSize) {
          send("delta", { text: text.slice(i, i + chunkSize) });
          // tiny delay to feel natural without blocking too long
          await new Promise((r) => setTimeout(r, 10));
        }

        send("done", {
          agent: out.agent,
          sources: out.sources ?? [],
          mode: out.mode,
        });
      } catch (e) {
        send("error", {
          error: e instanceof Error ? e.message : "Request failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

