import { afterEach, describe, expect, it } from "vitest";

import { buildRealtimeChannel, getRealtimeConfig } from "@/lib/realtime/config";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("realtime configuration", () => {
  it("stays disabled without requiring Redis credentials", () => {
    delete process.env.UPSTASH_REDIS_URL;
    delete process.env.REALTIME_TOKEN_SECRET;
    process.env.REALTIME_ENABLED = "false";

    expect(getRealtimeConfig()).toMatchObject({ enabled: false, redisUrl: null, tokenSecret: null });
  });

  it("requires private credentials when realtime is enabled", () => {
    process.env.REALTIME_ENABLED = "true";
    delete process.env.UPSTASH_REDIS_URL;
    delete process.env.REALTIME_TOKEN_SECRET;

    expect(() => getRealtimeConfig()).toThrow(/UPSTASH_REDIS_URL/);
  });

  it("rejects non-TLS Redis URLs", () => {
    process.env.REALTIME_ENABLED = "true";
    process.env.UPSTASH_REDIS_URL = "redis://localhost:6379";
    process.env.REALTIME_TOKEN_SECRET = "a".repeat(32);

    expect(() => getRealtimeConfig()).toThrow(/rediss:\/\//);
  });

  it("uses environment-prefixed and validated channel names", () => {
    process.env.REALTIME_ENABLED = "true";
    process.env.UPSTASH_REDIS_URL = "rediss://default:secret@example.upstash.io:6379";
    process.env.REALTIME_TOKEN_SECRET = "b".repeat(32);
    process.env.VERCEL_ENV = "preview";

    const config = getRealtimeConfig();
    expect(config.namespace).toBe("zyron:preview");
    expect(buildRealtimeChannel(config, "conversation", "conversation_123")).toBe(
      "zyron:preview:conversation:conversation_123",
    );
    expect(() => buildRealtimeChannel(config, "conversation", "../production")).toThrow(/channel scope/i);
  });
});
