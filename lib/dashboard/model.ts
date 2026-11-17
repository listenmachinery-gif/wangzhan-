import type {
  DashboardFirstPartyReport,
  DashboardKpi,
  DashboardModelInput,
  DashboardRange,
  DashboardTrendPoint,
} from "@/lib/dashboard/types";

const RANGE_DAYS: Record<DashboardRange, number> = {
  "7d": 7,
  "28d": 28,
  "90d": 90,
};

function dateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function safeNumber(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function dashboardDateWindow(range: DashboardRange, now = new Date()) {
  const { year, month, day } = dateParts(now);
  const end = new Date(Date.UTC(year, month - 1, day) - 24 * 60 * 60 * 1_000);
  const start = new Date(end.getTime() - (RANGE_DAYS[range] - 1) * 24 * 60 * 60 * 1_000);
  return { from: isoDay(start), to: isoDay(end) };
}

export function buildDashboardTrend(report: DashboardFirstPartyReport | null): DashboardTrendPoint[] {
  if (!report) return [];
  return report.firstParty.trend
    .map((point) => ({
      date: point.date,
      visitors: safeNumber(point.visitors),
      sessions: safeNumber(point.sessions),
      pageViews: safeNumber(point.pageViews),
      inquiries: safeNumber(point.inquiries),
    }))
    .toSorted((left, right) => left.date.localeCompare(right.date));
}

function metric(options: Omit<DashboardKpi, "format"> & { format?: DashboardKpi["format"] }): DashboardKpi {
  return { format: "number", ...options };
}

export function buildDashboardKpis({ live, firstParty, google, content }: DashboardModelInput): DashboardKpi[] {
  const realtimeReason = live ? undefined : "等待第一方实时数据";
  const reportReason = firstParty ? undefined : "暂无第一方汇总数据";
  const visitors = firstParty?.firstParty.funnel.visitors ?? null;
  const inquiries = firstParty?.firstParty.funnel.inquirySubmissions ?? null;
  const conversionAvailable = visitors !== null && visitors > 0 && inquiries !== null;
  const ga4Metric = google?.ga4.data?.metrics.activeUsers;
  const searchMetric = google?.searchConsole.data?.metrics.clicks;

  return [
    metric({ id: "online", label: "当前在线", value: live?.summary.onlineVisitors ?? null, available: Boolean(live), source: "第一方实时", reason: realtimeReason }),
    metric({ id: "visitors-today", label: "今日访客", value: live?.summary.visitorsToday ?? null, available: Boolean(live), source: "第一方实时", reason: realtimeReason }),
    metric({ id: "sessions-today", label: "今日会话", value: live?.summary.sessionsToday ?? null, available: Boolean(live), source: "第一方实时", reason: realtimeReason }),
    metric({ id: "page-views-today", label: "今日浏览量", value: live?.summary.pageViewsToday ?? null, available: Boolean(live), source: "第一方实时", reason: realtimeReason }),
    metric({ id: "period-visitors", label: "周期访客", value: visitors, available: visitors !== null, source: "第一方汇总", reason: reportReason }),
    metric({ id: "period-inquiries", label: "周期询盘", value: inquiries, available: inquiries !== null, source: "第一方汇总", reason: reportReason }),
    metric({
      id: "conversion-rate",
      label: "询盘转化率",
      value: conversionAvailable ? inquiries / visitors : null,
      available: conversionAvailable,
      format: "percent",
      source: "第一方汇总",
      reason: firstParty && visitors === 0 ? "所选周期没有访客，无法计算" : reportReason,
    }),
    metric({
      id: "ga4-active-users",
      label: "GA4 活跃用户",
      value: ga4Metric?.value ?? null,
      available: Boolean(ga4Metric),
      source: "GA4",
      reason: google?.ga4.state.message ?? "正在读取 Google 数据",
      changePercent: ga4Metric?.changePercent,
    }),
    metric({
      id: "search-clicks",
      label: "搜索点击",
      value: searchMetric?.value ?? null,
      available: Boolean(searchMetric),
      source: "Search Console",
      reason: google?.searchConsole.state.message ?? "正在读取 Google 数据",
      changePercent: searchMetric?.changePercent,
    }),
    metric({ id: "products-total", label: "产品总数", value: content.products, available: true, source: "CMS" }),
    metric({ id: "published-products", label: "已发布产品", value: content.publishedProducts, available: true, source: "CMS" }),
    metric({ id: "new-leads", label: "新询盘", value: content.newLeads, available: true, source: "CRM" }),
  ];
}
