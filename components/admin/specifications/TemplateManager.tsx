"use client";

import { useState } from "react";

type Category = { id: string; name: string };
type FieldDraft = { name: string; unit: string; valueType: "TEXT" | "NUMBER" };
type TemplateSummary = { id: string; name: string; category: Category | null; fields: Array<{ id: string; name: string; unit: string | null; valueType: string }> };

export function TemplateManager({ initialTemplates, categories }: { initialTemplates: TemplateSummary[]; categories: Category[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([{ name: "", unit: "", valueType: "TEXT" }]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createTemplate() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/admin/specifications/templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        categoryId: categoryId || null,
        fields: fields.map((field, position) => ({ ...field, unit: field.unit || null, position })),
      }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(result.message ?? "模板创建失败。");
    const category = categories.find(({ id }) => id === result.categoryId) ?? null;
    setTemplates((current) => [...current, { ...result, category }].sort((left, right) => left.name.localeCompare(right.name)));
    setName(""); setFields([{ name: "", unit: "", valueType: "TEXT" }]);
    setMessage("模板已创建，可进入对应产品录入型号参数。");
  }

  return <div className="space-y-6">
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">创建参数模板</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">模板名称<input aria-label="模板名称" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2" /></label>
        <label className="text-sm font-medium">适用分类<select aria-label="适用分类" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2"><option value="">全部分类（通用）</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      </div>
      <div className="mt-5 space-y-3">{fields.map((field, index) => <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_160px_160px_auto]">
        <input aria-label={`字段名称 ${index + 1}`} placeholder="字段名称" value={field.name} onChange={(event) => setFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} className="rounded-lg border px-3 py-2" />
        <input aria-label={`字段单位 ${index + 1}`} placeholder="单位（可选）" value={field.unit} onChange={(event) => setFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, unit: event.target.value } : item))} className="rounded-lg border px-3 py-2" />
        <select aria-label={`字段类型 ${index + 1}`} value={field.valueType} onChange={(event) => setFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, valueType: event.target.value as FieldDraft["valueType"] } : item))} className="rounded-lg border px-3 py-2"><option value="TEXT">文本</option><option value="NUMBER">数字</option></select>
        <button type="button" disabled={fields.length === 1} onClick={() => setFields((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-red-200 px-3 py-2 text-red-700 disabled:opacity-40">删除</button>
      </div>)}</div>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => setFields((current) => [...current, { name: "", unit: "", valueType: "TEXT" }])} className="rounded-lg border px-4 py-2 font-semibold">新增字段</button><button type="button" disabled={busy} onClick={() => void createTemplate()} className="rounded-lg bg-[#0B0D10] px-5 py-2 font-semibold text-white disabled:opacity-50">创建参数模板</button></div>
      {message ? <p role="status" className="mt-3 text-sm text-neutral-700">{message}</p> : null}
    </section>
    <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-lg font-semibold">现有模板</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{templates.map((template) => <article key={template.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{template.name}</h3><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{template.category?.name ?? "通用"}</span></div><p className="mt-3 text-sm text-neutral-600">{template.fields.map((field) => `${field.name}${field.unit ? ` [${field.unit}]` : ""}`).join(" · ")}</p></article>)}{templates.length === 0 ? <p className="text-sm text-neutral-500">尚无参数模板。</p> : null}</div></section>
  </div>;
}
