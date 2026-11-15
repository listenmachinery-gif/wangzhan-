"use client";
import { useState } from "react";

type Setting = { key: string; value: unknown; version: number };
const definitions = [
  ["company.name", "公司名称"], ["contact.email", "联系邮箱"], ["contact.whatsapp", "WhatsApp"],
  ["contact.address", "公司地址"], ["seo.titleSuffix", "SEO 标题后缀"],
] as const;
export function SettingsForm({ initialSettings }: { initialSettings: Setting[] }) {
  const initial = Object.fromEntries(initialSettings.map((item) => [item.key, item]));
  const [settings, setSettings] = useState<Record<string, Setting>>(initial);
  const [message, setMessage] = useState("");
  async function save(formData: FormData) {
    setMessage("");
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ settings: definitions.map(([key]) => ({ key, value: formData.get(key), version: settings[key]?.version ?? 0 })) }) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.message || result.code);
    setSettings(Object.fromEntries(result.map((item: Setting) => [item.key, item])));
    setMessage("设置已保存");
  }
  return <form action={save} className="grid gap-5 rounded-xl border bg-white p-6">{definitions.map(([key, label]) => <label key={key} className="grid gap-2 text-sm font-medium">{label}<input name={key} required maxLength={500} defaultValue={String(settings[key]?.value ?? "")} className="h-11 rounded-lg border px-3" /></label>)}<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>双因素认证（2FA）：尚未配置</strong><p className="mt-1">当前版本不提供 2FA 开关，不会展示虚假的启用状态。</p></div><button className="h-11 rounded-lg bg-[#0B0D10] font-semibold text-white">保存设置</button><p role="status" className="text-sm text-[#5F9500]">{message}</p></form>;
}
