import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  listVisitors: vi.fn(),
  exportCsv: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/guards")>(),
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/services/visitor-analytics-query-service", () => ({
  VisitorAnalyticsPermissionError: class VisitorAnalyticsPermissionError extends Error {},
  VisitorAnalyticsQueryService: class {
    listVisitors = mocks.listVisitors;
    exportCsv = mocks.exportCsv;
  },
}));

import { GET as getVisitors } from "@/app/api/admin/analytics/visitors/route";
import { GET as exportVisitors } from "@/app/api/admin/analytics/visitors/export/route";
import { PermissionDeniedError } from "@/lib/auth/guards";
import { visitorListQuerySchema } from "@/lib/validation/visitor-analytics";

const principal = { id: "admin", email: "admin@zyroncnc.com", name: "Admin", roles: ["ADMIN"] };

describe("visitor analytics routes", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    mocks.requirePermission.mockResolvedValue(principal);
    mocks.listVisitors.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    mocks.exportCsv.mockResolvedValue("visitor,lastSeenAt\r\n");
  });

  it("normalizes all supported filters and date boundaries", () => {
    const parsed = visitorListQuerySchema.parse({
      page: "2",
      pageSize: "50",
      from: "2026-11-01",
      to: "2026-11-16",
      source: " google ",
      countryCode: "us",
      deviceType: "mobile",
      status: "active",
      productId: "product_123",
    });

    expect(parsed).toMatchObject({
      page: 2,
      pageSize: 50,
      source: "google",
      countryCode: "US",
      deviceType: "mobile",
      status: "active",
      productId: "product_123",
    });
    expect(parsed.from?.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(parsed.to?.toISOString()).toBe("2026-11-16T23:59:59.999Z");
    expect(visitorListQuerySchema.parse({ deviceType: "", status: "", source: "" })).toMatchObject({ page: 1, pageSize: 20 });
  });

  it("rejects invalid dates, reversed ranges, and page boundaries", async () => {
    expect(visitorListQuerySchema.safeParse({ from: "2026-11-20", to: "2026-11-01" }).success).toBe(false);
    expect(visitorListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(visitorListQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);

    const response = await getVisitors(new NextRequest("http://localhost/api/admin/analytics/visitors?from=not-a-date"));
    expect(response.status).toBe(400);
    expect(mocks.listVisitors).not.toHaveBeenCalled();
  });

  it("lists the current environment with the validated filter object", async () => {
    const response = await getVisitors(new NextRequest("http://localhost/api/admin/analytics/visitors?page=2&source=google&countryCode=us&deviceType=desktop&status=online&productId=product_123"));

    expect(response.status).toBe(200);
    expect(mocks.requirePermission).toHaveBeenCalledWith("analytics.read.visitors");
    expect(mocks.listVisitors).toHaveBeenCalledWith(principal, expect.objectContaining({
      environment: "TEST",
      page: 2,
      pageSize: 20,
      source: "google",
      countryCode: "US",
      deviceType: "desktop",
      status: "online",
      productId: "product_123",
    }));
  });

  it("denies list and export independently by permission", async () => {
    mocks.requirePermission.mockRejectedValue(new PermissionDeniedError("Permission denied."));

    const listResponse = await getVisitors(new NextRequest("http://localhost/api/admin/analytics/visitors"));
    const exportResponse = await exportVisitors(new NextRequest("http://localhost/api/admin/analytics/visitors/export"));

    expect(listResponse.status).toBe(403);
    expect(exportResponse.status).toBe(403);
    expect(mocks.requirePermission).toHaveBeenNthCalledWith(1, "analytics.read.visitors");
    expect(mocks.requirePermission).toHaveBeenNthCalledWith(2, "analytics.export");
  });

  it("exports with the same validated filters and safe download headers", async () => {
    const response = await exportVisitors(new NextRequest("http://localhost/api/admin/analytics/visitors/export?source=google&countryCode=us&status=offline"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("zyron-visitors-");
    expect(await response.text()).toBe("visitor,lastSeenAt\r\n");
    expect(mocks.exportCsv).toHaveBeenCalledWith(principal, expect.objectContaining({
      environment: "TEST",
      source: "google",
      countryCode: "US",
      status: "offline",
    }));
  });
});
