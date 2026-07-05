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
  const accent = persona === "hitesh" ? "#E8A33D" : "#7C9473";

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center ${breathing ? "avatar-breathe" : ""}`}
      style={{
        width: size,
        height: size,
        background: failed ? accent : "#3A2A1E",
        boxShadow: ring
          ? persona === "hitesh"
            ? "0 0 0 2px #E8A33D, 0 0 12px rgba(232,163,61,0.35)"
            : "0 0 0 2px #7C9473, 0 0 12px rgba(124,148,115,0.35)"
          : "none",
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
    <div className="flex flex-col h-full" style={{ background: "#1B120E", borderRight: "1px solid #3A2A1E" }}>
      <div className="p-3 border-b" style={{ borderColor: "#3A2A1E" }}>
        <button
          onClick={() => { onNew(); onClose(); }}
          className="new-chat-btn w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          style={{ background: "#3A2A1E", color: "#F5E6D3" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: "#8C7A64" }}>No conversations yet</p>
        )}
        {conversations.map((conv, idx) => (
          <div key={conv.id} className="group relative sidebar-item-in" style={{ animationDelay: `${idx * 35}ms` }}>
            <button
              onClick={() => { onSelect(conv.id); onClose(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer"
              style={{
                background: conv.id === activeId ? "#3A2A1E" : "transparent",
                color: conv.id === activeId ? "#F5E6D3" : "#8C7A64",
              }}
              onMouseEnter={(e) => { if (conv.id !== activeId) e.currentTarget.style.background = "#2A1B14"; }}
              onMouseLeave={(e) => { if (conv.id !== activeId) e.currentTarget.style.background = "transparent"; }}
            >
              <Avatar persona={conv.persona} size={20} ring={conv.id === activeId} />
              <span className="truncate flex-1 text-left">{conv.title}</span>
              {pendingIds.has(conv.id) && (
                <TypingDots color={conv.persona === "hitesh" ? "#E8A33D" : "#7C9473"} />
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer hover:scale-110"
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
    <svg viewBox="0 0 64 32" className="w-16 h-8" fill="none">
      <path d="M4 10h9c1.5 0 2.5 1.2 2.5 2.6V16H4v-6Z" fill="#B8A38C" opacity="0.9" />
      <path d="M15.5 12.5H20c1.2 0 2 .9 2 2s-.8 2-2 2h-3.2" stroke="#B8A38C" strokeWidth="1.6" strokeLinecap="round" />
      <rect className="pour-stream" x="20.5" y="14" width="1.6" height="6" rx="0.8" fill="#E8A33D" />
      <path className="steam-wisp steam-1" d="M22 12c-1.5-1.5.5-2.5 0-4" stroke="#B8A38C" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 20h14l-1 6c-.2 1.4-1.4 2.4-2.8 2.4h-6.4c-1.4 0-2.6-1-2.8-2.4l-1-6Z" fill="#3A2A1E" stroke="#4A3728" strokeWidth="1" />
      <clipPath id="cupClip">
        <path d="M25 20.8h12l-.85 5.5c-.15 1-.9 1.7-1.9 1.7h-6.5c-1 0-1.75-.7-1.9-1.7l-.85-5.5Z" />
      </clipPath>
      <rect className="cup-fill" x="24" y="20" width="14" height="8" clipPath="url(#cupClip)" fill="#E8A33D" />
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
          style={{ background: color, animationDelay: `${i * 0.15}s` }}
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
      className="flex rounded-lg p-0.5 shrink-0 transition-all"
      style={{ background: "#2A1B14", border: "1px solid #3A2A1E" }}
    >
      <button
        onClick={() => onChange("hitesh")}
        className="persona-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
        style={{
          background: persona === "hitesh" ? "#E8A33D" : "transparent",
          color: persona === "hitesh" ? "#1B120E" : "#8C7A64",
        }}
      >
        <Avatar persona="hitesh" size={16} ring={false} />
        Hitesh
      </button>
      <button
        onClick={() => onChange("piyush")}
        className="persona-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
        style={{
          background: persona === "piyush" ? "#E8A33D" : "transparent",
          color: persona === "piyush" ? "#1B120E" : "#8C7A64",
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
  const accent = persona === "hitesh" ? "#E8A33D" : "#7C9473";
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

  // Track persona changes for animation
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

      // If editing a previous message, truncate conversation at that point
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

    // Remove last assistant message, resend last user message
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
    <><div className="flex h-screen" style={{ background: "#0f0a08", color: "#F5E6D3" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="glass flex items-center gap-3 px-4 py-3 shrink-0 z-10"
          style={{ borderBottom: "1px solid rgba(58,42,30,0.5)" }}>
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
              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#E8A33D", border: "2px solid #0f0a08" }}>
                <svg viewBox="0 0 20 20" width="11" height="11" fill="none">
                  <path d="M4 8h10l-.75 6c-.15 1.2-1.25 2-2.5 2h-3.5c-1.25 0-2.35-.8-2.5-2L4 8Z" fill="#1B120E" />
                  <path d="M14 9h1.5c1 0 1.75.75 1.75 1.75S16.5 12.5 15.5 12.5H14" stroke="#1B120E" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <Steam className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5" style={{ color: "#B8A38C" }} />
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: "#4ADE80", borderColor: "#0f0a08" }}
              title="Online"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1
              className="text-[16px] font-semibold leading-none truncate"
              style={{ color: "#F5E6D3" }}
            >
              {persona === "hitesh"
                ? "Hitesh Choudhary"
                : "Piyush Garg"}
            </h1>
            <p
              className="text-xs mt-1 truncate"
              style={{
                color: activePending ? accent : "#9CA3AF",
              }}
            >
              {activePending
                ? "Typing..."
                : persona === "hitesh"
                ? "Backend Mentor • Chai aur Code"
                : "Full Stack Mentor"}
            </p>
          </div>
          <span
            className="px-2 py-1 rounded-full text-[10px] font-medium shrink-0"
            style={{
              background: "#1F2937",
              color: "#4ADE80",
            }}
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
            className="p-2 rounded-lg transition-all cursor-pointer shrink-0 hover:scale-110 hover:bg-[#3A2A1E]"
            style={{ color: "#8C7A64" }}
            title="New chat"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Messages area — bottom-aligned */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollBehavior: "smooth", overflowAnchor: "auto" }}>
          <div className={`mx-auto w-full max-w-3xl px-4 ${hasMessages ? "mt-auto py-4" : "flex flex-col justify-center min-h-full py-6"}`}>

            {showWelcome ? (
              <div key={personaKey} className="persona-enter flex flex-col items-center text-center gap-4">
                <Avatar persona={persona} size={72} breathing />
                <p style={{ color: "#8C7A64" }} className="text-sm max-w-xs leading-relaxed">
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
                      className="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer hover:-translate-y-0.5"
                      style={{
                        background: "#2A1B14",
                        color: "#B8A38C",
                        border: "1px solid #3A2A1E",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3A2A1E")}
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
                  const isFirstInGroup = !sameSender;

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
                              ? "linear-gradient(135deg, #d4942e 0%, #b87d1f 100%)"
                              : "linear-gradient(135deg, #E8A33D 0%, #d4942e 100%)"
                            : "rgba(26, 18, 14, 0.85)",
                          color: isUser ? "#1B120E" : "#F0E4D3",
                          border: isUser
                            ? editingIndex === i
                              ? "2px solid rgba(255,255,255,0.3)"
                              : "none"
                            : "1px solid rgba(58, 42, 30, 0.6)",
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          backdropFilter: isUser ? "none" : "blur(4px)",
                          boxShadow: isUser
                            ? "0 2px 8px rgba(232,163,61,0.3)"
                            : "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
                        }}
                      >
                        <div className="px-4 py-2.5 text-sm leading-relaxed">
                          {isUser ? msg.content : <Markdown content={msg.content} />}
                          {isLiveAssistant && (
                            <span className="type-cursor inline-block w-[6px] h-[13px] ml-0.5 align-middle rounded-sm"
                              style={{ background: accent }} />
                          )}
                        </div>
                        {/* Message actions */}
                        {!isLiveAssistant && msg.content.trim().length > 0 && (isUser ? (
                          <div className="flex items-center gap-1 px-4 pb-1.5 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingIndex(i);
                                setInput(msg.content);
                                setTimeout(() => textareaRef.current?.focus(), 0);
                              }}
                              className="flex items-center gap-1 px-1.5 py-1 rounded text-[11px] transition-colors hover:bg-[rgba(0,0,0,0.15)] cursor-pointer"
                              style={{ color: "rgba(27,18,14,0.6)" }}
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
                              className="p-1 rounded transition-colors hover:bg-[#3A2A1E] cursor-pointer"
                              style={{ color: "#8C7A64" }}
                              title="Copy message"
                            >
                              <CopyIcon />
                            </button>
                            {isLast && (
                              <button
                                onClick={handleRegenerate}
                                className="flex items-center gap-1 px-1.5 py-1 rounded text-[11px] transition-colors hover:bg-[#3A2A1E] cursor-pointer"
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
                      className="flex items-center gap-3 px-4 py-2.5"
                      style={{
                        background: "rgba(26, 18, 14, 0.85)",
                        border: "1px solid rgba(58, 42, 30, 0.6)",
                        borderRadius: "18px 18px 18px 4px",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {persona === "hitesh" ? <PourLoader /> : <TypingDots color={accent} />}
                      <span className="text-sm" style={{ color: "#8C7A64" }}>
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

        {/* Input bar — glassmorphism */}
        <form onSubmit={handleSubmit} className="shrink-0"
          style={{ borderTop: "1px solid rgba(58,42,30,0.5)" }}>
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div
              className={`glass flex items-end gap-2 rounded-xl px-3 py-2 transition-all ${focused ? "shadow-sm" : ""}`}
              style={{
                boxShadow: focused
                  ? persona === "hitesh"
                    ? "0 0 0 1px #E8A33D, 0 0 20px rgba(232,163,61,0.06)"
                    : "0 0 0 1px #7C9473, 0 0 20px rgba(124,148,115,0.06)"
                  : "0 0 0 1px rgba(74,55,40,0.5)",
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
                className="send-btn relative rounded-lg p-2 shrink-0 disabled:opacity-30 transition-all cursor-pointer"
                style={{
                  background: accent,
                  color: "#1B120E",
                  boxShadow: `0 2px 8px ${accent}44`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {showPuff && (
                  <span
                    className="absolute left-1/2 top-1/2 pointer-events-none rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      background: "#F5E6D3",
                      animation: "puffOut .5s ease-out forwards",
                    }}
                  />
                )}
              </button>
            </div>
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#5C4E3E" }}>
              {persona === "hitesh"
                ? "Chai aur Code — Hitesh ka kadak gyaan"
                : "Piyush Garg — build karo, seekho, ship karo"}
            </p>
          </div>
        </form>
      </div>
    </div>

    {!store.activeConversation && (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${selectedPersona ? "picker-overlay-out" : "picker-overlay-in"}`}
        style={{ background: "rgba(0,0,0,0.7)" }}
      >
        <div className={`flex flex-col items-center text-center gap-6 ${selectedPersona ? "picker-card-out" : "picker-card-in"}`}
          style={{ animationDelay: selectedPersona ? "0ms" : "50ms" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "#F5E6D3" }}>
            Choose your mentor
          </h2>
          <div className="flex gap-6">
            <button
              onClick={() => {
                setSelectedPersona("hitesh");
                setTimeout(() => store.newConversation("hitesh"), 250);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "#2A1B14",
                border: "2px solid #3A2A1E",
                minWidth: 160,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8A33D"; e.currentTarget.style.background = "#332218"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3A2A1E"; e.currentTarget.style.background = "#2A1B14"; }}
            >
              <Avatar persona="hitesh" size={72} breathing />
              <span className="text-sm font-semibold" style={{ color: "#F5E6D3" }}>Hitesh</span>
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>Backend Mentor</span>
            </button>
            <button
              onClick={() => {
                setSelectedPersona("piyush");
                setTimeout(() => store.newConversation("piyush"), 250);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "#2A1B14",
                border: "2px solid #3A2A1E",
                minWidth: 160,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7C9473"; e.currentTarget.style.background = "#1F2A1A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3A2A1E"; e.currentTarget.style.background = "#2A1B14"; }}
            >
              <Avatar persona="piyush" size={72} breathing />
              <span className="text-sm font-semibold" style={{ color: "#F5E6D3" }}>Piyush</span>
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>Full Stack Mentor</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {confirmTarget && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={() => setConfirmTarget(null)}
      >
        <div
          className="rounded-xl p-6 w-[320px] shadow-2xl"
          style={{ background: "#2A1B14", border: "1px solid #3A2A1E" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: "#F5E6D3" }}>
            Switch Persona?
          </h3>
          <p className="text-xs leading-relaxed mb-5" style={{ color: "#9CA3AF" }}>
            <span className="font-medium capitalize" style={{ color: accent }}>{confirmTarget}</span> will continue this conversation. Existing messages stay, but responses will come from{" "}
            <span className="font-medium capitalize" style={{ color: confirmTarget === "hitesh" ? "#E8A33D" : "#7C9473" }}>{confirmTarget}</span>'s perspective.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmTarget(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{ background: "#3A2A1E", color: "#8C7A64" }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (store.activeId) store.setConversationPersona(store.activeId, confirmTarget);
                setConfirmTarget(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: confirmTarget === "hitesh" ? "#E8A33D" : "#7C9473",
                color: "#1B120E",
              }}
            >
              Switch
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
