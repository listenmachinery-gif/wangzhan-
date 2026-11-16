import { describe, expect, it, vi } from "vitest";

import type { GoogleJsonRequest } from "@/lib/analytics/google-http";
import { SearchConsoleReportingService } from "@/lib/analytics/search-console-reporting";

type SearchBody = {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  dataState: string;
  rowLimit: number;
};

function searchResponse(rows: Array<{
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}>) {
  return { rows, responseAggregationType: "auto" };
}

describe("SearchConsoleReportingService", () => {
  it("queries finalized Pacific-Time data and normalizes every report table", async () => {
    const request = vi.fn(async <T>(input: GoogleJsonRequest) => {
      expect(input.url).toBe(
        "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Azyroncnc.com/searchAnalytics/query",
      );
      const body = input.body as SearchBody;
      expect(body.dataState).toBe("final");
      expect(body.rowLimit).toBeGreaterThan(0);
      const dimension = body.dimensions?.[0];
      if (!dimension && body.startDate === "2026-11-09") {
        return searchResponse([{ clicks: 80, impressions: 2000, ctr: 0.04, position: 8.5 }]) as T;
      }
      if (!dimension) return searchResponse([{ clicks: 60, impressions: 1800, ctr: 0.033, position: 9.2 }]) as T;
      if (dimension === "date") return searchResponse([
        { keys: ["2026-11-09"], clicks: 10, impressions: 300, ctr: 0.033, position: 9.1 },
        { keys: ["2026-11-12"], clicks: 18, impressions: 420, ctr: 0.043, position: 8.2 },
      ]) as T;
      if (dimension === "query") return searchResponse([
        { keys: ["small electric shearing machine"], clicks: 20, impressions: 300, ctr: 0.066, position: 5.4 },
      ]) as T;
      if (dimension === "page") return searchResponse([
        { keys: ["https://www.zyroncnc.com/products/compact-electric-shearing-machine"], clicks: 22, impressions: 340, ctr: 0.065, position: 5.8 },
      ]) as T;
      if (dimension === "device") return searchResponse([
        { keys: ["MOBILE"], clicks: 48, impressions: 1200, ctr: 0.04, position: 8.8 },
      ]) as T;
      return searchResponse([
        { keys: ["usa"], clicks: 16, impressions: 400, ctr: 0.04, position: 7.9 },
      ]) as T;
    });

    const report = await new SearchConsoleReportingService("sc-domain:zyroncnc.com", request).getReport(
      "7d",
      new Date("2026-11-16T12:00:00.000Z"),
    );

    expect(report.currentWindow).toEqual({ startDate: "2026-11-09", endDate: "2026-11-15" });
    expect(report.metrics.clicks).toMatchObject({ value: 80, previousValue: 60 });
    expect(report.metrics.clicks.changePercent).toBeCloseTo(33.3333, 4);
    expect(report.metrics.impressions).toMatchObject({ value: 2000, previousValue: 1800 });
    expect(report.metrics.impressions.changePercent).toBeCloseTo(11.1111, 4);
    expect(report.metrics.ctr).toMatchObject({ value: 0.04, previousValue: 0.033 });
    expect(report.metrics.ctr.changePercent).toBeCloseTo(21.2121, 4);
    expect(report.metrics.position).toMatchObject({ value: 8.5, previousValue: 9.2 });
    expect(report.metrics.position.changePercent).toBeCloseTo(-7.6087, 4);
    expect(report.daily[0]).toEqual({ date: "2026-11-09", clicks: 10, impressions: 300, ctr: 0.033, position: 9.1 });
    expect(report.queries[0]?.query).toBe("small electric shearing machine");
    expect(report.pages[0]?.page).toContain("/products/compact-electric-shearing-machine");
    expect(report.devices[0]?.device).toBe("MOBILE");
    expect(report.countries[0]?.country).toBe("usa");
    expect(report.dataThrough).toBe("2026-11-12");
    expect(request).toHaveBeenCalledTimes(7);
  });

  it("returns a valid no-data report when Search Console has no rows", async () => {
    const request = vi.fn(async <T>() => searchResponse([]) as T);

    const report = await new SearchConsoleReportingService("sc-domain:zyroncnc.com", request).getReport(
      "7d",
      new Date("2026-11-16T12:00:00.000Z"),
    );

    expect(report.metrics.clicks).toEqual({ value: 0, previousValue: 0, changePercent: null });
    expect(report.daily).toEqual([]);
    expect(report.queries).toEqual([]);
    expect(report.dataThrough).toBeNull();
  });
});
