import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RealtimeGateway, type GatewaySocket } from "@/lib/realtime/gateway";
import { PresenceService } from "@/lib/realtime/presence";
import type { RealtimeEvent } from "@/lib/realtime/protocol";

class FakeSocket extends EventEmitter implements GatewaySocket {
  readyState = 1;
  bufferedAmount = 0;
  sent: string[] = [];
  closed: { code: number; reason: string } | null = null;

  send(data: string) {
    this.sent.push(data);
  }

  close(code: number, reason: string) {
    this.readyState = 3;
    this.closed = { code, reason };
    this.emit("close");
  }

  receive(data: unknown) {
    this.emit("message", Buffer.from(JSON.stringify(data)));
  }
}

const visitorToken = {
  v: 1 as const,
  subjectType: "visitor" as const,
  subjectId: "visitor_1",
  conversationId: "conversation_1",
  environment: "TEST" as const,
  issuedAt: 1,
  expiresAt: 9999999999,
  nonce: "d15d4b8d-cbf0-4a34-9e48-2b3df7ef27dc",
};

describe("realtime gateway", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("closes sockets that do not authenticate before the deadline", async () => {
    const socket = new FakeSocket();
    const gateway = new RealtimeGateway({ verifyToken: vi.fn(), subscribe: vi.fn(), publish: vi.fn(), touchPresence: vi.fn() });
    gateway.accept(socket);

    await vi.advanceTimersByTimeAsync(5_001);
    expect(socket.closed).toEqual({ code: 4401, reason: "Authentication required" });
  });

  it("rejects cross-conversation subscriptions for visitor tokens", async () => {
    const socket = new FakeSocket();
    const gateway = new RealtimeGateway({
      verifyToken: vi.fn(() => visitorToken),
      subscribe: vi.fn(),
      publish: vi.fn(),
      touchPresence: vi.fn(),
    });
    gateway.accept(socket);
    socket.receive({ v: 1, type: "auth", token: "secret-token-must-not-be-logged" });
    await vi.runAllTicks();
    socket.receive({ v: 1, type: "subscribe", conversationId: "conversation_2" });
    await vi.runAllTicks();

    expect(socket.closed).toEqual({ code: 4403, reason: "Conversation access denied" });
  });

  it("deduplicates Redis fan-out and requests resync when the outbound buffer is unsafe", async () => {
    let relay: ((event: RealtimeEvent) => void) | undefined;
    const unsubscribe = vi.fn();
    const socket = new FakeSocket();
    const gateway = new RealtimeGateway({
      verifyToken: vi.fn(() => visitorToken),
      subscribe: vi.fn(async (_channel, handler) => {
        relay = handler;
        return unsubscribe;
      }),
      publish: vi.fn(),
      touchPresence: vi.fn(),
    });
    gateway.accept(socket);
    socket.receive({ v: 1, type: "auth", token: "valid" });
    await vi.runAllTicks();
    socket.receive({ v: 1, type: "subscribe", conversationId: "conversation_1" });
    await vi.runAllTicks();
    await Promise.resolve();
    await Promise.resolve();

    const event: RealtimeEvent = {
      v: 1,
      id: "event_1",
      type: "typing.changed",
      serverTime: "2026-11-16T10:00:00.000Z",
      conversationId: "conversation_1",
      payload: { actor: "AGENT", typing: true },
    };
    relay?.(event);
    relay?.(event);
    expect(socket.sent.filter((entry) => entry.includes("event_1"))).toHaveLength(1);

    socket.bufferedAmount = 300_000;
    relay?.({ ...event, id: "event_2" });
    expect(socket.sent.some((entry) => entry.includes("resync.required"))).toBe(true);
    expect(socket.closed?.code).toBe(1013);
    await vi.waitFor(() => expect(unsubscribe).toHaveBeenCalledOnce());
  });

  it("degrades on Redis publish failure without logging tokens or message bodies", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const socket = new FakeSocket();
    const gateway = new RealtimeGateway({
      verifyToken: vi.fn(() => visitorToken),
      subscribe: vi.fn(async () => vi.fn()),
      publish: vi.fn(async () => { throw new Error("Redis unavailable"); }),
      touchPresence: vi.fn(),
    });
    gateway.accept(socket);
    socket.receive({ v: 1, type: "auth", token: "secret-token" });
    await vi.runAllTicks();
    socket.receive({ v: 1, type: "typing.start", conversationId: "conversation_1" });
    await vi.runAllTicks();

    expect(socket.sent.some((entry) => entry.includes("REALTIME_DEGRADED"))).toBe(true);
    expect(JSON.stringify(consoleError.mock.calls)).not.toMatch(/secret-token|typing\.start/);
  });
});

describe("presence TTL", () => {
  it("writes environment-scoped presence with a bounded TTL", async () => {
    const store = { set: vi.fn(), remove: vi.fn() };
    const presence = new PresenceService(store);

    await presence.touch("conversation_1", "visitor_1", "VISITOR");
    expect(store.set).toHaveBeenCalledWith(
      "zyron:test:presence:conversation_1:VISITOR:visitor_1",
      expect.any(String),
      45,
    );
  });
});
