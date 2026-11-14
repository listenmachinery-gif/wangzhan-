import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { db } from "@/lib/db/client";
import { ROLES, type Principal, type RoleKey } from "@/lib/auth/permissions";

export const SESSION_COOKIE_NAME = "zyron_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function tokenDigest(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export type SessionCookie = {
  sessionId: string;
  token: string;
  expiresAt: Date;
};

export async function createSession(
  userId: string,
  context: { ipHash?: string; userAgent?: string },
  expiresAt = new Date(Date.now() + SESSION_DURATION_MS),
): Promise<SessionCookie> {
  const token = randomBytes(32).toString("hex");
  const session = await db.session.create({
    data: {
      userId,
      tokenHash: tokenDigest(token),
      expiresAt,
      ipHash: context.ipHash,
      userAgent: context.userAgent,
    },
  });

  return { sessionId: session.id, token, expiresAt };
}

export async function getPrincipalByToken(token: string): Promise<Principal | null> {
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: tokenDigest(token) },
    include: { user: { include: { roles: { include: { role: true } } } } },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) {
    return null;
  }

  const roles = session.user.roles
    .map(({ role }) => role.key)
    .filter((role): role is RoleKey => ROLES.includes(role as RoleKey));

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    roles,
  };
}

export async function getCurrentPrincipal() {
  const cookieStore = await cookies();
  return getPrincipalByToken(cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "");
}

export async function revokeSession(token: string) {
  await db.session.updateMany({
    where: { tokenHash: tokenDigest(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function formatSessionCookie(token: string, expiresAt: Date) {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/admin; Expires=${expiresAt.toUTCString()}; HttpOnly; Secure; SameSite=Lax`;
}
