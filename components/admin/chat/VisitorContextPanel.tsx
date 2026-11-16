"use client";

import Link from "next/link";
import { Building2, Globe2, Mail, MessageCircle, Monitor } from "lucide-react";

import type { AdminConversation, SupportAgent } from "@/components/admin/chat/ChatWorkspace";

export function VisitorContextPanel({ conversation, agents, canAssign, canManage, onAssign, onStatus, onCreateLead }: {
  conversation: AdminConversation | null;
  agents: SupportAgent[];
  canAssign: boolean;
  canManage: boolean;
  onAssign: (agentId: string) => Promise<void>;
  onStatus: (status: AdminConversation["status"]) => Promise<void>;
  onCreateLead: () => Promise<void>;
}) {
  return (
    <aside data-testid="visitor-context" className="hidden min-h-0 shrink-0 overflow-y-auto border-l border-admin-border bg-white xl:block xl:w-[340px]">
      {!conversation ? <p className="p-6 text-sm text-admin-muted">选择会话后查看访客与 CRM 上下文。</p> : <div className="divide-y divide-admin-border">
        <section className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-admin-muted">访客资料</p><h2 className="mt-3 text-lg font-semibold text-admin-ink">{conversation.contactName || "匿名访客"}</h2><dl className="mt-4 space-y-3 text-sm"><ContextRow icon={Mail} label={conversation.contactEmail || "未提供邮箱"} /><ContextRow icon={MessageCircle} label={conversation.contactWhatsapp || "未提供 WhatsApp"} /><ContextRow icon={Globe2} label={conversation.visitor.countryCode || "未知地区"} /><ContextRow icon={Monitor} label={conversation.visitor.deviceType || "未知设备"} /></dl></section>
        <section className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-admin-muted">负责人</p>{conversation.assignments[0] ? <p className="mt-3 text-sm font-semibold text-admin-ink">{conversation.assignments[0].assignee.name}</p> : <p className="mt-3 text-sm text-amber-700">尚未分配</p>}{canAssign ? <label className="mt-4 block text-xs font-semibold text-admin-muted">分配 / 转接<select aria-label="分配客服" value={conversation.assignments[0]?.assignee.id ?? ""} onChange={(event) => { if (event.target.value) void onAssign(event.target.value); }} className="mt-2 h-10 w-full rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink"><option value="">选择客服</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label> : null}</section>
        <section className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-admin-muted">CRM 关联</p>{conversation.lead ? <Link href={`/admin/leads/${conversation.lead.id}`} className="mt-3 flex items-center gap-2 rounded-admin-sm border border-admin-border p-3 text-sm font-semibold text-admin-ink hover:border-ignition"><Building2 className="size-4 text-ignition" />{conversation.lead.company || conversation.lead.name || conversation.lead.email}</Link> : <><p className="mt-3 text-sm text-admin-muted">尚未关联询盘客户</p>{canManage ? <button type="button" disabled={!conversation.contactEmail} onClick={() => { void onCreateLead(); }} className="mt-3 w-full rounded-admin-sm bg-graphite-950 px-3 py-2.5 text-xs font-semibold text-white hover:bg-graphite-700 disabled:cursor-not-allowed disabled:opacity-40">创建或关联询盘客户</button> : null}{!conversation.contactEmail ? <p className="mt-2 text-[11px] text-amber-700">访客提供有效邮箱后才能创建客户。</p> : null}</>}</section>
        {canManage ? <section className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-admin-muted">会话状态</p><div className="mt-3 grid grid-cols-2 gap-2"><StatusButton label="打开" onClick={() => onStatus("OPEN")} /><StatusButton label="待处理" onClick={() => onStatus("PENDING")} /><StatusButton label="关闭" onClick={() => onStatus("CLOSED")} /><StatusButton label="垃圾" danger onClick={() => onStatus("SPAM")} /></div></section> : null}
      </div>}
    </aside>
  );
}

function ContextRow({ icon: Icon, label }: { icon: typeof Mail; label: string }) { return <div className="flex items-center gap-2.5"><Icon aria-hidden className="size-4 shrink-0 text-zinc-400" /><span className="break-all text-admin-ink">{label}</span></div>; }
function StatusButton({ label, danger, onClick }: { label: string; danger?: boolean; onClick: () => Promise<void> }) { return <button type="button" onClick={() => { void onClick(); }} className={`rounded-admin-sm border px-3 py-2 text-xs font-semibold ${danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-admin-border text-admin-ink hover:border-ignition"}`}>{label}</button>; }
