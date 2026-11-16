import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics/types";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "analytics.read.summary")) redirect("/admin");
  const params = await searchParams;
  const requested = typeof params.range === "string" ? params.range : "28d";
  const range = ANALYTICS_RANGES.includes(requested as AnalyticsRange) ? requested as AnalyticsRange : "28d";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="经营概览"
        title="数据分析"
        description="统一查看 ZYRON 第一方实时访客、Google Analytics 4 与 Search Console 的真实数据。"
        actions={<Link href="/admin/analytics/reports" className="inline-flex items-center gap-2 rounded-admin-sm bg-graphite-950 px-4 py-2 text-sm font-semibold text-white transition duration-admin hover:bg-graphite-700">外贸增长报告<ArrowUpRight aria-hidden className="size-4" /></Link>}
      />
      <AnalyticsDashboard initialRange={range} />
    </div>
  );
}
