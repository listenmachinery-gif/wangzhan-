import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { FirstPartyAnalyticsService } from "@/lib/services/first-party-analytics-service";
import { parseAnalyticsBatch } from "@/lib/validation/first-party-analytics";

const identity = {
  visitorId: "0123456789abcdef0123456789abcdef",
  sessionId: "abcdef0123456789abcdef0123456789",
};

function batch(productSlug = "small-electric-shearing-machine") {
  return parseAnalyticsBatch({
    events: [
      {
        kind: "page_view",
        eventId: "event_page_1",
        pageViewId: "page_1",
        path: `/products/${productSlug}?utm_source=google&utm_medium=cpc&utm_campaign=export`,
        title: "Small Electric Shearing Machine",
        referrer: "https://www.google.com/",
        productSlug,
        occurredAt: "2026-11-16T08:00:00.000Z",
      },
      {
        kind: "event",
        eventId: "event_product_1",
        pageViewId: "page_1",
        eventType: "PRODUCT_VIEW",
        path: `/products/${productSlug}`,
        productSlug,
        properties: { placement: "product_page", product_category: "Shearing Machines" },
        occurredAt: "2026-11-16T08:00:01.000Z",
      },
    ],
  });
}

const context = {
  environment: "TEST" as const,
  now: new Date("2026-11-16T08:00:02.000Z"),
  countryCode: "US",
  region: "VA",
  city: "Ashburn",
  deviceType: "desktop",
  browser: "Chrome",
  operatingSystem: "macOS",
  ipHash: "network-hash",
  isBot: false,
};

describe("first-party analytics ingestion", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(() => db.$disconnect());

  it("persists visitor, session, source, page view, event, and product relationships", async () => {
    const category = await db.productCategory.create({
      data: { name: "Shearing Machines", slug: "analytics-shearing" },
    });
    const product = await db.product.create({
      data: {
        categoryId: category.id,
        name: "Small Electric Shearing Machine",
        slug: "small-electric-shearing-machine",
        summary: "Compact electric shear.",
      },
    });

    const result = await new FirstPartyAnalyticsService(db).collectAnalyticsBatch(identity, batch(), context);

    expect(result).toEqual({ accepted: 2, duplicates: 0 });
    await expect(db.analyticsVisitor.findFirstOrThrow()).resolves.toMatchObject({
      anonymousId: identity.visitorId,
      countryCode: "US",
      isBot: false,
      firstSource: { source: "google", medium: "cpc", campaign: "export" },
    });
    await expect(db.analyticsSession.findFirstOrThrow()).resolves.toMatchObject({
      sessionKey: identity.sessionId,
      source: "google",
      medium: "cpc",
      campaign: "export",
      pageViewCount: 1,
      eventCount: 1,
    });
    await expect(db.analyticsPageView.findFirstOrThrow()).resolves.toMatchObject({ productId: product.id });
    await expect(db.analyticsEvent.findFirstOrThrow()).resolves.toMatchObject({ productId: product.id });
  });

  it("treats an identical retried batch as duplicates without inflating counts", async () => {
    const category = await db.productCategory.create({ data: { name: "Shearing", slug: "retry-shearing" } });
    await db.product.create({
      data: {
        categoryId: category.id,
        name: "Small Electric Shearing Machine",
        slug: "small-electric-shearing-machine",
        summary: "Compact electric shear.",
      },
    });
    const service = new FirstPartyAnalyticsService(db);

    await expect(service.collectAnalyticsBatch(identity, batch(), context)).resolves.toEqual({ accepted: 2, duplicates: 0 });
    await expect(service.collectAnalyticsBatch(identity, batch(), context)).resolves.toEqual({ accepted: 0, duplicates: 2 });

    await expect(db.analyticsPageView.count()).resolves.toBe(1);
    await expect(db.analyticsEvent.count()).resolves.toBe(1);
    await expect(db.analyticsSession.findFirstOrThrow()).resolves.toMatchObject({ pageViewCount: 1, eventCount: 1 });
  });

  it("serializes concurrent retries without duplicate rows or inflated counters", async () => {
    const category = await db.productCategory.create({ data: { name: "Concurrent Shearing", slug: "concurrent-shearing" } });
    await db.product.create({
      data: {
        categoryId: category.id,
        name: "Small Electric Shearing Machine",
        slug: "small-electric-shearing-machine",
        summary: "Compact electric shear.",
      },
    });
    const service = new FirstPartyAnalyticsService(db);

    const results = await Promise.all(Array.from({ length: 5 }, () => (
      service.collectAnalyticsBatch(identity, batch(), context)
    )));

    expect(results.filter(({ accepted }) => accepted === 2)).toHaveLength(1);
    expect(results.filter(({ duplicates }) => duplicates === 2)).toHaveLength(4);
    await expect(db.analyticsPageView.count()).resolves.toBe(1);
    await expect(db.analyticsEvent.count()).resolves.toBe(1);
    await expect(db.analyticsSession.findFirstOrThrow()).resolves.toMatchObject({ pageViewCount: 1, eventCount: 1 });
  });

  it("rejects client timestamps outside the accepted retry window without writing data", async () => {
    const stale = parseAnalyticsBatch({ events: [{
      kind: "page_view",
      eventId: "stale_event",
      pageViewId: "stale_page",
      path: "/",
      occurredAt: "2026-11-15T07:59:59.999Z",
    }] });
    const future = parseAnalyticsBatch({ events: [{
      kind: "page_view",
      eventId: "future_event",
      pageViewId: "future_page",
      path: "/",
      occurredAt: "2026-11-16T08:05:02.001Z",
    }] });
    const service = new FirstPartyAnalyticsService(db);

    await expect(service.collectAnalyticsBatch(identity, stale, context)).rejects.toMatchObject({
      name: "AnalyticsEventTimeError",
    });
    await expect(service.collectAnalyticsBatch(identity, future, context)).rejects.toMatchObject({
      name: "AnalyticsEventTimeError",
    });
    await expect(db.analyticsVisitor.count()).resolves.toBe(0);
  });

  it("isolates environments and marks bot sessions for later exclusion", async () => {
    const service = new FirstPartyAnalyticsService(db);
    const previewBatch = parseAnalyticsBatch({ events: [{
      kind: "page_view",
      eventId: "preview_event",
      pageViewId: "preview_page",
      path: "/",
      occurredAt: "2026-11-16T08:00:00.000Z",
    }] });
    const productionBatch = parseAnalyticsBatch({ events: [{
      kind: "page_view",
      eventId: "production_event",
      pageViewId: "production_page",
      path: "/",
      occurredAt: "2026-11-16T08:00:00.000Z",
    }] });

    await service.collectAnalyticsBatch(identity, previewBatch, { ...context, environment: "PREVIEW", isBot: true });
    await service.collectAnalyticsBatch(identity, productionBatch, { ...context, environment: "PRODUCTION" });

    await expect(db.analyticsVisitor.count()).resolves.toBe(2);
    await expect(db.analyticsVisitor.count({ where: { environment: "PREVIEW", isBot: true } })).resolves.toBe(1);
    await expect(db.analyticsVisitor.count({ where: { environment: "PRODUCTION", isBot: false } })).resolves.toBe(1);
  });
});
