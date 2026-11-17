// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalIntelligenceDashboard } from "@/components/admin/dashboard/GlobalIntelligenceDashboard";
import { LIVE_OVERVIEW_EVENT } from "@/lib/analytics/first-party/live-alerts";

const mocks = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/components/admin/dashboard/WorldTrafficMap", () => ({
  WorldTrafficMap: ({ countries, onSelectCountry }: { countries: Array<{ value: string }>; onSelectCountry: (value: string) => void }) => (
    <section aria-label="全球流量分布">
      <button type="button" onClick={() => onSelectCountry(countries[0]?.value ?? "")}>选择美国</button>
    </section>
  ),
}));

const firstPartyReport = {
  range: { from: "2026-10-21", to: "2026-11-17" },
  environment: "PRODUCTION",
  firstParty: {
    trend: [{ date: "2026-11-17", visitors: 18, sessions: 22, pageViews: 48, inquiries: 2 }],
    sources: [{ value: "google", visitors: 12, sessions: 14, pageViews: 30, events: 4, inquiries: 2 }],
    countries: [{ value: "US", visitors: 9, sessions: 11, pageViews: 24, events: 3, inquiries: 1 }],
    devices: [{ value: "desktop", visitors: 10, sessions: 12, pageViews: 25, events: 3, inquiries: 1 }],
    products: [{ value: "p1", label: "小型电动剪板机", visitors: 8, sessions: 9, pageViews: 18, events: 2, inquiries: 1 }],
    funnel: { visitors: 18, chatVisitors: 5, linkedLeads: 3, inquirySubmissions: 2, chatToLeadRate: 0.6 },
  },
};

const googleOverview = {
  range: "28d",
  generatedAt: "2026-11-17T02:00:00.000Z",
  ga4: {
    state: { code: "CONNECTED", message: "已连接", checkedAt: "2026-11-17T02:00:00.000Z" },
    data: {
      metrics: { activeUsers: { value: 60, previousValue: 50, changePercent: 20 } },
      daily: [], topPages: [], acquisition: [], countries: [], events: {},
    },
  },
  searchConsole: {
    state: { code: "CONNECTED", message: "已连接", checkedAt: "2026-11-17T02:00:00.000Z" },
    data: {
      metrics: { clicks: { value: 28, previousValue: 20, changePercent: 40 } },
      daily: [], queries: [], pages: [], devices: [], countries: [],
    },
  },
};

const inquiries = { items: [], total: 0, page: 1, pageSize: 6 };

function response(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: async () => body } as Response);
}

function dashboardFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = String(input);
  if (url.includes("/analytics/reports?")) return response(firstPartyReport);
  if (url.includes("/analytics/overview?")) return response(googleOverview);
  if (url.includes("/inquiries?")) return response(inquiries);
  throw new Error(`Unexpected request: ${url} ${String(init?.signal)}`);
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(dashboardFetch));
});

describe("GlobalIntelligenceDashboard", () => {
  it("loads independent real sources and renders the command center regions", async () => {
    render(<GlobalIntelligenceDashboard initialRange="28d" content={{ products: 8, publishedProducts: 5, newLeads: 3 }} canExport canViewInquiries />);

    expect(screen.getByRole("heading", { name: "ZYRON 全球业务数据中心" })).toBeInTheDocument();
    expect(await screen.findByTestId("dashboard-kpi-period-visitors")).toHaveTextContent("18");
    expect(screen.getByRole("region", { name: "核心业务指标" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "核心指标趋势" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "全球流量分布" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "渠道 / 来源分布" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "第一方转化漏斗" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "热门产品" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "搜索表现" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "最新询盘" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "数据源健康状态" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/admin/analytics/reports?from="), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(fetch).toHaveBeenCalledWith("/api/admin/analytics/overview?range=28d", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(fetch).toHaveBeenCalledWith("/api/admin/inquiries?page=1&pageSize=6", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("updates the range URL, cancels stale requests, and preserves raw filter values", async () => {
    const signals: AbortSignal[] = [];
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (init?.signal) signals.push(init.signal);
      return dashboardFetch(input, init);
    });
    const user = userEvent.setup();
    render(<GlobalIntelligenceDashboard initialRange="28d" content={{ products: 8, publishedProducts: 5, newLeads: 3 }} canExport canViewInquiries />);
    await screen.findByTestId("dashboard-kpi-period-visitors");

    await user.click(screen.getByRole("button", { name: "近 7 天" }));

    expect(mocks.replace).toHaveBeenCalledWith("/admin?range=7d", { scroll: false });
    expect(signals.slice(0, 3).every((signal) => signal.aborted)).toBe(true);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/admin/analytics/overview?range=7d", expect.anything()));

    await user.selectOptions(screen.getByRole("combobox", { name: "设备筛选" }), "desktop");
    expect(screen.getByRole("combobox", { name: "设备筛选" })).toHaveValue("desktop");
    await user.click(screen.getByRole("button", { name: "选择美国" }));
    expect(screen.getByRole("combobox", { name: "国家筛选" })).toHaveValue("US");
  });

  it("supports live events, manual refresh, auto refresh, export and fullscreen", async () => {
    vi.useFakeTimers();
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: requestFullscreen });
    render(<GlobalIntelligenceDashboard initialRange="28d" content={{ products: 8, publishedProducts: 5, newLeads: 3 }} canExport canViewInquiries />);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId("dashboard-kpi-period-visitors")).toHaveTextContent("18");

    act(() => window.dispatchEvent(new CustomEvent(LIVE_OVERVIEW_EVENT, { detail: {
      generatedAt: "2026-11-17T03:00:00.000Z", environment: "PRODUCTION",
      summary: { onlineVisitors: 4, activeVisitors: 6, visitorsToday: 12, sessionsToday: 15, pageViewsToday: 40 },
    } })));
    expect(screen.getByTestId("dashboard-kpi-online")).toHaveTextContent("4");

    const callsBeforeRefresh = vi.mocked(fetch).mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "立即刷新" }));
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(callsBeforeRefresh);
    expect(screen.getByRole("link", { name: "导出 CSV" })).toHaveAttribute("href", expect.stringContaining("/api/admin/analytics/reports/export?from="));

    fireEvent.click(screen.getByRole("button", { name: "进入全屏" }));
    expect(requestFullscreen).toHaveBeenCalledOnce();

    const callsBeforeTimer = vi.mocked(fetch).mock.calls.length;
    act(() => vi.advanceTimersByTime(60_000));
    await act(async () => { await Promise.resolve(); });
    expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(callsBeforeTimer);
    fireEvent.click(screen.getByRole("switch", { name: "自动刷新" }));
    expect(screen.getByRole("switch", { name: "自动刷新" })).toHaveAttribute("aria-checked", "false");
  });

  it("does not request or expose CRM and export controls without permission", async () => {
    render(<GlobalIntelligenceDashboard initialRange="28d" content={{ products: 8, publishedProducts: 5, newLeads: 3 }} canExport={false} canViewInquiries={false} />);
    await screen.findByTestId("dashboard-kpi-period-visitors");

    expect(screen.queryByRole("link", { name: "导出 CSV" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "最新询盘" })).toHaveTextContent("当前账号无权查看询盘");
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("/api/admin/inquiries"))).toBe(false);
  });
});
