"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, Monitor, Plus, Smartphone, Trash2 } from "lucide-react";

import { MachinesDesktopPanel } from "@/components/SiteHeader";
import type { Product, ProductCategory } from "@/data/products";
import { buildMachinesMenuView } from "@/lib/navigation/machines-menu";
import type { MachinesCategoryConfig, MachinesMenuConfig } from "@/lib/navigation/schema";

type Props = {
  value: MachinesMenuConfig;
  categories: ProductCategory[];
  products: Product[];
  disabled?: boolean;
  onChange: (value: MachinesMenuConfig) => void;
};

const inputClass = "h-10 w-full rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink outline-none focus:border-ignition focus:ring-2 focus:ring-ignition/15";

export function MachinesMenuEditor({ value, categories, products, disabled, onChange }: Props) {
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const view = useMemo(() => buildMachinesMenuView(value, categories, products), [value, categories, products]);
  const [activeCategoryId, setActiveCategoryId] = useState(() => view.categories.find((item) => item.isDefault)?.id ?? view.categories[0]?.id ?? "");

  function patch(patchValue: Partial<MachinesMenuConfig>) { onChange({ ...value, ...patchValue }); }
  function patchSettings(settings: Partial<MachinesMenuConfig["settings"]>) { patch({ settings: { ...value.settings, ...settings } }); }
  function patchCategory(index: number, category: Partial<MachinesCategoryConfig>) {
    patch({ categories: value.categories.map((item, itemIndex) => itemIndex === index ? { ...item, ...category } : category.isDefault ? { ...item, isDefault: false } : item) });
  }
  function moveCategory(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.categories.length) return;
    const next = [...value.categories];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ categories: next.map((item, sortOrder) => ({ ...item, sortOrder })) });
  }
  function toggleProduct(categoryIndex: number, productId: string, enabled: boolean) {
    const category = value.categories[categoryIndex];
    const existing = category.products.find((item) => item.productId === productId);
    const productsConfig = existing
      ? category.products.map((item) => item.productId === productId ? { ...item, enabled } : item)
      : [...category.products, { productId, enabled, sortOrder: category.products.length }];
    patchCategory(categoryIndex, { products: productsConfig });
  }
  function patchProduct(categoryIndex: number, productId: string, productPatch: Partial<MachinesCategoryConfig["products"][number]>) {
    const category = value.categories[categoryIndex];
    patchCategory(categoryIndex, { products: category.products.map((item) => item.productId === productId ? { ...item, ...productPatch } : item) });
  }
  function moveProduct(categoryIndex: number, productId: string, direction: -1 | 1) {
    const category = value.categories[categoryIndex];
    const enabled = category.products.filter((item) => item.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
    const index = enabled.findIndex((item) => item.productId === productId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= enabled.length) return;
    [enabled[index], enabled[target]] = [enabled[target], enabled[index]];
    const orders = new Map(enabled.map((item, sortOrder) => [item.productId, sortOrder]));
    patchCategory(categoryIndex, { products: category.products.map((item) => orders.has(item.productId) ? { ...item, sortOrder: orders.get(item.productId)! } : item) });
  }
  function addMissingCategory() {
    const configured = new Set(value.categories.map((item) => item.categoryId));
    const category = categories.find((item) => !configured.has(item.id));
    if (!category) return;
    patch({ categories: [...value.categories, { categoryId: category.id, displayName: category.navLabel.toUpperCase(), sortOrder: value.categories.length, enabled: true, isDefault: value.categories.length === 0, products: [] }] });
  }

  return (
    <section className="space-y-5" aria-label="Machines Mega Menu 管理">
      <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-lg font-semibold text-admin-ink">Machines Mega Menu</h2><p className="mt-1 text-sm text-admin-muted">关联真实产品分类和产品。草稿不会显示到官网，发布后桌面端与移动端同步更新。</p></div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={value.enabled} disabled={disabled} onChange={(event) => patch({ enabled: event.target.checked })} />启用 Machines 菜单</label>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">产品同步模式<select aria-label="产品同步模式" value={value.mode} disabled={disabled} onChange={(event) => patch({ mode: event.target.value as MachinesMenuConfig["mode"] })} className={inputClass}><option value="AUTO">自动同步已发布产品</option><option value="MANUAL">手动选择产品</option></select></label>
          <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">桌面产品列数<select aria-label="桌面产品列数" value={value.settings.desktopColumns} disabled={disabled} onChange={(event) => patchSettings({ desktopColumns: Number(event.target.value) as 3 | 4 })} className={inputClass}><option value="3">3 列</option><option value="4">4 列</option></select></label>
          <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">询价按钮文字<input value={value.settings.ctaLabel} disabled={disabled} onChange={(event) => patchSettings({ ctaLabel: event.target.value })} className={inputClass} /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold text-admin-muted">
          {(["showCounts", "showDescriptions", "showImages", "backdrop", "mobileShowImages", "mobileShowDescriptions", "mobileStickyCta"] as const).map((key) => <label key={key} className="inline-flex items-center gap-2"><input type="checkbox" checked={value.settings[key]} disabled={disabled} onChange={(event) => patchSettings({ [key]: event.target.checked })} />{{ showCounts: "显示数量", showDescriptions: "显示说明", showImages: "显示图片", backdrop: "桌面遮罩", mobileShowImages: "移动端图片", mobileShowDescriptions: "移动端说明", mobileStickyCta: "移动端固定询价" }[key]}</label>)}
        </div>
      </div>

      <div className="rounded-admin-lg border border-admin-border bg-white shadow-admin-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4"><div><h2 className="font-semibold text-admin-ink">分类与产品管理</h2><p className="mt-1 text-xs text-admin-muted">上下移动支持键盘操作；移出菜单不会删除产品中心中的数据。</p></div><button type="button" onClick={addMissingCategory} disabled={disabled || value.categories.length >= categories.length} className="inline-flex h-9 items-center gap-1.5 rounded-admin-sm border border-admin-border px-3 text-sm font-semibold disabled:opacity-40"><Plus className="size-4" />添加未配置系列</button></div>
        <div className="divide-y divide-admin-border">{value.categories.map((config, index) => {
          const category = categories.find((item) => item.id === config.categoryId);
          const categoryProducts = products.filter((item) => item.categoryId === config.categoryId);
          return <article key={config.categoryId} className="p-5">
            <div className="grid gap-3 lg:grid-cols-[40px_1fr_1.4fr_auto] lg:items-end">
              <span className="grid size-10 place-items-center rounded-admin-sm bg-admin-canvas text-sm font-semibold text-admin-muted">{index + 1}</span>
              <label className="grid gap-1 text-xs font-semibold text-admin-muted">系列显示名称<input aria-label={`系列 ${index + 1} 显示名称`} value={config.displayName ?? category?.navLabel ?? ""} disabled={disabled} onChange={(event) => patchCategory(index, { displayName: event.target.value })} className={inputClass} /></label>
              <label className="grid gap-1 text-xs font-semibold text-admin-muted">系列说明<input aria-label={`系列 ${index + 1} 说明`} value={config.description ?? ""} placeholder={category?.summary} disabled={disabled} onChange={(event) => patchCategory(index, { description: event.target.value || undefined })} className={inputClass} /></label>
              <div className="flex items-center gap-2 pb-1"><label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={config.enabled} disabled={disabled} onChange={(event) => patchCategory(index, { enabled: event.target.checked })} />显示</label><label className="inline-flex items-center gap-1 text-xs"><input type="radio" name="default-machine-category" checked={config.isDefault} disabled={disabled} onChange={() => patchCategory(index, { isDefault: true })} />默认</label><button type="button" aria-label={`上移 ${config.displayName ?? config.categoryId}`} disabled={disabled || index === 0} onClick={() => moveCategory(index, -1)} className="p-2 disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" aria-label={`下移 ${config.displayName ?? config.categoryId}`} disabled={disabled || index === value.categories.length - 1} onClick={() => moveCategory(index, 1)} className="p-2 disabled:opacity-30"><ArrowDown className="size-4" /></button><button type="button" aria-label={`移出菜单 ${config.displayName ?? config.categoryId}`} disabled={disabled} onClick={() => patch({ categories: value.categories.filter((_, itemIndex) => itemIndex !== index).map((item, sortOrder) => ({ ...item, sortOrder })) })} className="p-2 text-red-600 disabled:opacity-30"><Trash2 className="size-4" /></button></div>
            </div>
            {value.mode === "MANUAL" ? <details className="mt-4 rounded-admin-sm border border-admin-border bg-admin-canvas p-4"><summary className="cursor-pointer text-sm font-semibold">产品选择与显示覆盖（{categoryProducts.length}）</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{categoryProducts.map((product) => { const selected = config.products.find((item) => item.productId === product.id)?.enabled ?? false; return <label key={product.id} className="flex items-center gap-3 rounded-admin-sm border border-admin-border bg-white p-3 text-sm"><input type="checkbox" checked={selected} disabled={disabled} onChange={(event) => toggleProduct(index, product.id, event.target.checked)} /><span className="min-w-0"><span className="block truncate font-semibold">{product.name}</span><span className="block truncate text-xs text-admin-muted">/{product.id}</span></span></label>; })}</div><div className="mt-4 space-y-3">{config.products.filter((item) => item.enabled).sort((a, b) => a.sortOrder - b.sortOrder).map((productConfig, productIndex, selected) => { const product = categoryProducts.find((item) => item.id === productConfig.productId); if (!product) return null; return <div key={productConfig.productId} className="rounded-admin-sm border border-admin-border bg-white p-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold">{product.name}</p><div className="flex"><button type="button" aria-label={`上移产品 ${product.name}`} disabled={disabled || productIndex === 0} onClick={() => moveProduct(index, product.id, -1)} className="p-2 disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" aria-label={`下移产品 ${product.name}`} disabled={disabled || productIndex === selected.length - 1} onClick={() => moveProduct(index, product.id, 1)} className="p-2 disabled:opacity-30"><ArrowDown className="size-4" /></button></div></div><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="grid gap-1 text-xs font-semibold text-admin-muted">显示名称覆盖<input value={productConfig.displayNameOverride ?? ""} placeholder={product.name} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { displayNameOverride: event.target.value || undefined })} className={inputClass} /></label><label className="grid gap-1 text-xs font-semibold text-admin-muted">图片替换路径<input value={productConfig.imageOverride ?? ""} placeholder={product.image} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { imageOverride: event.target.value || undefined })} className={inputClass} /></label><label className="grid gap-1 text-xs font-semibold text-admin-muted md:col-span-2">简短说明覆盖<input value={productConfig.shortDescriptionOverride ?? ""} placeholder={product.tagline} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { shortDescriptionOverride: event.target.value || undefined })} className={inputClass} /></label><label className="grid gap-1 text-xs font-semibold text-admin-muted md:col-span-2">图片替代文字<input value={productConfig.altOverride ?? ""} placeholder={product.name} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { altOverride: event.target.value || undefined })} className={inputClass} /></label></div></div>; })}</div></details> : null}
          </article>;
        })}</div>
      </div>

      <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-admin-ink"><Eye className="size-4 text-ignition" />实时预览</h2><p className="mt-1 text-xs text-admin-muted">预览当前草稿，不会影响官网。</p></div><div className="flex rounded-admin-sm border border-admin-border p-1"><button type="button" onClick={() => setPreview("desktop")} className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold ${preview === "desktop" ? "bg-admin-ink text-white" : "text-admin-muted"}`}><Monitor className="size-3.5" />桌面</button><button type="button" onClick={() => setPreview("mobile")} className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold ${preview === "mobile" ? "bg-admin-ink text-white" : "text-admin-muted"}`}><Smartphone className="size-3.5" />移动</button></div></div>
        <div className="mt-4 overflow-hidden rounded-admin-sm border border-admin-border bg-white">{preview === "desktop" ? <div className="origin-top-left overflow-auto"><MachinesDesktopPanel view={view} activeCategoryId={activeCategoryId} onActiveCategory={setActiveCategoryId} compact /></div> : <div className="mx-auto min-h-[520px] max-w-[390px] border-x border-neutral-200 p-5"><p className="text-2xl font-semibold">Machines</p><p className="mt-1 text-sm text-neutral-500">View All Machines</p><div className="mt-6">{view.categories.map((category) => <div key={category.id} className="flex min-h-16 items-center justify-between border-b border-neutral-200 text-sm font-semibold"><span>{category.name}</span><span className="text-neutral-400">{category.count} ›</span></div>)}</div></div>}</div>
      </div>
    </section>
  );
}
