import "server-only";

import { getRealtimeConfig } from "@/lib/realtime/config";
import { removeRealtimeValue, setRealtimeValue } from "@/lib/realtime/redis";

const PRESENCE_TTL_SECONDS = 45;

type PresenceStore = {
  set: (key: string, value: string, ttlSeconds: number) => Promise<unknown> | unknown;
  remove: (key: string) => Promise<unknown> | unknown;
};

const defaultStore: PresenceStore = {
  set: setRealtimeValue,
  remove: removeRealtimeValue,
};

export class PresenceService {
  constructor(private readonly store: PresenceStore = defaultStore) {}

  private key(conversationId: string, actorId: string, actorType: "VISITOR" | "AGENT") {
    const { namespace } = getRealtimeConfig();
    return `${namespace}:presence:${conversationId}:${actorType}:${actorId}`;
  }

  async touch(conversationId: string, actorId: string, actorType: "VISITOR" | "AGENT") {
    const key = this.key(conversationId, actorId, actorType);
    await this.store.set(key, new Date().toISOString(), PRESENCE_TTL_SECONDS);
    return { key, ttlSeconds: PRESENCE_TTL_SECONDS };
  }

  async remove(conversationId: string, actorId: string, actorType: "VISITOR" | "AGENT") {
    await this.store.remove(this.key(conversationId, actorId, actorType));
  }
}
