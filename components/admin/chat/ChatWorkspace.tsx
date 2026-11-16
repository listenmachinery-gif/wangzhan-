"use client";

import type { Principal } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/permissions";
import { useEffect, useState } from "react";

import { AgentConversation } from "@/components/admin/chat/AgentConversation";
import { ConversationList } from "@/components/admin/chat/ConversationList";
import { VisitorContextPanel } from "@/components/admin/chat/VisitorContextPanel";

export type AdminMessage = {
  id: string;
  clientMessageId: string;
  senderType: "VISITOR" | "AGENT" | "SYSTEM";
  type: "TEXT" | "SYSTEM";
  body: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  pending?: boolean;
};

export type SupportAgent = { id: string; name: string; email: string };

export type AdminConversation = {
  id: string;
  status: "OPEN" | "PENDING" | "CLOSED" | "SPAM";
  contactName: string | null;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  agentUnreadCount: number;
  lastMessageAt: string | null;
  visitor: { id: string; countryCode: string | null; deviceType: string | null; lastSeenAt: string };
  lead: { id: string; name: string | null; email: string; company: string | null; status: string } | null;
  assignments: Array<{ id: string; assigneeId: string; assignee: SupportAgent }>;
  messages: Array<{ id: string; body: string; sentAt: string }>;
};

export function ChatWorkspace({ principal, agents }: { principal: Principal; agents: SupportAgent[] }) {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selected, setSelected] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDegraded, setDeliveryDegraded] = useState(false);
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);
  const selectedId = selected?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/chat/conversations")
      .then(async (response) => response.ok ? response.json() as Promise<{ items: AdminConversation[] }> : Promise.reject())
      .then((result) => { if (!cancelled) setConversations(result.items); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let socket: WebSocket | null = null;
    let cancelled = false;
    void fetch("/api/admin/chat/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId }),
    }).then(async (response) => {
      if (!response.ok || cancelled || typeof WebSocket === "undefined") {
        setDeliveryDegraded(true);
        return;
      }
      const { token } = await response.json() as { token: string };
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${protocol}//${window.location.host}/api/realtime`);
      socket.addEventListener("open", () => socket?.send(JSON.stringify({ v: 1, type: "auth", token })));
      socket.addEventListener("message", (message) => {
        let event: { type?: string; payload?: AdminMessage };
        try { event = JSON.parse(String(message.data)) as typeof event; } catch { return; }
        if (event.type === "ready") {
          socket?.send(JSON.stringify({ v: 1, type: "subscribe", conversationId: selectedId }));
          setDeliveryDegraded(false);
        } else if (event.type === "message.created" && event.payload?.id) {
          setMessages((current) => current.some((item) => item.id === event.payload?.id || item.clientMessageId === event.payload?.clientMessageId)
            ? current.map((item) => item.clientMessageId === event.payload?.clientMessageId ? event.payload as AdminMessage : item)
            : [...current, event.payload as AdminMessage]);
        } else if (event.type === "error") {
          setDeliveryDegraded(true);
        }
      });
      socket.addEventListener("close", () => { if (!cancelled) setDeliveryDegraded(true); });
      socket.addEventListener("error", () => setDeliveryDegraded(true));
    }).catch(() => setDeliveryDegraded(true));
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, [selectedId]);

  async function selectConversation(conversation: AdminConversation) {
    setSelected(conversation);
    setMobileConversationOpen(true);
    setMessages([]);
    const response = await fetch(`/api/admin/chat/conversations/${encodeURIComponent(conversation.id)}/messages`);
    if (!response.ok) return;
    const result = await response.json() as { items: AdminMessage[] };
    setMessages(result.items);
  }

  async function send(body: string) {
    if (!selected) return;
    const clientMessageId = globalThis.crypto?.randomUUID?.() ?? `agent_${Date.now()}`;
    const optimistic: AdminMessage = {
      id: `optimistic:${clientMessageId}`,
      clientMessageId,
      senderType: "AGENT",
      type: "TEXT",
      body,
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      pending: true,
    };
    setMessages((current) => [...current, optimistic]);
    const response = await fetch(`/api/admin/chat/conversations/${encodeURIComponent(selected.id)}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientMessageId, body }),
    });
    if (!response.ok) {
      setDeliveryDegraded(true);
      return;
    }
    const result = await response.json() as { message: AdminMessage; realtime: { degraded: boolean } };
    setMessages((current) => current.map((message) => (
      message.clientMessageId === clientMessageId ? result.message : message
    )));
    setDeliveryDegraded(result.realtime.degraded);
    setConversations((current) => current.map((conversation) => conversation.id === selected.id
      ? { ...conversation, messages: [{ id: result.message.id, body: result.message.body, sentAt: result.message.sentAt }], lastMessageAt: result.message.sentAt }
      : conversation));
  }

  async function assign(agentId: string) {
    if (!selected) return;
    const response = await fetch(`/api/admin/chat/conversations/${encodeURIComponent(selected.id)}/assignment`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assigneeId: agentId, currentAssignmentId: selected.assignments[0]?.id ?? null }),
    });
    if (!response.ok) return;
    const assignment = await response.json() as { id: string; assigneeId: string };
    const agent = agents.find(({ id }) => id === agentId);
    if (!agent) return;
    const updated = { ...selected, assignments: [{ ...assignment, assignee: agent }] };
    setSelected(updated);
    setConversations((current) => current.map((item) => item.id === updated.id ? updated : item));
  }

  async function updateStatus(status: AdminConversation["status"]) {
    if (!selected) return;
    const response = await fetch(`/api/admin/chat/conversations/${encodeURIComponent(selected.id)}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return;
    const updated = { ...selected, status };
    setSelected(updated);
    setConversations((current) => current.map((item) => item.id === updated.id ? updated : item));
  }

  return (
    <div data-testid="chat-workspace" data-mobile-flow="list-to-conversation" className="flex h-[calc(100dvh-12.5rem)] min-h-[560px] overflow-hidden rounded-admin border border-admin-border bg-white shadow-admin">
      <div className={`${mobileConversationOpen ? "hidden" : "flex"} w-full lg:flex lg:w-auto`}>
        <ConversationList conversations={conversations} selectedId={selected?.id ?? null} onSelect={selectConversation} loading={loading} />
      </div>
      <div className={`${mobileConversationOpen ? "flex" : "hidden"} min-w-0 flex-1 lg:flex`}>
        <AgentConversation conversation={selected} messages={messages} deliveryDegraded={deliveryDegraded} onBack={() => setMobileConversationOpen(false)} onSend={send} />
        <VisitorContextPanel conversation={selected} agents={agents} canAssign={can(principal, "chat.assign")} canManage={can(principal, "chat.manage")} onAssign={assign} onStatus={updateStatus} />
      </div>
    </div>
  );
}
