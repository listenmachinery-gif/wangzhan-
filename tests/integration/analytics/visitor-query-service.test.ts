import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  VisitorAnalyticsNotFoundError,
  VisitorAnalyticsPermissionError,
  VisitorAnalyticsQueryService,
} from "@/lib/services/visitor-analytics-query-service";

const admin: Principal = {
  id: "admin",
  email: "admin@zyroncnc.com",
  name: "Admin",
  roles: ["ADMIN"],
};
const editor: Principal = {
  id: "editor",
  email: "editor@zyroncnc.com",
  name: "Editor",
  roles: ["CONTENT_EDITOR"],
};
const now = new Date("2026-11-16T12:00:00.000Z");

async function visitor(input: {
  id: string;
  environment?: "TEST" | "PREVIEW";
  firstSeenAt?: Date;
  lastSeenAt: Date;
  lastActiveAt?: Date;
  source?: string;
  countryCode?: string;
  city?: string;
  deviceType?: string;
  isBot?: boolean;
}) {
  return db.analyticsVisitor.create({
    data: {
      id: input.id,
      anonymousId: `anonymous-${input.id}`,
      environment: input.environment ?? "TEST",
      firstSeenAt: input.firstSeenAt ?? new Date("2026-11-16T08:00:00.000Z"),
      lastSeenAt: input.lastSeenAt,
      lastActiveAt: input.lastActiveAt,
      firstSource: { source: input.source ?? "direct", medium: input.source ? "referral" : "none" },
      lastSource: { source: input.source ?? "direct", medium: input.source ? "referral" : "none" },
      countryCode: input.countryCode,
      city: input.city,
      deviceType: input.deviceType,
      isBot: input.isBot ?? false,
    },
  });
}

async function session(visitorId: string, id: string, startedAt = new Date("2026-11-16T08:00:00.000Z")) {
  return db.analyticsSession.create({
    data: {
      id,
      visitorId,
      sessionKey: `public-${id}`,
      environment: "TEST",
      startedAt,
      lastSeenAt: now,
      lastActiveAt: now,
      landingPath: "/",
    },
  });
}

describe("visitor analytics query service", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(() => db.$disconnect());

  it("applies exact online and active boundaries while excluding bots and other environments", async () => {
    const online = await visitor({
      id: "visitor-online",
      lastSeenAt: new Date(now.getTime() - 120_000),
      lastActiveAt: new Date(now.getTime() - 300_000),
    });
    const offline = await visitor({
      id: "visitor-offline",
      lastSeenAt: new Date(now.getTime() - 120_001),
      lastActiveAt: new Date(now.getTime() - 300_001),
    });
    await visitor({ id: "visitor-bot", lastSeenAt: now, lastActiveAt: now, isBot: true });
    await visitor({ id: "visitor-preview", environment: "PREVIEW", lastSeenAt: now, lastActiveAt: now });
    await session(online.id, "session-online");
    await session(offline.id, "session-offline");
    await db.analyticsPageView.create({
      data: {
        visitorId: online.id,
        sessionId: "session-online",
        environment: "TEST",
        pageViewKey: "page-online",
        path: "/products",
        startedAt: now,
      },
    });

    const result = await new VisitorAnalyticsQueryService(db).getRealtimeSummary(admin, now, "TEST");

    expect(result).toEqual({
      onlineVisitors: 1,
      activeVisitors: 1,
      visitorsToday: 2,
      sessionsToday: 2,
      pageViewsToday: 1,
    });
  });

  it("returns only bounded first-time arrivals with safe display fields and latest paths", async () => {
    const recent = await visitor({
      id: "visitor-recent-arrival",
      firstSeenAt: new Date("2026-11-16T11:59:40.000Z"),
      lastSeenAt: now,
      countryCode: "US",
      city: "Chicago",
      deviceType: "mobile",
    });
    const recentSession = await session(recent.id, "session-recent", new Date("2026-11-16T11:59:40.000Z"));
    await db.analyticsPageView.createMany({
      data: [
        { visitorId: recent.id, sessionId: recentSession.id, environment: "TEST", pageViewKey: "recent-page-1", path: "/products", startedAt: new Date("2026-11-16T11:59:41.000Z") },
        { visitorId: recent.id, sessionId: recentSession.id, environment: "TEST", pageViewKey: "recent-page-2", path: "/products/small-electric-shear", startedAt: new Date("2026-11-16T11:59:45.000Z") },
      ],
    });
    await visitor({ id: "visitor-before-cursor", firstSeenAt: new Date("2026-11-16T11:58:59.999Z"), lastSeenAt: now });
    await visitor({ id: "visitor-bot-arrival", firstSeenAt: new Date("2026-11-16T11:59:50.000Z"), lastSeenAt: now, isBot: true });
    await visitor({ id: "visitor-preview-arrival", environment: "PREVIEW", firstSeenAt: new Date("2026-11-16T11:59:50.000Z"), lastSeenAt: now });

    const result = await new VisitorAnalyticsQueryService(db).getRealtimeOverview(
      admin,
      now,
      "TEST",
      new Date("2026-11-16T11:59:00.000Z"),
    );

    expect(result.arrivals).toEqual([{
      id: recent.id,
      label: "访客-RRIVAL",
      firstSeenAt: "2026-11-16T11:59:40.000Z",
      countryCode: "US",
      city: "Chicago",
      deviceType: "mobile",
      path: "/products/small-electric-shear",
    }]);
    expect(JSON.stringify(result.arrivals)).not.toMatch(/anonymousId|visitorId|cookie/i);
  });

  it("clamps stale cursors to five minutes, caps arrivals at twenty, and keeps baseline silent", async () => {
    for (let index = 0; index < 23; index += 1) {
      await visitor({
        id: `visitor-capped-${String(index).padStart(2, "0")}`,
        firstSeenAt: new Date(now.getTime() - 4 * 60_000 + index * 1_000),
        lastSeenAt: now,
      });
    }
    await visitor({ id: "visitor-too-old", firstSeenAt: new Date(now.getTime() - 5 * 60_000 - 1), lastSeenAt: now });

    const service = new VisitorAnalyticsQueryService(db);
    const result = await service.getRealtimeOverview(admin, now, "TEST", new Date("2026-11-16T00:00:00.000Z"));
    const baseline = await service.getRealtimeOverview(admin, now, "TEST");

    expect(result.arrivals).toHaveLength(20);
    expect(result.arrivals.at(-1)?.id).toBe("visitor-capped-22");
    expect(result.arrivals.some(({ id }) => id === "visitor-too-old")).toBe(false);
    expect(baseline.arrivals).toEqual([]);
  });

  it("returns stable pages and applies source, country, device, and status filters", async () => {
    await visitor({ id: "visitor-a", lastSeenAt: new Date("2026-11-16T11:59:00Z"), lastActiveAt: now, source: "google", countryCode: "US", deviceType: "desktop" });
    await visitor({ id: "visitor-b", lastSeenAt: new Date("2026-11-16T11:58:00Z"), source: "google", countryCode: "US", deviceType: "mobile" });
    await visitor({ id: "visitor-c", lastSeenAt: new Date("2026-11-16T11:57:00Z"), source: "linkedin", countryCode: "DE", deviceType: "desktop" });

    const service = new VisitorAnalyticsQueryService(db);
    const first = await service.listVisitors(admin, { environment: "TEST", page: 1, pageSize: 2 }, now);
    const second = await service.listVisitors(admin, { environment: "TEST", page: 2, pageSize: 2 }, now);

    expect(first.items.map(({ id }) => id)).toEqual(["visitor-a", "visitor-b"]);
    expect(second.items.map(({ id }) => id)).toEqual(["visitor-c"]);
    expect(first).toMatchObject({ total: 3, page: 1, pageSize: 2 });
    expect(new Set([...first.items, ...second.items].map(({ id }) => id)).size).toBe(3);
    expect(first.items[0]).not.toHaveProperty("anonymousId");

    await expect(service.listVisitors(admin, {
      environment: "TEST",
      page: 1,
      pageSize: 20,
      source: "google",
      countryCode: "US",
      deviceType: "desktop",
      status: "active",
    }, now)).resolves.toMatchObject({ items: [{ id: "visitor-a" }], total: 1 });
  });

  it("returns a visitor timeline without exposing signed-cookie identifiers", async () => {
    const created = await visitor({ id: "visitor-timeline", lastSeenAt: now, source: "google" });
    const createdSession = await session(created.id, "session-timeline");
    const page = await db.analyticsPageView.create({
      data: {
        visitorId: created.id,
        sessionId: createdSession.id,
        environment: "TEST",
        pageViewKey: "page-timeline",
        path: "/products/test",
        startedAt: now,
      },
    });
    await db.analyticsEvent.create({
      data: {
        visitorId: created.id,
        sessionId: createdSession.id,
        pageViewId: page.id,
        environment: "TEST",
        eventKey: "event-timeline",
        type: "PRODUCT_VIEW",
        occurredAt: now,
      },
    });

    const service = new VisitorAnalyticsQueryService(db);
    await expect(service.getVisitorTimeline(admin, created.id, "PREVIEW")).rejects.toBeInstanceOf(VisitorAnalyticsNotFoundError);
    const timeline = await service.getVisitorTimeline(admin, created.id, "TEST");

    expect(timeline).toMatchObject({
      id: created.id,
      sessions: [{ id: createdSession.id, pageViews: [{ id: page.id }], events: [{ type: "PRODUCT_VIEW" }] }],
    });
    expect(timeline).not.toHaveProperty("anonymousId");
  });

  it("rejects principals without analytics permissions", async () => {
    const service = new VisitorAnalyticsQueryService(db);

    await expect(service.getRealtimeSummary(editor, now, "TEST")).rejects.toBeInstanceOf(VisitorAnalyticsPermissionError);
    await expect(service.getRealtimeOverview(editor, now, "TEST", new Date(now.getTime() - 1_000))).rejects.toBeInstanceOf(VisitorAnalyticsPermissionError);
    await expect(service.listVisitors(editor, { environment: "TEST", page: 1, pageSize: 20 }, now)).rejects.toBeInstanceOf(VisitorAnalyticsPermissionError);
    await expect(service.getVisitorTimeline(editor, "missing", "TEST")).rejects.toBeInstanceOf(VisitorAnalyticsPermissionError);
  });
});
