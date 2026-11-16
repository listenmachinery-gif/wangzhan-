import "server-only";

import type { AnalyticsEnvironment, Prisma, PrismaClient } from "@prisma/client";

import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";

export type AnalyticsReportQuery = {
  environment: AnalyticsEnvironment;
  from: Date;
  to: Date;
};

type Metrics = { visitors: number; sessions: number; pageViews: number; events: number; inquiries: number };

export class AnalyticsReportPermissionError extends Error {
  constructor() {
    super("Analytics report permission is required.");
    this.name = "AnalyticsReportPermissionError";
  }
}

function assertRange({ from, to }: AnalyticsReportQuery) {
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) throw new TypeError("Invalid report range.");
  if (to.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1_000) throw new RangeError("Report range is limited to 366 days.");
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function metrics(value: Prisma.JsonValue): Metrics {
  const row = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    visitors: number(row.visitors),
    sessions: number(row.sessions),
    pageViews: number(row.pageViews),
    events: number(row.events),
    inquiries: number(row.inquiries),
  };
}

function safeSpreadsheetCell(value: string) {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

function accumulate(rows: Array<{ dimensionValue: string; metrics: Prisma.JsonValue }>) {
  const grouped = new Map<string, Metrics>();
  for (const row of rows) {
    const next = metrics(row.metrics);
    const current = grouped.get(row.dimensionValue) ?? { visitors: 0, sessions: 0, pageViews: 0, events: 0, inquiries: 0 };
    for (const key of Object.keys(current) as Array<keyof Metrics>) current[key] += next[key];
    grouped.set(row.dimensionValue, current);
  }
  return [...grouped.entries()]
    .map(([value, totals]) => ({ value, ...totals }))
    .sort((left, right) => right.visitors - left.visitors || right.sessions - left.sessions || left.value.localeCompare(right.value));
}

export class AnalyticsReportService {
  constructor(private readonly database: PrismaClient = db) {}

  async getReport(principal: Principal, query: AnalyticsReportQuery) {
    if (!can(principal, "analytics.read.summary")) throw new AnalyticsReportPermissionError();
    assertRange(query);
    const rows = await this.database.analyticsDailySummary.findMany({
      where: { environment: query.environment, date: { gte: query.from, lt: query.to } },
      orderBy: [{ date: "asc" }, { dimension: "asc" }, { dimensionValue: "asc" }],
      select: { date: true, dimension: true, dimensionValue: true, metrics: true },
    });
    const totals = rows.filter(({ dimension }) => dimension === "total").map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      ...metrics(row.metrics),
    }));
    const byDimension = (dimension: string) => accumulate(rows.filter((row) => row.dimension === dimension));
    const products = byDimension("product");
    const productNames = products.length > 0
      ? new Map((await this.database.product.findMany({
        where: { id: { in: products.map(({ value }) => value) } },
        select: { id: true, name: true },
      })).map(({ id, name }) => [id, name]))
      : new Map<string, string>();

    const [visitorIds, conversations, inquiryEvents] = await Promise.all([
      this.database.analyticsVisitor.findMany({
        where: { environment: query.environment, isBot: false, lastSeenAt: { gte: query.from, lt: query.to } },
        select: { id: true, linkedLeadId: true },
      }),
      this.database.chatConversation.findMany({
        where: { environment: query.environment, createdAt: { gte: query.from, lt: query.to } },
        select: { visitorId: true, leadId: true },
      }),
      this.database.analyticsEvent.count({
        where: {
          environment: query.environment,
          type: "INQUIRY_SUBMIT",
          occurredAt: { gte: query.from, lt: query.to },
          visitor: { isBot: false },
        },
      }),
    ]);
    const chatVisitors = new Set(conversations.map(({ visitorId }) => visitorId));
    const linkedVisitorIds = new Set([
      ...visitorIds.filter(({ linkedLeadId }) => linkedLeadId).map(({ id }) => id),
      ...conversations.filter(({ leadId }) => leadId).map(({ visitorId }) => visitorId),
    ]);

    return {
      range: { from: query.from.toISOString().slice(0, 10), to: new Date(query.to.getTime() - 1).toISOString().slice(0, 10) },
      environment: query.environment,
      firstParty: {
        trend: totals.map(({ date, visitors, sessions, pageViews, inquiries }) => ({ date, visitors, sessions, pageViews, inquiries })),
        sources: byDimension("source").slice(0, 25),
        countries: byDimension("country").slice(0, 25),
        devices: byDimension("device").slice(0, 25),
        products: products.slice(0, 25).map((item) => ({ ...item, label: productNames.get(item.value) ?? "已删除或未命名产品" })),
        funnel: {
          visitors: visitorIds.length,
          chatVisitors: chatVisitors.size,
          linkedLeads: linkedVisitorIds.size,
          inquirySubmissions: inquiryEvents,
          chatToLeadRate: chatVisitors.size === 0 ? 0 : linkedVisitorIds.size / chatVisitors.size,
        },
      },
      external: {
        ga4: { attribution: "aggregate_only" as const, personAttribution: false as const },
        searchConsole: { attribution: "aggregate_only" as const, personAttribution: false as const },
      },
    };
  }

  async *exportRows(principal: Principal, query: AnalyticsReportQuery, pageSize = 500) {
    if (!can(principal, "analytics.export")) throw new AnalyticsReportPermissionError();
    assertRange(query);
    const boundedPageSize = Math.max(1, Math.min(1_000, Math.trunc(pageSize)));
    let cursor: string | undefined;
    do {
      const rows = await this.database.analyticsDailySummary.findMany({
        where: { environment: query.environment, date: { gte: query.from, lt: query.to } },
        orderBy: { id: "asc" },
        take: boundedPageSize,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: { id: true, date: true, dimension: true, dimensionValue: true, metrics: true },
      });
      for (const row of rows) {
        yield {
          date: row.date.toISOString().slice(0, 10),
          environment: query.environment,
          dimension: safeSpreadsheetCell(row.dimension),
          dimensionValue: safeSpreadsheetCell(row.dimensionValue),
          ...metrics(row.metrics),
        };
      }
      cursor = rows.length === boundedPageSize ? rows.at(-1)?.id : undefined;
    } while (cursor);
  }
}
