import "server-only";

import { getCompletedDateWindows } from "@/lib/analytics/date-ranges";
import type { GoogleJsonClient, GoogleJsonRequest } from "@/lib/analytics/google-http";
import type {
  AnalyticsRange,
  DateWindow,
  MetricComparison,
  SearchConsoleReport,
} from "@/lib/analytics/types";

type SearchRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchResponse = { rows?: SearchRow[] };

function comparison(value: number, previousValue: number): MetricComparison {
  return {
    value,
    previousValue,
    changePercent: previousValue === 0 ? null : ((value - previousValue) / previousValue) * 100,
  };
}

function numeric(value: number | undefined) {
  return Number.isFinite(value) ? value! : 0;
}

function searchRequest(
  endpoint: string,
  window: DateWindow,
  dimension?: "date" | "query" | "page" | "device" | "country",
): GoogleJsonRequest {
  return {
    url: endpoint,
    method: "POST",
    body: {
      startDate: window.startDate,
      endDate: window.endDate,
      dataState: "final",
      ...(dimension ? { dimensions: [dimension] } : {}),
      rowLimit: dimension === "date" ? 100 : dimension ? 25 : 1,
      startRow: 0,
    },
  };
}

function metrics(row: SearchRow | undefined) {
  return {
    clicks: numeric(row?.clicks),
    impressions: numeric(row?.impressions),
    ctr: numeric(row?.ctr),
    position: numeric(row?.position),
  };
}

export class SearchConsoleReportingService {
  private readonly endpoint: string;

  constructor(
    siteUrl: string,
    private readonly request: GoogleJsonClient,
  ) {
    this.endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  }

  private fetchReport(request: GoogleJsonRequest) {
    return this.request(request) as Promise<SearchResponse>;
  }

  async probe() {
    await this.fetchReport(searchRequest(
      this.endpoint,
      { startDate: "2026-01-01", endDate: "2026-01-01" },
    ));
  }

  async getReport(range: AnalyticsRange, now = new Date()): Promise<SearchConsoleReport> {
    const { current, previous } = getCompletedDateWindows(range, now, "America/Los_Angeles");
    const [currentTotal, previousTotal, daily, queries, pages, devices, countries] = await Promise.all([
      this.fetchReport(searchRequest(this.endpoint, current)),
      this.fetchReport(searchRequest(this.endpoint, previous)),
      this.fetchReport(searchRequest(this.endpoint, current, "date")),
      this.fetchReport(searchRequest(this.endpoint, current, "query")),
      this.fetchReport(searchRequest(this.endpoint, current, "page")),
      this.fetchReport(searchRequest(this.endpoint, current, "device")),
      this.fetchReport(searchRequest(this.endpoint, current, "country")),
    ]);
    const currentMetrics = metrics(currentTotal.rows?.[0]);
    const previousMetrics = metrics(previousTotal.rows?.[0]);
    const dailyRows = daily.rows ?? [];
    const mapRows = <T extends string>(response: SearchResponse, key: T) =>
      (response.rows ?? []).map((row) => ({ [key]: row.keys?.[0] ?? "", ...metrics(row) })) as Array<
        Record<T, string> & ReturnType<typeof metrics>
      >;

    return {
      range,
      currentWindow: current,
      previousWindow: previous,
      generatedAt: now.toISOString(),
      dataThrough: dailyRows.reduce<string | null>((latest, row) => {
        const date = row.keys?.[0];
        return date && (!latest || date > latest) ? date : latest;
      }, null),
      metrics: {
        clicks: comparison(currentMetrics.clicks, previousMetrics.clicks),
        impressions: comparison(currentMetrics.impressions, previousMetrics.impressions),
        ctr: comparison(currentMetrics.ctr, previousMetrics.ctr),
        position: comparison(currentMetrics.position, previousMetrics.position),
      },
      daily: mapRows(daily, "date"),
      queries: mapRows(queries, "query"),
      pages: mapRows(pages, "page"),
      devices: mapRows(devices, "device"),
      countries: mapRows(countries, "country"),
    };
  }
}
