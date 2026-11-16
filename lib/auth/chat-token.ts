import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { AnalyticsEnvironment } from "@prisma/client";
import { z } from "zod";

import { getRealtimeConfig } from "@/lib/realtime/config";

const TOKEN_LIFETIME_SECONDS = 5 * 60;

const payloadSchema = z.strictObject({
  v: z.literal(1),
  subjectType: z.enum(["visitor", "admin"]),
  subjectId: z.string().min(1).max(128),
  conversationId: z.string().min(1).max(128).optional(),
  environment: z.enum(["DEVELOPMENT", "TEST", "PREVIEW", "PRODUCTION"]),
  issuedAt: z.number().int().nonnegative(),
  expiresAt: z.number().int().positive(),
  nonce: z.string().uuid(),
});

export type ChatTokenScope = {
  subjectType: "visitor" | "admin";
  subjectId: string;
  conversationId?: string;
  environment: AnalyticsEnvironment;
};

export class ChatTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatTokenError";
  }
}

function secret() {
  const config = getRealtimeConfig();
  if (!config.enabled || !config.tokenSecret) throw new ChatTokenError("Realtime chat is disabled.");
  return { value: config.tokenSecret, environment: config.environment.toUpperCase() as AnalyticsEnvironment };
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function issueChatToken(scope: ChatTokenScope, now = new Date()) {
  const tokenSecret = secret();
  if (scope.environment !== tokenSecret.environment) {
    throw new ChatTokenError("Token environment is invalid.");
  }
  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    ...scope,
    issuedAt,
    expiresAt: issuedAt + TOKEN_LIFETIME_SECONDS,
    nonce: randomUUID(),
  })).toString("base64url");
  return `${payload}.${sign(payload, tokenSecret.value)}`;
}

export function verifyChatToken(token: string, now = new Date()) {
  const [encodedPayload, suppliedSignature, ...rest] = token.split(".");
  if (rest.length || !encodedPayload || !suppliedSignature) throw new ChatTokenError("Invalid chat token.");
  const tokenSecret = secret();
  const expectedSignature = sign(encodedPayload, tokenSecret.value);
  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new ChatTokenError("Invalid chat token.");
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new ChatTokenError("Invalid chat token.");
  }
  const parsed = payloadSchema.safeParse(decoded);
  if (!parsed.success || parsed.data.environment !== tokenSecret.environment) {
    throw new ChatTokenError("Invalid chat token.");
  }
  const nowSeconds = Math.floor(now.getTime() / 1000);
  if (parsed.data.expiresAt <= nowSeconds) {
    throw new ChatTokenError("Chat token has expired.");
  }
  if (parsed.data.issuedAt > nowSeconds + 30) throw new ChatTokenError("Invalid chat token.");
  return parsed.data;
}
