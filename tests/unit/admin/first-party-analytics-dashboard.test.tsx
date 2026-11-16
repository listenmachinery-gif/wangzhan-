// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";

const googleUnconfigured = {
  range: "28d",
  generatedAt: "2026-11-16T02:00:00.000Z",
  ga4: { state: { code: "NOT_CONFIGURED", message: "尚未配置", checkedAt: "2026-11-16T02:00:00.000Z" }, data: null },
  searchConsole: { state: { code: "NOT_CONFIGURED", message: "尚未配置", checkedAt: "2026-11-16T02:00:00.000Z" }, data: null },
};

const firstParty = {
  generatedAt: "2026-11-16T02:00:00.000Z",
  environment: "TEST",
  summary: { onlineVisitors: 3, activeVisitors: 7, visitorsToday: 12, sessionsToday: 14, pageViewsToday: 31 },
};

function response(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: async () => body } as Response);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("first-party analytics command center", () => {
  it("renders real first-party metrics separately from independent Google states", async () => {
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes("first-party") ? response(firstParty) : response(googleUnconfigured);
    }));

    render(<AnalyticsDashboard initialRange="28d" />);

    const realtime = await screen.findByRole("region", { name: "第一方实时访客" });
    expect(within(realtime).getByText("3")).toBeVisible();
    expect(within(realtime).getByText("7")).toBeVisible();
    expect(within(realtime).getByText("31")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Google Analytics 4" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Google Search Console" })).toBeVisible();
    expect(screen.getAllByText("尚未配置")).toHaveLength(2);
    expect(screen.getByText(/不会与 Google 用户数据合并/)).toBeVisible();
  });

  it("distinguishes measured zero from an unavailable data source", async () => {
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes("first-party")
        ? response({ ...firstParty, summary: { onlineVisitors: 0, activeVisitors: 0, visitorsToday: 0, sessionsToday: 0, pageViewsToday: 0 } })
        : response(googleUnconfigured);
    }));

    render(<AnalyticsDashboard initialRange="28d" />);

    const realtime = await screen.findByRole("region", { name: "第一方实时访客" });
    expect(within(realtime).getAllByText("0")).toHaveLength(5);
    expect(within(realtime).queryByText("尚未配置")).not.toBeInTheDocument();
    expect(screen.getAllByText("尚未配置")).toHaveLength(2);
  });

  it("keeps Google reporting available when first-party analytics fails", async () => {
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes("first-party") ? response({ code: "ANALYTICS_UNAVAILABLE" }, false) : response(googleUnconfigured);
    }));

    render(<AnalyticsDashboard initialRange="28d" />);

    expect(await screen.findByText("实时访客数据暂时不可用")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Google Analytics 4" })).toBeVisible();
    expect(screen.getAllByText("尚未配置")).toHaveLength(2);
  });
});
