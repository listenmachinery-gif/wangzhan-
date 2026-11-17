// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import type { AnalyticsOverview } from "@/lib/analytics/types";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  getCurrentPrincipal: vi.fn(),
  getStatus: vi.fn(),
  productCount: vi.fn(),
  leadCount: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/lib/auth/session", () => ({ getCurrentPrincipal: mocks.getCurrentPrincipal }));
vi.mock("@/lib/db/client", () => ({
  db: {
    product: { count: mocks.productCount },
    lead: { count: mocks.leadCount },
  },
}));
vi.mock("@/lib/analytics/overview-service", () => ({
  AnalyticsOverviewService: class { getStatus = mocks.getStatus; },
}));

import AdminDashboardPage from "@/app/admin/page";

const admin = {
  id: "admin",
  email: "admin@zyroncnc.com",
  name: "Admin",
  roles: ["ADMIN"],
} as const;

const productEditor = {
  id: "editor",
  email: "editor@zyroncnc.com",
  name: "Editor",
  roles: ["PRODUCT_EDITOR"],
} as const;

function overview(overrides: Partial<AnalyticsOverview> = {}): AnalyticsOverview {
  const compared = (value: number, previousValue: number) => ({
    value,
    previousValue,
    changePercent: previousValue === 0 ? null : ((value - previousValue) / previousValue) * 100,
  });
  return {
    range: "28d",
    generatedAt: "2026-11-16T02:00:00.000Z",
    ga4: {
      state: { code: "CONNECTED", message: "已连接", checkedAt: "2026-11-16T02:00:00.000Z" },
      data: {
        range: "28d",
        currentWindow: { startDate: "2026-10-19", endDate: "2026-11-15" },
        previousWindow: { startDate: "2026-09-21", endDate: "2026-10-18" },
        generatedAt: "2026-11-16T02:00:00.000Z",
        dataThrough: "2026-11-15",
        metrics: {
          activeUsers: compared(120, 100), sessions: compared(150, 120), pageViews: compared(400, 300),
          engagementRate: compared(0.62, 0.5), keyEvents: compared(9, 6),
        },
        daily: [{ date: "2026-11-15", activeUsers: 30, sessions: 40, pageViews: 90 }],
        topPages: [{ path: "/products/example", title: "Example product", pageViews: 88, activeUsers: 40 }],
        acquisition: [{ source: "google", medium: "organic", sessions: 70, activeUsers: 60 }],
        countries: [{ country: "United States", activeUsers: 32, sessions: 38 }],
        events: { inquiry_start: 12, inquiry_submit: 4, whatsapp_click: 7, email_click: 3, catalog_download: 2 },
      },
    },
    searchConsole: {
      state: { code: "CONNECTED", message: "已连接", checkedAt: "2026-11-16T02:00:00.000Z" },
      data: {
        range: "28d",
        currentWindow: { startDate: "2026-10-19", endDate: "2026-11-15" },
        previousWindow: { startDate: "2026-09-21", endDate: "2026-10-18" },
        generatedAt: "2026-11-16T02:00:00.000Z",
        dataThrough: "2026-11-12",
        metrics: { clicks: compared(80, 60), impressions: compared(2000, 1800), ctr: compared(0.04, 0.033), position: compared(8.5, 9.2) },
        daily: [{ date: "2026-11-12", clicks: 18, impressions: 420, ctr: 0.043, position: 8.2 }],
        queries: [{ query: "small electric shear", clicks: 20, impressions: 300, ctr: 0.066, position: 5.4 }],
        pages: [{ page: "https://www.zyroncnc.com/products/example", clicks: 22, impressions: 340, ctr: 0.065, position: 5.8 }],
        devices: [{ device: "MOBILE", clicks: 48, impressions: 1200, ctr: 0.04, position: 8.8 }],
        countries: [{ country: "usa", clicks: 16, impressions: 400, ctr: 0.04, position: 7.9 }],
      },
    },
    ...overrides,
  };
}

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: async () => body } as Response);
}

const firstPartyOverview = {
  generatedAt: "2026-11-16T02:00:00.000Z",
  environment: "TEST",
  summary: { onlineVisitors: 2, activeVisitors: 4, visitorsToday: 8, sessionsToday: 10, pageViewsToday: 24 },
};

function analyticsFetch(report: AnalyticsOverview) {
  return (input: RequestInfo | URL) => String(input).includes("first-party")
    ? jsonResponse(firstPartyOverview)
    : jsonResponse(report);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(analyticsFetch(overview())));
  });

  it("loads the default 28-day report and renders both sources accessibly", async () => {
    render(<AnalyticsDashboard initialRange="28d" />);

    expect(screen.getByText("正在读取 Google 报表…")).toBeInTheDocument();
    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "GA4 每日活跃用户趋势" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Search Console 每日点击趋势" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "页面" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "搜索词" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "访问国家 / 地区" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "转化事件" })).toBeInTheDocument();
    expect(screen.getAllByText("美国")).toHaveLength(2);
    expect(screen.getByText("询盘提交")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "搜索设备" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "搜索国家 / 地区" })).toBeInTheDocument();
    expect(screen.getByText("移动端")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "GA4 每日活跃用户趋势数据" })).toHaveTextContent("2026-11-15: 30");
    expect(screen.getByRole("list", { name: "Search Console 每日点击趋势数据" })).toHaveTextContent("2026-11-12: 18");
    expect(document.querySelectorAll("[data-mobile-scroll]").length).toBeGreaterThan(0);
    expect(screen.getByText(/GA4 数据更新至 2026-11-15/)).toBeInTheDocument();
    expect(screen.getByText(/Search Console 数据更新至 2026-11-12/)).toBeInTheDocument();
  });

  it("keeps all five conversion event rows visible when their counts are zero", async () => {
    const report = overview();
    report.ga4.data!.events = {
      inquiry_start: 0,
      inquiry_submit: 0,
      whatsapp_click: 0,
      email_click: 0,
      catalog_download: 0,
    };
    vi.mocked(fetch).mockImplementation(analyticsFetch(report));

    render(<AnalyticsDashboard initialRange="28d" />);

    const events = await screen.findByRole("region", { name: "转化事件" });
    expect(within(events).getAllByRole("row")).toHaveLength(6);
    expect(within(events).getAllByText("0")).toHaveLength(5);
  });

  it("updates the URL and fetches a selected range", async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard initialRange="28d" />);
    await screen.findByText("120");

    await user.click(screen.getByRole("button", { name: "7 天" }));

    expect(mocks.replace).toHaveBeenCalledWith("/admin/analytics?range=7d", { scroll: false });
    await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(
      "/api/admin/analytics/overview?range=7d",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ));
  });

  it.each([
    ["ga4", "FORBIDDEN", "Google 资源访问权限不足"],
    ["searchConsole", "TIMEOUT", "Google API 请求超时"],
    ["ga4", "NOT_CONFIGURED", "尚未配置"],
  ] as const)("keeps the other panel when %s is %s", async (source, code, message) => {
    const report = overview({
      [source]: { state: { code, message, checkedAt: "2026-11-16T02:00:00.000Z" }, data: null },
    });
    vi.mocked(fetch).mockImplementation(analyticsFetch(report));

    render(<AnalyticsDashboard initialRange="28d" />);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByText(source === "ga4" ? "80" : "120")).toBeInTheDocument();
  });

  it("renders a truthful no-data state and avoids dividing by zero", async () => {
    const report = overview();
    report.ga4.state = { code: "NO_DATA", message: "已连接，所选日期暂无数据", checkedAt: report.generatedAt };
    report.ga4.data!.metrics.activeUsers = { value: 0, previousValue: 0, changePercent: null };
    report.ga4.data!.daily = [];
    vi.mocked(fetch).mockImplementation(analyticsFetch(report));

    render(<AnalyticsDashboard initialRange="28d" />);

    expect(await screen.findByText("已连接，所选日期暂无数据")).toBeInTheDocument();
    const activeUsersCard = screen.getByTestId("metric-active-users");
    expect(within(activeUsersCard).getByText("暂无可比数据")).toBeInTheDocument();
    expect(screen.queryByText(/Infinity|NaN/)).not.toBeInTheDocument();
  });
});

describe("admin dashboard analytics visibility", () => {
  beforeEach(() => {
    mocks.productCount.mockResolvedValueOnce(8).mockResolvedValueOnce(5);
    mocks.leadCount.mockResolvedValue(3);
    mocks.getStatus.mockResolvedValue({
      generatedAt: "2026-11-16T02:00:00.000Z",
      ga4: { code: "CONNECTED", message: "已连接", checkedAt: "2026-11-16T02:00:00.000Z" },
      searchConsole: { code: "NOT_CONFIGURED", message: "尚未配置", checkedAt: "2026-11-16T02:00:00.000Z" },
    });
  });

  it("keeps the lightweight overview for principals without analytics access", async () => {
    mocks.getCurrentPrincipal.mockResolvedValue(productEditor);

    render(await AdminDashboardPage({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByText("Google Analytics 4")).not.toBeInTheDocument();
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });

  it("shows the global intelligence dashboard to administrators", async () => {
    mocks.getCurrentPrincipal.mockResolvedValue(admin);

    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(await AdminDashboardPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "ZYRON 全球业务数据中心" })).toBeInTheDocument();
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });
});
