import { z } from "zod";

export const REALTIME_PROTOCOL_VERSION = 1 as const;
export const MAX_REALTIME_EVENT_BYTES = 16 * 1024;

const id = z.string().trim().min(1).max(128);
const conversationId = id;
const serverEnvelope = {
  v: z.literal(REALTIME_PROTOCOL_VERSION),
  id,
  serverTime: z.string().datetime(),
};

export const realtimeClientEventSchema = z.discriminatedUnion("type", [
  z.strictObject({ v: z.literal(REALTIME_PROTOCOL_VERSION), type: z.literal("auth"), token: z.string().min(1).max(4096) }),
  z.strictObject({
    v: z.literal(REALTIME_PROTOCOL_VERSION),
    type: z.literal("subscribe"),
    conversationId,
    cursor: id.optional(),
  }),
  z.strictObject({ v: z.literal(REALTIME_PROTOCOL_VERSION), type: z.literal("typing.start"), conversationId }),
  z.strictObject({ v: z.literal(REALTIME_PROTOCOL_VERSION), type: z.literal("typing.stop"), conversationId }),
  z.strictObject({
    v: z.literal(REALTIME_PROTOCOL_VERSION),
    type: z.literal("message.read"),
    conversationId,
    messageId: id,
  }),
  z.strictObject({
    v: z.literal(REALTIME_PROTOCOL_VERSION),
    type: z.literal("presence.ping"),
    conversationId: conversationId.optional(),
  }),
]);

const messagePayload = z.strictObject({
  id,
  clientMessageId: id.optional(),
  senderType: z.enum(["VISITOR", "AGENT", "SYSTEM"]),
  type: z.enum(["TEXT", "SYSTEM"]),
  body: z.string().max(5000),
  sentAt: z.string().datetime(),
});

export const realtimeEventSchema = z.discriminatedUnion("type", [
  z.strictObject({ ...serverEnvelope, type: z.literal("ready"), payload: z.strictObject({ connectionId: id }) }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("message.created"),
    conversationId,
    payload: messagePayload,
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("message.delivered"),
    conversationId,
    payload: z.strictObject({ messageId: id, deliveredAt: z.string().datetime() }),
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("message.read"),
    conversationId,
    payload: z.strictObject({ messageId: id, readAt: z.string().datetime() }),
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("typing.changed"),
    conversationId,
    payload: z.strictObject({ actor: z.enum(["VISITOR", "AGENT"]), typing: z.boolean() }),
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("presence.changed"),
    conversationId: conversationId.optional(),
    payload: z.strictObject({ actorId: id, online: z.boolean() }),
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("conversation.updated"),
    conversationId,
    payload: z.strictObject({ status: z.enum(["OPEN", "PENDING", "CLOSED", "SPAM"]), assigneeId: id.nullable().optional() }),
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("resync.required"),
    conversationId: conversationId.optional(),
    payload: z.strictObject({ reason: z.enum(["RECONNECT", "GAP", "OVERFLOW", "ROLLOVER"]) }),
  }),
  z.strictObject({
    ...serverEnvelope,
    type: z.literal("error"),
    conversationId: conversationId.optional(),
    payload: z.strictObject({ code: id, message: z.string().min(1).max(512) }),
  }),
]);

export type RealtimeClientEvent = z.infer<typeof realtimeClientEventSchema>;
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

function serializedInput(input: string | unknown) {
  if (typeof input === "string") return input;
  try {
    return JSON.stringify(input);
  } catch {
    throw new Error("Realtime payload must be JSON serializable.");
  }
}

function parseBoundedJson(input: string | unknown) {
  const serialized = serializedInput(input);
  if (new TextEncoder().encode(serialized).byteLength > MAX_REALTIME_EVENT_BYTES) {
    throw new Error("Realtime payload is too large.");
  }
  if (typeof input !== "string") return input;
  try {
    return JSON.parse(input) as unknown;
  } catch {
    throw new Error("Realtime payload must contain valid JSON.");
  }
}

export function parseRealtimeClientEvent(input: string | unknown) {
  return realtimeClientEventSchema.parse(parseBoundedJson(input));
}

export function parseRealtimeEvent(input: string | unknown) {
  return realtimeEventSchema.parse(parseBoundedJson(input));
}
