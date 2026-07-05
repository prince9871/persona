"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/lib/chat-store";
import { Markdown } from "@/lib/markdown";

const AVATARS = {
  hitesh:
    "https://chaicode.com/assets/white-1-CYshgcRl.webp",
  piyush:
    "https://imgproxy-g.learnyst.com/https://imgproxy.learnyst.com/learnyst-user-assets/school-assets/schools/171024/teacher/NEW_6_lyst1734206483728.png?w=840&h=840&resizetype=fill&format=webp",
};

// ── Richer, punchier palette ────────────────────────────────────────────
const THEME = {
  hitesh: {
    accent: "#FFB84D",
    accent2: "#FF7A45",
    glow: "rgba(255,184,77,0.45)",
    gradient: "linear-gradient(135deg, #FFB84D 0%, #FF7A45 60%, #FF4D6D 100%)",
  },
  piyush: {
    accent: "#7CF5B0",
    accent2: "#39C4E8",
    glow: "rgba(124,245,176,0.4)",
    gradient: "linear-gradient(135deg, #7CF5B0 0%, #39C4E8 60%, #6E6BFF 100%)",
  },
};

function Avatar({
  persona,
  size = 36,
  breathing = false,
  ring = true,
}: {
  persona: "hitesh" | "piyush";
  size?: number;
  breathing?: boolean;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const t = THEME[persona];

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center ${breathing ? "avatar-breathe" : ""} avatar-glow`}
      style={{
        width: size,
        height: size,
        background: failed ? t.gradient : "#241713",
        boxShadow: ring
          ? `0 0 0 2.5px ${t.accent}, 0 0 18px ${t.glow}, 0 0 34px ${t.glow}`
          : "none",
        transition: "box-shadow .35s ease",
      }}
    >
      {failed ? (
        <span
          className="font-bold select-none"
          style={{ color: "#1B120E", fontSize: size * 0.42 }}
        >
          {persona === "hitesh" ? "H" : "P"}
        </span>
      ) : (
        <img
          src={AVATARS[persona]}
          alt={persona === "hitesh" ? "Hitesh" : "Piyush"}
          className="w-full h-full object-cover"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function Steam({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" style={style}>
      <path className="steam-wisp steam-1" d="M14 34c-3-4 3-6 0-10s3-6 0-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="steam-wisp steam-2" d="M22 34c-3-4 3-6 0-10s3-6 0-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="steam-wisp steam-3" d="M30 34c-3-4 3-6 0-10s3-6 0-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Sidebar({
  conversations,
  activeId,
  pendingIds,
  onNew,
  onSelect,
  onDelete,
  onClose,
}: {
  conversations: { id: string; title: string; createdAt: number; persona: "hitesh" | "piyush" }[];
  activeId: string | null;
  pendingIds: Set<string>;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1B120E 0%, #150e0b 100%)",
        borderRight: "1px solid rgba(255,184,77,0.12)",
      }}
    >
      <div className="sidebar-glow" />
      <div className="p-3 border-b relative z-10" style={{ borderColor: "rgba(255,184,77,0.12)" }}>
        <button
          onClick={() => { onNew(); onClose(); }}
          className="new-chat-btn w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #FFB84D 0%, #FF7A45 100%)",
            color: "#1B120E",
            boxShadow: "0 4px 16px rgba(255,122,69,0.35)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 relative z-10">
        {conversations.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: "#8C7A64" }}>No conversations yet</p>
        )}
        {conversations.map((conv, idx) => (
          <div key={conv.id} className="group relative sidebar-item-in" style={{ animationDelay: `${idx * 35}ms` }}>
            <button
              onClick={() => { onSelect(conv.id); onClose(); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              style={{
                background: conv.id === activeId
                  ? "linear-gradient(135deg, rgba(255,184,77,0.18), rgba(255,122,69,0.08))"
                  : "transparent",
                color: conv.id === activeId ? "#FFDCA8" : "#8C7A64",
                border: conv.id === activeId ? "1px solid rgba(255,184,77,0.3)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => { if (conv.id !== activeId) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (conv.id !== activeId) e.currentTarget.style.background = "transparent"; }}
            >
              <Avatar persona={conv.persona} size={22} ring={conv.id === activeId} />
              <span className="truncate flex-1 text-left">{conv.title}</span>
              {pendingIds.has(conv.id) && (
                <TypingDots color={THEME[conv.persona].accent} />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer hover:scale-125"
              style={{ color: "#8C7A64" }}
              title="Delete conversation"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M10 4v7a1 1 0 01-1 1H5a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PourLoader() {
  return (
    <svg viewBox="0 0 60 36" className="w-14 h-8" fill="none">
      {/* kettle body */}
      <path d="M2 12h13c2 0 3.5 1.6 3.5 3.5V20H2v-8Z" fill="#3A2A1E" stroke="#5C4630" strokeWidth="1" />
      <ellipse cx="8.5" cy="12" rx="6.5" ry="1.6" fill="#4A3728" />
      {/* spout */}
      <path d="M18.5 15.5H23c1.4 0 2.4 1 2.4 2.3s-1 2.3-2.4 2.3h-3.6" stroke="#5C4630" strokeWidth="1.6" strokeLinecap="round" />
      {/* handle */}
      <path d="M2 14c-1.8 0-3 1.2-3 2.8s1.2 2.8 3 2.8" stroke="#5C4630" strokeWidth="1.4" strokeLinecap="round" />
      {/* pouring stream */}
      <rect className="pour-stream" x="24.5" y="18" width="1.8" height="8" rx="0.9" fill="#FFB84D" />
      {/* steam */}
      <path className="steam-wisp steam-1" d="M26 14c-1.5-1.5.5-2.5 0-4" stroke="#B8A38C" strokeWidth="1.3" strokeLinecap="round" />
      <path className="steam-wisp steam-2" d="M29 15c-1.5-1.5.5-2.5 0-4" stroke="#B8A38C" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      {/* cup */}
      <path d="M20 26h18l-1.2 7.2c-.25 1.5-1.6 2.6-3.1 2.6h-9.4c-1.5 0-2.85-1.1-3.1-2.6L20 26Z" fill="#241713" stroke="#5C4630" strokeWidth="1" />
      {/* cup handle */}
      <path d="M38 28.5h2c1.3 0 2.3 1 2.3 2.3S41.3 33 40 33h-2" stroke="#5C4630" strokeWidth="1.4" strokeLinecap="round" />
      <clipPath id="cupClip2">
        <path d="M20.9 27h16.2l-1 6c-.2 1.2-1.2 2-2.5 2h-9.2c-1.3 0-2.3-.8-2.5-2l-1-6Z" />
      </clipPath>
      <rect className="cup-fill" x="20" y="24" width="18" height="12" clipPath="url(#cupClip2)" fill="#FFB84D" />
      <rect className="cup-fill" x="20" y="24" width="18" height="12" clipPath="url(#cupClip2)" fill="url(#cupShine)" opacity="0.5" />
      <defs>
        <linearGradient id="cupShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFDCA8" />
          <stop offset="100%" stopColor="#FF7A45" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TypingDots({ color }: { color: string }) {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: color, animationDelay: `${i * 0.15}s`, boxShadow: `0 0 6px ${color}` }}
        />
      ))}
    </span>
  );
}

function PersonaToggle({
  persona,
  onChange,
}: {
  persona: "hitesh" | "piyush";
  onChange: (p: "hitesh" | "piyush") => void;
}) {
  return (
    <div
      className="flex rounded-xl p-0.5 shrink-0 transition-all"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,184,77,0.15)" }}
    >
      <button
        onClick={() => onChange("hitesh")}
        className="persona-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        style={{
          background: persona === "hitesh" ? THEME.hitesh.gradient : "transparent",
          color: persona === "hitesh" ? "#1B120E" : "#8C7A64",
          boxShadow: persona === "hitesh" ? "0 2px 10px rgba(255,122,69,0.4)" : "none",
        }}
      >
        <Avatar persona="hitesh" size={16} ring={false} />
        Hitesh
      </button>
      <button
        onClick={() => onChange("piyush")}
        className="persona-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        style={{
          background: persona === "piyush" ? THEME.piyush.gradient : "transparent",
          color: persona === "piyush" ? "#0C1B14" : "#8C7A64",
          boxShadow: persona === "piyush" ? "0 2px 10px rgba(57,196,232,0.35)" : "none",
        }}
      >
        <Avatar persona="piyush" size={16} ring={false} />
        Piyush
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="3" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 11V2h9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function Home() {
  const store = useChatStore();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPuff, setShowPuff] = useState(false);
  const [focused, setFocused] = useState(false);
  const [personaKey, setPersonaKey] = useState(0);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [confirmTarget, setConfirmTarget] = useState<"hitesh" | "piyush" | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<"hitesh" | "piyush" | null>(null);

  const persona = store.activeConversation?.persona ?? "hitesh";
  const t = THEME[persona];
  const accent = t.accent;
  const activePending = store.isPending(store.activeId);
  const activeMessages = store.activeConversation?.messages ?? [];
  const lastActiveMessage = activeMessages[activeMessages.length - 1];
  const activeStreaming = activePending && lastActiveMessage?.role === "assistant";
  const activeWaiting = activePending && lastActiveMessage?.role === "user";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevPersonaRef = useRef(persona);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [store.activeConversation?.messages, activePending, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (prevPersonaRef.current !== persona) {
      setPersonaKey((k) => k + 1);
      prevPersonaRef.current = persona;
    }
  }, [persona]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const convId = store.ensureActiveConversation(persona);
      if (store.isPending(convId)) return;

      const snapshot = store.getConversationSnapshot(convId);
      const chatPersona = snapshot?.persona ?? persona;
      let prevMsgs = snapshot?.messages ?? [];

      if (editingIndex >= 0 && editingIndex < prevMsgs.length) {
        store.truncateConversation(convId, editingIndex);
        prevMsgs = prevMsgs.slice(0, editingIndex);
      }
      setEditingIndex(-1);

      const text = input.trim();
      setInput("");
      setShowPuff(true);
      setTimeout(() => setShowPuff(false), 500);

      const allMsgs = [...prevMsgs, { role: "user" as const, content: text }];
      store.addMessageTo(convId, { role: "user", content: text });
      store.startPending(convId);

      const signal = store.getAbortSignal(convId);
      let assistantStarted = false;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMsgs, persona: chatPersona }),
          signal,
        });

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? `Request failed (${res.status})`);
        }

        if (!res.body) throw new Error("Empty response from server");

        store.addMessageTo(convId, { role: "assistant", content: "", persona: chatPersona });
        assistantStarted = true;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          store.updateAssistantContent(convId, accumulated);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        const reason = err instanceof Error ? err.message : "unknown error";
        const errorText =
          chatPersona === "hitesh"
            ? `Kadak jhatka: ${reason}. Ek baar phir try karo.`
            : `Connection issue: ${reason}. Dobara try karo, main wait kar raha hoon.`;
        if (assistantStarted) {
          store.updateAssistantContent(convId, errorText);
        } else {
          store.addMessageTo(convId, { role: "assistant", content: errorText, persona: chatPersona });
        }
      } finally {
        if (!signal.aborted) {
          store.flushConversationSave();
          store.endPending(convId);
        }
      }
    },
    [input, store, persona, editingIndex],
  );

  const handleRegenerate = useCallback(async () => {
    const convId = store.activeId;
    if (!convId || store.isPending(convId)) return;

    const snapshot = store.getConversationSnapshot(convId);
    if (!snapshot) return;
    const msgs = snapshot.messages;
    const userMsgIdx = msgs.length - 2;
    if (userMsgIdx < 0 || msgs[userMsgIdx].role !== "user") return;

    const lastUserMsg = msgs[userMsgIdx].content;
    const persona = snapshot.persona;

    const allMsgs = msgs.slice(0, userMsgIdx + 1);
    store.addMessageTo(convId, { role: "assistant", content: "", persona });

    store.startPending(convId);
    const signal = store.getAbortSignal(convId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMsgs, persona }),
        signal,
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Request failed (${res.status})`);
      }

      if (!res.body) throw new Error("Empty response from server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        store.updateAssistantContent(convId, accumulated);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const reason = err instanceof Error ? err.message : "unknown error";
      store.updateAssistantContent(
        convId,
        persona === "hitesh"
          ? `Kadak jhatka: ${reason}. Dobara try karo.`
          : `Connection issue: ${reason}. Dobara try karo.`,
      );
    } finally {
      if (!signal.aborted) {
        store.flushConversationSave();
        store.endPending(convId);
      }
    }
  }, [store]);

  const hasMessages = activeMessages.length > 0;
  const showWelcome = !hasMessages && !activeWaiting;

  return (
    <>
      <div className="flex h-screen max-h-screen relative overflow-hidden" style={{ background: "#0a0706", color: "#F5E6D3" }}>
        {/* Ambient animated backdrop */}
        <div className="ambient-bg" style={{ background: `radial-gradient(circle at 20% 20%, ${t.glow}, transparent 45%), radial-gradient(circle at 85% 75%, ${THEME[persona].accent2}22, transparent 50%)` }} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`sidebar-slide fixed lg:static inset-y-0 left-0 z-20 w-64 lg:w-60 shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar
            conversations={store.conversations}
            activeId={store.activeId}
            pendingIds={store.pendingIds}
            onNew={() => store.newConversation(persona)}
            onSelect={(id) => store.selectConversation(id)}
            onDelete={(id) => store.deleteConversation(id)}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        <div className="flex flex-col flex-1 min-w-0 min-h-0 relative z-10">
          <header
            className="glass flex items-center gap-3 px-4 py-3 shrink-0 sticky top-0 z-20"
            style={{ borderBottom: "1px solid rgba(255,184,77,0.12)" }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: "#8C7A64" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="relative shrink-0">
              <Avatar persona={persona} size={40} breathing />
              {persona === "hitesh" && (
                <div
                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: THEME.hitesh.gradient, border: "2px solid #0a0706", boxShadow: "0 0 10px rgba(255,122,69,0.6)" }}
                >
                  <svg viewBox="0 0 20 20" width="11" height="11" fill="none">
                    <path d="M4 8h10l-.75 6c-.15 1.2-1.25 2-2.5 2h-3.5c-1.25 0-2.35-.8-2.5-2L4 8Z" fill="#1B120E" />
                    <path d="M14 9h1.5c1 0 1.75.75 1.75 1.75S16.5 12.5 15.5 12.5H14" stroke="#1B120E" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <Steam className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5" style={{ color: "#B8A38C" }} />
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 pulse-dot"
                style={{ background: "#4ADE80", borderColor: "#0a0706" }}
                title="Online"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1
                className="text-[16px] font-bold leading-none truncate bg-clip-text"
                style={{
                  backgroundImage: t.gradient,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {persona === "hitesh" ? "Hitesh Choudhary" : "Piyush Garg"}
              </h1>
              <p
                className="text-xs mt-1 truncate"
                style={{ color: activePending ? accent : "#9CA3AF" }}
              >
                {activePending
                  ? "Typing..."
                  : persona === "hitesh"
                  ? "Backend Mentor • Chai aur Code"
                  : "Full Stack Mentor"}
              </p>
            </div>
            <span
              className="px-2 py-1 rounded-full text-[10px] font-semibold shrink-0"
              style={{ background: "rgba(74,222,128,0.12)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.3)" }}
            >
              ● Online
            </span>
            <div className="flex-1" />
            <PersonaToggle
              persona={persona}
              onChange={(p) => {
                if (p === persona) return;
                const hasMsgs = (store.activeConversation?.messages.length ?? 0) > 0;
                if (hasMsgs) {
                  setConfirmTarget(p);
                } else if (store.activeId) {
                  store.setConversationPersona(store.activeId, p);
                } else {
                  store.newConversation(p);
                }
              }}
            />
            <button
              onClick={() => store.newConversation(persona)}
              className="p-2 rounded-lg transition-all cursor-pointer shrink-0 hover:scale-110 hover:bg-white/5"
              style={{ color: "#8C7A64" }}
              title="New chat"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ scrollBehavior: "smooth", overflowAnchor: "auto" }}>
            <div className={`mx-auto w-full max-w-3xl px-4 ${hasMessages ? "mt-auto py-4" : "flex flex-col justify-center min-h-full py-6"}`}>
              {showWelcome ? (
                <div key={personaKey} className="persona-enter flex flex-col items-center text-center gap-4">
                  <Avatar persona={persona} size={72} breathing />
                  <p style={{ color: "#B8A38C" }} className="text-sm max-w-xs leading-relaxed">
                    {persona === "hitesh"
                      ? "Cup garam hai, code taiyaar hai. Kuch bhi poocho — bug ho ya concept."
                      : "Build karo, seekho, ship karo. Kya poochna hai?"}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {(persona === "hitesh"
                      ? ["What is closure in JavaScript?", "Explain async/await", "How does React work?", "CSS flexbox vs grid"]
                      : ["Explain RAG architecture", "Docker vs VM — real trade-offs?", "How to design a scalable API?", "Next.js server actions vs API routes"]
                    ).map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                        className="suggestion-chip px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          color: "#D8C5AC",
                          border: "1px solid rgba(255,184,77,0.15)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 14px ${t.glow}`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,77,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={personaKey} className="persona-enter space-y-0.5">
                  {activeMessages.map((msg, i) => {
                    const isUser = msg.role === "user";
                    const isLast = i === activeMessages.length - 1;
                    const isLiveAssistant = !isUser && isLast && activeStreaming;
                    const prev = i > 0 ? activeMessages[i - 1] : null;
                    const sameSender = prev && prev.role === msg.role;
                    const msgPersonaTheme = THEME[msg.persona ?? persona];

                    return (
                      <div
                        key={i}
                        className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                        style={{ marginTop: sameSender ? 3 : 10 }}
                      >
                        {!isUser && (
                          <div className="shrink-0" style={{ visibility: sameSender ? "hidden" : "visible" }}>
                            <Avatar persona={msg.persona ?? persona} size={28} ring={false} />
                          </div>
                        )}
                        <div
                          className={`bubble-pop max-w-[88%] sm:max-w-[78%] ${isUser ? "" : "prose-sm"}`}
                          style={{
                            background: isUser
                              ? editingIndex === i
                                ? "linear-gradient(135deg, #6b4a26 0%, #5a3d1f 100%)"
                                : `linear-gradient(160deg, ${t.accent}33, rgba(36,26,20,0.92))`
                              : "linear-gradient(160deg, rgba(36,26,20,0.9), rgba(20,14,11,0.9))",
                            color: isUser ? "#F5E6D3" : "#F0E4D3",
                            border: isUser
                              ? editingIndex === i
                                ? "2px solid rgba(255,255,255,0.2)"
                                : `1px solid ${t.accent}55`
                              : `1px solid ${msgPersonaTheme.accent}22`,
                            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            backdropFilter: "blur(6px)",
                            boxShadow: isUser
                              ? `0 3px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`
                              : "0 2px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
                          }}
                        >
                          <div className="px-4 py-2.5 text-sm leading-relaxed">
                            {isUser ? msg.content : <Markdown content={msg.content} />}
                            {isLiveAssistant && (
                              <span className="type-cursor inline-block w-[6px] h-[13px] ml-0.5 align-middle rounded-sm" style={{ background: accent }} />
                            )}
                          </div>
                          {!isLiveAssistant && msg.content.trim().length > 0 && (isUser ? (
                            <div className="flex items-center gap-1 px-4 pb-1.5 opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingIndex(i);
                                  setInput(msg.content);
                                  setTimeout(() => textareaRef.current?.focus(), 0);
                                }}
                                className="flex items-center gap-1 px-1.5 py-1 rounded text-[11px] transition-colors hover:bg-white/10 cursor-pointer"
                                style={{ color: "rgba(245,230,211,0.6)" }}
                                title="Edit message"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Edit
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-4 pb-1.5 opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                className="p-1 rounded transition-colors hover:bg-white/5 cursor-pointer"
                                style={{ color: "#8C7A64" }}
                                title="Copy message"
                              >
                                <CopyIcon />
                              </button>
                              {isLast && (
                                <button
                                  onClick={handleRegenerate}
                                  className="flex items-center gap-1 px-1.5 py-1 rounded text-[11px] transition-colors hover:bg-white/5 cursor-pointer"
                                  style={{ color: "#8C7A64" }}
                                  title="Regenerate"
                                >
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M1.5 6a4.5 4.5 0 0 1 8.2-2.7M10.5 6a4.5 4.5 0 0 1-8.2 2.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                    <path d="M10.5 1.5V4H8M1.5 10.5V8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Regenerate
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {activeWaiting && (
                    <div className="flex items-end gap-2 justify-start bubble-pop">
                      <Avatar persona={persona} size={28} ring={false} />
                      <div
                        className="flex items-center gap-3 px-4 py-3 waiting-bubble"
                        style={{
                          background: `linear-gradient(160deg, ${accent}14, rgba(20,14,11,0.92))`,
                          border: `1px solid ${accent}33`,
                          borderRadius: "18px 18px 18px 4px",
                          backdropFilter: "blur(6px)",
                          boxShadow: `0 2px 14px rgba(0,0,0,0.35), 0 0 20px ${t.glow}`,
                        }}
                      >
                        {persona === "hitesh" ? <PourLoader /> : <TypingDots color={accent} />}
                        <span className="text-sm font-medium shimmer-text" style={{ color: "#D8C5AC" }}>
                          {persona === "hitesh" ? "Ghol raha hoon..." : "Process kar raha hoon..."}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="shrink-0" style={{ borderTop: "1px solid rgba(255,184,77,0.12)" }}>
            <div className="mx-auto max-w-3xl px-4 py-3">
              <div
                className={`glass flex items-end gap-2 rounded-2xl px-3 py-2 transition-all ${focused ? "shadow-sm" : ""}`}
                style={{
                  boxShadow: focused
                    ? `0 0 0 1.5px ${accent}, 0 0 24px ${t.glow}`
                    : "0 0 0 1px rgba(255,184,77,0.12)",
                }}
              >
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-transparent text-sm outline-none resize-none max-h-[200px]"
                  style={{ color: "#F5E6D3", fontFamily: "inherit" }}
                  rows={1}
                  placeholder="Apna sawaal likho... (Enter to send, Shift+Enter for newline)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={activePending}
                />
                <button
                  type="submit"
                  disabled={activePending || !input.trim()}
                  className="send-btn relative rounded-xl p-2.5 shrink-0 disabled:opacity-30 transition-all cursor-pointer"
                  style={{ background: t.gradient, color: "#1B120E", boxShadow: `0 3px 14px ${t.glow}` }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {showPuff && (
                    <span
                      className="absolute left-1/2 top-1/2 pointer-events-none rounded-full"
                      style={{ width: 8, height: 8, background: "#F5E6D3", animation: "puffOut .5s ease-out forwards" }}
                    />
                  )}
                </button>
              </div>
              <p className="text-[10px] mt-1.5 text-center" style={{ color: "#5C4E3E" }}>
                {persona === "hitesh" ? "Chai aur Code — Hitesh ka kadak gyaan" : "Piyush Garg — build karo, seekho, ship karo"}
              </p>
            </div>
          </form>
        </div>
      </div>

      {!store.activeConversation && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${selectedPersona ? "picker-overlay-out" : "picker-overlay-in"}`}
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div
            className={`flex flex-col items-center text-center gap-6 ${selectedPersona ? "picker-card-out" : "picker-card-in"}`}
            style={{ animationDelay: selectedPersona ? "0ms" : "50ms" }}
          >
            <h2
              className="text-xl font-bold bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #FFB84D, #7CF5B0)", WebkitBackgroundClip: "text", color: "transparent" }}
            >
              Choose your mentor
            </h2>
            <div className="flex gap-6">
              <button
                onClick={() => {
                  setSelectedPersona("hitesh");
                  setTimeout(() => store.newConversation("hitesh"), 250);
                }}
                className="picker-card flex flex-col items-center gap-3 p-6 rounded-2xl transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)", border: "2px solid rgba(255,184,77,0.2)", minWidth: 160 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFB84D"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,184,77,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,77,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <Avatar persona="hitesh" size={72} breathing />
                <span className="text-sm font-bold" style={{ color: "#F5E6D3" }}>Hitesh</span>
                <span className="text-[11px]" style={{ color: "#9CA3AF" }}>Backend Mentor</span>
              </button>
              <button
                onClick={() => {
                  setSelectedPersona("piyush");
                  setTimeout(() => store.newConversation("piyush"), 250);
                }}
                className="picker-card flex flex-col items-center gap-3 p-6 rounded-2xl transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)", border: "2px solid rgba(124,245,176,0.2)", minWidth: 160 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7CF5B0"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(124,245,176,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(124,245,176,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <Avatar persona="piyush" size={72} breathing />
                <span className="text-sm font-bold" style={{ color: "#F5E6D3" }}>Piyush</span>
                <span className="text-[11px]" style={{ color: "#9CA3AF" }}>Full Stack Mentor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="rounded-2xl p-6 w-[320px] shadow-2xl picker-card-in"
            style={{ background: "#241713", border: "1px solid rgba(255,184,77,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#F5E6D3" }}>
              Switch Persona?
            </h3>
            <p className="text-xs leading-relaxed mb-5" style={{ color: "#9CA3AF" }}>
              <span className="font-medium capitalize" style={{ color: THEME[confirmTarget].accent }}>{confirmTarget}</span> will continue this conversation. Existing messages stay, but responses will come from{" "}
              <span className="font-medium capitalize" style={{ color: THEME[confirmTarget].accent }}>{confirmTarget}</span>'s perspective.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", color: "#8C7A64" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (store.activeId) store.setConversationPersona(store.activeId, confirmTarget);
                  setConfirmTarget(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: THEME[confirmTarget].gradient, color: "#1B120E" }}
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ambient-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          animation: ambientShift 12s ease-in-out infinite alternate;
        }
        @keyframes ambientShift {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        .sidebar-glow {
          position: absolute;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 60%;
          background: radial-gradient(circle, rgba(255,184,77,0.08), transparent 70%);
          animation: ambientShift 8s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .avatar-breathe {
          animation: breathe 3.2s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .avatar-glow { transition: transform .25s ease; }
        .avatar-glow:hover { transform: scale(1.06); }
        .sidebar-item-in {
          animation: slideFadeIn .35s ease both;
        }
        @keyframes slideFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .bubble-pop {
          animation: bubblePop .32s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes bubblePop {
          from { opacity: 0; transform: translateY(8px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .persona-enter { animation: personaFade .4s ease both; }
        @keyframes personaFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-dot { animation: dotBounce 1s ease-in-out infinite; }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .type-cursor { animation: blink 0.9s step-start infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
          50% { box-shadow: 0 0 0 4px rgba(74,222,128,0); }
        }
        .steam-wisp { animation: steamRise 2.4s ease-in-out infinite; opacity: .7; }
        .steam-1 { animation-delay: 0s; }
        .steam-2 { animation-delay: .3s; }
        .steam-3 { animation-delay: .6s; }
        @keyframes steamRise {
          0% { transform: translateY(0) scaleY(1); opacity: .7; }
          50% { transform: translateY(-4px) scaleY(1.1); opacity: 1; }
          100% { transform: translateY(0) scaleY(1); opacity: .7; }
        }
        .pour-stream { animation: pourFlow .5s linear infinite; }
        @keyframes pourFlow {
          0% { opacity: .4; } 50% { opacity: 1; } 100% { opacity: .4; }
        }
        .cup-fill { animation: cupFill 1.4s ease-in-out infinite alternate; }
        @keyframes cupFill { from { opacity: .5; } to { opacity: .9; } }
        .suggestion-chip { animation: chipIn .4s ease both; }
        @keyframes chipIn {
          from { opacity: 0; transform: translateY(6px) scale(.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .suggestion-chip:hover { transform: translateY(-2px) scale(1.03); }
        .persona-btn:active { transform: scale(.95); }
        .new-chat-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,122,69,0.45); }
        .send-btn:hover:not(:disabled) { transform: scale(1.08) rotate(4deg); }
        .send-btn:active:not(:disabled) { transform: scale(.94); }
        @keyframes puffOut {
          0% { opacity: .8; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(6); }
        }
        .sidebar-slide { transition: transform .3s cubic-bezier(.4,0,.2,1); }
        .glass {
          background: rgba(20,14,11,0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .picker-overlay-in { animation: fadeIn .3s ease both; }
        .picker-overlay-out { animation: fadeOut .25s ease both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        .picker-card-in { animation: cardIn .45s cubic-bezier(.34,1.56,.64,1) both; }
        .picker-card-out { animation: cardOut .25s ease both; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px) scale(.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(.9); }
        }
        .waiting-bubble { animation: waitingGlow 2.2s ease-in-out infinite; }
        @keyframes waitingGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #B8A38C 0%, #FFEFD6 50%, #B8A38C 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmerMove 1.6s linear infinite;
          font-weight: 600;
        }
        @keyframes shimmerMove {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}