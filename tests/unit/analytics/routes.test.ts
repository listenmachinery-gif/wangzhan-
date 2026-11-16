import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  getOverview: vi.fn(),
  getStatus: vi.fn(),
  getRealtimeSummary: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/guards")>(),
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/analytics/overview-service", () => ({
  AnalyticsOverviewService: class {
    getOverview = mocks.getOverview;
    getStatus = mocks.getStatus;
  },
}));

vi.mock("@/lib/services/visitor-analytics-query-service", () => ({
  VisitorAnalyticsQueryService: class {
    getRealtimeSummary = mocks.getRealtimeSummary;
  },
}));

import { GET as getOverview } from "@/app/api/admin/analytics/overview/route";
import { GET as getFirstPartyOverview } from "@/app/api/admin/analytics/first-party/overview/route";
import { GET as getStatus } from "@/app/api/admin/analytics/status/route";
import { AuthenticationRequiredError, PermissionDeniedError } from "@/lib/auth/guards";

const principal = { id: "admin", email: "admin@zyroncnc.com", name: "Admin", roles: ["ADMIN"] };

const partialOverview = {
  range: "28d",
  generatedAt: "2026-11-16T02:00:00.000Z",
  ga4: {
    state: { code: "CONNECTED", message: "Connected", checkedAt: "2026-11-16T02:00:00.000Z" },
    data: { dataThrough: "2026-11-15" },
  },
  searchConsole: {
    state: { code: "FORBIDDEN", message: "Access denied", checkedAt: "2026-11-16T02:00:00.000Z" },
    data: null,
  },
};

describe("analytics admin routes", () => {
  beforeEach(() => {
    mocks.requirePermission.mockResolvedValue(principal);
    mocks.getOverview.mockResolvedValue(partialOverview);
    mocks.getStatus.mockResolvedValue({
      generatedAt: partialOverview.generatedAt,
      ga4: partialOverview.ga4.state,
      searchConsole: partialOverview.searchConsole.state,
    });
    mocks.getRealtimeSummary.mockResolvedValue({
      onlineVisitors: 3,
      activeVisitors: 7,
      visitorsToday: 12,
      sessionsToday: 14,
      pageViewsToday: 31,
    });
  });

  it("returns 401 when no admin session exists", async () => {
    mocks.requirePermission.mockRejectedValueOnce(new AuthenticationRequiredError("Authentication required."));

    const response = await getOverview(new NextRequest("http://localhost/api/admin/analytics/overview?range=28d"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ code: "UNAUTHENTICATED" });
  });

  it("returns 403 when the principal lacks analytics.read.summary", async () => {
    mocks.requirePermission.mockRejectedValueOnce(new PermissionDeniedError("Permission denied."));

    const response = await getStatus();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ code: "FORBIDDEN" });
  });

  it("rejects unsupported ranges before calling Google", async () => {
    const response = await getOverview(new NextRequest("http://localhost/api/admin/analytics/overview?range=365d"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "INVALID_ANALYTICS_RANGE" });
    expect(mocks.getOverview).not.toHaveBeenCalled();
  });

  it("returns normalized partial success without secrets", async () => {
    const response = await getOverview(new NextRequest("http://localhost/api/admin/analytics/overview?range=28d"));
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body).toEqual(partialOverview);
    expect(mocks.requirePermission).toHaveBeenCalledWith("analytics.read.summary");
    expect(mocks.getOverview).toHaveBeenCalledWith("28d");
    expect(serialized).not.toMatch(/private.?key|access.?token|client.?email|upstream/i);
  });

  it("returns an environment-scoped first-party summary without visitor identifiers", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    const response = await getFirstPartyOverview();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      environment: "PREVIEW",
      summary: { onlineVisitors: 3, activeVisitors: 7, visitorsToday: 12, sessionsToday: 14, pageViewsToday: 31 },
    });
    expect(body.generatedAt).toEqual(expect.any(String));
    expect(mocks.requirePermission).toHaveBeenCalledWith("analytics.read.summary");
    expect(mocks.getRealtimeSummary).toHaveBeenCalledWith(principal, expect.any(Date), "PREVIEW");
    expect(JSON.stringify(body)).not.toMatch(/anonymousId|visitorId|cookie/i);
  });
});
