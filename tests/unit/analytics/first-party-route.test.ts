import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/analytics/collect/route";
import { MAX_ANALYTICS_BODY_BYTES } from "@/lib/validation/first-party-analytics";

function request(body: string, headers: Record<string, string> = {}) {
  return new Request("https://www.zyroncnc.com/api/analytics/collect", {
    method: "POST",
    headers: {
      host: "www.zyroncnc.com",
      origin: "https://www.zyroncnc.com",
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      ...headers,
    },
    body,
  });
}

describe("first-party analytics collection route", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "analytics-test-secret-that-is-at-least-32-characters");
    vi.stubEnv("VERCEL_ENV", "preview");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("accepts no analytics and sets no identity cookies without consent", async () => {
    const response = await POST(request(JSON.stringify({ events: [] })));

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("rejects a cross-origin collection request", async () => {
    const response = await POST(request(JSON.stringify({ events: [] }), {
      cookie: "zyron_analytics_consent=accepted",
      origin: "https://evil.example",
      "sec-fetch-site": "cross-site",
    }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ code: "UNTRUSTED_ORIGIN" });
  });

  it("rejects declared bodies beyond the 16KB limit", async () => {
    const response = await POST(request("{}", {
      cookie: "zyron_analytics_consent=accepted",
      "content-length": String(MAX_ANALYTICS_BODY_BYTES + 1),
    }));

    expect(response.status).toBe(413);
  });

  it("maps malformed accepted JSON to a client error", async () => {
    const response = await POST(request('{"events":', {
      cookie: "zyron_analytics_consent=accepted",
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_ANALYTICS_BATCH" });
  });
});
