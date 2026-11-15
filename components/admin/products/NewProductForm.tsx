"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewProductForm({ categories }: { categories: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true); setError("");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        categoryId: formData.get("categoryId"),
        name: formData.get("name"),
        slug: formData.get("slug"),
        summary: formData.get("summary"),
        position: Number(formData.get("position") || 0),
      }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return setError(result.message ?? "创建失败。");
    router.push(`/admin/products/${result.id}`);
    router.refresh();
  }

  return (
    <form action={submit} className="max-w-3xl space-y-5 rounded-xl border border-neutral-200 bg-white p-6">
      <label className="block text-sm font-medium">产品分类<select name="categoryId" required className="mt-2 w-full rounded-lg border px-3 py-2">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="block text-sm font-medium">产品名称<input name="name" required className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm font-medium">固定 URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-2 w-full rounded-lg border px-3 py-2" /><span className="mt-1 block text-xs font-normal text-neutral-500">创建后不可修改，避免破坏原有 URL。</span></label>
      <label className="block text-sm font-medium">摘要<textarea name="summary" required rows={4} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
      <label className="block text-sm font-medium">排序<input name="position" type="number" min="0" defaultValue="0" className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <button disabled={saving} className="rounded-lg bg-[#76B900] px-5 py-2.5 font-semibold text-[#0B0D10] disabled:opacity-50">{saving ? "创建中…" : "创建草稿"}</button>
    </form>
  );
}
