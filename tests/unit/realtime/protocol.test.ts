import { describe, expect, it } from "vitest";

import {
  MAX_REALTIME_EVENT_BYTES,
  parseRealtimeClientEvent,
  parseRealtimeEvent,
  REALTIME_PROTOCOL_VERSION,
} from "@/lib/realtime/protocol";

describe("realtime protocol", () => {
  it("accepts versioned client and server events", () => {
    expect(parseRealtimeClientEvent({
      v: REALTIME_PROTOCOL_VERSION,
      type: "subscribe",
      conversationId: "conversation_123",
      cursor: "message_100",
    }).type).toBe("subscribe");

    expect(parseRealtimeEvent({
      v: REALTIME_PROTOCOL_VERSION,
      id: "event_123",
      type: "message.created",
      serverTime: "2026-11-16T10:00:00.000Z",
      conversationId: "conversation_123",
      payload: {
        id: "message_101",
        senderType: "VISITOR",
        type: "TEXT",
        body: "Hello",
        sentAt: "2026-11-16T10:00:00.000Z",
      },
    }).type).toBe("message.created");
  });

  it("rejects unknown event types and unknown fields", () => {
    expect(() => parseRealtimeClientEvent({ v: 1, type: "database.reset" })).toThrow();
    expect(() => parseRealtimeClientEvent({
      v: 1,
      type: "typing.start",
      conversationId: "conversation_123",
      secret: "must-not-pass",
    })).toThrow();
  });

  it("rejects oversized serialized payloads", () => {
    const oversized = JSON.stringify({
      v: 1,
      id: "event_oversized",
      type: "error",
      serverTime: "2026-11-16T10:00:00.000Z",
      payload: { code: "INVALID", message: "x".repeat(MAX_REALTIME_EVENT_BYTES) },
    });

    expect(() => parseRealtimeEvent(oversized)).toThrow(/payload is too large/i);
  });

  it("rejects unsupported protocol versions", () => {
    expect(() => parseRealtimeClientEvent({
      v: 2,
      type: "presence.ping",
    })).toThrow();
  });
});
