import "server-only";

import { getCompletedDateWindows } from "@/lib/analytics/date-ranges";
import type { GoogleJsonClient, GoogleJsonRequest } from "@/lib/analytics/google-http";
import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventName,
  type AnalyticsRange,
  type DateWindow,
  type Ga4Report,
  type MetricComparison,
} from "@/lib/analytics/types";

type GaResponse = {
  dimensionHeaders?: Array<{ name?: string }>;
  metricHeaders?: Array<{ name?: string }>;
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

type GaRow = { dimensions: string[]; metrics: number[] };

function rows(response: GaResponse): GaRow[] {
  return (response.rows ?? []).map((row) => ({
    dimensions: (row.dimensionValues ?? []).map(({ value }) => value ?? ""),
    metrics: (row.metricValues ?? []).map(({ value }) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    }),
  }));
}

function comparison(value: number, previousValue: number): MetricComparison {
  return {
    value,
    previousValue,
    changePercent: previousValue === 0 ? null : ((value - previousValue) / previousValue) * 100,
  };
}

function dateFromGa(value: string) {
  return value.length === 8
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value;
}

function reportRequest(
  endpoint: string,
  window: DateWindow,
  metrics: string[],
  dimensions: string[] = [],
  extras: Record<string, unknown> = {},
): GoogleJsonRequest {
  return {
    url: endpoint,
    method: "POST",
    body: {
      dateRanges: [window],
      metrics: metrics.map((name) => ({ name })),
      ...(dimensions.length > 0 ? { dimensions: dimensions.map((name) => ({ name })) } : {}),
      ...extras,
    },
  };
}

export class Ga4ReportingService {
  private readonly endpoint: string;

  constructor(
    propertyId: string,
    private readonly request: GoogleJsonClient,
  ) {
    this.endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
  }

  private fetchReport(request: GoogleJsonRequest) {
    return this.request(request) as Promise<GaResponse>;
  }

  async probe() {
    await this.fetchReport(reportRequest(
      this.endpoint,
      { startDate: "yesterday", endDate: "yesterday" },
      ["activeUsers"],
      [],
      { limit: "1" },
    ));
  }

  async getReport(range: AnalyticsRange, now = new Date()): Promise<Ga4Report> {
    const { current, previous } = getCompletedDateWindows(range, now, "Asia/Shanghai");
    const totalMetrics = ["activeUsers", "sessions", "screenPageViews", "engagementRate", "keyEvents"];
    const [currentTotals, previousTotals, daily, topPages, acquisition, countries, events] = await Promise.all([
      this.fetchReport(reportRequest(this.endpoint, current, totalMetrics)),
      this.fetchReport(reportRequest(this.endpoint, previous, totalMetrics)),
      this.fetchReport(reportRequest(
        this.endpoint,
        current,
        ["activeUsers", "sessions", "screenPageViews"],
        ["date"],
        { orderBys: [{ dimension: { dimensionName: "date" } }], limit: "100" },
      )),
      this.fetchReport(reportRequest(
        this.endpoint,
        current,
        ["screenPageViews", "activeUsers"],
        ["pagePath", "pageTitle"],
        { orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "25" },
      )),
      this.fetchReport(reportRequest(
        this.endpoint,
        current,
        ["sessions", "activeUsers"],
        ["sessionSource", "sessionMedium"],
        { orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: "25" },
      )),
      this.fetchReport(reportRequest(
        this.endpoint,
        current,
        ["activeUsers", "sessions"],
        ["country"],
        { orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: "25" },
      )),
      this.fetchReport(reportRequest(
        this.endpoint,
        current,
        ["eventCount"],
        ["eventName"],
        {
          dimensionFilter: {
            filter: {
              fieldName: "eventName",
              inListFilter: { values: [...ANALYTICS_EVENT_NAMES], caseSensitive: true },
            },
          },
          limit: "25",
        },
      )),
    ]);

    const currentValues = rows(currentTotals)[0]?.metrics ?? [];
    const previousValues = rows(previousTotals)[0]?.metrics ?? [];
    const eventCounts = Object.fromEntries(
      ANALYTICS_EVENT_NAMES.map((name) => [name, 0]),
    ) as Record<AnalyticsEventName, number>;
    for (const row of rows(events)) {
      const name = row.dimensions[0] as AnalyticsEventName;
      if (ANALYTICS_EVENT_NAMES.includes(name)) eventCounts[name] = row.metrics[0] ?? 0;
    }

    return {
      range,
      currentWindow: current,
      previousWindow: previous,
      generatedAt: now.toISOString(),
      dataThrough: current.endDate,
      metrics: {
        activeUsers: comparison(currentValues[0] ?? 0, previousValues[0] ?? 0),
        sessions: comparison(currentValues[1] ?? 0, previousValues[1] ?? 0),
        pageViews: comparison(currentValues[2] ?? 0, previousValues[2] ?? 0),
        engagementRate: comparison(currentValues[3] ?? 0, previousValues[3] ?? 0),
        keyEvents: comparison(currentValues[4] ?? 0, previousValues[4] ?? 0),
      },
      daily: rows(daily).map((row) => ({
        date: dateFromGa(row.dimensions[0] ?? ""),
        activeUsers: row.metrics[0] ?? 0,
        sessions: row.metrics[1] ?? 0,
        pageViews: row.metrics[2] ?? 0,
      })),
      topPages: rows(topPages).map((row) => ({
        path: row.dimensions[0] ?? "",
        title: row.dimensions[1] ?? "",
        pageViews: row.metrics[0] ?? 0,
        activeUsers: row.metrics[1] ?? 0,
      })),
      acquisition: rows(acquisition).map((row) => ({
        source: row.dimensions[0] ?? "",
        medium: row.dimensions[1] ?? "",
        sessions: row.metrics[0] ?? 0,
        activeUsers: row.metrics[1] ?? 0,
      })),
      countries: rows(countries).map((row) => ({
        country: row.dimensions[0] ?? "",
        activeUsers: row.metrics[0] ?? 0,
        sessions: row.metrics[1] ?? 0,
      })),
      events: eventCounts,
    };
  }
}
