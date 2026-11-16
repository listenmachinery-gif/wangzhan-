import { redirect } from "next/navigation";

import { AnalyticsReports } from "@/components/admin/analytics/reports/AnalyticsReports";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsReportsPage() {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "analytics.read.summary")) redirect("/admin");
  const today = new Date();
  const from = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1_000);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Revenue intelligence"
        title="外贸增长报告"
        description="用第一方访问、在线沟通和询盘关联数据识别高价值市场与产品；Google 数据保持独立汇总，不进行个人级归因。"
      />
      <AnalyticsReports
        initialFrom={from.toISOString().slice(0, 10)}
        initialTo={today.toISOString().slice(0, 10)}
        canExport={can(principal, "analytics.export")}
      />
    </div>
  );
}
