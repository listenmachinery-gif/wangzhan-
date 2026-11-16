import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { shouldRotateSession } from "@/lib/analytics/first-party/rules";
import type { AnalyticsIdentityResult, SignedAnalyticsIdentity } from "@/lib/analytics/first-party/types";

export const ANALYTICS_VISITOR_COOKIE = "zyron_vid";
export const ANALYTICS_SESSION_COOKIE = "zyron_sid";

const VISITOR_MAX_AGE_SECONDS = 2 * 365 * 24 * 60 * 60;
const SESSION_MAX_AGE_SECONDS = 30 * 60;
const ID_PATTERN = /^[a-f0-9]{32}$/;

type IdentityKind = "visitor" | "session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters for analytics identity.");
  }
  return value;
}

function signature(kind: IdentityKind, id: string, timestamp: string) {
  return createHmac("sha256", secret()).update(`${kind}:${id}:${timestamp}`).digest("hex");
}

function encode(kind: IdentityKind, id: string, seenAt: Date) {
  const timestamp = String(seenAt.getTime());
  return `${id}.${timestamp}.${signature(kind, id, timestamp)}`;
}

function decode(kind: IdentityKind, value: string | undefined): SignedAnalyticsIdentity | null {
  if (!value) return null;
  const [id, timestamp, suppliedSignature, ...rest] = value.split(".");
  if (rest.length || !ID_PATTERN.test(id ?? "") || !/^\d{13}$/.test(timestamp ?? "") || !/^[a-f0-9]{64}$/.test(suppliedSignature ?? "")) {
    return null;
  }
  const expected = signature(kind, id, timestamp);
  const suppliedBuffer = Buffer.from(suppliedSignature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return null;
  }
  const seenAt = new Date(Number(timestamp));
  return Number.isNaN(seenAt.getTime()) ? null : { id, seenAt };
}

function parseCookies(request: Request) {
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name && !cookies.has(name)) cookies.set(name, value);
  }
  return cookies;
}

function formatCookie(request: Request, name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" || new URL(request.url).protocol === "https:";
  return [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    secure ? "Secure" : null,
    "SameSite=Lax",
  ].filter(Boolean).join("; ");
}

function newId() {
  return randomBytes(16).toString("hex");
}

export function readOrCreateAnalyticsIdentity(request: Request, now = new Date()): AnalyticsIdentityResult {
  const cookies = parseCookies(request);
  const existingVisitor = decode("visitor", cookies.get(ANALYTICS_VISITOR_COOKIE));
  const visitorId = existingVisitor?.id ?? newId();
  const visitorCreated = !existingVisitor;

  const existingSession = visitorCreated
    ? null
    : decode("session", cookies.get(ANALYTICS_SESSION_COOKIE));
  const sessionCreated = !existingSession || shouldRotateSession(existingSession.seenAt, now);
  const sessionId = sessionCreated ? newId() : existingSession.id;
  const cookieHeaders: string[] = [];

  if (visitorCreated) {
    cookieHeaders.push(formatCookie(
      request,
      ANALYTICS_VISITOR_COOKIE,
      encode("visitor", visitorId, now),
      VISITOR_MAX_AGE_SECONDS,
    ));
  }
  cookieHeaders.push(formatCookie(
    request,
    ANALYTICS_SESSION_COOKIE,
    encode("session", sessionId, now),
    SESSION_MAX_AGE_SECONDS,
  ));

  return { visitorId, sessionId, visitorCreated, sessionCreated, cookieHeaders };
}
