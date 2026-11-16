import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_VISITOR_COOKIE,
  readOrCreateAnalyticsIdentity,
} from "@/lib/analytics/first-party/identity";

const SECRET = "analytics-test-secret-that-is-at-least-32-characters";

function cookieValue(headers: string[], name: string) {
  const header = headers.find((value) => value.startsWith(`${name}=`));
  if (!header) throw new Error(`Missing ${name} cookie.`);
  return header.slice(name.length + 1).split(";", 1)[0];
}

describe("first-party analytics identity", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", SECRET);
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates opaque signed visitor and session cookies with secure attributes", () => {
    const result = readOrCreateAnalyticsIdentity(
      new Request("https://www.zyroncnc.com/products"),
      new Date("2026-11-16T08:00:00Z"),
    );

    expect(result.visitorCreated).toBe(true);
    expect(result.sessionCreated).toBe(true);
    expect(result.visitorId).toMatch(/^[a-f0-9]{32}$/);
    expect(result.sessionId).toMatch(/^[a-f0-9]{32}$/);
    expect(result.cookieHeaders).toHaveLength(2);
    for (const header of result.cookieHeaders) {
      expect(header).toContain("Path=/");
      expect(header).toContain("HttpOnly");
      expect(header).toContain("Secure");
      expect(header).toContain("SameSite=Lax");
    }
    expect(result).not.toHaveProperty("ip");
    expect(result).not.toHaveProperty("userAgent");
  });

  it("keeps valid identities and refreshes the signed session activity time", () => {
    const created = readOrCreateAnalyticsIdentity(
      new Request("https://www.zyroncnc.com/"),
      new Date("2026-11-16T08:00:00Z"),
    );
    const visitorCookie = cookieValue(created.cookieHeaders, ANALYTICS_VISITOR_COOKIE);
    const sessionCookie = cookieValue(created.cookieHeaders, ANALYTICS_SESSION_COOKIE);

    const resumed = readOrCreateAnalyticsIdentity(new Request("https://www.zyroncnc.com/products", {
      headers: { cookie: `${ANALYTICS_VISITOR_COOKIE}=${visitorCookie}; ${ANALYTICS_SESSION_COOKIE}=${sessionCookie}` },
    }), new Date("2026-11-16T08:10:00Z"));

    expect(resumed.visitorId).toBe(created.visitorId);
    expect(resumed.sessionId).toBe(created.sessionId);
    expect(resumed.visitorCreated).toBe(false);
    expect(resumed.sessionCreated).toBe(false);
    expect(resumed.cookieHeaders).toHaveLength(1);
    expect(cookieValue(resumed.cookieHeaders, ANALYTICS_SESSION_COOKIE)).not.toBe(sessionCookie);
  });

  it("rejects tampered cookies and never reuses their identifiers", () => {
    const created = readOrCreateAnalyticsIdentity(
      new Request("https://www.zyroncnc.com/"),
      new Date("2026-11-16T08:00:00Z"),
    );
    const visitorCookie = cookieValue(created.cookieHeaders, ANALYTICS_VISITOR_COOKIE);
    const sessionCookie = cookieValue(created.cookieHeaders, ANALYTICS_SESSION_COOKIE);
    const tamperedVisitor = `${visitorCookie.slice(0, -1)}${visitorCookie.endsWith("a") ? "b" : "a"}`;

    const replaced = readOrCreateAnalyticsIdentity(new Request("https://www.zyroncnc.com/", {
      headers: { cookie: `${ANALYTICS_VISITOR_COOKIE}=${tamperedVisitor}; ${ANALYTICS_SESSION_COOKIE}=${sessionCookie}` },
    }), new Date("2026-11-16T08:01:00Z"));

    expect(replaced.visitorCreated).toBe(true);
    expect(replaced.sessionCreated).toBe(true);
    expect(replaced.visitorId).not.toBe(created.visitorId);
    expect(replaced.sessionId).not.toBe(created.sessionId);
  });

  it("rotates only the session after 30 minutes without activity", () => {
    const created = readOrCreateAnalyticsIdentity(
      new Request("https://www.zyroncnc.com/"),
      new Date("2026-11-16T08:00:00Z"),
    );
    const visitorCookie = cookieValue(created.cookieHeaders, ANALYTICS_VISITOR_COOKIE);
    const sessionCookie = cookieValue(created.cookieHeaders, ANALYTICS_SESSION_COOKIE);

    const rotated = readOrCreateAnalyticsIdentity(new Request("https://www.zyroncnc.com/products", {
      headers: { cookie: `${ANALYTICS_VISITOR_COOKIE}=${visitorCookie}; ${ANALYTICS_SESSION_COOKIE}=${sessionCookie}` },
    }), new Date("2026-11-16T08:30:00Z"));

    expect(rotated.visitorId).toBe(created.visitorId);
    expect(rotated.visitorCreated).toBe(false);
    expect(rotated.sessionCreated).toBe(true);
    expect(rotated.sessionId).not.toBe(created.sessionId);
  });
});
