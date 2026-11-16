import { describe, expect, it, vi } from "vitest";

import { Ga4ReportingService } from "@/lib/analytics/ga4-reporting";
import type { GoogleJsonRequest } from "@/lib/analytics/google-http";

type GaBody = {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: unknown;
};

function gaResponse(dimensions: string[], metrics: string[], rows: Array<{ keys?: string[]; values: number[] }>) {
  return {
    dimensionHeaders: dimensions.map((name) => ({ name })),
    metricHeaders: metrics.map((name) => ({ name, type: "TYPE_FLOAT" })),
    rows: rows.map((row) => ({
      dimensionValues: (row.keys ?? []).map((value) => ({ value })),
      metricValues: row.values.map((value) => ({ value: String(value) })),
    })),
    rowCount: rows.length,
  };
}

describe("Ga4ReportingService", () => {
  it("normalizes totals, comparisons, dimensions, and conversion events", async () => {
    const request = vi.fn(async <T>(input: GoogleJsonRequest) => {
      expect(input.url).toBe("https://analyticsdata.googleapis.com/v1beta/properties/123456789:runReport");
      const body = input.body as GaBody;
      const dimensions = body.dimensions?.map(({ name }) => name) ?? [];
      const metrics = body.metrics.map(({ name }) => name);
      const start = body.dateRanges[0]?.startDate;
      if (dimensions.length === 0 && start === "2026-11-09") {
        expect(metrics).toEqual(["activeUsers", "sessions", "screenPageViews", "engagementRate", "keyEvents"]);
        return gaResponse([], metrics, [{ values: [120, 150, 400, 0.62, 9] }]) as T;
      }
      if (dimensions.length === 0) return gaResponse([], metrics, [{ values: [100, 120, 300, 0.5, 6] }]) as T;
      if (dimensions[0] === "date") return gaResponse(dimensions, metrics, [
        { keys: ["20261109"], values: [10, 12, 30] },
        { keys: ["20261110"], values: [15, 18, 45] },
      ]) as T;
      if (dimensions[0] === "pagePath") return gaResponse(dimensions, metrics, [
        { keys: ["/products/compact-electric-shearing-machine", "Small Electric Shear"], values: [88, 40] },
      ]) as T;
      if (dimensions[0] === "sessionSource") return gaResponse(dimensions, metrics, [
        { keys: ["google", "organic"], values: [70, 60] },
      ]) as T;
      if (dimensions[0] === "country") return gaResponse(dimensions, metrics, [
        { keys: ["United States"], values: [32, 38] },
      ]) as T;
      expect(dimensions).toEqual(["eventName"]);
      expect(body.dimensionFilter).toMatchObject({ filter: { fieldName: "eventName" } });
      return gaResponse(dimensions, metrics, [
        { keys: ["inquiry_start"], values: [12] },
        { keys: ["inquiry_submit"], values: [4] },
        { keys: ["whatsapp_click"], values: [7] },
      ]) as T;
    });

    const report = await new Ga4ReportingService("123456789", request).getReport(
      "7d",
      new Date("2026-11-16T02:00:00.000Z"),
    );

    expect(report.metrics).toEqual({
      activeUsers: { value: 120, previousValue: 100, changePercent: 20 },
      sessions: { value: 150, previousValue: 120, changePercent: 25 },
      pageViews: { value: 400, previousValue: 300, changePercent: 33.33333333333333 },
      engagementRate: { value: 0.62, previousValue: 0.5, changePercent: 24 },
      keyEvents: { value: 9, previousValue: 6, changePercent: 50 },
    });
    expect(report.daily[0]).toEqual({ date: "2026-11-09", activeUsers: 10, sessions: 12, pageViews: 30 });
    expect(report.topPages[0]).toEqual({
      path: "/products/compact-electric-shearing-machine",
      title: "Small Electric Shear",
      pageViews: 88,
      activeUsers: 40,
    });
    expect(report.acquisition[0]).toEqual({ source: "google", medium: "organic", sessions: 70, activeUsers: 60 });
    expect(report.countries[0]).toEqual({ country: "United States", activeUsers: 32, sessions: 38 });
    expect(report.events).toEqual({
      inquiry_start: 12,
      inquiry_submit: 4,
      whatsapp_click: 7,
      email_click: 0,
      catalog_download: 0,
    });
    expect(report.dataThrough).toBe("2026-11-15");
    expect(request).toHaveBeenCalledTimes(7);
  });

  it("returns zero metrics and empty tables for a successful empty property", async () => {
    const request = vi.fn(async <T>() => gaResponse([], [], []) as T);

    const report = await new Ga4ReportingService("123456789", request).getReport(
      "7d",
      new Date("2026-11-16T02:00:00.000Z"),
    );

    expect(report.metrics.activeUsers).toEqual({ value: 0, previousValue: 0, changePercent: null });
    expect(report.daily).toEqual([]);
    expect(report.topPages).toEqual([]);
    expect(Object.values(report.events)).toEqual([0, 0, 0, 0, 0]);
  });
});
