"use client";

import { MediaAssetPicker } from "@/components/admin/pages/MediaAssetPicker";
import {
  resolveProductExplorerCardLayout,
  type ProductExplorerCategoryKey,
  type ProductExplorerContent,
} from "@/lib/product-explorer/config";

export type ProductExplorerCategoryOption = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type ProductExplorerProductOption = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  summary: string;
  image: string;
  imageAlt: string;
};

type Props = {
  content: ProductExplorerContent;
  categoryOptions: ProductExplorerCategoryOption[];
  productOptions: ProductExplorerProductOption[];
  onChange(content: ProductExplorerContent): void;
};

const fieldClass = "mt-1 h-9 w-full rounded-md border border-neutral-300 bg-white px-2 text-xs outline-none focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/15";
const textAreaClass = "mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-xs outline-none focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/15";

export function ProductExplorerEditor({ content, categoryOptions, productOptions, onChange }: Props) {
  function update<K extends keyof ProductExplorerContent>(key: K, value: ProductExplorerContent[K]) {
    onChange({ ...content, [key]: value });
  }

  function updateCategory(index: number, changes: Partial<ProductExplorerContent["categories"][number]>) {
    update("categories", content.categories.map((category, categoryIndex) =>
      categoryIndex === index ? { ...category, ...changes } : category,
    ));
  }

  function updateProductOverride(product: ProductExplorerProductOption, changes: Partial<ProductExplorerContent["productCardOverrides"][number]>) {
    const current = content.productCardOverrides.find((item) => item.productId === product.id);
    const next = {
      productId: product.id,
      title: product.name,
      summary: product.summary,
      image: product.image,
      imageAlt: product.imageAlt,
      ...current,
      ...changes,
    };
    update("productCardOverrides", [
      ...content.productCardOverrides.filter((item) => item.productId !== product.id),
      next,
    ]);
  }

  function restoreProductDefaults(productId: string) {
    update("productCardOverrides", content.productCardOverrides.filter((item) => item.productId !== productId));
  }

  function updateProductLayout(
    categoryKey: ProductExplorerCategoryKey,
    orderedProductIds: string[],
    hiddenProductIds: string[],
  ) {
    update("productCardLayouts", [
      ...content.productCardLayouts.filter((item) => item.categoryKey !== categoryKey),
      { categoryKey, orderedProductIds, hiddenProductIds },
    ]);
  }

  function moveProduct(
    categoryKey: ProductExplorerCategoryKey,
    visibleProducts: ProductExplorerProductOption[],
    productId: string,
    direction: -1 | 1,
  ) {
    const orderedProductIds = visibleProducts.map((product) => product.id);
    const currentIndex = orderedProductIds.indexOf(productId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedProductIds.length) return;
    [orderedProductIds[currentIndex], orderedProductIds[nextIndex]] = [orderedProductIds[nextIndex], orderedProductIds[currentIndex]];
    const layout = content.productCardLayouts.find((item) => item.categoryKey === categoryKey);
    updateProductLayout(categoryKey, orderedProductIds, layout?.hiddenProductIds ?? []);
  }

  function removeProduct(
    categoryKey: ProductExplorerCategoryKey,
    visibleProducts: ProductExplorerProductOption[],
    productId: string,
  ) {
    const layout = content.productCardLayouts.find((item) => item.categoryKey === categoryKey);
    updateProductLayout(
      categoryKey,
      visibleProducts.filter((product) => product.id !== productId).map((product) => product.id),
      Array.from(new Set([...(layout?.hiddenProductIds ?? []), productId])),
    );
  }

  function addProduct(
    categoryKey: ProductExplorerCategoryKey,
    visibleProducts: ProductExplorerProductOption[],
    productId: string,
  ) {
    const layout = content.productCardLayouts.find((item) => item.categoryKey === categoryKey);
    updateProductLayout(
      categoryKey,
      [...visibleProducts.map((product) => product.id), productId],
      (layout?.hiddenProductIds ?? []).filter((id) => id !== productId),
    );
  }

  function restoreProductLayout(categoryKey: ProductExplorerCategoryKey) {
    update("productCardLayouts", content.productCardLayouts.filter((item) => item.categoryKey !== categoryKey));
  }

  const textFields: Array<[keyof ProductExplorerContent, string, number]> = [
    ["eyebrow", "品牌标签", 2],
    ["title", "主标题", 3],
    ["subtitle", "绿色副标题", 2],
    ["description", "说明文字", 3],
    ["primaryLabel", "主按钮文字", 2],
    ["secondaryLabel", "次按钮文字", 2],
  ];
  const colorFields: Array<[keyof ProductExplorerContent, string]> = [
    ["backgroundColor", "首屏背景色"],
    ["panelColor", "首屏层次色"],
    ["accentColor", "品牌强调色"],
    ["textColor", "主文字颜色"],
    ["mutedTextColor", "次文字颜色"],
    ["productSectionBackground", "产品区背景色"],
    ["cardBackground", "产品卡片背景"],
    ["cardBorderColor", "产品卡片边框"],
  ];

  return (
    <div className="space-y-5" data-product-explorer-editor>
      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <h4 className="text-xs font-bold text-neutral-900">基础文案</h4>
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-medium text-neutral-600">全幅背景图片地址
            <input aria-label="全幅背景图片地址" value={content.backgroundImage} onChange={(event) => update("backgroundImage", event.target.value)} className={fieldClass} />
          </label>
          <MediaAssetPicker
            label="从媒体资源库替换全幅背景图"
            kind="image"
            onSelect={(media) => update("backgroundImage", media.url)}
          />
          {textFields.map(([key, label, rows]) => (
            <label key={key} className="block text-xs font-medium text-neutral-600">
              {label}
              <textarea
                aria-label={label}
                rows={rows}
                value={String(content[key])}
                onChange={(event) => update(key, event.target.value as never)}
                className={textAreaClass}
              />
            </label>
          ))}
          <label className="block text-xs font-medium text-neutral-600">主按钮链接
            <input aria-label="主按钮链接" value={content.primaryHref} onChange={(event) => update("primaryHref", event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-neutral-600">次按钮链接
            <input aria-label="次按钮链接" value={content.secondaryHref} onChange={(event) => update("secondaryHref", event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-neutral-600">默认显示分类
            <select aria-label="默认显示分类" value={content.defaultCategoryKey} onChange={(event) => update("defaultCategoryKey", event.target.value as ProductExplorerContent["defaultCategoryKey"])} className={fieldClass}>
              {content.categories.map((category) => <option key={category.key} value={category.key}>{category.number} · {category.navLabel}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 p-3">
        <h4 className="text-xs font-bold text-neutral-900">版面与产品卡片</h4>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {([
            ["maxWidth", "最大宽度"], ["heroHeight", "首屏高度"], ["animationMs", "切换动画毫秒"],
            ["cardRadius", "卡片圆角"], ["cardGap", "卡片间距"], ["desktopCards", "桌面卡片数"],
            ["tabletCards", "平板卡片数"], ["mobileCards", "手机卡片数"],
          ] as Array<[keyof ProductExplorerContent, string]>).map(([key, label]) => (
            <label key={key} className="text-xs font-medium text-neutral-600">{label}
              <input type="number" aria-label={label} step={key.toString().includes("Cards") ? "0.1" : "1"} value={Number(content[key])} onChange={(event) => update(key, Number(event.target.value) as never)} className={fieldClass} />
            </label>
          ))}
          <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={content.showArrows} onChange={(event) => update("showArrows", event.target.checked)} />显示桌面切换箭头</label>
          <label className="col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={content.showProgress} onChange={(event) => update("showProgress", event.target.checked)} />显示横向浏览进度</label>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 p-3">
        <h4 className="text-xs font-bold text-neutral-900">颜色</h4>
        <div className="mt-3 space-y-2">
          {colorFields.map(([key, label]) => (
            <label key={key} className="grid grid-cols-[42px_1fr] items-end gap-2 text-xs font-medium text-neutral-600">
              <input type="color" aria-label={`${label}选择器`} value={String(content[key])} onChange={(event) => update(key, event.target.value as never)} className="h-9 w-10 rounded border" />
              <span>{label}<input aria-label={label} value={String(content[key])} onChange={(event) => update(key, event.target.value as never)} className={fieldClass} /></span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-neutral-900">八大固定产品分类</h4>
          <p className="mt-1 text-[11px] leading-5 text-neutral-500">序号、导航名称和顺序固定；请选择真实数据库分类。产品卡片会自动读取该分类下全部已发布产品。</p>
        </div>
        {content.categories.map((category, index) => {
          const categoryProducts = productOptions.filter((product) => product.categoryId === category.categoryId);
          const visibleProducts = resolveProductExplorerCardLayout(category.key, categoryProducts, content.productCardLayouts);
          const layout = content.productCardLayouts.find((item) => item.categoryKey === category.key);
          const hiddenProductIds = new Set(layout?.hiddenProductIds ?? []);
          const hiddenProducts = categoryProducts.filter((product) => hiddenProductIds.has(product.id));
          return (
          <article key={category.key} className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-xs text-neutral-900">{category.number} · {category.navLabel}</strong>
              <span className="rounded-full bg-lime-100 px-2 py-1 text-[10px] font-bold text-lime-800">固定分类位</span>
            </div>
            <div className="mt-3 space-y-3">
              <label className="block text-xs font-medium text-neutral-600">真实产品分类
                <select aria-label={`第 ${index + 1} 类真实产品分类`} value={category.categoryId} onChange={(event) => {
                  const option = categoryOptions.find((item) => item.id === event.target.value);
                  updateCategory(index, {
                    categoryId: event.target.value,
                    ...(option ? { seriesHref: `/products/series/${option.slug}` } : {}),
                  });
                }} className={fieldClass}>
                  <option value="">请选择分类</option>
                  {categoryOptions.map((option) => <option key={option.id} value={option.id}>{option.name} · {option.status === "PUBLISHED" ? "已发布" : "未发布"}</option>)}
                </select>
              </label>
              <label className="block text-xs font-medium text-neutral-600">系列标题
                <textarea aria-label={`第 ${index + 1} 类系列标题`} rows={2} value={category.fullSeriesName} onChange={(event) => updateCategory(index, { fullSeriesName: event.target.value })} className={textAreaClass} />
              </label>
              <label className="block text-xs font-medium text-neutral-600">产品区标题
                <textarea aria-label={`第 ${index + 1} 类产品区标题`} rows={2} value={category.productSectionTitle} onChange={(event) => updateCategory(index, { productSectionTitle: event.target.value })} className={textAreaClass} />
              </label>
              <label className="block text-xs font-medium text-neutral-600">系列按钮文字
                <textarea aria-label={`第 ${index + 1} 类系列按钮文字`} rows={2} value={category.seriesCtaLabel} onChange={(event) => updateCategory(index, { seriesCtaLabel: event.target.value })} className={textAreaClass} />
              </label>
              <label className="block text-xs font-medium text-neutral-600">透明设备图片地址
                <input aria-label={`第 ${index + 1} 类透明设备图片地址`} value={category.heroImage} onChange={(event) => updateCategory(index, { heroImage: event.target.value })} className={fieldClass} />
              </label>
              <MediaAssetPicker
                label={`第 ${index + 1} 类从媒体资源库替换设备图`}
                kind="image"
                onSelect={(media) => updateCategory(index, { heroImage: media.url, heroAlt: media.altText || category.heroAlt })}
              />
              <label className="block text-xs font-medium text-neutral-600">图片替代文字
                <textarea aria-label={`第 ${index + 1} 类图片替代文字`} rows={2} value={category.heroAlt} onChange={(event) => updateCategory(index, { heroAlt: event.target.value })} className={textAreaClass} />
              </label>
              <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3">
                {([
                  ["desktopScale", "桌面缩放", 0.05], ["desktopX", "桌面水平位置", 1], ["desktopY", "桌面垂直位置", 1],
                  ["tabletScale", "平板缩放", 0.05], ["tabletX", "平板水平位置", 1], ["tabletY", "平板垂直位置", 1],
                  ["mobileScale", "手机缩放", 0.05], ["mobileX", "手机水平位置", 1], ["mobileY", "手机垂直位置", 1],
                ] as Array<[keyof typeof category, string, number]>).map(([key, label, step]) => (
                  <label key={key} className="text-[10px] leading-4 text-neutral-500">{label}
                    <input type="number" step={step} aria-label={`第 ${index + 1} 类${label}`} value={Number(category[key])} onChange={(event) => updateCategory(index, { [key]: Number(event.target.value) })} className={fieldClass} />
                  </label>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900">具体产品卡片</h5>
                    <p className="mt-1 text-[10px] leading-4 text-neutral-500">仅覆盖产品总页显示，不修改产品详情页及链接。</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600">
                      显示 {visibleProducts.length} / {categoryProducts.length}
                    </span>
                    <button
                      type="button"
                      disabled={!layout}
                      onClick={() => restoreProductLayout(category.key)}
                      className="rounded border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      第 {index + 1} 类恢复产品默认顺序
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {visibleProducts.map((product, productIndex) => {
                    const override = content.productCardOverrides.find((item) => item.productId === product.id);
                    const values = override ?? {
                      productId: product.id,
                      title: product.name,
                      summary: product.summary,
                      image: product.image,
                      imageAlt: product.imageAlt,
                    };
                    return (
                      <article
                        key={product.id}
                        data-testid="product-card-editor"
                        data-product-id={product.id}
                        className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                        style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <strong className="block truncate text-xs text-neutral-900">{product.name}</strong>
                            <span className="block truncate text-[10px] text-neutral-500">/products/{product.slug}</span>
                          </div>
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              aria-label={`上移 ${product.name}`}
                              disabled={productIndex === 0}
                              onClick={() => moveProduct(category.key, visibleProducts, product.id, -1)}
                              className="rounded border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >上移</button>
                            <button
                              type="button"
                              aria-label={`下移 ${product.name}`}
                              disabled={productIndex === visibleProducts.length - 1}
                              onClick={() => moveProduct(category.key, visibleProducts, product.id, 1)}
                              className="rounded border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >下移</button>
                            <button
                              type="button"
                              aria-label={`从总页移除 ${product.name}`}
                              onClick={() => removeProduct(category.key, visibleProducts, product.id)}
                              className="rounded border border-red-200 bg-white px-2 py-1 text-[10px] font-semibold text-red-700"
                            >移除</button>
                            <button
                              type="button"
                              disabled={!override}
                              onClick={() => restoreProductDefaults(product.id)}
                              className="shrink-0 rounded border border-neutral-300 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              恢复 {product.name} 产品资料
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-3">
                          <label className="block text-xs font-medium text-neutral-600">卡片标题
                            <textarea
                              aria-label={`产品「${product.name}」卡片标题`}
                              rows={2}
                              value={values.title}
                              onChange={(event) => updateProductOverride(product, { title: event.target.value })}
                              className={textAreaClass}
                            />
                          </label>
                          <label className="block text-xs font-medium text-neutral-600">卡片摘要
                            <textarea
                              aria-label={`产品「${product.name}」卡片摘要`}
                              rows={3}
                              value={values.summary}
                              onChange={(event) => updateProductOverride(product, { summary: event.target.value })}
                              className={textAreaClass}
                            />
                          </label>
                          <label className="block text-xs font-medium text-neutral-600">卡片图片地址
                            <input
                              aria-label={`产品「${product.name}」卡片图片地址`}
                              value={values.image}
                              onChange={(event) => updateProductOverride(product, { image: event.target.value })}
                              className={fieldClass}
                            />
                          </label>
                          <MediaAssetPicker
                            label={`产品「${product.name}」从媒体资源库替换卡片图片`}
                            kind="image"
                            onSelect={(media) => updateProductOverride(product, {
                              image: media.url,
                              imageAlt: media.altText || values.imageAlt || product.name,
                            })}
                          />
                          <label className="block text-xs font-medium text-neutral-600">图片替代文字（Alt）
                            <textarea
                              aria-label={`产品「${product.name}」图片替代文字`}
                              rows={2}
                              value={values.imageAlt}
                              onChange={(event) => updateProductOverride(product, { imageAlt: event.target.value })}
                              className={textAreaClass}
                            />
                          </label>
                        </div>
                      </article>
                    );
                  })}
                  {hiddenProducts.length ? (
                    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3">
                      <strong className="text-[11px] text-neutral-700">已从产品总页隐藏</strong>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {hiddenProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            aria-label={`重新添加 ${product.name}`}
                            onClick={() => addProduct(category.key, visibleProducts, product.id)}
                            className="rounded border border-[#76B900]/40 bg-white px-2 py-1 text-[10px] font-semibold text-lime-800 hover:border-[#76B900]"
                          >
                            + {product.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {category.categoryId && categoryProducts.length === 0 ? (
                    <p className="rounded border border-dashed border-neutral-300 p-3 text-center text-[11px] text-neutral-500">该分类暂无已发布产品。</p>
                  ) : null}
                  {!category.categoryId ? (
                    <p className="rounded border border-dashed border-neutral-300 p-3 text-center text-[11px] text-neutral-500">选择真实产品分类后，可编辑该分类下的具体产品卡片。</p>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
          );
        })}
      </section>
    </div>
  );
}
