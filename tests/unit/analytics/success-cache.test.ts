import { describe, expect, it, vi } from "vitest";

import { SuccessCache } from "@/lib/analytics/success-cache";

describe("SuccessCache", () => {
  it("reuses successful values for 15 minutes and reloads after expiry", async () => {
    const cache = new SuccessCache({ successTtlMs: 15 * 60 * 1_000 });
    const load = vi.fn(async () => ({ value: 1 }));

    await expect(cache.getOrLoad("ga4:7d", load, new Date("2026-11-16T00:00:00Z")))
      .resolves.toEqual({ value: 1 });
    await expect(cache.getOrLoad("ga4:7d", load, new Date("2026-11-16T00:14:59Z")))
      .resolves.toEqual({ value: 1 });
    await cache.getOrLoad("ga4:7d", load, new Date("2026-11-16T00:15:00Z"));

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not store rejected loads or serialize secret-bearing errors", async () => {
    const cache = new SuccessCache();
    const secret = "upstream-private-key-material";
    const failingLoad = vi.fn(async () => {
      throw new Error(secret);
    });

    await expect(cache.getOrLoad("ga4:7d", failingLoad)).rejects.toThrow(secret);
    await expect(cache.getOrLoad("ga4:7d", async () => "recovered")).resolves.toBe("recovered");

    expect(JSON.stringify(cache)).not.toContain(secret);
    expect(failingLoad).toHaveBeenCalledTimes(1);
  });

  it("keeps source, range, and date keys independent", async () => {
    const cache = new SuccessCache();

    const values = await Promise.all([
      cache.getOrLoad("ga4:7d:2026-11-15", async () => "ga4-seven"),
      cache.getOrLoad("gsc:7d:2026-11-15", async () => "gsc-seven"),
      cache.getOrLoad("ga4:28d:2026-11-15", async () => "ga4-twenty-eight"),
      cache.getOrLoad("ga4:7d:2026-11-14", async () => "ga4-previous-date"),
    ]);

    expect(values).toEqual(["ga4-seven", "gsc-seven", "ga4-twenty-eight", "ga4-previous-date"]);
  });
});
