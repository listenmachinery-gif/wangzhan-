"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MediaAssetPicker } from "@/components/admin/pages/MediaAssetPicker";
import type { ProductExplorerProductOption } from "@/components/admin/pages/ProductExplorerEditor";
import {
  DEFAULT_PRODUCT_SELECTION_CONTENT,
  type ProductSelectionContent,
  type ProductSelectionFilter,
} from "@/lib/product-selection/config";

const input = "mt-1 h-9 w-full rounded-md border border-neutral-300 bg-white px-2 text-xs outline-none focus:border-[#76B900]";
const area = "mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-xs outline-none focus:border-[#76B900]";

function move<T>(items: T[], index: number, offset: -1 | 1) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function ProductSelectionEditor({ content, productOptions, onChange }: {
  content: ProductSelectionContent;
  productOptions: ProductExplorerProductOption[];
  onChange(content: ProductSelectionContent): void;
}) {
  const set = <K extends keyof ProductSelectionContent>(key: K, value: ProductSelectionContent[K]) => onChange({ ...content, [key]: value });
  const updateFilter = (index: number, changes: Partial<ProductSelectionFilter>) => set("filters", content.filters.map((item, current) => current === index ? { ...item, ...changes } : item));
  const textFields: Array<["eyebrow" | "title" | "subtitle" | "description", string, number]> = [
    ["eyebrow", "顶部标签", 1], ["title", "模块主标题", 2], ["subtitle", "模块副标题", 2], ["description", "模块介绍", 4],
  ];

  return <div className="space-y-5" data-product-selection-editor>
    <section className="rounded-lg border bg-neutral-50 p-3">
      <div className="flex items-center justify-between"><h4 className="text-xs font-bold">模块文案</h4><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={content.enabled} onChange={(event) => set("enabled", event.target.checked)} />显示模块</label></div>
      <div className="mt-3 space-y-3">{textFields.map(([key, label, rows]) => <label key={key} className="block text-xs">{label}<textarea rows={rows} value={content[key]} onChange={(event) => set(key, event.target.value)} className={area} /></label>)}</div>
    </section>

    <section className="rounded-lg border p-3"><h4 className="text-xs font-bold">搜索与无结果提示</h4><div className="mt-3 space-y-2">
      {([['placeholder','搜索框提示'],['buttonLabel','搜索按钮'],['noResultsTitle','无结果标题'],['noResultsBody','无结果说明'],['resetLabel','重置按钮']] as const).map(([key,label]) => <label key={key} className="block text-xs">{label}<textarea value={content.search[key]} onChange={(event) => set("search", { ...content.search, [key]: event.target.value })} className={area} /></label>)}
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={content.search.suggestions} onChange={(event) => set("search", { ...content.search, suggestions: event.target.checked })} />启用搜索建议</label>
      <label className="block text-xs">同义词（每行：标准词 | 别名1, 别名2）<textarea rows={5} value={content.search.synonyms.map((item) => `${item.term} | ${item.aliases.join(", ")}`).join("\n")} onChange={(event) => set("search", { ...content.search, synonyms: event.target.value.split("\n").flatMap((line) => { const [term, aliases] = line.split("|"); const values = aliases?.split(",").map((value) => value.trim()).filter(Boolean) ?? []; return term?.trim() && values.length ? [{ term: term.trim(), aliases: values }] : []; }) })} className={area} /></label>
    </div></section>

    <section className="rounded-lg border p-3"><h4 className="text-xs font-bold">布局、字号与颜色</h4><div className="mt-3 grid grid-cols-2 gap-2">
      {([['titleSize','主标题字号'],['subtitleSize','副标题字号'],['bodySize','正文字号'],['eyebrowSize','标签字号'],['maxWidth','最大宽度'],['paddingY','上下留白'],['filterWidth','筛选栏宽度'],['gap','内容间距']] as const).map(([key,label]) => <label key={key} className="text-xs">{label}<input type="number" value={content.design[key]} onChange={(event) => set("design", { ...content.design, [key]: Number(event.target.value) })} className={input} /></label>)}
      {([['backgroundColor','背景色'],['accentColor','品牌绿'],['titleColor','标题色'],['bodyColor','正文色'],['cardBackground','卡片底色'],['cardBorder','卡片边框']] as const).map(([key,label]) => <label key={key} className="text-xs">{label}<input type="color" value={content.design[key]} onChange={(event) => set("design", { ...content.design, [key]: event.target.value })} className={input} /></label>)}
    </div><div className="mt-3"><MediaAssetPicker label="从媒体资源库选择模块背景" kind="image" onSelect={(media) => set("design", { ...content.design, backgroundImage: media.url })} /></div></section>

    <section className="space-y-3"><div className="flex items-center justify-between"><div><h4 className="text-xs font-bold">动态筛选项</h4><p className="text-[11px] text-neutral-500">字段名称需对应产品型号参数中的字段，可增减、排序。</p></div><button type="button" onClick={() => set("filters", [...content.filters, { ...DEFAULT_PRODUCT_SELECTION_CONTENT.filters[0], id: `filter-${Date.now()}`, label: "New Filter", adminLabel: "New Filter", sourceFields: ["Field Name"], position: content.filters.length }])} className="inline-flex items-center gap-1 rounded bg-[#76B900] px-2 py-1 text-xs"><Plus size={13} />新增</button></div>
      {content.filters.map((filter, index) => <article key={filter.id} className="rounded-lg border p-3"><div className="flex items-center justify-between"><strong className="text-xs">{index + 1}. {filter.label}</strong><div className="flex gap-1"><button aria-label="上移筛选项" onClick={() => set("filters", move(content.filters, index, -1))}><ArrowUp size={14} /></button><button aria-label="下移筛选项" onClick={() => set("filters", move(content.filters, index, 1))}><ArrowDown size={14} /></button><button aria-label="删除筛选项" onClick={() => set("filters", content.filters.filter((_, current) => current !== index))}><Trash2 size={14} /></button></div></div><div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-xs">前台名称<input value={filter.label} onChange={(event) => updateFilter(index, { label: event.target.value, adminLabel: event.target.value })} className={input} /></label>
        <label className="text-xs">单位<input value={filter.unit} onChange={(event) => updateFilter(index, { unit: event.target.value })} className={input} /></label>
        <label className="col-span-2 text-xs">数据源字段（逗号分隔）<input value={filter.sourceFields.join(", ")} onChange={(event) => updateFilter(index, { sourceFields: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} className={input} /></label>
        <label className="text-xs">数据类型<select value={filter.dataType} onChange={(event) => updateFilter(index, { dataType: event.target.value as ProductSelectionFilter["dataType"] })} className={input}><option value="TEXT">文字</option><option value="NUMBER">数值</option><option value="BOOLEAN">是/否</option></select></label>
        <label className="text-xs">筛选方式<select value={filter.control} onChange={(event) => updateFilter(index, { control: event.target.value as ProductSelectionFilter["control"] })} className={input}><option value="MULTI_SELECT">多选</option><option value="SINGLE_SELECT">单选</option><option value="NUMBER_MIN">最低要求</option><option value="NUMBER_MAX">最高要求</option><option value="NUMBER_RANGE">范围</option><option value="BOOLEAN">是/否</option></select></label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={filter.enabled} onChange={(event) => updateFilter(index, { enabled: event.target.checked })} />启用</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={filter.showOnCard} onChange={(event) => updateFilter(index, { showOnCard: event.target.checked })} />卡片显示</label>
      </div></article>)}
    </section>

    <section className="rounded-lg border p-3"><h4 className="text-xs font-bold">产品卡片与排序</h4><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs">详情按钮<input value={content.cards.viewLabel} onChange={(event) => set("cards", { ...content.cards, viewLabel: event.target.value })} className={input} /></label><label className="text-xs">参数数量<input type="number" min="2" max="6" value={content.cards.parameterCount} onChange={(event) => set("cards", { ...content.cards, parameterCount: Number(event.target.value) })} className={input} /></label><label className="text-xs">每页数量<input type="number" min="3" max="60" value={content.display.perPage} onChange={(event) => set("display", { ...content.display, perPage: Number(event.target.value) })} className={input} /></label><label className="text-xs">加载更多文字<input value={content.display.loadMoreLabel} onChange={(event) => set("display", { ...content.display, loadMoreLabel: event.target.value })} className={input} /></label></div>
      <div className="mt-4 space-y-2">{productOptions.map((product) => { const override = content.cards.overrides.find((item) => item.productId === product.id); return <details key={product.id} className="rounded border p-2"><summary className="cursor-pointer text-xs font-semibold">{product.name}</summary><div className="mt-2 grid grid-cols-2 gap-2"><label className="text-xs">推荐顺序<input type="number" value={override?.recommendedPosition ?? 0} onChange={(event) => { const next = { productId: product.id, title: override?.title ?? "", summary: override?.summary ?? "", image: override?.image ?? "", imageAlt: override?.imageAlt ?? "", recommendedPosition: Number(event.target.value), hidden: override?.hidden ?? false }; set("cards", { ...content.cards, overrides: [...content.cards.overrides.filter((item) => item.productId !== product.id), next] }); }} className={input} /></label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={override?.hidden ?? false} onChange={(event) => { const next = { productId: product.id, title: override?.title ?? "", summary: override?.summary ?? "", image: override?.image ?? "", imageAlt: override?.imageAlt ?? "", recommendedPosition: override?.recommendedPosition ?? 0, hidden: event.target.checked }; set("cards", { ...content.cards, overrides: [...content.cards.overrides.filter((item) => item.productId !== product.id), next] }); }} />前台隐藏</label></div></details>; })}</div>
    </section>

    <section className="rounded-lg border p-3"><h4 className="text-xs font-bold">对比与工程师咨询</h4><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs">最多对比<input type="number" min="2" max="6" value={content.compare.maxItems} onChange={(event) => set("compare", { ...content.compare, maxItems: Number(event.target.value) })} className={input} /></label><label className="text-xs">对比按钮<input value={content.compare.buttonLabel} onChange={(event) => set("compare", { ...content.compare, buttonLabel: event.target.value })} className={input} /></label></div><label className="mt-2 block text-xs">咨询标题<textarea value={content.consultation.title} onChange={(event) => set("consultation", { ...content.consultation, title: event.target.value })} className={area} /></label><label className="mt-2 block text-xs">咨询说明<textarea value={content.consultation.description} onChange={(event) => set("consultation", { ...content.consultation, description: event.target.value })} className={area} /></label></section>

    <button type="button" onClick={() => onChange(structuredClone(DEFAULT_PRODUCT_SELECTION_CONTENT))} className="inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold"><RotateCcw size={14} />恢复专业选型中心默认设置</button>
  </div>;
}
