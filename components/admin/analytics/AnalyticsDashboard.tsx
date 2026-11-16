"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { ReportTable } from "@/components/admin/analytics/ReportTable";
import { TrendChart } from "@/components/admin/analytics/TrendChart";
import type { AnalyticsOverview, AnalyticsRange, AnalyticsSourceResult, Ga4Report, SearchConsoleReport } from "@/lib/analytics/types";

const ranges: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 天" },
  { value: "28d", label: "28 天" },
  { value: "90d", label: "90 天" },
];

const number = new Intl.NumberFormat("zh-CN");
const decimal = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 });
const eventLabels = {
  inquiry_start: "开始询盘",
  inquiry_submit: "询盘提交",
  whatsapp_click: "WhatsApp 点击",
  email_click: "邮件点击",
  catalog_download: "目录下载",
} as const;

function SourceNotice({ result }: { result: AnalyticsSourceResult<unknown> }) {
  const isHealthy = result.state.code === "CONNECTED" || result.state.code === "NO_DATA";
  return (
    <p className={`rounded-lg border px-4 py-3 text-sm ${isHealthy ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
      {result.state.message}
    </p>
  );
}

function Ga4Panel({ result }: { result: AnalyticsSourceResult<Ga4Report> }) {
  return (
    <section aria-labelledby="ga4-title" className="space-y-4">
      <div>
        <h2 id="ga4-title" className="text-xl font-semibold">Google Analytics 4</h2>
        <p className="mt-1 text-xs text-neutral-500">按 Asia/Shanghai 的完整自然日统计</p>
      </div>
      <SourceNotice result={result} />
      {result.data ? <>
        <p className="text-xs text-neutral-500">GA4 数据更新至 {result.data.dataThrough}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard id="active-users" label="活跃用户" metric={result.data.metrics.activeUsers} />
          <MetricCard id="sessions" label="会话" metric={result.data.metrics.sessions} />
          <MetricCard id="page-views" label="浏览量" metric={result.data.metrics.pageViews} />
          <MetricCard id="engagement-rate" label="互动率" metric={result.data.metrics.engagementRate} format="percent" />
          <MetricCard id="key-events" label="关键事件" metric={result.data.metrics.keyEvents} />
        </div>
        <TrendChart title="访问趋势" accessibleName="GA4 每日活跃用户趋势" points={result.data.daily.map((item) => ({ label: item.date, value: item.activeUsers }))} />
        <div className="grid gap-4 xl:grid-cols-2">
          <ReportTable title="热门页面" columns={[{ key: "name", label: "页面" }, { key: "views", label: "浏览量", align: "right" }, { key: "users", label: "活跃用户", align: "right" }]} rows={result.data.topPages.map((item) => ({ id: item.path, name: <><span className="block font-medium">{item.title || item.path}</span><span className="block truncate text-xs text-neutral-500">{item.path}</span></>, views: number.format(item.pageViews), users: number.format(item.activeUsers) }))} />
          <ReportTable title="流量来源" columns={[{ key: "source", label: "来源 / 媒介" }, { key: "sessions", label: "会话", align: "right" }, { key: "users", label: "用户", align: "right" }]} rows={result.data.acquisition.map((item) => ({ id: `${item.source}/${item.medium}`, source: `${item.source} / ${item.medium}`, sessions: number.format(item.sessions), users: number.format(item.activeUsers) }))} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ReportTable title="访问国家 / 地区" columns={[{ key: "country", label: "国家 / 地区" }, { key: "users", label: "活跃用户", align: "right" }, { key: "sessions", label: "会话", align: "right" }]} rows={result.data.countries.map((item) => ({ id: item.country, country: item.country, users: number.format(item.activeUsers), sessions: number.format(item.sessions) }))} />
          <ReportTable title="转化事件" columns={[{ key: "event", label: "事件" }, { key: "count", label: "次数", align: "right" }]} rows={Object.entries(eventLabels).map(([key, label]) => ({ id: key, event: label, count: number.format(result.data!.events[key as keyof typeof eventLabels]) }))} />
        </div>
      </> : null}
    </section>
  );
}

function SearchConsolePanel({ result }: { result: AnalyticsSourceResult<SearchConsoleReport> }) {
  return (
    <section aria-labelledby="gsc-title" className="space-y-4">
      <div>
        <h2 id="gsc-title" className="text-xl font-semibold">Google Search Console</h2>
        <p className="mt-1 text-xs text-neutral-500">按 America/Los_Angeles 的完整自然日统计；搜索数据通常比 GA4 延迟</p>
      </div>
      <SourceNotice result={result} />
      {result.data ? <>
        <p className="text-xs text-neutral-500">Search Console 数据更新至 {result.data.dataThrough ?? "暂无可用日期"}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard id="search-clicks" label="点击" metric={result.data.metrics.clicks} />
          <MetricCard id="search-impressions" label="展示" metric={result.data.metrics.impressions} />
          <MetricCard id="search-ctr" label="点击率" metric={result.data.metrics.ctr} format="percent" />
          <MetricCard id="search-position" label="平均排名" metric={result.data.metrics.position} format="decimal" inverse />
        </div>
        <TrendChart title="自然搜索趋势" accessibleName="Search Console 每日点击趋势" points={result.data.daily.map((item) => ({ label: item.date, value: item.clicks }))} />
        <div className="grid gap-4 xl:grid-cols-2">
          <ReportTable title="热门搜索词" columns={[{ key: "query", label: "搜索词" }, { key: "clicks", label: "点击", align: "right" }, { key: "impressions", label: "展示", align: "right" }, { key: "ctr", label: "CTR", align: "right" }, { key: "position", label: "排名", align: "right" }]} rows={result.data.queries.map((item) => ({ id: item.query, query: item.query, clicks: number.format(item.clicks), impressions: number.format(item.impressions), ctr: percent.format(item.ctr), position: decimal.format(item.position) }))} />
          <ReportTable title="自然搜索落地页" columns={[{ key: "page", label: "搜索页面" }, { key: "clicks", label: "点击", align: "right" }, { key: "impressions", label: "展示", align: "right" }]} rows={result.data.pages.map((item) => ({ id: item.page, page: <span className="block max-w-md truncate">{item.page}</span>, clicks: number.format(item.clicks), impressions: number.format(item.impressions) }))} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ReportTable title="搜索设备" columns={[{ key: "device", label: "设备" }, { key: "clicks", label: "点击", align: "right" }, { key: "impressions", label: "展示", align: "right" }, { key: "ctr", label: "CTR", align: "right" }, { key: "position", label: "排名", align: "right" }]} rows={result.data.devices.map((item) => ({ id: item.device, device: item.device, clicks: number.format(item.clicks), impressions: number.format(item.impressions), ctr: percent.format(item.ctr), position: decimal.format(item.position) }))} />
          <ReportTable title="搜索国家 / 地区" columns={[{ key: "country", label: "国家 / 地区" }, { key: "clicks", label: "点击", align: "right" }, { key: "impressions", label: "展示", align: "right" }, { key: "ctr", label: "CTR", align: "right" }, { key: "position", label: "排名", align: "right" }]} rows={result.data.countries.map((item) => ({ id: item.country, country: item.country, clicks: number.format(item.clicks), impressions: number.format(item.impressions), ctr: percent.format(item.ctr), position: decimal.format(item.position) }))} />
        </div>
      </> : null}
    </section>
  );
}

export function AnalyticsDashboard({ initialRange }: { initialRange: AnalyticsRange }) {
  const router = useRouter();
  const [range, setRange] = useState(initialRange);
  const [report, setReport] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setReport(null);
    setError(false);
    fetch(`/api/admin/analytics/overview?range=${range}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Analytics request failed");
        return response.json() as Promise<AnalyticsOverview>;
      })
      .then(setReport)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(true);
      });
    return () => controller.abort();
  }, [range]);

  function selectRange(nextRange: AnalyticsRange) {
    if (nextRange === range) return;
    setRange(nextRange);
    router.replace(`/admin/analytics?range=${nextRange}`, { scroll: false });
  }

  return (
    <div className="space-y-8">
      <div role="group" aria-label="统计日期范围" className="flex flex-wrap gap-2">
        {ranges.map((option) => <button key={option.value} type="button" onClick={() => selectRange(option.value)} aria-pressed={range === option.value} className={`rounded-full px-4 py-2 text-sm font-semibold ${range === option.value ? "bg-[#0B0D10] text-white" : "border border-neutral-300 bg-white text-neutral-700"}`}>{option.label}</button>)}
      </div>
      {!report && !error ? <p role="status" className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600">正在读取 Google 报表…</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">暂时无法读取分析报表，请稍后重试。</p> : null}
      {report ? <>
        <Ga4Panel result={report.ga4} />
        <SearchConsolePanel result={report.searchConsole} />
      </> : null}
    </div>
  );
}
