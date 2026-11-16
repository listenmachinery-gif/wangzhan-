import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  getRealtimeOverview: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/auth/guards")>(),
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/services/visitor-analytics-query-service", () => ({
  VisitorAnalyticsQueryService: class {
    getRealtimeOverview = mocks.getRealtimeOverview;
  },
}));

import { GET } from "@/app/api/admin/analytics/first-party/overview/route";

const principal = { id: "admin", email: "admin@zyroncnc.com", name: "Admin", roles: ["ADMIN"] };
const overview = {
  summary: { onlineVisitors: 2, activeVisitors: 3, visitorsToday: 4, sessionsToday: 5, pageViewsToday: 6 },
  arrivals: [{ id: "visitor-1", label: "访客-TOR-1", firstSeenAt: "2026-11-16T12:00:01.000Z", countryCode: "US", city: null, deviceType: "desktop", path: "/products" }],
};

describe("first-party live overview route", () => {
  beforeEach(() => {
    vi.stubEnv("VERCEL_ENV", "production");
    mocks.requirePermission.mockReset().mockResolvedValue(principal);
    mocks.getRealtimeOverview.mockReset().mockResolvedValue(overview);
  });

  it("passes a valid cursor to the environment-scoped overview service", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics/first-party/overview?since=2026-11-16T12%3A00%3A00.000Z"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ environment: "PRODUCTION", ...overview });
    expect(body.generatedAt).toEqual(expect.any(String));
    expect(mocks.getRealtimeOverview).toHaveBeenCalledWith(
      principal,
      expect.any(Date),
      "PRODUCTION",
      new Date("2026-11-16T12:00:00.000Z"),
    );
  });

  it("returns a silent baseline when no cursor is supplied", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics/first-party/overview"));

    expect(response.status).toBe(200);
    expect(mocks.getRealtimeOverview).toHaveBeenCalledWith(principal, expect.any(Date), "PRODUCTION", undefined);
  });

  it("rejects an invalid cursor before querying visitor data", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics/first-party/overview?since=not-a-date"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: "INVALID_REALTIME_CURSOR" });
    expect(mocks.getRealtimeOverview).not.toHaveBeenCalled();
  });
});
