import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { VisitorAnalyticsPermissionError, VisitorAnalyticsQueryService } from "@/lib/services/visitor-analytics-query-service";

const admin: Principal = { id: "admin", email: "admin@zyroncnc.com", name: "Admin", roles: ["ADMIN"] };
const editor: Principal = { id: "editor", email: "editor@zyroncnc.com", name: "Editor", roles: ["CONTENT_EDITOR"] };
const now = new Date("2026-11-16T12:00:00.000Z");

async function createVisitor(input: { id: string; source: string; countryCode: string; deviceType: string; lastSeenAt: Date; city?: string }) {
  return db.analyticsVisitor.create({
    data: {
      id: input.id,
      anonymousId: `cookie-${input.id}`,
      environment: "TEST",
      firstSeenAt: new Date("2026-11-01T08:00:00.000Z"),
      lastSeenAt: input.lastSeenAt,
      lastActiveAt: input.lastSeenAt,
      firstSource: { source: input.source, medium: "referral" },
      lastSource: { source: input.source, medium: "referral" },
      countryCode: input.countryCode,
      city: input.city,
      deviceType: input.deviceType,
      isBot: false,
    },
  });
}

describe("visitor analytics CSV export", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("uses list-equivalent filters, stable ordering, readable labels, and formula-safe cells", async () => {
    await createVisitor({ id: "visitor-a12345", source: "=HYPERLINK(\"x\")", countryCode: "US", deviceType: "desktop", lastSeenAt: new Date("2026-11-16T11:50:00.000Z"), city: "+SUM(1,1)" });
    await createVisitor({ id: "visitor-b67890", source: "google", countryCode: "DE", deviceType: "mobile", lastSeenAt: new Date("2026-11-16T10:00:00.000Z") });

    const service = new VisitorAnalyticsQueryService(db);
    const csv = await service.exportCsv(admin, {
      environment: "TEST",
      page: 1,
      pageSize: 20,
      countryCode: "US",
      deviceType: "desktop",
      from: new Date("2026-11-16T00:00:00.000Z"),
      to: new Date("2026-11-16T23:59:59.999Z"),
    }, now);

    expect(csv).toContain("访客-A12345");
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+SUM(1,1)");
    expect(csv).not.toContain("cookie-visitor-a12345");
    expect(csv).not.toContain("访客-B67890");
  });

  it("rejects exports without analytics.export", async () => {
    await expect(new VisitorAnalyticsQueryService(db).exportCsv(editor, {
      environment: "TEST",
      page: 1,
      pageSize: 20,
    }, now)).rejects.toBeInstanceOf(VisitorAnalyticsPermissionError);
  });
});
