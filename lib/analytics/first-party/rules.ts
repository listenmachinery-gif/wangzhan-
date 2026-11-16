import "server-only";

import { createHmac } from "node:crypto";

export const ONLINE_WINDOW_MS = 120 * 1_000;
export const ACTIVE_WINDOW_MS = 5 * 60 * 1_000;
export const SESSION_INACTIVITY_MS = 30 * 60 * 1_000;

function analyticsSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters for analytics identity.");
  }
  return value;
}

function elapsed(lastSeenAt: Date, now: Date) {
  return Math.max(0, now.getTime() - lastSeenAt.getTime());
}

export function isOnline(lastSeenAt: Date, now = new Date()) {
  return elapsed(lastSeenAt, now) <= ONLINE_WINDOW_MS;
}

export function isActive(lastActiveAt: Date, now = new Date()) {
  return elapsed(lastActiveAt, now) <= ACTIVE_WINDOW_MS;
}

export function shouldRotateSession(lastSeenAt: Date, now = new Date()) {
  return elapsed(lastSeenAt, now) >= SESSION_INACTIVITY_MS;
}

export function hashNetworkKey(value: string, month: string) {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Analytics network hash month must use YYYY-MM.");
  }
  return createHmac("sha256", analyticsSecret())
    .update(`analytics-network:${month}:${value.trim().toLowerCase()}`)
    .digest("hex");
}
