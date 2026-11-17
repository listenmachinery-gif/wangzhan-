import Link from "next/link";

export type VisitorFilterValues = {
  from?: string;
  to?: string;
  source?: string;
  countryCode?: string;
  deviceType?: string;
  status?: string;
  productId?: string;
};

const inputClass = "mt-1.5 h-10 w-full rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink outline-none transition duration-admin focus:border-ignition focus:ring-2 focus:ring-ignition/20";

export function VisitorFilters({ values, products }: {
  values: VisitorFilterValues;
  products: Array<{ id: string; name: string }>;
}) {
  return (
    <form action="/admin/analytics/visitors" method="get" className="rounded-admin border border-admin-border bg-white p-5 shadow-admin-card">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-medium text-admin-muted">开始日期<input className={inputClass} type="date" name="from" defaultValue={values.from} /></label>
        <label className="text-xs font-medium text-admin-muted">结束日期<input className={inputClass} type="date" name="to" defaultValue={values.to} /></label>
        <label className="text-xs font-medium text-admin-muted">流量来源<input className={inputClass} name="source" maxLength={200} placeholder="例如：Google" defaultValue={values.source} /></label>
        <label className="text-xs font-medium text-admin-muted">国家 / 地区（ISO 代码）<input className={inputClass} name="countryCode" maxLength={2} placeholder="例如：US（美国）" defaultValue={values.countryCode} /></label>
        <label className="text-xs font-medium text-admin-muted">设备
          <select className={inputClass} name="deviceType" defaultValue={values.deviceType ?? ""}>
            <option value="">全部设备</option><option value="desktop">桌面端</option><option value="mobile">移动端</option><option value="tablet">平板</option>
          </select>
        </label>
        <label className="text-xs font-medium text-admin-muted">访客状态
          <select className={inputClass} name="status" defaultValue={values.status ?? ""}>
            <option value="">全部状态</option><option value="online">当前在线</option><option value="active">5 分钟活跃</option><option value="offline">离线</option>
          </select>
        </label>
        <label className="text-xs font-medium text-admin-muted md:col-span-2">浏览产品
          <select className={inputClass} name="productId" defaultValue={values.productId ?? ""}>
            <option value="">全部产品</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-admin-border pt-4">
        <Link href="/admin/analytics/visitors" className="rounded-admin-sm border border-admin-border px-4 py-2 text-sm font-semibold text-admin-muted outline-none transition duration-admin hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-ignition">清除筛选</Link>
        <button type="submit" className="rounded-admin-sm bg-graphite-950 px-4 py-2 text-sm font-semibold text-white outline-none transition duration-admin hover:bg-graphite-700 focus-visible:ring-2 focus-visible:ring-ignition focus-visible:ring-offset-2">应用筛选</button>
      </div>
    </form>
  );
}
