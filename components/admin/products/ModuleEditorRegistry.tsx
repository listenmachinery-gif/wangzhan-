"use client";

import { SMALL_ELECTRIC_PRODUCT_MODULE_LABELS } from "@/lib/product-modules/small-electric-template";
import type { ProductModuleType } from "@/lib/product-modules/types";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function blankCopy(value: JsonValue): JsonValue {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.length ? [blankCopy(value[0])] : [""];
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blankCopy(item)]));
  return null;
}

function StructuredFields({ value, path = [], onChange }: { value: JsonValue; path?: Array<string | number>; onChange: (path: Array<string | number>, value: JsonValue) => void }) {
  if (typeof value === "string") {
    const multiline = value.length > 100 || ["paragraphs", "answer", "text", "description", "intro", "note"].some((key) => path.includes(key));
    return multiline
      ? <textarea aria-label={labelFor(String(path.at(-1) ?? "value"))} value={value} rows={3} onChange={(event) => onChange(path, event.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
      : <input aria-label={labelFor(String(path.at(-1) ?? "value"))} value={value} onChange={(event) => onChange(path, event.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />;
  }
  if (typeof value === "number") return <input aria-label={labelFor(String(path.at(-1) ?? "value"))} type="number" value={value} onChange={(event) => onChange(path, Number(event.target.value))} className="w-full rounded-md border px-3 py-2 text-sm" />;
  if (typeof value === "boolean") return <input aria-label={labelFor(String(path.at(-1) ?? "value"))} type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} />;
  if (Array.isArray(value)) return <div className="space-y-3">{value.map((item, index) => <div key={index} className="rounded-lg border border-neutral-200 p-3"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold text-neutral-500">项目 {index + 1}</p><button type="button" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-red-700">移除</button></div><StructuredFields value={item} path={[...path, index]} onChange={onChange} /></div>)}<button type="button" onClick={() => onChange(path, [...value, blankCopy(value.at(-1) ?? "")])} className="rounded border px-3 py-1.5 text-xs font-medium">添加项目</button></div>;
  if (value && typeof value === "object") return <div className="grid gap-4 sm:grid-cols-2">{Object.entries(value).map(([key, item]) => <label key={key} className="block text-xs font-medium text-neutral-600"><span className="mb-1 block">{labelFor(key)}</span><StructuredFields value={item} path={[...path, key]} onChange={onChange} /></label>)}</div>;
  return <p className="text-xs text-neutral-500">空值</p>;
}

export function ModuleEditorRegistry({ type, value, onChange }: { type: ProductModuleType; value: JsonValue; onChange: (value: JsonValue) => void }) {
  function update(path: Array<string | number>, nextValue: JsonValue) {
    const root = structuredClone(value);
    let cursor = root as JsonValue;
    for (let index = 0; index < path.length - 1; index += 1) cursor = (cursor as Record<string | number, JsonValue>)[path[index]];
    if (path.length === 0) return onChange(nextValue);
    (cursor as Record<string | number, JsonValue>)[path[path.length - 1]] = nextValue;
    onChange(root);
  }
  return <fieldset className="mt-4"><legend className="sr-only">编辑 {SMALL_ELECTRIC_PRODUCT_MODULE_LABELS[type]}</legend><StructuredFields value={value} onChange={update} /></fieldset>;
}

export type { JsonValue };
