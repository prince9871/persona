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
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const activeRef = useRef(activeId);
  const convsRef = useRef(convs);
  const saveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => { activeRef.current = activeId; }, [activeId]);
  useEffect(() => { convsRef.current = convs; }, [convs]);

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

  const isPending = useCallback(
    (convId: string) => (convId ? pendingIds.has(convId) : false),
    [pendingIds],
  );

  const startPending = useCallback((convId: string) => {
    setPendingIds((prev) => new Set(prev).add(convId));
  }, []);

  const endPending = useCallback((convId: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(convId);
      return next;
    });
  }, []);

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
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    const timer = saveTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      saveTimersRef.current.delete(id);
    }
    setConvs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeRef.current === id) {
        setActiveId(next.length > 0 ? next[0].id : "");
      }
      saveConversations(next);
      return next;
    });
  }, []);

  const addMessageTo = useCallback((convId: string, msg: Message) => {
    setConvs((prev) => {
      const exists = prev.some((c) => c.id === convId);
      if (!exists) return prev;

      const updated = prev.map((c) => {
        if (c.id !== convId) return c;
        const nextMsg = [...c.messages, msg];
        const title =
          c.messages.length === 0 && msg.role === "user"
            ? generateTitle([msg])
            : c.title;
        return { ...c, messages: nextMsg, title };
      });
      convsRef.current = updated;
      saveConversations(updated);
      return updated;
    });
  }, []);

  const ensureActiveConversation = useCallback(
    (persona: "hitesh" | "piyush" = "hitesh") => {
      const currentId = activeRef.current;
      const currentConvs = convsRef.current;
      if (currentId && currentConvs.some((c) => c.id === currentId)) {
        return currentId;
      }
      return newConversation(persona);
    },
    [newConversation],
  );

  const setConversationPersona = useCallback((id: string, persona: "hitesh" | "piyush") => {
    setConvs((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, persona } : c,
      );
      saveConversations(updated);
      return updated;
    });
  }, []);

  const updateAssistantContent = useCallback((convId: string, content: string) => {
    setConvs((prev) => {
      if (!prev.some((c) => c.id === convId)) return prev;

      const updated = prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        const last = msgs[msgs.length - 1];
        if (!last || last.role !== "assistant") return c;
        msgs[msgs.length - 1] = { ...last, content };
        return { ...c, messages: msgs };
      });
      convsRef.current = updated;

      const existing = saveTimersRef.current.get(convId);
      if (existing) clearTimeout(existing);
      saveTimersRef.current.set(
        convId,
        setTimeout(() => saveConversations(updated), 400),
      );

      return updated;
    });
  }, []);

  const flushConversationSave = useCallback(() => {
    for (const timer of saveTimersRef.current.values()) {
      clearTimeout(timer);
    }
    saveTimersRef.current.clear();
    saveConversations(convsRef.current);
  }, []);

  return {
    conversations: convs,
    activeConversation,
    activeId,
    pendingIds,
    isPending,
    startPending,
    endPending,
    newConversation,
    selectConversation,
    deleteConversation,
    addMessageTo,
    ensureActiveConversation,
    updateAssistantContent,
    flushConversationSave,
    setConversationPersona,
  } as const;
}
