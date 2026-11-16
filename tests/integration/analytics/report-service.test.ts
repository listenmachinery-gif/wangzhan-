import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { AnalyticsReportPermissionError, AnalyticsReportService } from "@/lib/services/analytics-report-service";

const admin: Principal = { id: "admin", email: "admin@example.com", name: "Admin", roles: ["ADMIN"] };
const editor: Principal = { id: "editor", email: "editor@example.com", name: "Editor", roles: ["CONTENT_EDITOR"] };
const from = new Date("2026-11-15T00:00:00.000Z");
const to = new Date("2026-11-17T00:00:00.000Z");

describe("analytics report service", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("builds first-party trends and dimensional breakdowns without pretending GA4 or GSC are people", async () => {
    await db.analyticsDailySummary.createMany({ data: [
      { environment: "TEST", date: from, dimension: "total", dimensionValue: "all", metrics: { visitors: 4, sessions: 5, pageViews: 12, events: 3, inquiries: 1 } },
      { environment: "TEST", date: from, dimension: "source", dimensionValue: "google", metrics: { visitors: 3, sessions: 4, pageViews: 9, events: 2, inquiries: 1 } },
      { environment: "TEST", date: from, dimension: "country", dimensionValue: "US", metrics: { visitors: 2, sessions: 2, pageViews: 5, events: 1, inquiries: 0 } },
      { environment: "TEST", date: from, dimension: "device", dimensionValue: "desktop", metrics: { visitors: 4, sessions: 5, pageViews: 12, events: 3, inquiries: 1 } },
      { environment: "PRODUCTION", date: from, dimension: "total", dimensionValue: "all", metrics: { visitors: 999 } },
    ] });

    const report = await new AnalyticsReportService(db).getReport(admin, { environment: "TEST", from, to });

    expect(report.firstParty.trend).toEqual([{ date: "2026-11-15", visitors: 4, sessions: 5, pageViews: 12, inquiries: 1 }]);
    expect(report.firstParty.sources[0]).toMatchObject({ value: "google", visitors: 3 });
    expect(report.firstParty.countries[0]).toMatchObject({ value: "US", pageViews: 5 });
    expect(report.firstParty.devices[0]).toMatchObject({ value: "desktop", sessions: 5 });
    expect(report.external).toEqual({
      ga4: { attribution: "aggregate_only", personAttribution: false },
      searchConsole: { attribution: "aggregate_only", personAttribution: false },
    });
  });

  it("enforces report and export permissions and streams spreadsheet-safe rows in bounded pages", async () => {
    await db.analyticsDailySummary.create({
      data: { environment: "TEST", date: from, dimension: "source", dimensionValue: "=IMPORTXML(\"bad\")", metrics: { visitors: 1, sessions: 1, pageViews: 1, events: 0, inquiries: 0 } },
    });
    const service = new AnalyticsReportService(db);

    await expect(service.getReport(editor, { environment: "TEST", from, to })).rejects.toBeInstanceOf(AnalyticsReportPermissionError);
    await expect(async () => {
      for await (const _row of service.exportRows(editor, { environment: "TEST", from, to })) void _row;
    }).rejects.toBeInstanceOf(AnalyticsReportPermissionError);

    const rows = [];
    for await (const row of service.exportRows(admin, { environment: "TEST", from, to }, 1)) rows.push(row);
    expect(rows).toEqual([expect.objectContaining({ dimensionValue: "'=IMPORTXML(\"bad\")" })]);
  });
});
