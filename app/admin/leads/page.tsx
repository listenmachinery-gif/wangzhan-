import Link from "next/link";
import { redirect } from "next/navigation";

import { LeadTable } from "@/components/admin/leads/LeadTable";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { LeadService } from "@/lib/services/lead-service";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  const raw = await searchParams;
  const query = Object.fromEntries(Object.entries(raw).flatMap(([key, value]) => typeof value === "string" ? [[key, value]] : []));
  const result = await new LeadService().list(principal, query);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#5F9500]">销售工作台</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">询盘 CRM</h1><p className="mt-2 text-sm text-neutral-600">询盘先可靠入库，再进行通知、分配与跟进。</p></div><Link href="/api/admin/leads/export" className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold">导出授权范围 CSV</Link></div>
      <form className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_180px_auto]">
        <input name="query" defaultValue={query.query} placeholder="搜索姓名、公司或邮箱" className="h-11 rounded-lg border border-neutral-300 px-3" />
        <select name="status" defaultValue={query.status || ""} className="h-11 rounded-lg border border-neutral-300 px-3"><option value="">全部状态</option>{["NEW", "CONTACTED", "IN_DISCUSSION", "QUOTED", "WON", "LOST", "SPAM"].map((status) => <option key={status}>{status}</option>)}</select>
        <button className="h-11 rounded-lg bg-[#0B0D10] px-5 font-semibold text-white">筛选</button>
      </form>
      <LeadTable leads={result.items} />
      <p className="text-sm text-neutral-500">共 {result.total} 条 · 第 {result.page} 页</p>
    </div>
  );
}
