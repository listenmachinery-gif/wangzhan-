import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { PrivacyRetentionService } from "@/lib/services/privacy-retention-service";

const now = new Date("2026-11-16T12:00:00.000Z");

async function visitor(anonymousId: string, environment: "TEST" | "PRODUCTION", lastSeenAt: Date) {
  return db.analyticsVisitor.create({ data: { anonymousId, environment, firstSeenAt: lastSeenAt, lastSeenAt } });
}

describe("privacy retention service", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("removes expired raw analytics, summaries, and chats in bounded environment-scoped batches", async () => {
    const stale = await visitor("stale-test", "TEST", new Date("2026-01-01T00:00:00.000Z"));
    const production = await visitor("stale-production", "PRODUCTION", new Date("2026-01-01T00:00:00.000Z"));
    const chatVisitor = await visitor("chat-test", "TEST", new Date("2024-01-01T00:00:00.000Z"));
    await db.analyticsSession.create({ data: { visitorId: stale.id, sessionKey: "stale-session", environment: "TEST", startedAt: stale.lastSeenAt, lastSeenAt: stale.lastSeenAt, landingPath: "/" } });
    await db.chatConversation.create({ data: { visitorId: chatVisitor.id, environment: "TEST", status: "CLOSED", lastMessageAt: new Date("2024-01-01T00:00:00.000Z"), createdAt: new Date("2024-01-01T00:00:00.000Z") } });
    await db.analyticsDailySummary.createMany({ data: [
      { environment: "TEST", date: new Date("2024-01-01T00:00:00.000Z"), dimension: "total", dimensionValue: "all", metrics: {} },
      { environment: "PRODUCTION", date: new Date("2024-01-01T00:00:00.000Z"), dimension: "total", dimensionValue: "all", metrics: {} },
    ] });

    const result = await new PrivacyRetentionService(db, { rawDays: 180, summaryDays: 730, chatDays: 730, batchSize: 100 }).applyRetention(now, "TEST");

    expect(result).toMatchObject({ visitorsDeleted: 2, chatsDeleted: 1, summariesDeleted: 1 });
    expect(await db.analyticsVisitor.count({ where: { environment: "TEST" } })).toBe(0);
    expect(await db.analyticsVisitor.count({ where: { id: production.id } })).toBe(1);
    expect(await db.analyticsDailySummary.count({ where: { environment: "PRODUCTION" } })).toBe(1);
  });

  it("is safe to rerun and retains active chat shells while removing their expired analytics detail", async () => {
    const retained = await visitor("retained-chat", "TEST", new Date("2026-01-01T00:00:00.000Z"));
    const session = await db.analyticsSession.create({ data: { visitorId: retained.id, sessionKey: "retained-session", environment: "TEST", startedAt: retained.lastSeenAt, lastSeenAt: retained.lastSeenAt, landingPath: "/" } });
    await db.chatConversation.create({ data: { visitorId: retained.id, sessionId: session.id, environment: "TEST", status: "OPEN", lastMessageAt: new Date("2026-11-01T00:00:00.000Z") } });
    const service = new PrivacyRetentionService(db, { rawDays: 180, summaryDays: 730, chatDays: 730, batchSize: 1 });

    await service.applyRetention(now, "TEST");
    const second = await service.applyRetention(now, "TEST");

    expect(await db.analyticsVisitor.count({ where: { id: retained.id } })).toBe(1);
    expect(await db.analyticsSession.count({ where: { visitorId: retained.id } })).toBe(0);
    expect(second).toMatchObject({ visitorsDeleted: 0, chatsDeleted: 0, summariesDeleted: 0 });
  });
});
