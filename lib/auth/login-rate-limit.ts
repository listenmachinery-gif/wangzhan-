import "server-only";

import { createHmac } from "node:crypto";

import { db } from "@/lib/db/client";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

function hashKey(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for login throttling.");
  return createHmac("sha256", secret).update(value.trim().toLowerCase()).digest("hex");
}

export function loginKeys(accountKey: string, networkKey: string) {
  return { accountKeyHash: hashKey(accountKey), networkKeyHash: hashKey(networkKey) };
}

export async function isLoginRateLimited(accountKey: string, networkKey: string) {
  const keys = loginKeys(accountKey, networkKey);
  const since = new Date(Date.now() - WINDOW_MS);
  const failures = await db.loginAttempt.count({
    where: {
      succeeded: false,
      attemptedAt: { gte: since },
      OR: [{ accountKeyHash: keys.accountKeyHash }, { networkKeyHash: keys.networkKeyHash }],
    },
  });
  return failures >= MAX_FAILURES;
}

export function recordLoginAttempt(input: {
  accountKey: string;
  networkKey: string;
  succeeded: boolean;
  userId?: string;
}) {
  const keys = loginKeys(input.accountKey, input.networkKey);
  return db.loginAttempt.create({
    data: { ...keys, succeeded: input.succeeded, userId: input.userId },
  });
}
