"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, GripVertical, Monitor, Plus, Smartphone, Tablet, Trash2 } from "lucide-react";

import { MachinesDesktopPanel } from "@/components/SiteHeader";
import { MediaAssetPicker } from "@/components/admin/pages/MediaAssetPicker";
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
  const [preview, setPreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [productSearch, setProductSearch] = useState<Record<string, string>>({});
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
  function moveCategoryTo(source: number, target: number) {
    if (source === target || source < 0 || target < 0) return;
    const next = [...value.categories];
    const [moved] = next.splice(source, 1);
    next.splice(target, 0, moved);
    patch({ categories: next.map((item, sortOrder) => ({ ...item, sortOrder })) });
  }
  function toggleProduct(categoryIndex: number, productId: string, enabled: boolean) {
    if (enabled) {
      assignProducts(categoryIndex, [productId]);
      return;
    }
    patchCategory(categoryIndex, { products: value.categories[categoryIndex].products.map((item) => item.productId === productId ? { ...item, enabled: false } : item) });
  }
  function assignProducts(categoryIndex: number, productIds: string[]) {
    const ids = new Set(productIds);
    const nextCategories = value.categories.map((category, index) => {
      if (index !== categoryIndex) {
        return { ...category, products: category.products.map((item) => ids.has(item.productId) ? { ...item, enabled: false } : item) };
      }
      const nextProducts = [...category.products];
      for (const productId of productIds) {
        const existingIndex = nextProducts.findIndex((item) => item.productId === productId);
        if (existingIndex >= 0) nextProducts[existingIndex] = { ...nextProducts[existingIndex], enabled: true };
        else nextProducts.push({ productId, enabled: true, sortOrder: nextProducts.length });
      }
      return { ...category, products: nextProducts };
    });
    patch({ categories: nextCategories });
  }
  function removeProducts(categoryIndex: number, productIds: string[]) {
    const ids = new Set(productIds);
    patchCategory(categoryIndex, { products: value.categories[categoryIndex].products.map((item) => ids.has(item.productId) ? { ...item, enabled: false } : item) });
  }
  function moveProductToCategory(categoryIndex: number, productId: string, targetCategoryId: string) {
    if (!targetCategoryId || targetCategoryId === value.categories[categoryIndex].categoryId) return;
    const sourceProduct = value.categories[categoryIndex].products.find((item) => item.productId === productId);
    const targetIndex = value.categories.findIndex((item) => item.categoryId === targetCategoryId);
    if (!sourceProduct || targetIndex < 0) return;
    const nextCategories = value.categories.map((category, index) => {
      if (index === categoryIndex) {
        return { ...category, products: category.products.map((item) => item.productId === productId ? { ...item, enabled: false } : item) };
      }
      if (index === targetIndex) {
        const withoutDuplicate = category.products.filter((item) => item.productId !== productId);
        return { ...category, products: [...withoutDuplicate, { ...sourceProduct, enabled: true, sortOrder: withoutDuplicate.length }] };
      }
      return category;
    });
    patch({ categories: nextCategories });
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
  function moveProductToPosition(categoryIndex: number, productId: string, targetProductId: string) {
    const category = value.categories[categoryIndex];
    const enabled = category.products.filter((item) => item.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
    const source = enabled.findIndex((item) => item.productId === productId);
    const target = enabled.findIndex((item) => item.productId === targetProductId);
    if (source < 0 || target < 0 || source === target) return;
    const [moved] = enabled.splice(source, 1);
    enabled.splice(target, 0, moved);
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
    <section className="space-y-5" aria-label="PRODUCTS Mega Menu 管理">
      <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-lg font-semibold text-admin-ink">PRODUCTS Mega Menu</h2><p className="mt-1 text-sm text-admin-muted">关联真实产品分类和产品。草稿不会显示到官网，发布后桌面端与移动端同步更新。</p></div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={value.enabled} disabled={disabled} onChange={(event) => patch({ enabled: event.target.checked })} />启用 PRODUCTS 菜单</label>
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

      <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
        <div><h2 className="font-semibold text-admin-ink">菜单文字与间距</h2><p className="mt-1 text-xs text-admin-muted">修改会立即反映在下方预览。颜色请使用 #RRGGBB 格式。</p></div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <fieldset className="rounded-admin-sm border border-admin-border p-4">
            <legend className="px-2 text-sm font-semibold text-admin-ink">左侧八大分类</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberSetting label="左侧分类字号" value={value.settings.categoryFontSize ?? 17} min={10} max={20} disabled={disabled} onChange={(next) => patchSettings({ categoryFontSize: next })} />
              <NumberSetting label="分类行间距" value={value.settings.categoryRowGap ?? 0} min={0} max={20} disabled={disabled} onChange={(next) => patchSettings({ categoryRowGap: next })} />
              <NumberSetting label="分类上下留白" value={value.settings.categoryRowPaddingY ?? 8} min={6} max={24} disabled={disabled} onChange={(next) => patchSettings({ categoryRowPaddingY: next })} />
              <ColorSetting label="左侧分类文字颜色" value={value.settings.categoryTextColor ?? "#A7A7A7"} disabled={disabled} onChange={(next) => patchSettings({ categoryTextColor: next })} />
              <ColorSetting label="左侧选中文字颜色" value={value.settings.categoryActiveTextColor ?? "#FFFFFF"} disabled={disabled} onChange={(next) => patchSettings({ categoryActiveTextColor: next })} />
            </div>
          </fieldset>
          <fieldset className="rounded-admin-sm border border-admin-border p-4">
            <legend className="px-2 text-sm font-semibold text-admin-ink">右侧标题、产品与链接</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberSetting label="右侧标题字号" value={value.settings.rightHeadingFontSize ?? 24} min={18} max={40} disabled={disabled} onChange={(next) => patchSettings({ rightHeadingFontSize: next })} />
              <ColorSetting label="右侧标题颜色" value={value.settings.rightHeadingColor ?? "#FFFFFF"} disabled={disabled} onChange={(next) => patchSettings({ rightHeadingColor: next })} />
              <NumberSetting label="右侧说明字号" value={value.settings.rightDescriptionFontSize ?? 14} min={11} max={22} disabled={disabled} onChange={(next) => patchSettings({ rightDescriptionFontSize: next })} />
              <ColorSetting label="右侧说明颜色" value={value.settings.rightDescriptionColor ?? "#A7A7A7"} disabled={disabled} onChange={(next) => patchSettings({ rightDescriptionColor: next })} />
              <NumberSetting label="产品标题字号" value={value.settings.productTitleFontSize ?? 17} min={11} max={22} disabled={disabled} onChange={(next) => patchSettings({ productTitleFontSize: next })} />
              <ColorSetting label="产品标题颜色" value={value.settings.productTitleColor ?? "#FFFFFF"} disabled={disabled} onChange={(next) => patchSettings({ productTitleColor: next })} />
              <NumberSetting label="产品说明字号" value={value.settings.productDescriptionFontSize ?? 15} min={10} max={20} disabled={disabled} onChange={(next) => patchSettings({ productDescriptionFontSize: next })} />
              <ColorSetting label="产品说明颜色" value={value.settings.productDescriptionColor ?? "#A7A7A7"} disabled={disabled} onChange={(next) => patchSettings({ productDescriptionColor: next })} />
              <NumberSetting label="链接字号" value={value.settings.rightLinkFontSize ?? 15} min={10} max={18} disabled={disabled} onChange={(next) => patchSettings({ rightLinkFontSize: next })} />
              <ColorSetting label="链接文字颜色" value={value.settings.rightLinkColor ?? "#FFFFFF"} disabled={disabled} onChange={(next) => patchSettings({ rightLinkColor: next })} />
            </div>
          </fieldset>
        </div>
      </div>

      <div className="rounded-admin-lg border border-admin-border bg-white shadow-admin-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4"><div><h2 className="font-semibold text-admin-ink">分类与产品管理</h2><p className="mt-1 text-xs text-admin-muted">上下移动支持键盘操作；移出菜单不会删除产品中心中的数据。</p></div><button type="button" onClick={addMissingCategory} disabled={disabled || value.categories.length >= categories.length} className="inline-flex h-9 items-center gap-1.5 rounded-admin-sm border border-admin-border px-3 text-sm font-semibold disabled:opacity-40"><Plus className="size-4" />添加未配置系列</button></div>
        <div className="divide-y divide-admin-border">{value.categories.map((config, index) => {
          const category = categories.find((item) => item.id === config.categoryId);
          const query = productSearch[config.categoryId]?.trim().toLocaleLowerCase() ?? "";
          const filteredProducts = products.filter((item) => !query || `${item.name} ${item.id} ${item.tagline}`.toLocaleLowerCase().includes(query));
          const enabledProductConfigs = config.products.filter((item) => item.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
          return <article key={config.categoryId} className="p-5" onDragOver={(event) => { if (event.dataTransfer.types.includes("application/x-zyron-category")) event.preventDefault(); }} onDrop={(event) => { const source = Number(event.dataTransfer.getData("application/x-zyron-category")); if (Number.isInteger(source)) moveCategoryTo(source, index); }}>
            <div className="grid gap-3 lg:grid-cols-[40px_1fr_1.2fr_1fr_auto] lg:items-end">
              <button type="button" draggable={!disabled} aria-label={`拖拽排序 ${config.displayName ?? config.categoryId}`} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-zyron-category", String(index)); }} className="grid size-10 place-items-center rounded-admin-sm bg-admin-canvas text-admin-muted" title="拖拽调整分类顺序"><GripVertical className="size-4" /><span className="sr-only">第 {index + 1} 项</span></button>
              <label className="grid gap-1 text-xs font-semibold text-admin-muted">系列显示名称<input aria-label={`系列 ${index + 1} 显示名称`} value={config.displayName ?? category?.navLabel ?? ""} disabled={disabled} onChange={(event) => patchCategory(index, { displayName: event.target.value })} className={inputClass} /></label>
              <label className="grid gap-1 text-xs font-semibold text-admin-muted">系列说明<input aria-label={`系列 ${index + 1} 说明`} value={config.description ?? ""} placeholder={category?.summary} disabled={disabled} onChange={(event) => patchCategory(index, { description: event.target.value || undefined })} className={inputClass} /></label>
              <label className="grid gap-1 text-xs font-semibold text-admin-muted">分类入口地址<input aria-label={`系列 ${index + 1} 入口地址`} value={config.hrefOverride ?? ""} placeholder={category ? `/products?category=${category.id}` : "/products"} disabled={disabled} onChange={(event) => patchCategory(index, { hrefOverride: event.target.value || undefined })} className={inputClass} /></label>
              <div className="flex items-center gap-2 pb-1"><label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={config.enabled} disabled={disabled} onChange={(event) => patchCategory(index, { enabled: event.target.checked })} />显示</label><label className="inline-flex items-center gap-1 text-xs"><input type="radio" name="default-machine-category" checked={config.isDefault} disabled={disabled} onChange={() => patchCategory(index, { isDefault: true })} />默认</label><button type="button" aria-label={`上移 ${config.displayName ?? config.categoryId}`} disabled={disabled || index === 0} onClick={() => moveCategory(index, -1)} className="p-2 disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" aria-label={`下移 ${config.displayName ?? config.categoryId}`} disabled={disabled || index === value.categories.length - 1} onClick={() => moveCategory(index, 1)} className="p-2 disabled:opacity-30"><ArrowDown className="size-4" /></button><button type="button" aria-label={`移出菜单 ${config.displayName ?? config.categoryId}`} disabled={disabled} onClick={() => patch({ categories: value.categories.filter((_, itemIndex) => itemIndex !== index).map((item, sortOrder) => ({ ...item, sortOrder })) })} className="p-2 text-red-600 disabled:opacity-30"><Trash2 className="size-4" /></button></div>
            </div>
            {value.mode === "MANUAL" ? (
              <details className="mt-4 rounded-admin-sm border border-admin-border bg-admin-canvas p-4">
                <summary className="cursor-pointer text-sm font-semibold">产品选择与显示覆盖（已选 {enabledProductConfigs.length} / 全部 {products.length}）</summary>
                <p className="mt-2 text-xs text-admin-muted">可搜索全部真实产品并放入任意导航分类。移除或移动卡片只修改导航，不会改变产品中心的数据与原始分类。</p>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="min-w-[260px] flex-1 text-xs font-semibold text-admin-muted">搜索产品<input type="search" aria-label="搜索可添加产品" value={productSearch[config.categoryId] ?? ""} disabled={disabled} onChange={(event) => setProductSearch((current) => ({ ...current, [config.categoryId]: event.target.value }))} placeholder="输入产品名称、网址标识或说明" className={`${inputClass} mt-1`} /></label>
                  <button type="button" disabled={disabled || filteredProducts.length === 0} onClick={() => assignProducts(index, filteredProducts.map((item) => item.id))} className="h-10 rounded-admin-sm bg-admin-ink px-3 text-xs font-semibold text-white disabled:opacity-40">批量加入筛选结果</button>
                  <button type="button" disabled={disabled || enabledProductConfigs.length === 0} onClick={() => removeProducts(index, filteredProducts.map((item) => item.id))} className="h-10 rounded-admin-sm border border-admin-border bg-white px-3 text-xs font-semibold text-red-600 disabled:opacity-40">批量移出筛选结果</button>
                </div>
                <div className="mt-3 max-h-72 overflow-y-auto rounded-admin-sm border border-admin-border bg-white p-2"><div className="grid gap-2 sm:grid-cols-2">{filteredProducts.map((product) => {
                  const selected = config.products.find((item) => item.productId === product.id)?.enabled ?? false;
                  return <label key={product.id} className="flex items-center gap-3 rounded-admin-sm border border-admin-border bg-white p-3 text-sm"><input type="checkbox" checked={selected} disabled={disabled} onChange={(event) => toggleProduct(index, product.id, event.target.checked)} /><span className="min-w-0"><span className="block truncate font-semibold">{product.name}</span><span className="block truncate text-xs text-admin-muted">{product.categoryId} · /{product.id}</span></span></label>;
                })}</div>{filteredProducts.length === 0 ? <p className="p-4 text-center text-xs text-admin-muted">没有找到匹配的产品</p> : null}</div>
                <div className="mt-4 space-y-3">{enabledProductConfigs.map((productConfig, productIndex, selected) => {
                  const product = products.find((item) => item.id === productConfig.productId);
                  if (!product) return null;
                  const selectedImage = productConfig.imageOverride ?? product.image;
                  const selectedAlt = productConfig.altOverride ?? product.name;
                  return <div key={productConfig.productId} className="rounded-admin-sm border border-admin-border bg-white p-4" onDragOver={(event) => { if (event.dataTransfer.types.includes("application/x-zyron-product")) event.preventDefault(); }} onDrop={(event) => { const sourceProductId = event.dataTransfer.getData("application/x-zyron-product"); if (sourceProductId) moveProductToPosition(index, sourceProductId, product.id); }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2"><button type="button" draggable={!disabled} aria-label={`拖拽排序产品 ${product.name}`} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-zyron-product", product.id); }} className="grid size-8 shrink-0 place-items-center text-admin-muted" title="拖拽调整产品顺序"><GripVertical className="size-4" /></button><p className="truncate text-sm font-semibold">{product.name}</p></div>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <select aria-label={`移动 ${product.name} 到其他分类`} value="" disabled={disabled} onChange={(event) => moveProductToCategory(index, product.id, event.target.value)} className="h-9 max-w-48 rounded-admin-sm border border-admin-border bg-white px-2 text-xs font-semibold"><option value="">移动到其他分类…</option>{value.categories.filter((item) => item.categoryId !== config.categoryId).map((item) => <option key={item.categoryId} value={item.categoryId}>{item.displayName ?? categories.find((categoryItem) => categoryItem.id === item.categoryId)?.navLabel ?? item.categoryId}</option>)}</select>
                        <button type="button" aria-label={`上移产品 ${product.name}`} disabled={disabled || productIndex === 0} onClick={() => moveProduct(index, product.id, -1)} className="p-2 disabled:opacity-30"><ArrowUp className="size-4" /></button>
                        <button type="button" aria-label={`下移产品 ${product.name}`} disabled={disabled || productIndex === selected.length - 1} onClick={() => moveProduct(index, product.id, 1)} className="p-2 disabled:opacity-30"><ArrowDown className="size-4" /></button>
                        <button type="button" aria-label={`移除产品 ${product.name}`} disabled={disabled} onClick={() => toggleProduct(index, product.id, false)} className="inline-flex items-center gap-1 rounded-admin-sm px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 className="size-3.5" />移除</button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-4 lg:grid-cols-[180px_1fr]">
                      <div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-admin-sm bg-admin-canvas"><Image src={selectedImage} alt={selectedAlt} fill sizes="180px" className="object-contain p-2" /></div>
                        <p className="mt-2 break-all text-[11px] text-admin-muted">{productConfig.imageOverride ?? "使用产品原图"}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {!disabled ? <MediaAssetPicker kind="image" label="从媒体资源选择图片" onSelect={(asset) => patchProduct(index, product.id, { imageOverride: asset.url, altOverride: asset.altText || productConfig.altOverride })} /> : null}
                          {productConfig.imageOverride ? <button type="button" disabled={disabled} onClick={() => patchProduct(index, product.id, { imageOverride: undefined, altOverride: undefined })} className="rounded-lg border border-admin-border px-3 py-2 text-xs font-semibold disabled:opacity-30">恢复产品原图</button> : null}
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1 text-xs font-semibold text-admin-muted">显示名称覆盖<input value={productConfig.displayNameOverride ?? ""} placeholder={product.name} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { displayNameOverride: event.target.value || undefined })} className={inputClass} /></label>
                        <label className="grid gap-1 text-xs font-semibold text-admin-muted">图片替代文字<input value={productConfig.altOverride ?? ""} placeholder={product.name} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { altOverride: event.target.value || undefined })} className={inputClass} /></label>
                        <label className="grid gap-1 text-xs font-semibold text-admin-muted md:col-span-2">产品跳转地址<input aria-label={`产品 ${product.name} 跳转地址`} value={productConfig.hrefOverride ?? ""} placeholder={`/products/${product.id}`} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { hrefOverride: event.target.value || undefined })} className={inputClass} /></label>
                        <label className="grid gap-1 text-xs font-semibold text-admin-muted md:col-span-2">简短说明覆盖<input value={productConfig.shortDescriptionOverride ?? ""} placeholder={product.tagline} disabled={disabled} onChange={(event) => patchProduct(index, product.id, { shortDescriptionOverride: event.target.value || undefined })} className={inputClass} /></label>
                      </div>
                    </div>
                  </div>;
                })}</div>
              </details>
            ) : <p className="mt-3 rounded-admin-sm bg-admin-canvas px-4 py-3 text-xs text-admin-muted">当前为自动同步。如需单独添加、移除产品或替换卡片图片，请将“产品同步模式”切换为“手动选择产品”。</p>}
          </article>;
        })}</div>
      </div>

      <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-admin-ink"><Eye className="size-4 text-ignition" />实时预览</h2><p className="mt-1 text-xs text-admin-muted">预览当前草稿，不会影响官网。</p></div><div className="flex rounded-admin-sm border border-admin-border p-1"><button type="button" onClick={() => setPreview("desktop")} className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold ${preview === "desktop" ? "bg-admin-ink text-white" : "text-admin-muted"}`}><Monitor className="size-3.5" />桌面</button><button type="button" onClick={() => setPreview("tablet")} className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold ${preview === "tablet" ? "bg-admin-ink text-white" : "text-admin-muted"}`}><Tablet className="size-3.5" />平板</button><button type="button" onClick={() => setPreview("mobile")} className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold ${preview === "mobile" ? "bg-admin-ink text-white" : "text-admin-muted"}`}><Smartphone className="size-3.5" />移动</button></div></div>
        <div className="mt-4 overflow-auto rounded-admin-sm border border-admin-border bg-white">{preview !== "mobile" ? <div className={preview === "tablet" ? "mx-auto w-[1024px] max-w-full" : "w-full"}><MachinesDesktopPanel view={view} activeCategoryId={activeCategoryId} onActiveCategory={setActiveCategoryId} compact /></div> : <div className="mx-auto min-h-[520px] max-w-[390px] border-x border-neutral-200 p-5"><p className="text-2xl font-semibold">Products</p><p className="mt-1 text-sm text-neutral-500">View All Products</p><div className="mt-6">{view.categories.map((category) => <div key={category.id} className="flex min-h-16 items-center justify-between border-b border-neutral-200 text-sm font-semibold"><span>{category.name}</span><span className="text-neutral-400">{category.count} ›</span></div>)}</div></div>}</div>
      </div>
    </section>
  );
}

function NumberSetting({ label, value, min, max, disabled, onChange }: { label: string; value: number; min: number; max: number; disabled?: boolean; onChange(value: number): void }) {
  return <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">{label}<div className="relative"><input type="number" aria-label={label} value={value} min={min} max={max} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className={`${inputClass} pr-11`} /><span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-[11px] text-admin-muted">px</span></div></label>;
}

function ColorSetting({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange(value: string): void }) {
  const pickerValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000";
  return <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">{label}<span className="flex gap-2"><input type="color" aria-label={`${label}选择器`} value={pickerValue} disabled={disabled} onChange={(event) => onChange(event.target.value.toUpperCase())} className="h-10 w-12 shrink-0 cursor-pointer rounded-admin-sm border border-admin-border bg-white p-1" /><input type="text" aria-label={label} value={value} maxLength={7} pattern="#[0-9A-Fa-f]{6}" disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass} /></span></label>;
}
