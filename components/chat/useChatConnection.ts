"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ChatConnectionState = "idle" | "connecting" | "online" | "degraded" | "offline";

export type PublicChatMessage = {
  id: string;
  clientMessageId: string;
  senderType: "VISITOR" | "AGENT" | "SYSTEM";
  type: "TEXT" | "SYSTEM";
  body: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  pending?: boolean;
  queued?: boolean;
};

type ContactDetails = { name?: string; email?: string; whatsapp?: string };
type OutboxItem = { conversationId: string; clientMessageId: string; body: string };

const CONVERSATION_KEY = "zyron_chat_conversation_id";
const OUTBOX_KEY = "zyron_chat_outbox";

function clientId() {
  return globalThis.crypto?.randomUUID?.() ?? `chat_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function readOutbox(): OutboxItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is OutboxItem => (
      typeof item === "object" && item !== null
      && typeof (item as OutboxItem).conversationId === "string"
      && typeof (item as OutboxItem).clientMessageId === "string"
      && typeof (item as OutboxItem).body === "string"
    )) : [];
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

export function storedChatConversationId() {
  return typeof window === "undefined" ? null : localStorage.getItem(CONVERSATION_KEY);
}

export function useChatConnection() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [state, setState] = useState<ChatConnectionState>("idle");
  const [agentTyping, setAgentTyping] = useState(false);
  const conversationRef = useRef<string | null>(null);
  const messagesRef = useRef<PublicChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempt = useRef(0);
  const mounted = useRef(true);

  const updateMessages = useCallback((updater: (current: PublicChatMessage[]) => PublicChatMessage[]) => {
    setMessages((current) => {
      const next = updater(current);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const mergeMessage = useCallback((incoming: PublicChatMessage) => {
    updateMessages((current) => {
      const match = current.findIndex((item) => (
        item.id === incoming.id || item.clientMessageId === incoming.clientMessageId
      ));
      if (match < 0) return [...current, incoming];
      const next = [...current];
      next[match] = { ...incoming, pending: false, queued: false };
      return next;
    });
  }, [updateMessages]);

  const latestCursor = useCallback(() => {
    return [...messagesRef.current].reverse().find((message) => !message.pending && !message.id.startsWith("optimistic:"))?.id;
  }, []);

  const connectRealtime = useCallback(async (id: string) => {
    socketRef.current?.close();
    try {
      const tokenResponse = await fetch("/api/chat/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });
      if (!tokenResponse.ok || typeof WebSocket === "undefined") {
        if (mounted.current) setState(navigator.onLine ? "degraded" : "offline");
        return;
      }
      const { token } = await tokenResponse.json() as { token: string };
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(`${protocol}//${window.location.host}/api/realtime`);
      socketRef.current = socket;
      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ v: 1, type: "auth", token }));
      });
      socket.addEventListener("message", (message) => {
        let event: {
          type?: string;
          conversationId?: string;
          payload?: PublicChatMessage | { actor?: string; typing?: boolean };
        };
        try {
          event = JSON.parse(String(message.data)) as typeof event;
        } catch {
          return;
        }
        if (event.type === "ready") {
          socket.send(JSON.stringify({
            v: 1,
            type: "subscribe",
            conversationId: id,
            ...(latestCursor() ? { cursor: latestCursor() } : {}),
          }));
          reconnectAttempt.current = 0;
          setState("online");
        } else if (event.type === "message.created" && event.payload && "body" in event.payload) {
          mergeMessage(event.payload);
        } else if (event.type === "typing.changed" && event.payload && "typing" in event.payload) {
          setAgentTyping(event.payload.actor === "AGENT" && event.payload.typing === true);
        } else if (event.type === "resync.required") {
          void syncMessages(id, latestCursor(), mergeMessage);
        } else if (event.type === "error") {
          setState("degraded");
        }
      });
      socket.addEventListener("close", () => {
        if (!mounted.current || conversationRef.current !== id) return;
        setState(navigator.onLine ? "degraded" : "offline");
        const delay = Math.min(1_000 * 2 ** reconnectAttempt.current, 20_000);
        reconnectAttempt.current += 1;
        reconnectTimer.current = setTimeout(() => { void connectRealtime(id); }, delay);
      });
      socket.addEventListener("error", () => setState("degraded"));
    } catch {
      if (mounted.current) setState(navigator.onLine ? "degraded" : "offline");
    }
  }, [latestCursor, mergeMessage]);

  const load = useCallback(async (id: string) => {
    setState("connecting");
    const response = await fetch(`/api/chat/conversations/${encodeURIComponent(id)}/messages`);
    if (!response.ok) return false;
    const history = await response.json() as { items: PublicChatMessage[]; nextCursor: string | null };
    messagesRef.current = history.items;
    setMessages(history.items);
    conversationRef.current = id;
    setConversationId(id);
    localStorage.setItem(CONVERSATION_KEY, id);
    for (const queued of readOutbox().filter((item) => item.conversationId === id)) {
      mergeMessage({
        id: `optimistic:${queued.clientMessageId}`,
        clientMessageId: queued.clientMessageId,
        senderType: "VISITOR",
        type: "TEXT",
        body: queued.body,
        sentAt: new Date().toISOString(),
        deliveredAt: null,
        readAt: null,
        pending: true,
        queued: true,
      });
    }
    await connectRealtime(id);
    return true;
  }, [connectRealtime, mergeMessage]);

  const start = useCallback(async (contact: ContactDetails = {}) => {
    setState("connecting");
    const response = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ landingPath: `${window.location.pathname}${window.location.search}`, ...contact }),
    });
    if (!response.ok) {
      setState("degraded");
      return false;
    }
    const conversation = await response.json() as { id: string };
    return load(conversation.id);
  }, [load]);

  const resume = useCallback(async (id: string) => {
    const resumed = await load(id);
    if (!resumed) {
      localStorage.removeItem(CONVERSATION_KEY);
      conversationRef.current = null;
      setConversationId(null);
      setMessages([]);
      setState("idle");
    }
    return resumed;
  }, [load]);

  const postMessage = useCallback(async (item: OutboxItem) => {
    const response = await fetch(`/api/chat/conversations/${encodeURIComponent(item.conversationId)}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientMessageId: item.clientMessageId, body: item.body }),
    });
    if (!response.ok) throw new Error("Message could not be sent.");
    const result = await response.json() as { message: PublicChatMessage; realtime: { degraded: boolean } };
    mergeMessage(result.message);
    if (result.realtime.degraded) setState("degraded");
  }, [mergeMessage]);

  const flushOutbox = useCallback(async () => {
    if (!navigator.onLine) return;
    const items = readOutbox();
    const remaining: OutboxItem[] = [];
    for (const item of items) {
      try {
        await postMessage(item);
      } catch {
        remaining.push(item);
      }
    }
    writeOutbox(remaining);
    updateMessages((current) => current.map((message) => (
      remaining.some((item) => item.clientMessageId === message.clientMessageId)
        ? message
        : { ...message, queued: false, pending: false }
    )));
  }, [postMessage, updateMessages]);

  const send = useCallback(async (body: string) => {
    const id = conversationRef.current;
    if (!id) return;
    const item = { conversationId: id, clientMessageId: clientId(), body };
    mergeMessage({
      id: `optimistic:${item.clientMessageId}`,
      clientMessageId: item.clientMessageId,
      senderType: "VISITOR",
      type: "TEXT",
      body,
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      pending: true,
      queued: !navigator.onLine,
    });
    if (!navigator.onLine) {
      writeOutbox([...readOutbox(), item]);
      setState("offline");
      return;
    }
    try {
      await postMessage(item);
    } catch {
      writeOutbox([...readOutbox().filter((queued) => queued.clientMessageId !== item.clientMessageId), item]);
      updateMessages((current) => current.map((message) => (
        message.clientMessageId === item.clientMessageId ? { ...message, queued: true } : message
      )));
      setState("offline");
    }
  }, [mergeMessage, postMessage, updateMessages]);

  useEffect(() => {
    mounted.current = true;
    const online = () => {
      setState((current) => current === "online" ? current : "degraded");
      void flushOutbox();
      if (conversationRef.current) void connectRealtime(conversationRef.current);
    };
    const offline = () => setState("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      mounted.current = false;
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [connectRealtime, flushOutbox]);

  return { conversationId, messages, state, agentTyping, start, resume, send };
}

async function syncMessages(
  conversationId: string,
  cursor: string | undefined,
  merge: (message: PublicChatMessage) => void,
) {
  const response = await fetch(
    `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
  );
  if (!response.ok) return;
  const result = await response.json() as { items: PublicChatMessage[] };
  for (const message of result.items) merge(message);
}
