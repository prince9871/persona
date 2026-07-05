"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  persona: "hitesh" | "piyush";
  createdAt: number;
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  const text = first.content.trim();
  return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

const STORAGE_KEY = "chai-conversations";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch {
  }
}

export function useChatStore() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const activeRef = useRef(activeId);
  const convsRef = useRef(convs);

  useEffect(() => { activeRef.current = activeId; }, [activeId]);
  useEffect(() => { convsRef.current = convs; }, [convs]);

  // Load persisted conversations after hydration (avoids SSR mismatch with localStorage)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadConversations();
    if (loaded.length > 0) {
      setActiveId(loaded[0].id);
      setConvs(loaded);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeConversation = convs.find((c) => c.id === activeId) ?? null;

  const newConversation = useCallback((persona: "hitesh" | "piyush" = "hitesh") => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      persona,
      createdAt: Date.now(),
    };
    setActiveId(id);
    setConvs((prev) => {
      const next = [conv, ...prev];
      saveConversations(next);
      return next;
    });
    return id;
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConvs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeRef.current === id) {
        setActiveId(next.length > 0 ? next[0].id : "");
      }
      saveConversations(next);
      return next;
    });
  }, []);

  const addMessage = useCallback((msg: Message, persona?: "hitesh" | "piyush") => {
    let id = activeRef.current;
    const currentConvs = convsRef.current;

    if (!id || !currentConvs.find((c) => c.id === id)) {
      id = generateId();
      const conv: Conversation = {
        id,
        title: "New Chat",
        messages: [msg],
        persona: persona ?? "hitesh",
        createdAt: Date.now(),
      };
      setActiveId(id);
      setConvs((prev) => {
        const next = [conv, ...prev];
        saveConversations(next);
        return next;
      });
      return;
    }

    setConvs((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const nextMsg = [...c.messages, msg];
        const title = c.messages.length === 0 && msg.role === "user"
          ? generateTitle([msg])
          : c.title;
        return { ...c, messages: nextMsg, title };
      });
      saveConversations(updated);
      return updated;
    });
  }, []);

  const setConversationPersona = useCallback((id: string, persona: "hitesh" | "piyush") => {
    setConvs((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, persona } : c,
      );
      saveConversations(updated);
      return updated;
    });
  }, []);

  const updateLastAssistantContent = useCallback((content: string) => {
    const id = activeRef.current;
    if (!id) return;

    setConvs((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const msgs = [...c.messages];
        const last = msgs[msgs.length - 1];
        if (!last || last.role !== "assistant") return c;
        msgs[msgs.length - 1] = { ...last, content };
        return { ...c, messages: msgs };
      });
      return updated;
    });
  }, []);

  return {
    conversations: convs,
    activeConversation,
    activeId,
    newConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateLastAssistantContent,
    setConversationPersona,
  } as const;
}
