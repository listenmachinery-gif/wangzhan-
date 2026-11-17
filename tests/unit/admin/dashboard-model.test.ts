import { describe, expect, it } from "vitest";

import {
  buildDashboardKpis,
  buildDashboardTrend,
  dashboardDateWindow,
} from "@/lib/dashboard/model";
import type { DashboardFirstPartyReport } from "@/lib/dashboard/types";
import type { AnalyticsOverview } from "@/lib/analytics/types";
import type { FirstPartyOverview } from "@/lib/analytics/first-party/types";

const live: FirstPartyOverview = {
  generatedAt: "2026-11-17T04:00:00.000Z",
  environment: "PRODUCTION",
  summary: {
    onlineVisitors: 0,
    activeVisitors: 2,
    visitorsToday: 8,
    sessionsToday: 10,
    pageViewsToday: 24,
  },
  arrivals: [],
};

const report: DashboardFirstPartyReport = {
  range: { from: "2026-10-21", to: "2026-11-17" },
  environment: "PRODUCTION",
  firstParty: {
    trend: [
      { date: "2026-11-16", visitors: 5, sessions: 6, pageViews: 14, inquiries: 1 },
      { date: "2026-11-15", visitors: 7, sessions: 9, pageViews: 18, inquiries: 2 },
    ],
    sources: [],
    countries: [],
    devices: [],
    products: [],
    funnel: {
      visitors: 12,
      chatVisitors: 4,
      linkedLeads: 3,
      inquirySubmissions: 3,
      chatToLeadRate: 0.75,
    },
  },
};

function google(state: "CONNECTED" | "NOT_CONFIGURED" = "CONNECTED"): AnalyticsOverview {
  const compared = (value: number) => ({ value, previousValue: 0, changePercent: null });
  const sourceState = { code: state, message: state === "CONNECTED" ? "已连接" : "尚未配置", checkedAt: "2026-11-17T04:00:00.000Z" } as const;
  return {
    range: "28d",
    generatedAt: "2026-11-17T04:00:00.000Z",
    ga4: {
      state: sourceState,
      data: state === "CONNECTED" ? {
        range: "28d",
        currentWindow: { startDate: "2026-10-20", endDate: "2026-11-16" },
        previousWindow: { startDate: "2026-09-22", endDate: "2026-10-19" },
        generatedAt: "2026-11-17T04:00:00.000Z",
        dataThrough: "2026-11-16",
        metrics: {
          activeUsers: compared(120), sessions: compared(150), pageViews: compared(400),
          engagementRate: compared(0.62), keyEvents: compared(9),
        },
        daily: [], topPages: [], acquisition: [], countries: [],
        events: { inquiry_start: 0, inquiry_submit: 0, whatsapp_click: 0, email_click: 0, catalog_download: 0 },
      } : null,
    },
    searchConsole: {
      state: sourceState,
      data: state === "CONNECTED" ? {
        range: "28d",
        currentWindow: { startDate: "2026-10-20", endDate: "2026-11-16" },
        previousWindow: { startDate: "2026-09-22", endDate: "2026-10-19" },
        generatedAt: "2026-11-17T04:00:00.000Z",
        dataThrough: "2026-11-15",
        metrics: { clicks: compared(80), impressions: compared(2_000), ctr: compared(0.04), position: compared(8.5) },
        daily: [], queries: [], pages: [], devices: [], countries: [],
      } : null,
    },
  };
}

describe("global intelligence dashboard model", () => {
  it.each([
    ["7d", "2026-11-10"],
    ["28d", "2026-10-20"],
    ["90d", "2026-08-19"],
  ] as const)("builds an inclusive %s first-party date window", (range, from) => {
    expect(dashboardDateWindow(range, new Date("2026-11-17T13:00:00.000Z"))).toEqual({
      from,
      to: "2026-11-16",
    });
  });

  it("sorts and sanitizes the first-party trend without inventing missing days", () => {
    expect(buildDashboardTrend(report)).toEqual([
      { date: "2026-11-15", visitors: 7, sessions: 9, pageViews: 18, inquiries: 2 },
      { date: "2026-11-16", visitors: 5, sessions: 6, pageViews: 14, inquiries: 1 },
    ]);
  });

  it("keeps measured zero realtime values available and labels each source", () => {
    const kpis = buildDashboardKpis({
      live,
      firstParty: report,
      google: google(),
      content: { products: 40, publishedProducts: 32, newLeads: 6 },
    });

    expect(kpis.find(({ id }) => id === "online")).toMatchObject({ value: 0, available: true, source: "第一方实时" });
    expect(kpis.find(({ id }) => id === "period-inquiries")).toMatchObject({ value: 3, available: true, source: "第一方汇总" });
    expect(kpis.find(({ id }) => id === "published-products")).toMatchObject({ value: 32, available: true, source: "CMS" });
    expect(kpis.find(({ id }) => id === "new-leads")).toMatchObject({ value: 6, available: true, source: "CRM" });
    expect(kpis.find(({ id }) => id === "ga4-active-users")).toMatchObject({ value: 120, available: true, source: "GA4" });
    expect(kpis.find(({ id }) => id === "search-clicks")).toMatchObject({ value: 80, available: true, source: "Search Console" });
  });

  it("returns truthful unavailable Google metrics instead of default zeroes", () => {
    const kpis = buildDashboardKpis({
      live,
      firstParty: report,
      google: google("NOT_CONFIGURED"),
      content: { products: 0, publishedProducts: 0, newLeads: 0 },
    });

    expect(kpis.find(({ id }) => id === "ga4-active-users")).toMatchObject({ value: null, available: false, reason: "尚未配置" });
    expect(kpis.find(({ id }) => id === "search-clicks")).toMatchObject({ value: null, available: false, reason: "尚未配置" });
  });

  it("calculates inquiry conversion from comparable first-party totals", () => {
    const kpis = buildDashboardKpis({ live, firstParty: report, google: null, content: { products: 0, publishedProducts: 0, newLeads: 0 } });
    expect(kpis.find(({ id }) => id === "conversion-rate")).toMatchObject({ value: 0.25, available: true, format: "percent" });
  });

  it("avoids dividing by zero when no first-party visitors were measured", () => {
    const empty = structuredClone(report);
    empty.firstParty.funnel.visitors = 0;
    empty.firstParty.funnel.inquirySubmissions = 0;
    const kpis = buildDashboardKpis({ live, firstParty: empty, google: null, content: { products: 0, publishedProducts: 0, newLeads: 0 } });
    expect(kpis.find(({ id }) => id === "conversion-rate")).toMatchObject({ value: null, available: false });
  });
});
