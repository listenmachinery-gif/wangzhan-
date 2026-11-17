import Link from "next/link";

import { adminEnumLabels } from "@/lib/admin/localization";
import { countryOptionsZh, getCountryName } from "@/lib/shipping/countries";

type ShippingListItem = {
  id: string;
  slug: string;
  status: string;
  version: number;
  publishedVersion: number | null;
  publishedAt: string | null;
  publishedShipmentDate: string | null;
  publishedCountryCode: string | null;
  categoryId: string | null;
  productId: string | null;
  coverMediaId: string | null;
  updatedAt: string;
  draftContent: unknown;
};

type Filters = {
  query?: string;
  status?: string;
  countryCode?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
};

function draftSummary(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as { title?: string; shipmentDate?: string; countryCode?: string; equipmentName?: string; quantity?: number };
}

function formatDate(value?: string | null) {
  if (!value) return "未设置";
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}

const inputClass = "h-10 w-full rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink outline-none focus:border-ignition focus:ring-2 focus:ring-ignition/15";

export function ShippingHighlightList({ items, categories, filters }: {
  items: ShippingListItem[];
  categories: { id: string; name: string }[];
  filters: Filters;
}) {
  return (
    <div className="space-y-5">
      <form className="grid gap-3 rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm md:grid-cols-2 xl:grid-cols-7">
        <label className="grid gap-1.5 text-xs font-semibold text-admin-muted xl:col-span-2">关键词
          <input aria-label="关键词" name="query" defaultValue={filters.query ?? ""} placeholder="标题、设备或 Slug" className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">状态
          <select aria-label="状态" name="status" defaultValue={filters.status ?? ""} className={inputClass}><option value="">全部状态</option><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select>
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">国家或地区
          <select aria-label="国家或地区" name="countryCode" defaultValue={filters.countryCode ?? ""} className={inputClass}><option value="">全部国家或地区</option>{countryOptionsZh.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}</select>
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">产品分类
          <select aria-label="产品分类" name="categoryId" defaultValue={filters.categoryId ?? ""} className={inputClass}><option value="">全部分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">发货开始日期
          <input aria-label="发货开始日期" type="date" name="dateFrom" defaultValue={filters.dateFrom ?? ""} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">发货结束日期
          <input aria-label="发货结束日期" type="date" name="dateTo" defaultValue={filters.dateTo ?? ""} className={inputClass} />
        </label>
        <div className="flex items-end gap-2 xl:col-span-7 xl:justify-end">
          <Link href="/admin/shipping-highlights" className="inline-flex h-10 items-center rounded-admin-sm border border-admin-border px-4 text-sm font-semibold">重置</Link>
          <button className="h-10 rounded-admin-sm bg-graphite-950 px-5 text-sm font-semibold text-white">筛选</button>
        </div>
      </form>

      <div className="overflow-hidden rounded-admin-lg border border-admin-border bg-white shadow-admin-sm">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center"><p className="font-semibold text-admin-ink">暂无符合条件的发货记录</p><p className="mt-2 text-sm text-admin-muted">调整筛选条件，或创建第一条真实发货内容。</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-admin-canvas text-xs font-semibold text-admin-muted"><tr><th className="px-5 py-3">发货内容</th><th className="px-5 py-3">国家或地区</th><th className="px-5 py-3">发货日期</th><th className="px-5 py-3">状态</th><th className="px-5 py-3">版本</th><th className="px-5 py-3 text-right">操作</th></tr></thead>
              <tbody className="divide-y divide-admin-border">
                {items.map((item) => {
                  const draft = draftSummary(item.draftContent);
                  const countryCode = draft.countryCode ?? item.publishedCountryCode ?? "";
                  const shipmentDate = draft.shipmentDate ?? item.publishedShipmentDate;
                  return <tr key={item.id} className="align-top">
                    <td className="px-5 py-4"><p className="font-semibold text-admin-ink">{draft.title ?? item.slug}</p><p className="mt-1 text-xs text-admin-muted">{draft.equipmentName ?? "设备未设置"}{draft.quantity ? ` · ${draft.quantity} 台` : ""}</p></td>
                    <td className="px-5 py-4 text-admin-ink">{countryCode ? getCountryName(countryCode, "zh-CN") : "未设置"}</td>
                    <td className="px-5 py-4 text-admin-ink">{formatDate(shipmentDate)}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">{adminEnumLabels[item.status] ?? item.status}</span></td>
                    <td className="px-5 py-4 text-admin-muted">草稿 v{item.version}{item.publishedVersion ? ` · 线上 v${item.publishedVersion}` : ""}</td>
                    <td className="px-5 py-4 text-right"><Link href={`/admin/shipping-highlights/${item.id}`} className="font-semibold text-ignition hover:text-neon">编辑</Link></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
