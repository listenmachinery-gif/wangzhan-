// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardKpiGrid } from "@/components/admin/dashboard/DashboardKpiGrid";
import { MultiSeriesTrendChart } from "@/components/admin/dashboard/MultiSeriesTrendChart";
import { WorldTrafficMap } from "@/components/admin/dashboard/WorldTrafficMap";
import { ChannelDistribution, ConversionFunnel, ProductRanking } from "@/components/admin/dashboard/DashboardBreakdowns";

afterEach(cleanup);

describe("dashboard visual primitives", () => {
  it("distinguishes an unavailable KPI from a measured zero", () => {
    render(<DashboardKpiGrid kpis={[
      { id: "online", label: "当前在线", value: 0, available: true, format: "number", source: "第一方实时" },
      { id: "ga4", label: "GA4 活跃用户", value: null, available: false, format: "number", source: "GA4", reason: "尚未配置" },
    ]} />);

    expect(within(screen.getByTestId("dashboard-kpi-online")).getByText("0")).toBeVisible();
    expect(within(screen.getByTestId("dashboard-kpi-ga4")).getByText("--")).toBeVisible();
    expect(within(screen.getByTestId("dashboard-kpi-ga4")).getByText("尚未配置")).toBeVisible();
  });

  it("exposes a multi-series trend as both a chart and equivalent data list", () => {
    render(<MultiSeriesTrendChart points={[
      { date: "2026-11-16", visitors: 8, sessions: 10, pageViews: 24, inquiries: 2 },
      { date: "2026-11-17", visitors: 12, sessions: 15, pageViews: 31, inquiries: 3 },
    ]} />);

    expect(screen.getByRole("img", { name: "第一方访问趋势" })).toBeVisible();
    expect(screen.getByRole("list", { name: "第一方访问趋势数据" })).toHaveTextContent("2026-11-17：访客 12，会话 15，浏览 31，询盘 3");
  });

  it("keeps country ranking selection synchronized with the map control", () => {
    const onSelectCountry = vi.fn();
    render(<WorldTrafficMap countries={[
      { value: "US", visitors: 18, sessions: 22, pageViews: 44, inquiries: 3 },
      { value: "DE", visitors: 8, sessions: 10, pageViews: 21, inquiries: 1 },
    ]} selectedCountry="US" onSelectCountry={onSelectCountry} />);

    expect(screen.getByRole("button", { name: /美国/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /德国/ }));
    expect(onSelectCountry).toHaveBeenCalledWith("DE");
  });

  it("renders truthful empty states instead of decorative sample data", () => {
    render(<>
      <WorldTrafficMap countries={[]} selectedCountry="all" onSelectCountry={vi.fn()} />
      <ChannelDistribution rows={[]} />
      <ProductRanking rows={[]} />
    </>);

    expect(screen.getAllByText("所选周期暂无数据")).toHaveLength(3);
    expect(screen.queryByText(/示例|演示/)).not.toBeInTheDocument();
  });

  it("renders channel, product and funnel values from provided rows", () => {
    render(<>
      <ChannelDistribution rows={[{ value: "google", visitors: 20, sessions: 24, pageViews: 50, inquiries: 4 }]} />
      <ProductRanking rows={[{ value: "product-1", label: "小型电动剪板机", visitors: 12, sessions: 14, pageViews: 30, inquiries: 3 }]} />
      <ConversionFunnel funnel={{ visitors: 40, chatVisitors: 12, linkedLeads: 8, inquirySubmissions: 5, chatToLeadRate: 2 / 3 }} />
    </>);

    expect(screen.getByText("Google")).toBeVisible();
    expect(screen.getByText("小型电动剪板机")).toBeVisible();
    expect(screen.getByRole("region", { name: "第一方转化漏斗" })).toHaveTextContent("40");
    expect(screen.getByRole("region", { name: "第一方转化漏斗" })).toHaveTextContent("5");
  });
});
