import type { AnalyticsEnvironment } from "@prisma/client";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";

function utcStart(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function parseDay(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function analyticsReportQuery(searchParams: URLSearchParams, environment: AnalyticsEnvironment = currentAnalyticsEnvironment()) {
  const today = utcStart(new Date());
  const defaultFrom = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1_000);
  const from = parseDay(searchParams.get("from")) ?? defaultFrom;
  const inclusiveTo = parseDay(searchParams.get("to")) ?? today;
  const to = new Date(inclusiveTo.getTime() + 24 * 60 * 60 * 1_000);
  if (from >= to || to.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1_000) throw new RangeError("Invalid analytics report range.");
  return { environment, from, to };
}
