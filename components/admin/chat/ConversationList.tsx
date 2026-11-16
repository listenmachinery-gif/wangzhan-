"use client";

import { MessageSquareText, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminConversation } from "@/components/admin/chat/ChatWorkspace";

export function ConversationList({ conversations, selectedId, onSelect, loading }: {
  conversations: AdminConversation[];
  selectedId: string | null;
  onSelect: (conversation: AdminConversation) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((item) => [item.contactName, item.contactEmail, item.contactWhatsapp]
      .some((value) => value?.toLowerCase().includes(needle)));
  }, [conversations, query]);

  return (
    <aside data-testid="conversation-rail" className="flex min-h-0 w-full shrink-0 flex-col border-r border-admin-border bg-white lg:w-[280px]">
      <div className="border-b border-admin-border p-4">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-semibold text-admin-ink">会话队列</p><p className="mt-0.5 text-xs text-admin-muted">{conversations.length} 个会话</p></div>
          <span className="rounded-full bg-ignition/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#558900]">Live</span>
        </div>
        <label className="relative mt-3 block">
          <span className="sr-only">搜索会话</span>
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索联系人" className="h-10 w-full rounded-admin-sm border border-admin-border bg-admin-canvas pl-9 pr-3 text-sm outline-none focus:border-ignition focus:ring-2 focus:ring-ignition/15" />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? <p className="px-3 py-8 text-center text-sm text-admin-muted">正在加载会话…</p> : null}
        {!loading && filtered.length === 0 ? <p className="px-3 py-8 text-center text-sm text-admin-muted">暂无待处理会话</p> : null}
        {filtered.map((conversation) => {
          const name = conversation.contactName || conversation.contactEmail || `访客 ${conversation.id.slice(-6)}`;
          const active = selectedId === conversation.id;
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation)}
              className={`mb-1 w-full rounded-admin-sm border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-ignition ${active ? "border-ignition/40 bg-ignition/10" : "border-transparent hover:bg-admin-canvas"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${active ? "bg-ignition text-graphite-950" : "bg-graphite-950 text-white"}`}><MessageSquareText aria-hidden className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-admin-ink">{name}</span>{conversation.agentUnreadCount > 0 ? <span aria-label={`${conversation.agentUnreadCount} unread messages`} className="grid min-w-5 place-items-center rounded-full bg-ignition px-1.5 text-[10px] font-bold leading-5 text-graphite-950">{conversation.agentUnreadCount}</span> : null}</span>
                  <span className="mt-1 block truncate text-xs text-admin-muted">最近：{conversation.messages[0]?.body || "新会话"}</span>
                  <span className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-zinc-400"><span>{conversation.visitor.countryCode || "—"} · {conversation.visitor.deviceType || "unknown"}</span><span>{conversation.status}</span></span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
