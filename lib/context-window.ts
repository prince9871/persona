import type { ChatCompletionMessageParam } from "openai/resources";
import { openai } from "./openai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const CHARS_PER_TOKEN = 4;
const MAX_MESSAGE_TOKENS = 8000;
const RECENT_MESSAGE_COUNT = 16;
const SUMMARIZE_AFTER_COUNT = 50;

// Simple content hash for caching summaries — avoids re-summarizing the same
// older messages on every reply in a long thread.
const summaryCache = new Map<string, { summary: string; ts: number }>();
const SUMMARY_CACHE_TTL = 120_000; // 2 minutes

function contentHash(messages: ChatMessage[]): string {
  let h = 0;
  for (const m of messages) {
    for (let i = 0; i < m.content.length; i++) {
      h = ((h << 5) - h + m.content.charCodeAt(i)) | 0;
    }
    h = ((h << 5) - h + m.role.charCodeAt(0)) | 0;
  }
  return h.toString(36);
}

function estimateTokens(messages: ChatMessage[]): number {
  const chars = messages.reduce((n, m) => n + m.content.length + 16, 0);
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

function formatForSummary(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");
}

async function summarizeOlderMessages(messages: ChatMessage[]): Promise<string> {
  const hash = contentHash(messages);
  const cached = summaryCache.get(hash);
  if (cached && Date.now() - cached.ts < SUMMARY_CACHE_TTL) {
    return cached.summary;
  }

  const text = formatForSummary(messages);
  const truncated = text.length > 12000 ? text.slice(-12000) : text;

  const completion = await openai.chat.completions.create({
    model: "stepfun-ai/step-3.7-flash",
    temperature: 0.3,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "Summarize this chat in 3-6 bullet points. Keep topics covered, decisions made, and what was already explained. No greetings. Be concise.",
      },
      { role: "user", content: truncated },
    ],
  });

  const summary =
    completion.choices[0]?.message?.content?.trim() ??
    "Earlier topics were discussed in this thread.";

  summaryCache.set(hash, { summary, ts: Date.now() });

  // Evict stale entries periodically
  if (summaryCache.size > 50) {
    const now = Date.now();
    for (const [key, val] of summaryCache) {
      if (now - val.ts > SUMMARY_CACHE_TTL) summaryCache.delete(key);
    }
  }

  return summary;
}

export async function prepareMessagesForContext(
  messages: ChatMessage[],
): Promise<ChatCompletionMessageParam[]> {
  if (!messages.length) return [];

  const valid = messages.filter(
    (m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  ) as ChatMessage[];

  if (!valid.length) return [];

  let working = [...valid];

  if (working.length > SUMMARIZE_AFTER_COUNT) {
    const older = working.slice(0, -RECENT_MESSAGE_COUNT);
    const recent = working.slice(-RECENT_MESSAGE_COUNT);
    const summary = await summarizeOlderMessages(older);
    working = [
      {
        role: "assistant",
        content: `[Earlier conversation summary — do not repeat these points unless the user asks again]\n${summary}`,
      },
      ...recent,
    ];
  } else if (working.length > RECENT_MESSAGE_COUNT) {
    working = working.slice(-RECENT_MESSAGE_COUNT);
  }

  while (working.length > 2 && estimateTokens(working) > MAX_MESSAGE_TOKENS) {
    working.shift();
  }

  return working.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}
