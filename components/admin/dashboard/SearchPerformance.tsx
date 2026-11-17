import Link from "next/link";
import { ArrowRight, ExternalLink, Search } from "lucide-react";

import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import type { AnalyticsSourceResult, SearchConsoleReport } from "@/lib/analytics/types";

const number = new Intl.NumberFormat("zh-CN");
const decimal = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 });

function pageLabel(value: string) {
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}

export function SearchPerformance({ result, loading, error }: {
  result: AnalyticsSourceResult<SearchConsoleReport> | null;
  loading: boolean;
  error: string | null;
}) {
  const data = result?.data;
  const connected = result?.state.code === "CONNECTED" || result?.state.code === "NO_DATA";
  const hasRows = Boolean(data && (data.queries.length > 0 || data.pages.length > 0));

  return (
    <DashboardPanel title="搜索表现" description="Google Search Console 完整自然日数据" action={<Link href="/admin/analytics" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8DDB00]">查看完整分析<ArrowRight className="size-3" aria-hidden /></Link>}>
      {loading ? <p role="status" className="px-5 py-16 text-center text-sm text-[#89939E]">正在读取 Search Console…</p> : null}
      {!loading && error ? <p role="alert" className="px-5 py-16 text-center text-sm text-amber-200">{error}</p> : null}
      {!loading && !error && result && !connected ? (
        <div className="grid min-h-48 place-items-center px-5 py-10 text-center">
          <div><Search aria-hidden className="mx-auto size-6 text-amber-300" /><p className="mt-3 text-sm font-medium text-white">{result.state.message}</p><Link href="/admin/analytics" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#76B900] px-4 text-xs font-semibold text-[#0B0D10]">前往接入<ExternalLink aria-hidden className="size-3.5" /></Link></div>
        </div>
      ) : null}
      {!loading && !error && connected && data ? (
        <>
          <div className="grid grid-cols-2 gap-px border-b border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            {[
              ["点击", number.format(data.metrics.clicks.value)],
              ["曝光", number.format(data.metrics.impressions.value)],
              ["点击率", percent.format(data.metrics.ctr.value)],
              ["平均排名", decimal.format(data.metrics.position.value)],
            ].map(([label, value]) => <div key={label} className="bg-[#161A20] px-4 py-3"><p className="text-[10px] text-[#78838E]">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums text-white">{value}</p></div>)}
          </div>
          {data.dataThrough ? <p className="border-b border-white/[0.07] px-5 py-2 text-[10px] text-[#69747E]">搜索数据更新至 {data.dataThrough}，通常晚于实时访问数据。</p> : null}
          {!hasRows ? <p className="px-5 py-14 text-center text-sm text-[#89939E]">所选周期暂无搜索词和落地页数据</p> : (
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-white/[0.07] p-4 lg:border-b-0 lg:border-r">
                <h3 className="text-[11px] font-semibold text-[#A5AEB7]">热门搜索词</h3>
                <ol className="mt-3 space-y-2">{data.queries.slice(0, 5).map((row, index) => <li key={row.query} className="flex items-center gap-3 rounded-lg bg-white/[0.025] px-3 py-2.5"><span className="text-[10px] text-[#76B900]">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate text-xs text-white">{row.query}</span><span className="text-[10px] tabular-nums text-[#89939E]">{number.format(row.clicks)} 点击</span></li>)}</ol>
              </div>
              <div className="p-4">
                <h3 className="text-[11px] font-semibold text-[#A5AEB7]">自然搜索落地页</h3>
                <ol className="mt-3 space-y-2">{data.pages.slice(0, 5).map((row, index) => <li key={row.page} className="flex items-center gap-3 rounded-lg bg-white/[0.025] px-3 py-2.5"><span className="text-[10px] text-[#31C7E8]">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1 truncate text-xs text-white" title={row.page}>{pageLabel(row.page)}</span><span className="text-[10px] tabular-nums text-[#89939E]">{number.format(row.clicks)} 点击</span></li>)}</ol>
              </div>
            </div>
          )}
        </>
      ) : null}
      {!loading && !error && !result ? <p className="px-5 py-16 text-center text-sm text-[#89939E]">暂无可用数据</p> : null}
    </DashboardPanel>
  );
}
