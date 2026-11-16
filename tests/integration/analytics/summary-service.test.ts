import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { AnalyticsSummaryService } from "@/lib/services/analytics-summary-service";

describe("analytics daily summary service", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("aggregates one UTC day by total, source, country, device, and product while excluding bots", async () => {
    const product = await db.product.create({
      data: {
        name: "Daily machine",
        slug: "daily-machine",
        summary: "Daily reporting machine",
        status: "PUBLISHED",
        category: { create: { name: "Daily category", slug: "daily-category", summary: "Reporting category" } },
      },
    });
    const visitor = await db.analyticsVisitor.create({
      data: {
        anonymousId: "summary-human",
        environment: "TEST",
        firstSeenAt: new Date("2026-11-15T23:55:00.000Z"),
        lastSeenAt: new Date("2026-11-16T00:30:00.000Z"),
        countryCode: "DE",
        deviceType: "desktop",
      },
    });
    const session = await db.analyticsSession.create({
      data: {
        visitorId: visitor.id,
        sessionKey: "summary-session",
        environment: "TEST",
        startedAt: new Date("2026-11-16T00:00:00.000Z"),
        lastSeenAt: new Date("2026-11-16T00:30:00.000Z"),
        landingPath: "/products/daily-machine",
        source: "google",
        countryCode: "DE",
        deviceType: "desktop",
      },
    });
    const pageView = await db.analyticsPageView.create({
      data: {
        visitorId: visitor.id,
        sessionId: session.id,
        productId: product.id,
        environment: "TEST",
        pageViewKey: "summary-page",
        path: "/products/daily-machine",
        startedAt: new Date("2026-11-16T00:05:00.000Z"),
      },
    });
    await db.analyticsEvent.create({
      data: {
        visitorId: visitor.id,
        sessionId: session.id,
        pageViewId: pageView.id,
        productId: product.id,
        environment: "TEST",
        eventKey: "summary-event",
        type: "INQUIRY_SUBMIT",
        occurredAt: new Date("2026-11-16T23:59:59.999Z"),
      },
    });

    const bot = await db.analyticsVisitor.create({
      data: {
        anonymousId: "summary-bot",
        environment: "TEST",
        firstSeenAt: new Date("2026-11-16T01:00:00.000Z"),
        lastSeenAt: new Date("2026-11-16T01:00:00.000Z"),
        isBot: true,
      },
    });
    await db.analyticsSession.create({
      data: {
        visitorId: bot.id,
        sessionKey: "summary-bot-session",
        environment: "TEST",
        startedAt: new Date("2026-11-16T01:00:00.000Z"),
        lastSeenAt: new Date("2026-11-16T01:00:00.000Z"),
        landingPath: "/",
        isBot: true,
      },
    });

    const result = await new AnalyticsSummaryService(db).summarizeDay(new Date("2026-11-16T18:45:00+08:00"), "TEST");

    expect(result.date).toBe("2026-11-16");
    expect(result.rows).toBe(5);
    const rows = await db.analyticsDailySummary.findMany({ orderBy: [{ dimension: "asc" }, { dimensionValue: "asc" }] });
    expect(rows.map(({ dimension, dimensionValue }) => `${dimension}:${dimensionValue}`)).toEqual([
      `country:DE`,
      `device:desktop`,
      `product:${product.id}`,
      `source:google`,
      `total:all`,
    ]);
    expect(rows.find(({ dimension }) => dimension === "total")?.metrics).toEqual({
      visitors: 1,
      sessions: 1,
      pageViews: 1,
      events: 1,
      inquiries: 1,
    });
  });

  it("replaces a day idempotently and keeps environments isolated", async () => {
    await db.analyticsDailySummary.create({
      data: {
        environment: "TEST",
        date: new Date("2026-11-16T00:00:00.000Z"),
        dimension: "stale",
        dimensionValue: "stale",
        metrics: { visitors: 99 },
      },
    });
    await db.analyticsDailySummary.create({
      data: {
        environment: "PRODUCTION",
        date: new Date("2026-11-16T00:00:00.000Z"),
        dimension: "total",
        dimensionValue: "all",
        metrics: { visitors: 42 },
      },
    });

    const service = new AnalyticsSummaryService(db);
    await service.summarizeDay(new Date("2026-11-16T00:00:00.000Z"), "TEST");
    await service.summarizeDay(new Date("2026-11-16T23:59:00.000Z"), "TEST");

    expect(await db.analyticsDailySummary.count({ where: { environment: "TEST" } })).toBe(1);
    expect(await db.analyticsDailySummary.findFirst({ where: { environment: "TEST" } })).toMatchObject({
      dimension: "total",
      dimensionValue: "all",
      version: 1,
      metrics: { visitors: 0, sessions: 0, pageViews: 0, events: 0, inquiries: 0 },
    });
    expect(await db.analyticsDailySummary.count({ where: { environment: "PRODUCTION" } })).toBe(1);
  });
});
