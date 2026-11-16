import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics/types";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "settings.write")) redirect("/admin");
  const params = await searchParams;
  const requested = typeof params.range === "string" ? params.range : "28d";
  const range = ANALYTICS_RANGES.includes(requested as AnalyticsRange) ? requested as AnalyticsRange : "28d";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#5F9500]">增长与搜索表现</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">数据分析</h1>
        <p className="mt-2 text-sm text-neutral-600">查看 Google Analytics 4 与 Search Console 的只读真实报表。</p>
      </div>
      <AnalyticsDashboard initialRange={range} />
    </div>
  );
}
