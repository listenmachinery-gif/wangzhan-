import Link from "next/link";
import { Download } from "lucide-react";
import { redirect } from "next/navigation";

import { VisitorFilters } from "@/components/admin/analytics/visitors/VisitorFilters";
import { VisitorTable } from "@/components/admin/analytics/visitors/VisitorTable";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";
import { visitorListQuerySchema } from "@/lib/validation/visitor-analytics";

export const dynamic = "force-dynamic";

function singleValueParams(input: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(Object.entries(input).flatMap(([key, value]) => typeof value === "string" ? [[key, value]] : []));
}

export default async function AdminVisitorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "analytics.read.visitors")) redirect("/admin");
  const raw = singleValueParams(await searchParams);
  const parsed = visitorListQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : visitorListQuerySchema.parse({});
  const now = new Date();
  const [result, products] = await Promise.all([
    new VisitorAnalyticsQueryService().listVisitors(principal, { environment: currentAnalyticsEnvironment(), ...query }, now),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 }),
  ]);
  const filters = new URLSearchParams();
  if (query.from) filters.set("from", query.from.toISOString().slice(0, 10));
  if (query.to) filters.set("to", query.to.toISOString().slice(0, 10));
  if (query.source) filters.set("source", query.source);
  if (query.countryCode) filters.set("countryCode", query.countryCode);
  if (query.deviceType) filters.set("deviceType", query.deviceType);
  if (query.status) filters.set("status", query.status);
  if (query.productId) filters.set("productId", query.productId);
  if (query.pageSize !== 20) filters.set("pageSize", String(query.pageSize));
  const baseQuery = filters.toString();
  const exportHref = `/api/admin/analytics/visitors/export${baseQuery ? `?${baseQuery}` : ""}`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="客户增长"
        title="访客分析"
        description="查看已同意统计的匿名访问轨迹，按来源、地区、设备和产品筛选，并导出当前结果。"
        actions={can(principal, "analytics.export") ? <Link href={exportHref} className="inline-flex items-center gap-2 rounded-admin-sm bg-graphite-950 px-4 py-2 text-sm font-semibold text-white transition duration-admin hover:bg-graphite-700"><Download aria-hidden className="size-4" />导出当前结果</Link> : undefined}
      />
      {!parsed.success && Object.keys(raw).length > 0 ? <p role="alert" className="rounded-admin-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">部分筛选条件无效，已恢复为默认条件。</p> : null}
      <VisitorFilters
        values={{
          from: query.from?.toISOString().slice(0, 10), to: query.to?.toISOString().slice(0, 10), source: query.source,
          countryCode: query.countryCode, deviceType: query.deviceType, status: query.status, productId: query.productId,
        }}
        products={products}
      />
      <VisitorTable {...result} now={now} baseQuery={baseQuery} />
    </div>
  );
}
