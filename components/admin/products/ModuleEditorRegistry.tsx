"use client";

import { SMALL_ELECTRIC_PRODUCT_MODULE_LABELS } from "@/lib/product-modules/small-electric-template";
import type { ProductModuleType } from "@/lib/product-modules/types";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type MediaOption = { id: string; name: string };

const fieldLabels: Readonly<Record<string, string>> = {
  value: "内容",
  eyebrow: "眉题",
  title: "标题",
  subtitle: "副标题",
  intro: "导语",
  paragraphs: "段落",
  items: "项目",
  image: "图片",
  images: "图片组",
  alt: "图片替代文本",
  text: "文本",
  label: "标签",
  columns: "列",
  rows: "行",
  values: "数值",
  desktop: "桌面端图片",
  tablet: "平板图片",
  mobile: "手机图片",
  badges: "特点标签",
  valuePoints: "核心价值",
  primaryCta: "主要行动按钮",
  secondaryCta: "次要行动按钮",
  href: "链接",
  fit: "适用情况",
  materials: "适用材料",
  note: "说明",
  key: "字段键名",
  unit: "单位",
  name: "名称",
  description: "描述",
  specs: "参数",
  question: "问题",
  answer: "回答",
  requiredInfo: "询盘必填信息",
};

function labelFor(key: string) {
  return fieldLabels[key] ?? key;
}

function blankCopy(value: JsonValue): JsonValue {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.length ? [blankCopy(value[0])] : [""];
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blankCopy(item)]));
  return null;
}

function nextTechnicalColumnKey(columns: JsonValue[]) {
  const used = new Set(columns.flatMap((column) => column && typeof column === "object" && !Array.isArray(column) && typeof column.key === "string" ? [column.key] : []));
  let suffix = 1;
  while (used.has(`column_${suffix}`)) suffix += 1;
  return `column_${suffix}`;
}

const galleryTypes = new Set<ProductModuleType>(["PRODUCT_SHOWCASE", "DETAIL_GALLERY", "OPTION_CAROUSEL", "MATERIAL_GALLERY", "INDUSTRY_GALLERY"]);
const cardTypes = new Set<ProductModuleType>(["PROBLEMS", "PROCESS", "APPLICATIONS", "ADVANTAGES", "STRUCTURE", "WORKFLOW", "MANUFACTURER_SUPPORT"]);

function optionalFields(type: ProductModuleType, path: Array<string | number>) {
  const key = path.map((part) => typeof part === "number" ? "*" : part).join(".");
  if (type === "HERO" && key === "") return { subtitle: "", intro: "", badges: [""], valuePoints: [""], secondaryCta: { label: "", href: "" } };
  if (type === "HERO" && key === "images") return { tablet: "", mobile: "" };
  if (galleryTypes.has(type) && key === "") return { paragraphs: [""] };
  if (galleryTypes.has(type) && key === "items.*") return { text: "", label: "" };
  if (cardTypes.has(type) && key === "") return { paragraphs: [""] };
  if (cardTypes.has(type) && key === "items.*") return { image: "", alt: "" };
  if (type === "SOLUTION" && key === "") return { fit: [""] };
  if (type === "MODEL_CARDS" && key === "items.*") return { description: "" };
  if (type === "MODEL_CARDS" && key === "items.*.specs.*") return { unit: "" };
  if (type === "TECHNICAL" && key === "columns.*") return { unit: "" };
  if (type === "RELATED_LINKS" && key === "items.*") return { description: "" };
  if (type === "CTA" && key === "") return { secondaryCta: { label: "", href: "" }, requiredInfo: [""] };
  return {};
}

function StructuredFields({ type, value, media, path = [], onChange, onRemove }: { type: ProductModuleType; value: JsonValue; media: MediaOption[]; path?: Array<string | number>; onChange: (path: Array<string | number>, value: JsonValue) => void; onRemove: (path: Array<string | number>) => void }) {
  if (typeof value === "string") {
    const multiline = value.length > 100 || ["paragraphs", "answer", "text", "description", "intro", "note"].some((key) => path.includes(key));
    const field = String(path.at(-1) ?? "value");
    const editor = multiline
      ? <textarea aria-label={labelFor(String(path.at(-1) ?? "value"))} value={value} rows={3} onChange={(event) => onChange(path, event.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
      : <input aria-label={labelFor(String(path.at(-1) ?? "value"))} value={value} onChange={(event) => onChange(path, event.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />;
    if (!["image", "desktop", "tablet", "mobile"].includes(field)) return editor;
    return <div className="space-y-2">{editor}<select aria-label={`${labelFor(field)} 媒体资源`} value="" onChange={(event) => event.target.value && onChange(path, `/api/media/${event.target.value}`)} className="w-full rounded-md border px-3 py-2 text-sm"><option value="">从媒体库选择…</option>{media.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>;
  }
  if (typeof value === "number") return <input aria-label={labelFor(String(path.at(-1) ?? "value"))} type="number" value={value} onChange={(event) => onChange(path, Number(event.target.value))} className="w-full rounded-md border px-3 py-2 text-sm" />;
  if (typeof value === "boolean") return <input aria-label={labelFor(String(path.at(-1) ?? "value"))} type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} />;
  if (Array.isArray(value)) return <div className="space-y-3">{value.map((item, index) => <div key={index} className="rounded-lg border border-neutral-200 p-3"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold text-neutral-500">项目 {index + 1}</p><button type="button" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-red-700">移除</button></div><StructuredFields type={type} value={item} media={media} path={[...path, index]} onChange={onChange} onRemove={onRemove} /></div>)}<button type="button" onClick={() => onChange(path, [...value, type === "TECHNICAL" && path.join(".") === "columns" ? { key: nextTechnicalColumnKey(value), label: "" } : blankCopy(value.at(-1) ?? "")])} className="rounded border px-3 py-1.5 text-xs font-medium">添加项目</button></div>;
  if (value && typeof value === "object") {
    const available = Object.entries(optionalFields(type, path)).filter(([key]) => !(key in value));
    const optionalKeys = new Set(Object.keys(optionalFields(type, path)));
    return <div className="grid gap-4 sm:grid-cols-2">{Object.entries(value).map(([key, item]) => <div key={key} className="block text-xs font-medium text-neutral-600"><div className="mb-1 flex items-center justify-between"><span>{labelFor(key)}</span>{optionalKeys.has(key) ? <button type="button" onClick={() => onRemove([...path, key])} className="text-red-700">移除可选字段</button> : null}</div><StructuredFields type={type} value={item} media={media} path={[...path, key]} onChange={onChange} onRemove={onRemove} /></div>)}{available.length ? <div className="flex flex-wrap items-start gap-2 sm:col-span-2">{available.map(([key, initial]) => <button key={key} type="button" onClick={() => onChange([...path, key], initial as JsonValue)} className="rounded border px-3 py-1.5 text-xs font-medium">添加 {labelFor(key)}</button>)}</div> : null}</div>;
  }
  return <p className="text-xs text-neutral-500">空值</p>;
}

export function ModuleEditorRegistry({ type, value, media, onChange }: { type: ProductModuleType; value: JsonValue; media: MediaOption[]; onChange: (value: JsonValue) => void }) {
  function update(path: Array<string | number>, nextValue: JsonValue) {
    const root = structuredClone(value);
    let cursor = root as JsonValue;
    for (let index = 0; index < path.length - 1; index += 1) cursor = (cursor as Record<string | number, JsonValue>)[path[index]];
    if (path.length === 0) return onChange(nextValue);
    const last = path[path.length - 1];
    const previous = (cursor as Record<string | number, JsonValue>)[last];
    (cursor as Record<string | number, JsonValue>)[last] = nextValue;
    if (type === "TECHNICAL" && path.length === 3 && path[0] === "columns" && path[2] === "key" && typeof previous === "string" && typeof nextValue === "string") {
      const rows = (root as { rows?: Array<Record<string, JsonValue>> }).rows ?? [];
      const columns = (root as { columns?: Array<{ key?: string }> }).columns ?? [];
      const duplicate = columns.some((column, index) => index !== path[1] && column.key === nextValue);
      if (!duplicate) for (const row of rows) {
        row[nextValue] = row[previous] ?? "";
        const previousStillUsed = columns.some((column, index) => index !== path[1] && column.key === previous);
        if (nextValue !== previous && !previousStillUsed) delete row[previous];
      }
    }
    onChange(root);
  }
  function remove(path: Array<string | number>) {
    const root = structuredClone(value);
    let cursor = root as JsonValue;
    for (let index = 0; index < path.length - 1; index += 1) cursor = (cursor as Record<string | number, JsonValue>)[path[index]];
    delete (cursor as Record<string | number, JsonValue>)[path[path.length - 1]];
    onChange(root);
  }
  return <fieldset className="mt-4"><legend className="sr-only">编辑 {SMALL_ELECTRIC_PRODUCT_MODULE_LABELS[type]}</legend><StructuredFields type={type} value={value} media={media} onChange={update} onRemove={remove} /></fieldset>;
}

export type { JsonValue };
