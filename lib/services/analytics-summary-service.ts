import "server-only";

import { Prisma, type AnalyticsEnvironment, type AnalyticsEventType, type PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";

type SummaryMetrics = {
  visitors: number;
  sessions: number;
  pageViews: number;
  events: number;
  inquiries: number;
};

type MutableMetrics = {
  visitorIds: Set<string>;
  sessionIds: Set<string>;
  pageViews: number;
  events: number;
  inquiries: number;
};

function utcDayStart(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function dayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function cleanDimensionValue(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, 200) : "unknown";
}

function mutableMetrics(): MutableMetrics {
  return { visitorIds: new Set(), sessionIds: new Set(), pageViews: 0, events: 0, inquiries: 0 };
}

function jsonMetrics(metrics: MutableMetrics): SummaryMetrics {
  return {
    visitors: metrics.visitorIds.size,
    sessions: metrics.sessionIds.size,
    pageViews: metrics.pageViews,
    events: metrics.events,
    inquiries: metrics.inquiries,
  };
}

function isInquiry(type: AnalyticsEventType) {
  return type === "INQUIRY_SUBMIT";
}

export class AnalyticsSummaryService {
  constructor(private readonly database: PrismaClient = db) {}

  async summarizeDay(day: Date, environment: AnalyticsEnvironment) {
    if (Number.isNaN(day.getTime())) throw new TypeError("A valid reporting day is required.");
    const start = utcDayStart(day);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1_000);

    const rows = await this.database.$transaction(async (transaction) => {
      const sessions = await transaction.analyticsSession.findMany({
        where: {
          environment,
          isBot: false,
          OR: [
            { startedAt: { gte: start, lt: end } },
            { pageViews: { some: { startedAt: { gte: start, lt: end } } } },
            { events: { some: { occurredAt: { gte: start, lt: end } } } },
          ],
        },
        select: {
          id: true,
          visitorId: true,
          source: true,
          countryCode: true,
          deviceType: true,
          pageViews: {
            where: { startedAt: { gte: start, lt: end } },
            select: { productId: true },
          },
          events: {
            where: { occurredAt: { gte: start, lt: end } },
            select: { productId: true, type: true },
          },
        },
      });

      const buckets = new Map<string, { dimension: string; dimensionValue: string; metrics: MutableMetrics }>();
      const bucket = (dimension: string, dimensionValue: string) => {
        const key = `${dimension}\u0000${dimensionValue}`;
        let current = buckets.get(key);
        if (!current) {
          current = { dimension, dimensionValue, metrics: mutableMetrics() };
          buckets.set(key, current);
        }
        return current.metrics;
      };

      const addSession = (metrics: MutableMetrics, session: typeof sessions[number]) => {
        metrics.visitorIds.add(session.visitorId);
        metrics.sessionIds.add(session.id);
        metrics.pageViews += session.pageViews.length;
        metrics.events += session.events.length;
        metrics.inquiries += session.events.filter(({ type }) => isInquiry(type)).length;
      };

      for (const session of sessions) {
        addSession(bucket("total", "all"), session);
        addSession(bucket("source", cleanDimensionValue(session.source)), session);
        addSession(bucket("country", cleanDimensionValue(session.countryCode)), session);
        addSession(bucket("device", cleanDimensionValue(session.deviceType)), session);

        const productIds = new Set([
          ...session.pageViews.map(({ productId }) => productId),
          ...session.events.map(({ productId }) => productId),
        ].filter((productId): productId is string => Boolean(productId)));
        for (const productId of productIds) {
          const metrics = bucket("product", productId);
          metrics.visitorIds.add(session.visitorId);
          metrics.sessionIds.add(session.id);
          metrics.pageViews += session.pageViews.filter((view) => view.productId === productId).length;
          const productEvents = session.events.filter((event) => event.productId === productId);
          metrics.events += productEvents.length;
          metrics.inquiries += productEvents.filter(({ type }) => isInquiry(type)).length;
        }
      }

      if (!buckets.has("total\u0000all")) bucket("total", "all");
      const replacements = [...buckets.values()].map(({ dimension, dimensionValue, metrics }) => ({
        environment,
        date: start,
        dimension,
        dimensionValue,
        metrics: jsonMetrics(metrics) as unknown as Prisma.InputJsonValue,
        version: 1,
      }));

      await transaction.analyticsDailySummary.deleteMany({ where: { environment, date: start } });
      await transaction.analyticsDailySummary.createMany({ data: replacements });
      return replacements.length;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return { date: dayKey(start), environment, rows };
  }
}
