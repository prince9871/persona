import type { ChatCompletionMessageParam } from "openai/resources";
import { openai } from "./openai";

interface StreamOptions {
  messages: Array<ChatCompletionMessageParam>;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export async function createStreamResponse({
  messages,
  systemPrompt,
  model = "stepfun-ai/step-3.7-flash",
  temperature = 0.75,
  maxTokens = 1536,
  frequencyPenalty = 0.4,
  presencePenalty = 0.3,
}: StreamOptions) {
  const stream = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    stream: true,
    messages: [
      ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
      ...messages,
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "stream error";
        controller.enqueue(encoder.encode(`\n\n> ⚠️ **Stream interrupted:** ${message}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
