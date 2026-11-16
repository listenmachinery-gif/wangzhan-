// @vitest-environment jsdom

import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { LIVE_OVERVIEW_EVENT } from "@/lib/analytics/first-party/live-alerts";

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
  arrivals: [],
};

function response(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: async () => body } as Response);
}

function publishFirstParty(body = firstParty) {
  act(() => {
    window.dispatchEvent(new CustomEvent(LIVE_OVERVIEW_EVENT, { detail: body }));
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("first-party analytics command center", () => {
  it("renders real first-party metrics separately from independent Google states", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL) => Promise<Response>>(() => response(googleUnconfigured));
    vi.stubGlobal("fetch", fetchMock);

    render(<AnalyticsDashboard initialRange="28d" />);
    publishFirstParty();

    const realtime = await screen.findByRole("region", { name: "第一方实时访客" });
    expect(within(realtime).getByText("3")).toBeVisible();
    expect(within(realtime).getByText("7")).toBeVisible();
    expect(within(realtime).getByText("31")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Google Analytics 4" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Google Search Console" })).toBeVisible();
    expect(screen.getAllByText("尚未配置")).toHaveLength(2);
    expect(screen.getByText(/不会与 Google 用户数据合并/)).toBeVisible();
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("first-party"))).toBe(false);
  });

  it("distinguishes measured zero from an unavailable data source", async () => {
    vi.stubGlobal("fetch", vi.fn(() => response(googleUnconfigured)));

    render(<AnalyticsDashboard initialRange="28d" />);
    publishFirstParty({ ...firstParty, summary: { onlineVisitors: 0, activeVisitors: 0, visitorsToday: 0, sessionsToday: 0, pageViewsToday: 0 } });

    const realtime = await screen.findByRole("region", { name: "第一方实时访客" });
    expect(within(realtime).getAllByText("0")).toHaveLength(5);
    expect(within(realtime).queryByText("尚未配置")).not.toBeInTheDocument();
    expect(screen.getAllByText("尚未配置")).toHaveLength(2);
  });

  it("updates all realtime metrics and refresh time from consecutive global snapshots", async () => {
    vi.stubGlobal("fetch", vi.fn(() => response(googleUnconfigured)));

    render(<AnalyticsDashboard initialRange="28d" />);
    publishFirstParty();
    publishFirstParty({
      ...firstParty,
      generatedAt: "2026-11-16T02:01:00.000Z",
      summary: { onlineVisitors: 4, activeVisitors: 8, visitorsToday: 13, sessionsToday: 15, pageViewsToday: 32 },
    });

    const realtime = await screen.findByRole("region", { name: "第一方实时访客" });
    for (const value of ["4", "8", "13", "15", "32"]) expect(within(realtime).getByText(value)).toBeVisible();
    expect(within(realtime).getByText("10:01")).toHaveAttribute("datetime", "2026-11-16T02:01:00.000Z");
    expect(screen.getByRole("heading", { name: "Google Analytics 4" })).toBeVisible();
    expect(screen.getAllByText("尚未配置")).toHaveLength(2);
  });
});
