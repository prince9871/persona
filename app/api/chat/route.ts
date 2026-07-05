import { buildConversationHint } from "@/lib/conversation-hint";
import { prepareMessagesForContext, type ChatMessage } from "@/lib/context-window";
import { retrievePersonaKnowledge } from "@/lib/persona-knowledge";
import { SYSTEM_PROMPT, PIYUSH_PROMPT } from "@/lib/prompts";
import { createStreamResponse } from "@/lib/stream";

const PROMPTS: Record<string, string> = {
  hitesh: SYSTEM_PROMPT,
  piyush: PIYUSH_PROMPT,
};

function lastUserContent(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) {
    throw new Error("messages must be an array");
  }

  const parsed: ChatMessage[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim()
    ) {
      parsed.push({ role: item.role, content: item.content.trim() });
    }
  }

  if (!parsed.length) {
    throw new Error("at least one valid message is required");
  }

  return parsed;
}

function parsePersona(raw: unknown): "hitesh" | "piyush" {
  return raw === "piyush" ? "piyush" : "hitesh";
}

export async function POST(req: Request) {
  if (!process.env.NVIDIA_API_KEY?.trim()) {
    return Response.json(
      { error: "Server is missing NVIDIA_API_KEY. Add it to environment variables." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { messages: rawMessages, persona: rawPersona } = body as {
    messages?: unknown;
    persona?: unknown;
  };

  let messages: ChatMessage[];
  try {
    messages = parseMessages(rawMessages);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid messages";
    return Response.json({ error: message }, { status: 400 });
  }

  const persona = parsePersona(rawPersona);
  const basePrompt = PROMPTS[persona];
  const lastUser = lastUserContent(messages);
  const knowledge = retrievePersonaKnowledge(persona, lastUser);
  const hint = buildConversationHint(messages);

  const systemParts = [basePrompt, knowledge, hint].filter(Boolean);
  const systemPrompt = systemParts.join("\n\n");

  try {
    const preparedMessages = await prepareMessagesForContext(messages);

    return await createStreamResponse({
      messages: preparedMessages,
      systemPrompt,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate response";
    console.error("[chat] LLM error:", message);
    return Response.json({ error: message }, { status: 502 });
  }
}
