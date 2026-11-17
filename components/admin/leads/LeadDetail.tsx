"use client";

import { useState } from "react";
import { formatAdminEnum, formatCountryName } from "@/lib/admin/localization";

type LeadDetailValue = {
  id: string;
  version: number;
  status: string;
  nextFollowUpAt: string | Date | null;
  name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  country: string | null;
  message: string;
  assignments: Array<{ id: string; endedAt: string | Date | null; assignee: { id: string; name: string; email: string } }>;
  activities: Array<{ id: string; type: string; content: string; createdAt: string | Date; actor: { name: string } | null }>;
};

export function LeadDetail({ lead: initialLead, assignableSales }: { lead: LeadDetailValue; assignableSales: Array<{ id: string; name: string; email: string }> }) {
  const [lead, setLead] = useState(initialLead);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function mutate(body: object) {
    setSaving(true); setMessage("");
    const response = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(result.message || result.code || "保存失败"); return false; }
    setLead((current) => ({ ...current, ...result })); setMessage("已保存"); return true;
  }

  async function addNote(formData: FormData) {
    setSaving(true); setMessage("");
    const response = await fetch(`/api/admin/leads/${lead.id}/activities`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "NOTE", content: formData.get("content") }) });
    setSaving(false);
    if (!response.ok) { const result = await response.json(); setMessage(result.message || result.code || "添加失败"); return; }
    window.location.reload();
  }

  const activeAssignment = lead.assignments.find(({ endedAt }) => !endedAt);
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6"><h2 className="text-xl font-semibold">客户需求</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-neutral-500">姓名 / 公司</dt><dd className="mt-1 font-medium">{lead.name || "—"} · {lead.company || "—"}</dd></div><div><dt className="text-xs text-neutral-500">国家/地区</dt><dd className="mt-1 font-medium">{formatCountryName(lead.country, "—")}</dd></div><div><dt className="text-xs text-neutral-500">电子邮箱</dt><dd className="mt-1 font-medium"><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div><div><dt className="text-xs text-neutral-500">电话 / WhatsApp</dt><dd className="mt-1 font-medium">{lead.whatsapp || lead.phone || "—"}</dd></div></dl><pre className="mt-5 whitespace-pre-wrap rounded-lg bg-neutral-50 p-4 font-sans text-sm leading-6">{lead.message}</pre></section>
      <section className="rounded-xl border border-neutral-200 bg-white p-6"><h2 className="text-xl font-semibold">跟进记录</h2><form action={addNote} className="mt-4 flex gap-3"><input name="content" required maxLength={5000} placeholder="添加不可修改的跟进备注" className="h-11 flex-1 rounded-lg border border-neutral-300 px-3"/><button disabled={saving} className="rounded-lg bg-[#76B900] px-4 font-semibold">添加</button></form><div className="mt-5 space-y-3">{lead.activities.map((activity) => <article key={activity.id} className="rounded-lg border border-neutral-200 p-4"><div className="flex justify-between text-xs text-neutral-500"><span>{formatAdminEnum(activity.type)} · {activity.actor?.name || "系统"}</span><time>{new Date(activity.createdAt).toLocaleString("zh-CN")}</time></div><p className="mt-2 text-sm">{activity.content}</p></article>)}</div></section>
    </div>
    <aside className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 xl:self-start"><h2 className="text-lg font-semibold">销售流程</h2><label className="grid gap-2 text-sm font-medium">状态<select value={lead.status} onChange={(event) => void mutate({ version: lead.version, status: event.target.value })} disabled={saving} className="h-11 rounded-lg border border-neutral-300 px-3">{["NEW", "CONTACTED", "IN_DISCUSSION", "QUOTED", "WON", "LOST", "SPAM"].map((status) => <option key={status} value={status}>{formatAdminEnum(status)}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">下次跟进<input type="datetime-local" defaultValue={lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString().slice(0,16) : ""} onBlur={(event) => void mutate({ version: lead.version, nextFollowUpAt: event.target.value ? new Date(event.target.value).toISOString() : null })} className="h-11 rounded-lg border border-neutral-300 px-3"/></label>{assignableSales.length ? <label className="grid gap-2 text-sm font-medium">负责人<select value={activeAssignment?.assignee.id || ""} onChange={(event) => void mutate({ action: "assign", version: lead.version, assigneeId: event.target.value })} disabled={saving} className="h-11 rounded-lg border border-neutral-300 px-3"><option value="" disabled>选择销售人员</option>{assignableSales.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select></label> : <p className="text-sm text-neutral-600">负责人：{activeAssignment?.assignee.name || "待分配"}</p>}<p aria-live="polite" className="min-h-5 text-sm text-[#5F9500]">{message}</p></aside>
  </div>;
}
