"use client";

import { ArrowLeft, Circle, MoreHorizontal } from "lucide-react";

import type { AdminConversation, AdminMessage } from "@/components/admin/chat/ChatWorkspace";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { formatAdminEnum } from "@/lib/admin/localization";

export function AgentConversation({ conversation, messages, deliveryDegraded, onBack, onSend }: {
  conversation: AdminConversation | null;
  messages: AdminMessage[];
  deliveryDegraded: boolean;
  onBack: () => void;
  onSend: (body: string) => Promise<void>;
}) {
  if (!conversation) {
    return <main data-testid="conversation-pane" className="hidden min-w-0 flex-1 place-items-center bg-admin-canvas lg:grid"><div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-xl border border-admin-border bg-white text-admin-muted"><MoreHorizontal className="size-5" /></div><p className="mt-4 text-sm font-semibold text-admin-ink">选择一个会话</p><p className="mt-1 text-xs text-admin-muted">访客消息和回复将在这里显示</p></div></main>;
  }
  const name = conversation.contactName || conversation.contactEmail || `访客 ${conversation.id.slice(-6)}`;
  const blocked = conversation.status === "CLOSED" || conversation.status === "SPAM";
  return (
    <main data-testid="conversation-pane" className="flex min-w-0 flex-1 flex-col bg-admin-canvas">
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-admin-border bg-white px-4">
        <div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="返回会话列表" onClick={onBack} className="grid size-9 place-items-center rounded-admin-sm border border-admin-border lg:hidden"><ArrowLeft className="size-4" /></button><div className="min-w-0"><p className="truncate text-sm font-semibold text-admin-ink">{name}</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-admin-muted"><Circle className="size-2 fill-ignition text-ignition" />{conversation.status === "OPEN" ? "在线咨询" : formatAdminEnum(conversation.status)}</p></div></div>
        {deliveryDegraded ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">已保存 · 实时传送暂不可用</span> : null}
      </header>
      <div role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.map((message) => <article key={message.id} className={`max-w-[78%] rounded-admin px-4 py-3 text-sm leading-6 shadow-sm ${message.senderType === "AGENT" ? "ml-auto bg-graphite-950 text-white" : "border border-admin-border bg-white text-admin-ink"}`}><p className="whitespace-pre-wrap break-words">{message.body}</p>{message.pending ? <p className="mt-1 text-[10px] text-zinc-400">正在保存…</p> : null}</article>)}
        {messages.length === 0 ? <p className="text-center text-sm text-admin-muted">该会话尚无消息</p> : null}
      </div>
      {blocked ? <div className="border-t border-admin-border bg-white p-4 text-center text-sm text-admin-muted">该会话已{conversation.status === "SPAM" ? "标记为垃圾" : "关闭"}，重新打开后才能回复。</div> : <ChatComposer language="zh-CN" onSend={onSend} />}
    </main>
  );
}
