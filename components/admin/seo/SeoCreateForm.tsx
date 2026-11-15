"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Target = { label: string; pathname: string; productId: string | null };
type Media = { id: string; name: string };

export function SeoCreateForm({ targets, media }: { targets: Target[]; media: Media[] }) {
  const router = useRouter();
  const [targetIndex, setTargetIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const target = useMemo(() => targets[targetIndex], [targetIndex, targets]);
  const field = "h-11 rounded-lg border border-neutral-300 px-3";

  async function create(formData: FormData) {
    if (!target) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/seo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pathname: target.pathname,
        productId: target.productId,
        title: formData.get("title"),
        description: formData.get("description"),
        canonicalUrl: target.pathname,
        openGraphTitle: formData.get("openGraphTitle"),
        openGraphDescription: formData.get("openGraphDescription"),
        openGraphMediaId: formData.get("openGraphMediaId"),
        robotsIndex: formData.get("robotsIndex") === "on",
        targetKeyword: formData.get("targetKeyword"),
      }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return setMessage(result.message || result.code);
    router.push(`/admin/seo/${result.record.id}`);
  }

  if (!target) return <p className="rounded-xl border bg-white p-6 text-sm text-neutral-600">当前账号没有可创建的 SEO 范围。</p>;
  return (
    <form action={create} className="grid gap-5 rounded-xl border bg-white p-6">
      <label className="grid gap-2 text-sm font-medium">页面
        <select className={field} value={targetIndex} onChange={(event) => setTargetIndex(Number(event.target.value))}>
          {targets.map((item, index) => <option key={`${item.pathname}:${item.productId ?? "global"}`} value={index}>{item.label} — {item.pathname}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium">SEO 标题<input className={field} name="title" maxLength={70} required /></label>
      <label className="grid gap-2 text-sm font-medium">SEO 描述<textarea className="min-h-28 rounded-lg border p-3" name="description" maxLength={320} required /></label>
      <label className="grid gap-2 text-sm font-medium">Open Graph 标题<input className={field} name="openGraphTitle" maxLength={70} /></label>
      <label className="grid gap-2 text-sm font-medium">Open Graph 描述<textarea className="min-h-24 rounded-lg border p-3" name="openGraphDescription" maxLength={320} /></label>
      <label className="grid gap-2 text-sm font-medium">Open Graph 图片
        <select className={field} name="openGraphMediaId"><option value="">沿用页面原图</option>{media.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      </label>
      <label className="grid gap-2 text-sm font-medium">目标关键词<input className={field} name="targetKeyword" maxLength={160} /></label>
      <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="robotsIndex" defaultChecked />允许搜索引擎索引</label>
      <button disabled={saving} className="h-11 rounded-lg bg-[#0B0D10] font-semibold text-white">{saving ? "创建中…" : "创建草稿"}</button>
      <p role="status" className="text-sm text-red-700">{message}</p>
    </form>
  );
}
