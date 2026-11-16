import { afterAll, describe, expect, it } from "vitest";

import { buildRealtimeChannel, getRealtimeConfig } from "@/lib/realtime/config";
import { closeRealtimeConnections, publishRealtimeEvent, subscribeRealtimeChannel } from "@/lib/realtime/redis";

const testRedisUrl = process.env.TEST_UPSTASH_REDIS_URL;

describe("Redis multi-instance fan-out", () => {
  afterAll(async () => {
    await closeRealtimeConnections();
  });

  if (!testRedisUrl) {
    it("BLOCKED: requires TEST_UPSTASH_REDIS_URL to verify real multi-instance fan-out", () => {
      expect(testRedisUrl).toBeUndefined();
    });
    return;
  }

  it("delivers one namespaced event to two independent subscribers", async () => {
    process.env.REALTIME_ENABLED = "true";
    process.env.UPSTASH_REDIS_URL = testRedisUrl;
    process.env.REALTIME_TOKEN_SECRET = "integration-realtime-token-secret".repeat(2);
    const channel = buildRealtimeChannel(getRealtimeConfig(), "conversation", `fanout_${Date.now()}`);
    const received: string[] = [];
    const done = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timed out waiting for Redis fan-out.")), 5_000);
      const record = (suffix: string) => (event: { id: string }) => {
        received.push(`${event.id}:${suffix}`);
        if (received.length === 2) {
          clearTimeout(timeout);
          resolve();
        }
      };
      void Promise.all([
        subscribeRealtimeChannel(channel, record("a")),
        subscribeRealtimeChannel(channel, record("b")),
      ]).then(() => publishRealtimeEvent(channel, {
        v: 1,
        id: "fanout_event",
        type: "typing.changed",
        serverTime: new Date().toISOString(),
        conversationId: "conversation_1",
        payload: { actor: "VISITOR", typing: true },
      })).catch(reject);
    });

    await done;
    expect(received.sort()).toEqual(["fanout_event:a", "fanout_event:b"]);
  });
});
