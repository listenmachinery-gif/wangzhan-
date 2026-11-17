import { GlobalIntelligenceDashboard } from "@/components/admin/dashboard/GlobalIntelligenceDashboard";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics/types";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getCurrentPrincipal();
  const mayViewAnalytics = principal ? can(principal, "analytics.read.summary") : false;
  const params = await searchParams;
  const requestedRange = typeof params.range === "string" ? params.range : "28d";
  const range = ANALYTICS_RANGES.includes(requestedRange as AnalyticsRange) ? requestedRange as AnalyticsRange : "28d";
  const [products, publishedProducts, newLeads] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.lead.count({ where: { status: "NEW" } }),
  ]);

  if (principal && mayViewAnalytics) {
    const assignedScope = { assigneeId: principal.id, assignmentActive: true };
    const canViewInquiries = can(principal, "lead.read.all") || can(principal, "lead.read.team") || can(principal, "lead.read.assigned", assignedScope);
    return <GlobalIntelligenceDashboard initialRange={range} content={{ products, publishedProducts, newLeads }} canExport={can(principal, "analytics.export")} canViewInquiries={canViewInquiries} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-[#5F9500]">运营概览</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">数据总览</h1>
        <p className="mt-2 text-sm text-neutral-600">这里只显示数据库中的真实运营数据。</p>
      </div>
      <section aria-label="内容统计" className="grid gap-4 sm:grid-cols-3">
        {[
          ["产品总数", products],
          ["已发布产品", publishedProducts],
          ["新询盘", newLeads],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
