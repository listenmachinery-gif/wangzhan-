import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ applyRetention: vi.fn() }));
vi.mock("@/lib/services/privacy-retention-service", () => ({
  PrivacyRetentionService: class { applyRetention = mocks.applyRetention; },
}));

import { GET } from "@/app/api/internal/privacy/retention/route";

describe("privacy retention cron route", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("CRON_SECRET", "retention-secret");
    vi.stubEnv("VERCEL_ENV", "preview");
    mocks.applyRetention.mockReset().mockResolvedValue({ environment: "PREVIEW", visitorsDeleted: 0 });
  });

  it("fails closed without the configured bearer secret", async () => {
    const response = await GET(new NextRequest("http://localhost/api/internal/privacy/retention"));
    expect(response.status).toBe(401);
    expect(mocks.applyRetention).not.toHaveBeenCalled();
  });

  it("runs only for the current isolated analytics environment", async () => {
    const before = Date.now();
    const response = await GET(new NextRequest("http://localhost/api/internal/privacy/retention", { headers: { authorization: "Bearer retention-secret" } }));
    expect(response.status).toBe(200);
    expect(mocks.applyRetention).toHaveBeenCalledWith(expect.any(Date), "PREVIEW");
    expect((mocks.applyRetention.mock.calls[0][0] as Date).getTime()).toBeGreaterThanOrEqual(before);
  });
});
