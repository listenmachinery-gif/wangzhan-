import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { AnalyticsReportService } from "@/lib/services/analytics-report-service";
import { VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";

const admin: Principal = { id: "performance-admin", email: "performance@example.com", name: "Performance", roles: ["ADMIN"] };
const day = new Date("2026-11-16T00:00:00.000Z");

describe("analytics query performance guardrails", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("uses the environment/time index and keeps representative visitor queries bounded", async () => {
    await db.analyticsVisitor.createMany({
      data: Array.from({ length: 1_200 }, (_, index) => ({
        id: `performance-visitor-${index.toString().padStart(4, "0")}`,
        anonymousId: `performance-anonymous-${index}`,
        environment: "TEST" as const,
        firstSeenAt: new Date(day.getTime() + index * 1_000),
        lastSeenAt: new Date(day.getTime() + index * 1_000),
        lastActiveAt: new Date(day.getTime() + index * 1_000),
        firstSource: { source: index % 2 ? "google" : "direct" },
        countryCode: index % 3 ? "US" : "DE",
        deviceType: index % 2 ? "desktop" : "mobile",
      })),
    });
    const indexes = await db.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes WHERE tablename = 'AnalyticsVisitor'
    `;
    expect(indexes.map(({ indexname }) => indexname)).toContain("AnalyticsVisitor_environment_lastSeenAt_id_idx");

    const started = performance.now();
    const result = await new VisitorAnalyticsQueryService(db).listVisitors(admin, {
      environment: "TEST", page: 1, pageSize: 20, countryCode: "US", deviceType: "desktop",
    }, new Date("2026-11-16T12:00:00.000Z"));
    const elapsedMs = performance.now() - started;

    expect(result.items).toHaveLength(20);
    expect(result.total).toBeGreaterThan(100);
    expect(elapsedMs).toBeLessThan(2_000);
  });

  it("streams a large report in bounded pages without retaining the full export", async () => {
    await db.analyticsDailySummary.createMany({
      data: Array.from({ length: 1_000 }, (_, index) => ({
        environment: "TEST" as const,
        date: day,
        dimension: "source",
        dimensionValue: `performance-source-${index}`,
        metrics: { visitors: index + 1, sessions: index + 1, pageViews: index + 2, events: 0, inquiries: 0 },
      })),
    });
    const before = process.memoryUsage().heapUsed;
    let count = 0;
    for await (const row of new AnalyticsReportService(db).exportRows(admin, {
      environment: "TEST", from: day, to: new Date("2026-11-17T00:00:00.000Z"),
    }, 100)) {
      expect(row.environment).toBe("TEST");
      count += 1;
    }
    const growth = process.memoryUsage().heapUsed - before;
    expect(count).toBe(1_000);
    expect(growth).toBeLessThan(96 * 1024 * 1024);
  });
});
