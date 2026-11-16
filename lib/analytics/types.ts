export const ANALYTICS_RANGES = ["7d", "28d", "90d"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export type DateWindow = {
  startDate: string;
  endDate: string;
};

export type IntegrationErrorCode =
  | "NOT_CONFIGURED"
  | "INVALID_CONFIG"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "UPSTREAM_UNAVAILABLE"
  | "NO_DATA";

export type IntegrationSourceState = {
  code: "CONNECTED" | IntegrationErrorCode;
  message: string;
  checkedAt: string;
};

export type MetricComparison = {
  value: number;
  previousValue: number;
  changePercent: number | null;
};

export type DailyMetricPoint = {
  date: string;
  value: number;
};

export const ANALYTICS_EVENT_NAMES = [
  "inquiry_start",
  "inquiry_submit",
  "whatsapp_click",
  "email_click",
  "catalog_download",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export type Ga4Report = {
  range: AnalyticsRange;
  currentWindow: DateWindow;
  previousWindow: DateWindow;
  generatedAt: string;
  dataThrough: string;
  metrics: {
    activeUsers: MetricComparison;
    sessions: MetricComparison;
    pageViews: MetricComparison;
    engagementRate: MetricComparison;
    keyEvents: MetricComparison;
  };
  daily: Array<{ date: string; activeUsers: number; sessions: number; pageViews: number }>;
  topPages: Array<{ path: string; title: string; pageViews: number; activeUsers: number }>;
  acquisition: Array<{ source: string; medium: string; sessions: number; activeUsers: number }>;
  countries: Array<{ country: string; activeUsers: number; sessions: number }>;
  events: Record<AnalyticsEventName, number>;
};

export type SearchConsoleReport = {
  range: AnalyticsRange;
  currentWindow: DateWindow;
  previousWindow: DateWindow;
  generatedAt: string;
  dataThrough: string | null;
  metrics: {
    clicks: MetricComparison;
    impressions: MetricComparison;
    ctr: MetricComparison;
    position: MetricComparison;
  };
  daily: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>;
  queries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  pages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  devices: Array<{ device: string; clicks: number; impressions: number; ctr: number; position: number }>;
  countries: Array<{ country: string; clicks: number; impressions: number; ctr: number; position: number }>;
};

export type AnalyticsSourceResult<T> = {
  state: IntegrationSourceState;
  data: T | null;
};

export type AnalyticsOverview = {
  range: AnalyticsRange;
  generatedAt: string;
  ga4: AnalyticsSourceResult<Ga4Report>;
  searchConsole: AnalyticsSourceResult<SearchConsoleReport>;
};

export type AnalyticsConnectionOverview = {
  generatedAt: string;
  ga4: IntegrationSourceState;
  searchConsole: IntegrationSourceState;
};
