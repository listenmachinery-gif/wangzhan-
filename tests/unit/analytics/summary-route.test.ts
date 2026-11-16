import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ summarizeDay: vi.fn() }));

vi.mock("@/lib/services/analytics-summary-service", () => ({
  AnalyticsSummaryService: class {
    summarizeDay = mocks.summarizeDay;
  },
}));

import { POST } from "@/app/api/internal/analytics/summarize/route";

describe("analytics summarize route", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    mocks.summarizeDay.mockReset().mockResolvedValue({ date: "2026-11-16", environment: "TEST", rows: 1 });
  });

  it("fails closed when internal authorization is invalid", async () => {
    const response = await POST(new NextRequest("http://localhost/api/internal/analytics/summarize", {
      method: "POST",
      headers: { authorization: "Bearer wrong" },
      body: JSON.stringify({ day: "2026-11-16", environment: "TEST" }),
    }));

    expect(response.status).toBe(401);
    expect(mocks.summarizeDay).not.toHaveBeenCalled();
  });

  it("summarizes an explicit environment and UTC reporting day", async () => {
    const response = await POST(new NextRequest("http://localhost/api/internal/analytics/summarize", {
      method: "POST",
      headers: { authorization: "Bearer test-cron-secret", "content-type": "application/json" },
      body: JSON.stringify({ day: "2026-11-16", environment: "TEST" }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.summarizeDay).toHaveBeenCalledWith(new Date("2026-11-16T00:00:00.000Z"), "TEST");
  });
});
