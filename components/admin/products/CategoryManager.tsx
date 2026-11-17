"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAdminEnum } from "@/lib/admin/localization";

type Category = { id: string; name: string; slug: string; summary: string | null; status: string; version: number; position: number; _count: { products: number } };

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState("");

  async function create(formData: FormData) {
    setMessage("");
    const response = await fetch("/api/admin/categories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), slug: formData.get("slug"), summary: formData.get("summary") || null, position: 0 }) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.message ?? "创建失败。");
    setCategories([...categories, { ...result, _count: { products: 0 } }]); setMessage("分类已创建为草稿。"); router.refresh();
  }

  async function update(category: Category, input: object) {
    setMessage("");
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: category.version, ...input }) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.message ?? "保存失败。");
    setCategories(categories.map((item) => item.id === category.id ? { ...item, ...result } : item)); setMessage("分类已保存。"); router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-neutral-50"><tr><th className="px-4 py-3">分类</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">产品数</th><th className="px-4 py-3">操作</th></tr></thead><tbody className="divide-y">{categories.map((category) => <tr key={category.id}><td className="px-4 py-4"><p className="font-medium">{category.name}</p><p className="mt-1 text-xs text-neutral-500">/products/series/{category.slug}</p></td><td className="px-4 py-4">{formatAdminEnum(category.status)}</td><td className="px-4 py-4">{category._count.products}</td><td className="px-4 py-4"><button onClick={() => void update(category, { status: category.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })} className="font-medium text-[#5F9500] hover:underline">{category.status === "PUBLISHED" ? "转为草稿" : "发布"}</button></td></tr>)}</tbody></table></div>
      <form action={create} className="h-fit space-y-4 rounded-xl border border-neutral-200 bg-white p-5"><h2 className="font-semibold">新建分类</h2><label className="block text-sm font-medium">名称<input name="name" required className="mt-2 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm font-medium">固定 slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-2 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm font-medium">摘要<textarea name="summary" rows={3} className="mt-2 w-full rounded-lg border px-3 py-2" /></label><button className="rounded-lg bg-[#76B900] px-4 py-2 font-semibold">创建草稿</button>{message ? <p role="status" className="text-sm text-neutral-600">{message}</p> : null}</form>
    </div>
  );
}
