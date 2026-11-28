"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MediaAssetPicker } from "@/components/admin/pages/MediaAssetPicker";
import type { ProductExplorerProductOption } from "@/components/admin/pages/ProductExplorerEditor";
import {
  DEFAULT_PRODUCT_SEARCH_CONTENT,
  type ProductSearchContent,
} from "@/lib/product-search/config";

const inputClass = "mt-1 h-9 w-full rounded-md border border-neutral-300 bg-white px-2 text-xs outline-none focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/15";
const areaClass = "mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-xs outline-none focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/15";

export function ProductSearchEditor({ content, productOptions, onChange }: {
  content: ProductSearchContent;
  productOptions: ProductExplorerProductOption[];
  onChange(content: ProductSearchContent): void;
}) {
  const update = <K extends keyof ProductSearchContent>(key: K, value: ProductSearchContent[K]) => onChange({ ...content, [key]: value });
  const updatePopular = (index: number, changes: Partial<ProductSearchContent["popularItems"][number]>) => update("popularItems", content.popularItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
  const updateFeature = (index: number, changes: Partial<ProductSearchContent["features"][number]>) => update("features", content.features.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
  const move = <T,>(items: T[], index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return next;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };
  const textFields: Array<[keyof ProductSearchContent, string, number]> = [
    ["eyebrow", "品牌标签", 1], ["titleLineOne", "标题第一行", 2], ["titleAccent", "绿色强调标题", 2],
    ["titleSuffix", "标题后缀", 2], ["description", "说明文字", 3], ["placeholder", "搜索框提示", 2],
    ["buttonLabel", "搜索按钮", 1], ["popularTitle", "热门搜索标题", 1], ["viewAllLabel", "查看全部结果", 1],
    ["loadingLabel", "加载提示", 1], ["noResultsLabel", "无结果提示", 1], ["errorLabel", "错误提示", 1],
  ];

  return <div className="space-y-5" data-product-search-editor>
    <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-3"><h4 className="text-xs font-bold">模块文案</h4><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={content.enabled} onChange={(event) => update("enabled", event.target.checked)} />显示模块</label></div>
      <div className="mt-3 space-y-3">{textFields.map(([key, label, rows]) => <label key={key} className="block text-xs font-medium text-neutral-600">{label}<textarea aria-label={label} rows={rows} value={String(content[key])} onChange={(event) => update(key, event.target.value as never)} className={areaClass} /></label>)}</div>
    </section>

    <section className="rounded-lg border border-neutral-200 p-3">
      <h4 className="text-xs font-bold">背景图片</h4>
      {(["desktopImage", "tabletImage", "mobileImage"] as const).map((key) => <div key={key} className="mt-3"><label className="block text-xs text-neutral-600">{{desktopImage:"桌面端背景",tabletImage:"平板端背景",mobileImage:"手机端背景"}[key]}<input value={content.background[key]} onChange={(event) => onChange({ ...content, background: { ...content.background, [key]: event.target.value } })} className={inputClass} /></label><MediaAssetPicker label={`从媒体资源库替换${{desktopImage:"桌面端背景",tabletImage:"平板端背景",mobileImage:"手机端背景"}[key]}`} kind="image" onSelect={(media) => onChange({ ...content, background: { ...content.background, [key]: media.url } })} /></div>)}
    </section>

    <section className="space-y-3">
      <div className="flex items-center justify-between"><div><h4 className="text-xs font-bold">热门搜索</h4><p className="mt-1 text-[11px] text-neutral-500">可增减、排序、替换图标，并绑定已发布产品。</p></div><button type="button" onClick={() => update("popularItems", [...content.popularItems, { ...DEFAULT_PRODUCT_SEARCH_CONTENT.popularItems[0], id: `popular-${Date.now()}`, label: "New Search", keyword: "New Search", productId: "" }])} className="inline-flex items-center gap-1 rounded bg-[#76B900] px-2 py-1 text-xs"><Plus size={13} />新增</button></div>
      {content.popularItems.map((item, index) => <article key={item.id} className="rounded-lg border p-3">
        <div className="flex items-center justify-between"><strong className="text-xs">{index + 1}. {item.label}</strong><div className="flex gap-1"><button aria-label="上移热门搜索" onClick={() => update("popularItems", move(content.popularItems, index, -1))}><ArrowUp size={15} /></button><button aria-label="下移热门搜索" onClick={() => update("popularItems", move(content.popularItems, index, 1))}><ArrowDown size={15} /></button><button aria-label="删除热门搜索" onClick={() => update("popularItems", content.popularItems.filter((_, i) => i !== index))}><Trash2 size={15} /></button></div></div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2"><label className="text-xs">显示文字<input value={item.label} onChange={(event) => updatePopular(index, { label: event.target.value })} className={inputClass} /></label><label className="text-xs">搜索关键词<input value={item.keyword} onChange={(event) => updatePopular(index, { keyword: event.target.value })} className={inputClass} /></label><label className="text-xs">绑定真实产品<select value={item.productId} onChange={(event) => updatePopular(index, { productId: event.target.value })} className={inputClass}><option value="">不绑定</option>{productOptions.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label className="text-xs">图标地址<input value={item.icon} onChange={(event) => updatePopular(index, { icon: event.target.value })} className={inputClass} /></label><label className="text-xs">图标尺寸<input type="number" min="24" max="80" value={item.iconSize} onChange={(event) => updatePopular(index, { iconSize: Number(event.target.value) })} className={inputClass} /></label><label className="text-xs">图标颜色<input type="color" value={item.iconColor} onChange={(event) => updatePopular(index, { iconColor: event.target.value })} className={inputClass} /></label><label className="text-xs">悬停颜色<input type="color" value={item.iconHoverColor} onChange={(event) => updatePopular(index, { iconHoverColor: event.target.value })} className={inputClass} /></label><label className="flex items-end gap-2 pb-2 text-xs"><input type="checkbox" checked={item.visible} onChange={(event) => updatePopular(index, { visible: event.target.checked })} />显示该入口</label></div>
        <div className="mt-2"><MediaAssetPicker label="从媒体资源库替换图标" kind="image" onSelect={(media) => updatePopular(index, { icon: media.url })} /></div>
      </article>)}
    </section>

    <section className="space-y-3">
      <div className="flex items-center justify-between"><h4 className="text-xs font-bold">底部搜索优势</h4><button type="button" onClick={() => update("features", [...content.features, { ...DEFAULT_PRODUCT_SEARCH_CONTENT.features[0], id: `feature-${Date.now()}`, title: "New Benefit", description: "Describe the benefit." }])} className="inline-flex items-center gap-1 rounded bg-[#76B900] px-2 py-1 text-xs"><Plus size={13} />新增</button></div>
      {content.features.map((item, index) => <article key={item.id} className="rounded-lg border p-3"><div className="flex items-center justify-between"><strong className="text-xs">{item.title}</strong><div className="flex gap-1"><button aria-label="上移搜索优势" onClick={() => update("features", move(content.features, index, -1))}><ArrowUp size={15} /></button><button aria-label="下移搜索优势" onClick={() => update("features", move(content.features, index, 1))}><ArrowDown size={15} /></button><button aria-label="删除搜索优势" onClick={() => update("features", content.features.filter((_, i) => i !== index))}><Trash2 size={15} /></button></div></div><label className="mt-2 block text-xs">标题<input value={item.title} onChange={(event) => updateFeature(index, { title: event.target.value })} className={inputClass} /></label><label className="mt-2 block text-xs">说明<textarea value={item.description} onChange={(event) => updateFeature(index, { description: event.target.value })} className={areaClass} /></label><label className="mt-2 block text-xs">图标地址<input value={item.icon} onChange={(event) => updateFeature(index, { icon: event.target.value })} className={inputClass} /></label><div className="mt-2 grid grid-cols-3 gap-2"><label className="text-xs">图标尺寸<input type="number" min="28" max="88" value={item.iconSize} onChange={(event) => updateFeature(index, { iconSize: Number(event.target.value) })} className={inputClass} /></label><label className="text-xs">图标颜色<input type="color" value={item.iconColor} onChange={(event) => updateFeature(index, { iconColor: event.target.value })} className={inputClass} /></label><label className="flex items-end gap-2 pb-2 text-xs"><input type="checkbox" checked={item.visible} onChange={(event) => updateFeature(index, { visible: event.target.checked })} />显示</label></div><MediaAssetPicker label="从媒体资源库替换图标" kind="image" onSelect={(media) => updateFeature(index, { icon: media.url })} /></article>)}
    </section>

    <section className="rounded-lg border border-neutral-200 p-3"><h4 className="text-xs font-bold">版式、字体和颜色</h4><div className="mt-3 grid grid-cols-2 gap-2">{([['titleSize','主标题字号'],['eyebrowSize','品牌标签字号'],['descriptionSize','说明文字号']] as const).map(([key,label]) => <label key={key} className="text-xs">{label}<input type="number" value={content.typography[key]} onChange={(event) => onChange({ ...content, typography: { ...content.typography, [key]: Number(event.target.value) } })} className={inputClass} /></label>)}{([['titleColor','标题颜色'],['accentColor','强调色'],['descriptionColor','说明颜色']] as const).map(([key,label]) => <label key={key} className="text-xs">{label}<input type="color" value={content.typography[key]} onChange={(event) => onChange({ ...content, typography: { ...content.typography, [key]: event.target.value } })} className={inputClass} /></label>)}{([['maxWidth','最大宽度'],['sectionHeight','模块高度'],['searchHeight','搜索框高度'],['buttonWidth','按钮宽度']] as const).map(([key,label]) => <label key={key} className="text-xs">{label}<input type="number" value={content.appearance[key]} onChange={(event) => onChange({ ...content, appearance: { ...content.appearance, [key]: Number(event.target.value) } })} className={inputClass} /></label>)}{([['buttonColor','按钮色'],['buttonHoverColor','按钮悬停色'],['searchBackground','搜索框底色'],['borderColor','边框色']] as const).map(([key,label]) => <label key={key} className="text-xs">{label}<input type="color" value={content.appearance[key]} onChange={(event) => onChange({ ...content, appearance: { ...content.appearance, [key]: event.target.value } })} className={inputClass} /></label>)}</div><button type="button" onClick={() => onChange(structuredClone(DEFAULT_PRODUCT_SEARCH_CONTENT))} className="mt-3 inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold"><RotateCcw size={14} />恢复搜索模块默认设计</button></section>
  </div>;
}
