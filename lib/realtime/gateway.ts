import "server-only";

import { randomUUID } from "node:crypto";

import { verifyChatToken } from "@/lib/auth/chat-token";
import { buildRealtimeChannel, getRealtimeConfig } from "@/lib/realtime/config";
import { PresenceService } from "@/lib/realtime/presence";
import {
  parseRealtimeClientEvent,
  type RealtimeEvent,
} from "@/lib/realtime/protocol";
import { publishRealtimeEvent, subscribeRealtimeChannel } from "@/lib/realtime/redis";

const AUTHENTICATION_TIMEOUT_MS = 5_000;
const IDLE_TIMEOUT_MS = 90_000;
const OUTBOUND_BUFFER_LIMIT = 256 * 1024;
const MAX_SEEN_EVENT_IDS = 512;

type TokenClaims = ReturnType<typeof verifyChatToken>;
type Unsubscribe = () => void | Promise<void>;

export type GatewaySocket = {
  readyState: number;
  bufferedAmount: number;
  send(data: string): void;
  close(code: number, reason: string): void;
  on(event: "message", listener: (data: unknown) => void): unknown;
  on(event: "close" | "error", listener: () => void): unknown;
};

type GatewayDependencies = {
  verifyToken?: (token: string) => TokenClaims;
  subscribe?: (channel: string, handler: (event: RealtimeEvent) => void) => Promise<Unsubscribe>;
  publish?: (channel: string, event: RealtimeEvent) => Promise<unknown>;
  touchPresence?: (conversationId: string, actorId: string, actorType: "VISITOR" | "AGENT") => Promise<unknown> | unknown;
};

function eventBase(type: RealtimeEvent["type"]) {
  return { v: 1 as const, id: randomUUID(), type, serverTime: new Date().toISOString() };
}

export class RealtimeGateway {
  private readonly verifyToken: NonNullable<GatewayDependencies["verifyToken"]>;
  private readonly subscribe: NonNullable<GatewayDependencies["subscribe"]>;
  private readonly publish: NonNullable<GatewayDependencies["publish"]>;
  private readonly touchPresence: NonNullable<GatewayDependencies["touchPresence"]>;

  constructor(dependencies: GatewayDependencies = {}) {
    const presence = new PresenceService();
    this.verifyToken = dependencies.verifyToken ?? verifyChatToken;
    this.subscribe = dependencies.subscribe ?? subscribeRealtimeChannel;
    this.publish = dependencies.publish ?? publishRealtimeEvent;
    this.touchPresence = dependencies.touchPresence ?? ((conversationId, actorId, actorType) => (
      presence.touch(conversationId, actorId, actorType)
    ));
  }

  accept(socket: GatewaySocket) {
    let claims: TokenClaims | null = null;
    let unsubscribe: Unsubscribe | null = null;
    let lastSeenAt = Date.now();
    let cleanedUp = false;
    const seenEventIds = new Set<string>();

    const authenticationTimer = setTimeout(() => {
      if (!claims && socket.readyState === 1) socket.close(4401, "Authentication required");
    }, AUTHENTICATION_TIMEOUT_MS);
    authenticationTimer.unref?.();

    const idleTimer = setInterval(() => {
      if (Date.now() - lastSeenAt > IDLE_TIMEOUT_MS && socket.readyState === 1) {
        socket.close(1001, "Idle timeout");
      }
    }, 30_000);
    idleTimer.unref?.();

    const cleanup = async () => {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(authenticationTimer);
      clearInterval(idleTimer);
      await unsubscribe?.();
      unsubscribe = null;
    };

    const directSend = (event: RealtimeEvent) => {
      if (socket.readyState === 1) socket.send(JSON.stringify(event));
    };

    const send = (event: RealtimeEvent) => {
      if (socket.bufferedAmount > OUTBOUND_BUFFER_LIMIT) {
        directSend({
          ...eventBase("resync.required"),
          type: "resync.required",
          conversationId: "conversationId" in event ? event.conversationId : undefined,
          payload: { reason: "OVERFLOW" },
        });
        socket.close(1013, "Realtime buffer overflow");
        void cleanup();
        return false;
      }
      directSend(event);
      return true;
    };

    const error = (code: string, message: string, conversationId?: string) => send({
      ...eventBase("error"),
      type: "error",
      conversationId,
      payload: { code, message },
    });

    const assertConversation = (conversationId: string) => {
      if (!claims) throw new Error("UNAUTHENTICATED");
      if (claims.subjectType === "visitor" && claims.conversationId !== conversationId) {
        throw new Error("FORBIDDEN_CONVERSATION");
      }
    };

    const relay = (event: RealtimeEvent) => {
      if (seenEventIds.has(event.id)) return;
      seenEventIds.add(event.id);
      if (seenEventIds.size > MAX_SEEN_EVENT_IDS) {
        const oldest = seenEventIds.values().next().value;
        if (oldest) seenEventIds.delete(oldest);
      }
      send(event);
    };

    const handleMessage = async (raw: unknown) => {
      lastSeenAt = Date.now();
      let event;
      try {
        const value = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw);
        event = parseRealtimeClientEvent(value);
      } catch {
        error("INVALID_EVENT", "Realtime event is invalid.");
        return;
      }

      if (event.type === "auth") {
        if (claims) return;
        try {
          claims = this.verifyToken(event.token);
          clearTimeout(authenticationTimer);
          send({
            ...eventBase("ready"),
            type: "ready",
            payload: { connectionId: randomUUID() },
          });
        } catch {
          socket.close(4401, "Invalid authentication");
          await cleanup();
        }
        return;
      }

      if (!claims) {
        socket.close(4401, "Authentication required");
        await cleanup();
        return;
      }

      if (event.type === "subscribe") {
        try {
          assertConversation(event.conversationId);
        } catch {
          socket.close(4403, "Conversation access denied");
          await cleanup();
          return;
        }
        await unsubscribe?.();
        const channel = buildRealtimeChannel(getRealtimeConfig(), "conversation", event.conversationId);
        try {
          unsubscribe = await this.subscribe(channel, relay);
          if (event.cursor) send({
            ...eventBase("resync.required"),
            type: "resync.required",
            conversationId: event.conversationId,
            payload: { reason: "RECONNECT" },
          });
        } catch {
          error("REALTIME_DEGRADED", "Live updates are temporarily unavailable.", event.conversationId);
        }
        return;
      }

      const conversationId = "conversationId" in event ? event.conversationId : claims.conversationId;
      if (!conversationId) {
        error("CONVERSATION_REQUIRED", "Conversation scope is required.");
        return;
      }
      try {
        assertConversation(conversationId);
        const channel = buildRealtimeChannel(getRealtimeConfig(), "conversation", conversationId);
        if (event.type === "presence.ping") {
          const actorType = claims.subjectType === "visitor" ? "VISITOR" : "AGENT";
          await this.touchPresence(conversationId, claims.subjectId, actorType);
          await this.publish(channel, {
            ...eventBase("presence.changed"),
            type: "presence.changed",
            conversationId,
            payload: { actorId: claims.subjectId, online: true },
          });
        } else if (event.type === "typing.start" || event.type === "typing.stop") {
          await this.publish(channel, {
            ...eventBase("typing.changed"),
            type: "typing.changed",
            conversationId,
            payload: { actor: claims.subjectType === "visitor" ? "VISITOR" : "AGENT", typing: event.type === "typing.start" },
          });
        } else if (event.type === "message.read") {
          await this.publish(channel, {
            ...eventBase("message.read"),
            type: "message.read",
            conversationId,
            payload: { messageId: event.messageId, readAt: new Date().toISOString() },
          });
        }
      } catch {
        error("REALTIME_DEGRADED", "Live updates are temporarily unavailable.", conversationId);
      }
    };

    socket.on("message", (data) => { void handleMessage(data); });
    socket.on("close", () => { void cleanup(); });
    socket.on("error", () => { void cleanup(); });
  }
}
