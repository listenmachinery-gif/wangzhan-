"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { createDraftProductModule } from "@/lib/product-modules/drafts";
import { SMALL_ELECTRIC_PRODUCT_MODULE_LABELS } from "@/lib/product-modules/small-electric-template";
import { PRODUCT_MODULE_TYPES, type ProductModuleType } from "@/lib/product-modules/types";
import { ModuleEditorRegistry, type JsonValue } from "./ModuleEditorRegistry";

type Section = { id: string; type: ProductModuleType; position: number; visible: boolean; content: JsonValue; mediaAssetIds: string[] };
type ProductState = { id: string; name: string; slug: string; summary: string; description: string | null; categoryId: string; status: string; version: number; sections: Section[] };

function referencedMediaIds(value: JsonValue): string[] {
  if (typeof value === "string") return value.match(/^\/api\/media\/([^/?#]+)$/)?.[1] ? [decodeURIComponent(value.slice("/api/media/".length))] : [];
  if (Array.isArray(value)) return value.flatMap(referencedMediaIds);
  if (value && typeof value === "object") return Object.values(value).flatMap(referencedMediaIds);
  return [];
}

export function ProductEditor({ initialProduct, categories, media }: { initialProduct: ProductState; categories: Array<{ id: string; name: string }>; media: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [sections, setSections] = useState(initialProduct.sections);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [moduleToAdd, setModuleToAdd] = useState<ProductModuleType>(
    PRODUCT_MODULE_TYPES.find((type) => !initialProduct.sections.some((section) => section.type === type)) ?? "HERO",
  );
  const [copyName, setCopyName] = useState(`${initialProduct.name} Copy`);
  const [copySlug, setCopySlug] = useState(`${initialProduct.slug}-copy`);

  async function request(url: string, options: RequestInit) {
    setBusy(true); setMessage("");
    const response = await fetch(url, { ...options, headers: { "content-type": "application/json", ...options.headers } });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(result.message ?? "操作失败。"); throw new Error(result.code); }
    setProduct((current) => ({ ...current, ...result }));
    return result;
  }

  async function saveBasics() {
    await request(`/api/admin/products/${product.id}`, { method: "PATCH", body: JSON.stringify({ version: product.version, categoryId: product.categoryId, name: product.name, summary: product.summary, description: product.description }) });
    setMessage("产品基础信息已保存。");
  }
  async function saveModules() {
    const result = await request(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        version: product.version,
        sections: sections.map((section, position) => ({
          type: section.type,
          position,
          visible: section.visible,
          content: section.content,
          mediaAssetIds: [...new Set(referencedMediaIds(section.content))],
        })),
      }),
    });
    setSections((current) => current.map((section, position) => ({ ...section, position })));
    setMessage(`模块已保存，当前版本 ${result.version}。`);
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections]; [next[index], next[target]] = [next[target], next[index]]; setSections(next);
  }
  async function publish() {
    await request(`/api/admin/products/${product.id}/publish`, { method: "POST", body: JSON.stringify({ version: product.version }) });
    setMessage("产品已发布，前台缓存已刷新。"); router.refresh();
  }
  async function archive() {
    await request(`/api/admin/products/${product.id}`, { method: "DELETE", body: JSON.stringify({ version: product.version }) });
    setMessage("产品已归档。"); router.refresh();
  }
  function addModule() {
    if (sections.some(({ type }) => type === moduleToAdd)) return setMessage("该模块已经存在。");
    const next = [...sections, { id: `draft-${moduleToAdd}`, type: moduleToAdd, position: sections.length, visible: true, content: createDraftProductModule(moduleToAdd) as JsonValue, mediaAssetIds: [] }];
    setSections(next);
    setModuleToAdd(PRODUCT_MODULE_TYPES.find((type) => !next.some((section) => section.type === type)) ?? "HERO");
    setMessage("已添加空白模块；请填写全部必填字段后保存。");
  }
  async function copy() {
    const result = await request(`/api/admin/products/${product.id}`, { method: "POST", body: JSON.stringify({ action: "copy", name: copyName, slug: copySlug, expectedVersion: product.version }) });
    router.push(`/admin/products/${result.id}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">基础信息</h2><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{product.status} · v{product.version}</span></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">名称<input value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
          <label className="text-sm font-medium">分类<select value={product.categoryId} onChange={(event) => setProduct({ ...product, categoryId: event.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="text-sm font-medium sm:col-span-2">固定 URL<input value={`/products/${product.slug}`} readOnly className="mt-2 w-full rounded-lg border bg-neutral-50 px-3 py-2 text-neutral-500" /></label>
          <label className="text-sm font-medium sm:col-span-2">摘要<textarea value={product.summary} onChange={(event) => setProduct({ ...product, summary: event.target.value })} rows={3} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
          <label className="text-sm font-medium sm:col-span-2">详细说明<textarea value={product.description ?? ""} onChange={(event) => setProduct({ ...product, description: event.target.value || null })} rows={5} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
        </div>
        <button disabled={busy} onClick={() => void saveBasics()} className="mt-5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">保存基础信息</button>
      </section>

      <section className="space-y-4">
        <div><h2 className="text-lg font-semibold">详情页模块</h2><p className="mt-1 text-sm text-neutral-600">顺序以“小型电动剪板机”的 24 模块模板为准；隐藏模块不会在前台显示。</p></div>
        {sections.map((section, index) => (
          <article key={section.id || section.type} data-module-editor={section.type} className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#5F9500]">{section.type}</p><h3 className="mt-1 font-semibold">{SMALL_ELECTRIC_PRODUCT_MODULE_LABELS[section.type]}</h3></div><div className="flex items-center gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.visible} onChange={(event) => setSections(sections.map((item, itemIndex) => itemIndex === index ? { ...item, visible: event.target.checked } : item))} />显示</label><button aria-label="上移模块" onClick={() => move(index, -1)} className="rounded border px-2 py-1">↑</button><button aria-label="下移模块" onClick={() => move(index, 1)} className="rounded border px-2 py-1">↓</button><button onClick={() => setSections(sections.filter((_, itemIndex) => itemIndex !== index))} className="rounded border border-red-200 px-2 py-1 text-red-700">删除</button></div></div>
            <ModuleEditorRegistry type={section.type} value={section.content} media={media} onChange={(content) => setSections(sections.map((item, itemIndex) => itemIndex === index ? { ...item, content } : item))} />
          </article>
        ))}
        {sections.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-neutral-500">尚无模块。请先从已有产品复制或通过 API 添加经 schema 校验的模块。</p> : null}
        <div className="flex flex-wrap gap-3"><select aria-label="新增模块类型" value={moduleToAdd} disabled={sections.length === PRODUCT_MODULE_TYPES.length} onChange={(event) => setModuleToAdd(event.target.value as ProductModuleType)} className="rounded-lg border px-3 py-2 text-sm">{PRODUCT_MODULE_TYPES.filter((type) => !sections.some((section) => section.type === type)).map((type) => <option key={type} value={type}>{SMALL_ELECTRIC_PRODUCT_MODULE_LABELS[type]}</option>)}</select><button type="button" disabled={sections.length === PRODUCT_MODULE_TYPES.length} onClick={addModule} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">新增标准模块</button><button disabled={busy} onClick={() => void saveModules()} className="rounded-lg bg-[#0B0D10] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">保存模块顺序与内容</button></div>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5">
        <Link href={`/admin/products/${product.id}/specifications`} className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold">管理型号参数</Link>
        <button disabled={busy} onClick={() => void publish()} className="rounded-lg bg-[#76B900] px-5 py-2.5 font-semibold text-[#0B0D10] disabled:opacity-50">发布到前台</button>
        <button disabled={busy || product.status === "ARCHIVED"} onClick={() => void archive()} className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50">归档</button>
        {message ? <p role="status" className={`text-sm ${message.includes("失败") || message.includes("changed") ? "text-red-700" : "text-neutral-700"}`}>{message}</p> : null}
      </section>
      <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="font-semibold">复制为新草稿</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">新名称<input value={copyName} onChange={(event) => setCopyName(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-sm">新 slug<input value={copySlug} onChange={(event) => setCopySlug(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></div><button disabled={busy} onClick={() => void copy()} className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">复制产品与模块</button></section>
    </div>
  );
}
