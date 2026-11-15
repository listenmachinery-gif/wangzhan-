import "server-only";

import { createHmac } from "node:crypto";

import { createSession } from "@/lib/auth/session";
import { isLoginRateLimited, recordLoginAttempt } from "@/lib/auth/login-rate-limit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { recordAudit } from "@/lib/services/audit-service";
import { loginInputSchema } from "@/lib/validation/auth";

export type LoginResult =
  | { ok: true; userId: string; token: string; expiresAt: Date }
  | { ok: false; code: "INVALID_CREDENTIALS" | "RATE_LIMITED" };

let dummyPasswordHash: Promise<string> | undefined;

function dummyHash() {
  dummyPasswordHash ??= hashPassword("dummy-password-value-never-used");
  return dummyPasswordHash;
}

function ipHash(networkKey: string) {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "").update(networkKey).digest("hex");
}

function accountHash(accountKey: string) {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(accountKey.trim().toLowerCase())
    .digest("hex");
}

function recordFailure(context: { accountKey: string; networkKey: string }, userId?: string) {
  return db.$transaction([
    recordLoginAttempt({ ...context, succeeded: false, userId }),
    recordAudit({
      actorId: userId,
      action: "auth.login.failure",
      entityType: "LoginAccount",
      entityId: userId ?? accountHash(context.accountKey),
      ipHash: ipHash(context.networkKey),
    }),
  ]);
}

export async function attemptLogin(
  rawInput: unknown,
  context: { accountKey: string; networkKey: string; userAgent?: string },
): Promise<LoginResult> {
  if (await isLoginRateLimited(context.accountKey, context.networkKey)) {
    return { ok: false, code: "RATE_LIMITED" };
  }

  const parsed = loginInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    await recordFailure(context);
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const passwordMatches = await verifyPassword(user?.passwordHash ?? (await dummyHash()), parsed.data.password);
  if (!user || !user.isActive || !passwordMatches) {
    await recordFailure(context, user?.id);
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }

  const session = await createSession(user.id, {
    ipHash: ipHash(context.networkKey),
    userAgent: context.userAgent,
  });
  await db.$transaction([
    recordLoginAttempt({ ...context, succeeded: true, userId: user.id }),
    recordAudit({
      actorId: user.id,
      action: "auth.login.success",
      entityType: "User",
      entityId: user.id,
      ipHash: ipHash(context.networkKey),
    }),
  ]);

  return { ok: true, userId: user.id, token: session.token, expiresAt: session.expiresAt };
}
