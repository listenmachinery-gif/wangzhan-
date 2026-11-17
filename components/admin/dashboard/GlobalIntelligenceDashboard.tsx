"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, CircleDot, Clock3, Users } from "lucide-react";

import { LIVE_OVERVIEW_EVENT, getLatestLiveOverview } from "@/lib/analytics/first-party/live-alerts";
import type { FirstPartyOverview } from "@/lib/analytics/first-party/types";
import type { AnalyticsOverview } from "@/lib/analytics/types";
import { ChannelDistribution, ConversionFunnel, ProductRanking } from "@/components/admin/dashboard/DashboardBreakdowns";
import { DashboardKpiGrid } from "@/components/admin/dashboard/DashboardKpiGrid";
import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { DashboardToolbar } from "@/components/admin/dashboard/DashboardToolbar";
import { DataSourceHealth, type DashboardHealthSource } from "@/components/admin/dashboard/DataSourceHealth";
import { InquiryPulse } from "@/components/admin/dashboard/InquiryPulse";
import { MultiSeriesTrendChart } from "@/components/admin/dashboard/MultiSeriesTrendChart";
import { SearchPerformance } from "@/components/admin/dashboard/SearchPerformance";
import { WorldTrafficMap } from "@/components/admin/dashboard/WorldTrafficMap";
import { buildDashboardKpis, buildDashboardTrend, dashboardDateWindow } from "@/lib/dashboard/model";
import type { DashboardContentStats, DashboardFirstPartyReport, DashboardInquiry, DashboardRange } from "@/lib/dashboard/types";

type SourceState<T> = { data: T | null; loading: boolean; error: string | null };
type InquiryResponse = { items: DashboardInquiry[]; total: number; page: number; pageSize: number };

const emptyState = <T,>(): SourceState<T> => ({ data: null, loading: true, error: null });

function aborted(error: unknown) {
  return (error instanceof DOMException && error.name === "AbortError") || (error instanceof Error && error.name === "AbortError");
}

async function readJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

function PlaceholderPanel({ title, message }: { title: string; message: string }) {
  return <DashboardPanel title={title}><p className="px-5 py-16 text-center text-sm text-[#89939E]">{message}</p></DashboardPanel>;
}

export function GlobalIntelligenceDashboard({ initialRange, content, canExport, canViewInquiries }: {
  initialRange: DashboardRange;
  content: DashboardContentStats;
  canExport: boolean;
  canViewInquiries: boolean;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(initialRange);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [live, setLive] = useState<FirstPartyOverview | null>(() => getLatestLiveOverview());
  const [firstParty, setFirstParty] = useState<SourceState<DashboardFirstPartyReport>>(emptyState);
  const [google, setGoogle] = useState<SourceState<AnalyticsOverview>>(emptyState);
  const [inquiries, setInquiries] = useState<SourceState<InquiryResponse>>(() => canViewInquiries ? emptyState() : { data: null, loading: false, error: null });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const dateWindow = useMemo(() => dashboardDateWindow(range), [range]);
  const exportHref = `/api/admin/analytics/reports/export?from=${encodeURIComponent(dateWindow.from)}&to=${encodeURIComponent(dateWindow.to)}`;

  const refresh = useCallback(() => setRefreshVersion((value) => value + 1), []);

  useEffect(() => {
    const receive = (event: Event) => setLive((event as CustomEvent<FirstPartyOverview>).detail);
    window.addEventListener(LIVE_OVERVIEW_EVENT, receive);
    return () => window.removeEventListener(LIVE_OVERVIEW_EVENT, receive);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refresh]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const reportController = new AbortController();
    const googleController = new AbortController();
    const inquiryController = new AbortController();

    setFirstParty((current) => ({ ...current, loading: true, error: null }));
    setGoogle((current) => ({ ...current, loading: true, error: null }));

    readJson<DashboardFirstPartyReport>(`/api/admin/analytics/reports?from=${encodeURIComponent(dateWindow.from)}&to=${encodeURIComponent(dateWindow.to)}`, reportController.signal)
      .then((data) => { setFirstParty({ data, loading: false, error: null }); setUpdatedAt(new Date().toISOString()); })
      .catch((error: unknown) => { if (!aborted(error)) setFirstParty((current) => ({ ...current, loading: false, error: "第一方汇总暂时不可用" })); });

    readJson<AnalyticsOverview>(`/api/admin/analytics/overview?range=${range}`, googleController.signal)
      .then((data) => { setGoogle({ data, loading: false, error: null }); setUpdatedAt(new Date().toISOString()); })
      .catch((error: unknown) => { if (!aborted(error)) setGoogle((current) => ({ ...current, loading: false, error: "Google 报表暂时不可用" })); });

    if (canViewInquiries) {
      setInquiries((current) => ({ ...current, loading: true, error: null }));
      readJson<InquiryResponse>("/api/admin/inquiries?page=1&pageSize=6", inquiryController.signal)
        .then((data) => { setInquiries({ data, loading: false, error: null }); setUpdatedAt(new Date().toISOString()); })
        .catch((error: unknown) => { if (!aborted(error)) setInquiries((current) => ({ ...current, loading: false, error: "询盘数据暂时不可用" })); });
    }

    return () => {
      reportController.abort();
      googleController.abort();
      inquiryController.abort();
    };
  }, [canViewInquiries, range, refreshVersion, dateWindow.from, dateWindow.to]);

  const countries = firstParty.data?.firstParty.countries ?? [];
  const devices = firstParty.data?.firstParty.devices ?? [];
  const visibleCountries = selectedCountry ? countries.filter((row) => row.value === selectedCountry) : countries;
  const visibleDevices = selectedDevice ? devices.filter((row) => row.value === selectedDevice) : devices;
  const kpis = buildDashboardKpis({ live, firstParty: firstParty.data, google: google.data, content });
  const sourceStates: DashboardHealthSource[] = [
    { label: "第一方分析", status: firstParty.loading ? "loading" : firstParty.data ? "healthy" : "unavailable", message: firstParty.loading ? "正在读取汇总" : firstParty.data ? `已覆盖 ${firstParty.data.range.from} 至 ${firstParty.data.range.to}` : firstParty.error ?? "暂不可用", href: "/admin/analytics/reports" },
    { label: "Google Analytics 4", status: google.loading ? "loading" : google.data?.ga4.state.code === "CONNECTED" || google.data?.ga4.state.code === "NO_DATA" ? "healthy" : "unavailable", message: google.error ?? google.data?.ga4.state.message ?? "等待连接状态", href: "/admin/analytics" },
    { label: "Search Console", status: google.loading ? "loading" : google.data?.searchConsole.state.code === "CONNECTED" || google.data?.searchConsole.state.code === "NO_DATA" ? "healthy" : "unavailable", message: google.error ?? google.data?.searchConsole.state.message ?? "等待连接状态", href: "/admin/analytics" },
    { label: "询盘 CRM", status: !canViewInquiries ? "restricted" : inquiries.loading ? "loading" : inquiries.data ? "healthy" : "unavailable", message: !canViewInquiries ? "当前账号无询盘读取权限" : inquiries.loading ? "正在读取询盘" : inquiries.data ? `权限范围内共 ${inquiries.data.total} 条` : inquiries.error ?? "暂不可用", href: "/admin/inquiries" },
  ];
  const healthySources = sourceStates.filter((source) => source.status === "healthy" || source.status === "restricted").length;
  const refreshing = firstParty.loading || google.loading || inquiries.loading;

  function selectRange(next: DashboardRange) {
    if (next === range) return;
    setRange(next);
    router.replace(`/admin?range=${next}`, { scroll: false });
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await rootRef.current?.requestFullscreen();
  }

  return (
    <div ref={rootRef} className="global-intelligence-dashboard relative -mx-4 min-h-screen overflow-x-clip bg-[#0B0D10] px-3 py-5 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative mx-auto max-w-[1920px] space-y-4">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#76B900]"><CircleDot className="size-3 animate-pulse" aria-hidden />数据总览 · 实时指挥中心</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">ZYRON 全球业务数据中心</h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[#8D98A3]">第一方实时运营、GA4、Search Console 与 CRM 独立校验。所有数字均来自受保护的真实接口。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-[#8D98A3]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-2"><Activity className="size-3 text-[#76B900]" />{healthySources}/{sourceStates.length} 个数据源可用</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-2"><Clock3 className="size-3" />{updatedAt ? `更新于 ${new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(updatedAt))}` : "正在读取数据"}</span>
          </div>
        </header>

        <DashboardToolbar range={range} countries={countries} devices={devices} selectedCountry={selectedCountry} selectedDevice={selectedDevice} canExport={canExport} exportHref={exportHref} autoRefresh={autoRefresh} refreshing={refreshing} isFullscreen={isFullscreen} onRange={selectRange} onCountry={setSelectedCountry} onDevice={setSelectedDevice} onRefresh={refresh} onAutoRefresh={setAutoRefresh} onFullscreen={toggleFullscreen} />

        {(firstParty.error || google.error || inquiries.error) ? <div role="alert" className="flex flex-wrap gap-x-5 gap-y-1 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-xs text-amber-100">{[firstParty.error, google.error, inquiries.error].filter(Boolean).map((error) => <span key={error}>{error}</span>)}</div> : null}

        <DashboardKpiGrid kpis={kpis} />

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8"><MultiSeriesTrendChart points={buildDashboardTrend(firstParty.data)} /></div>
          <DashboardPanel title="实时访客指挥区" description="来自第一方匿名实时数据" className="xl:col-span-4">
            <div className="grid grid-cols-2 gap-px bg-white/[0.07]">
              {[
                ["当前在线", live?.summary.onlineVisitors],
                ["5 分钟活跃", live?.summary.activeVisitors],
                ["今日访客", live?.summary.visitorsToday],
                ["今日浏览", live?.summary.pageViewsToday],
              ].map(([label, value]) => <div key={String(label)} className="bg-[#161A20] p-5"><p className="text-[11px] text-[#89939E]">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{typeof value === "number" ? value.toLocaleString("zh-CN") : "--"}</p></div>)}
            </div>
            <div className="flex items-center gap-2 border-t border-white/[0.08] px-5 py-4 text-[11px] text-[#89939E]"><Users className="size-3.5 text-[#76B900]" />实时身份仅为匿名统计，不推断具体客户</div>
          </DashboardPanel>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8"><WorldTrafficMap countries={visibleCountries} selectedCountry={selectedCountry} onSelectCountry={setSelectedCountry} /></div>
          <div className="space-y-4 xl:col-span-4">
            <ChannelDistribution rows={firstParty.data?.firstParty.sources ?? []} />
            <DashboardPanel title="设备结构" description="仅影响设备维度；不改写全局指标">
              {visibleDevices.length === 0 ? <p className="px-5 py-10 text-center text-sm text-[#89939E]">所选周期暂无设备数据</p> : <ul className="divide-y divide-white/[0.07] px-5">{visibleDevices.map((row) => <li key={row.value} className="flex items-center justify-between py-3 text-xs"><span className="uppercase text-[#A5AEB7]">{row.value}</span><strong className="tabular-nums text-white">{row.visitors.toLocaleString("zh-CN")}</strong></li>)}</ul>}
            </DashboardPanel>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5">{firstParty.data ? <ConversionFunnel funnel={firstParty.data.firstParty.funnel} /> : <PlaceholderPanel title="第一方转化漏斗" message={firstParty.loading ? "正在读取第一方漏斗…" : "暂无可用数据"} />}</div>
          <div className="xl:col-span-7"><ProductRanking rows={firstParty.data?.firstParty.products ?? []} /></div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7"><SearchPerformance result={google.data?.searchConsole ?? null} loading={google.loading} error={google.error} /></div>
          <div className="xl:col-span-5"><InquiryPulse rows={inquiries.data?.items ?? []} loading={inquiries.loading} error={inquiries.error} canView={canViewInquiries} /></div>
        </div>

        <DataSourceHealth sources={sourceStates} />
      </div>
    </div>
  );
}
