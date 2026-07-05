import { buildConversationHint } from "@/lib/conversation-hint";
import { SYSTEM_PROMPT, PIYUSH_PROMPT } from "@/lib/prompts";
import { createStreamResponse } from "@/lib/stream";

const PROMPTS: Record<string, string> = {
  hitesh: SYSTEM_PROMPT,
  piyush: PIYUSH_PROMPT,
};

export async function POST(req: Request) {
  const { messages, persona = "hitesh" } = await req.json();
  const basePrompt = PROMPTS[persona as string] ?? SYSTEM_PROMPT;
  const hint = buildConversationHint(messages ?? []);
  const systemPrompt = `${basePrompt}\n\n${hint}`;

  return createStreamResponse({
    messages,
    systemPrompt,
  });
}
