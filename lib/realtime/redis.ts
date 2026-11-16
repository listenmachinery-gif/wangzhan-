import "server-only";

import Redis from "ioredis";

import { getRealtimeConfig } from "@/lib/realtime/config";
import { parseRealtimeEvent, type RealtimeEvent } from "@/lib/realtime/protocol";

type RealtimeHandler = (event: RealtimeEvent) => void | Promise<void>;

let publisher: Redis | null = null;
let subscriber: Redis | null = null;
const handlers = new Map<string, Set<RealtimeHandler>>();

function connection(url: string) {
  const client = new Redis(url, {
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 2,
    retryStrategy: (attempt) => Math.min(100 * 2 ** Math.min(attempt, 5), 2_000),
  });
  client.on("error", () => undefined);
  return client;
}

function assertNamespacedChannel(channel: string, namespace: string) {
  if (!channel.startsWith(`${namespace}:`)) {
    throw new Error("Realtime channel does not belong to the current environment.");
  }
}

async function connected(client: Redis) {
  if (client.status === "wait") await client.connect();
  return client;
}

export async function publishRealtimeEvent(channel: string, event: RealtimeEvent) {
  const config = getRealtimeConfig();
  if (!config.enabled || !config.redisUrl) return { published: false as const, reason: "disabled" as const };

  assertNamespacedChannel(channel, config.namespace);
  const validated = parseRealtimeEvent(event);
  publisher ??= connection(config.redisUrl);
  await (await connected(publisher)).publish(channel, JSON.stringify(validated));
  return { published: true as const };
}

export async function subscribeRealtimeChannel(channel: string, handler: RealtimeHandler) {
  const config = getRealtimeConfig();
  if (!config.enabled || !config.redisUrl) return async () => undefined;

  assertNamespacedChannel(channel, config.namespace);
  subscriber ??= connection(config.redisUrl);
  const channelHandlers = handlers.get(channel) ?? new Set<RealtimeHandler>();
  const firstHandler = channelHandlers.size === 0;
  channelHandlers.add(handler);
  handlers.set(channel, channelHandlers);

  if (subscriber.listenerCount("message") === 0) {
    subscriber.on("message", (receivedChannel, payload) => {
      let event: RealtimeEvent;
      try {
        event = parseRealtimeEvent(payload);
      } catch {
        return;
      }
      for (const subscribedHandler of handlers.get(receivedChannel) ?? []) {
        void Promise.resolve(subscribedHandler(event)).catch(() => undefined);
      }
    });
  }

  if (firstHandler) await (await connected(subscriber)).subscribe(channel);

  return async () => {
    const currentHandlers = handlers.get(channel);
    currentHandlers?.delete(handler);
    if (currentHandlers && currentHandlers.size === 0) {
      handlers.delete(channel);
      if (subscriber?.status === "ready") await subscriber.unsubscribe(channel);
    }
  };
}

export async function closeRealtimeConnections() {
  handlers.clear();
  const clients = [publisher, subscriber].filter((client): client is Redis => client !== null);
  publisher = null;
  subscriber = null;
  await Promise.all(clients.map(async (client) => {
    if (client.status !== "end") await client.quit().catch(() => client.disconnect());
  }));
}
