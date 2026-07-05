type ChatMessage = { role: string; content: string };

const CASUAL_PATTERNS =
  /^(hi|hello|hey|hii|hola|yo|sup|namaste|namaskar|kaise ho|kaise h|kya haal|kya hal|kya chal|kya ho|kya kar|what'?s up|how are you|good morning|good evening|good afternoon)\b/i;

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content.trim();
  }
  return "";
}

function assistantPhrasesUsed(messages: ChatMessage[]): string[] {
  const found: string[] = [];
  const patterns = [
    { label: "chai mention", re: /chai/i },
    { label: "doubt/project pitch", re: /doubt|project.*(banana|start)|kya.*seekh/i },
    { label: "Hanji opener", re: /^hanji/i },
    { label: "Hey everyone opener", re: /^hey everyone/i },
    { label: "swagat hai", re: /swagat hai/i },
  ];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const { label, re } of patterns) {
      if (re.test(msg.content) && !found.includes(label)) found.push(label);
    }
  }
  return found;
}

export function buildConversationHint(messages: ChatMessage[]): string {
  const turn = Math.ceil(messages.length / 2);
  const lastUser = lastUserMessage(messages);
  const isFirstReply = messages.length <= 1;
  const isCasual = CASUAL_PATTERNS.test(lastUser);
  const usedPhrases = assistantPhrasesUsed(messages);

  const lines = [
    "## Live conversation rules (override generic habits for THIS reply)",
    `- Turn ${turn || 1}. ${isFirstReply ? "First exchange: greet warmly but briefly." : "Mid-conversation: do NOT welcome again, do NOT re-introduce yourself."}`,
    `- User just said: "${lastUser.slice(0, 200)}${lastUser.length > 200 ? "…" : ""}"`,
  ];

  if (isCasual) {
    lines.push(
      "- This is casual small talk, not a coding question. Reply like a real person texting back: 1-3 short sentences.",
      "- Answer what they asked (how you are, what's up). One small real-life detail is enough.",
      "- Do NOT pivot to 'koi doubt hai?', 'kya seekhna hai?', or 'project shuru karo' unless they bring up coding.",
    );
  } else if (lastUser) {
    lines.push(
      "- They asked something specific. Answer THAT first. Teaching tone is fine here.",
      "- Do not add a generic 'batao kya doubt hai' ending unless they seem stuck or confused.",
    );
  }

  if (usedPhrases.length > 0) {
    lines.push(
      `- Already used in this chat: ${usedPhrases.join(", ")}. Do NOT repeat these patterns in this reply.`,
    );
  }

  lines.push(
    "- Match their message length. Short question → short answer unless they want depth.",
    "- Vary sentence openings. Never start two replies in a row the same way.",
  );

  return lines.join("\n");
}
