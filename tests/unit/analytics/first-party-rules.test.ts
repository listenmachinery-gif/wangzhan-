import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  hashNetworkKey,
  isActive,
  isOnline,
  shouldRotateSession,
} from "@/lib/analytics/first-party/rules";

describe("first-party analytics time and privacy rules", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "analytics-test-secret-that-is-at-least-32-characters");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats a visitor as online through exactly 120 seconds", () => {
    const seen = new Date("2026-11-16T08:00:00Z");
    expect(isOnline(seen, new Date("2026-11-16T08:02:00Z"))).toBe(true);
    expect(isOnline(seen, new Date("2026-11-16T08:02:00.001Z"))).toBe(false);
  });

  it("treats a visitor as active through exactly five minutes", () => {
    const active = new Date("2026-11-16T08:00:00Z");
    expect(isActive(active, new Date("2026-11-16T08:05:00Z"))).toBe(true);
    expect(isActive(active, new Date("2026-11-16T08:05:00.001Z"))).toBe(false);
  });

  it("rotates a session at the 30-minute inactivity boundary", () => {
    const seen = new Date("2026-11-16T08:00:00Z");
    expect(shouldRotateSession(seen, new Date("2026-11-16T08:29:59.999Z"))).toBe(false);
    expect(shouldRotateSession(seen, new Date("2026-11-16T08:30:00Z"))).toBe(true);
  });

  it("creates a one-way month-scoped network hash", () => {
    const input = "203.0.113.42";
    const november = hashNetworkKey(input, "2026-11");

    expect(november).toMatch(/^[a-f0-9]{64}$/);
    expect(november).not.toContain(input);
    expect(hashNetworkKey(input, "2026-11")).toBe(november);
    expect(hashNetworkKey(input, "2026-12")).not.toBe(november);
  });
});
