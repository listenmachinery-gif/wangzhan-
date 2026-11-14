import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  createSession,
  formatSessionCookie,
  getPrincipalByToken,
  revokeSession,
} from "@/lib/auth/session";

describe("opaque administrator sessions", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  async function createAdmin() {
    const role = await db.role.create({ data: { key: "ADMIN", name: "Admin" } });
    const user = await db.user.create({
      data: { email: "admin@example.com", name: "Admin", passwordHash: "argon2id:test" },
    });
    await db.userRole.create({ data: { userId: user.id, roleId: role.id } });
    return user;
  }

  it("stores only a token digest and resolves an active principal", async () => {
    const user = await createAdmin();
    const created = await createSession(user.id, { ipHash: "ip", userAgent: "vitest" });
    const persisted = await db.session.findUniqueOrThrow({ where: { id: created.sessionId } });

    expect(created.token).toHaveLength(64);
    expect(persisted.tokenHash).not.toBe(created.token);
    await expect(getPrincipalByToken(created.token)).resolves.toMatchObject({
      id: user.id,
      email: "admin@example.com",
      roles: ["ADMIN"],
    });
  });

  it("rejects expired and revoked sessions", async () => {
    const user = await createAdmin();
    const expired = await createSession(user.id, {}, new Date("2020-01-01T00:00:00Z"));
    const active = await createSession(user.id, {});

    await expect(getPrincipalByToken(expired.token)).resolves.toBeNull();
    await revokeSession(active.token);
    await expect(getPrincipalByToken(active.token)).resolves.toBeNull();
  });

  it("formats a hardened session cookie", () => {
    const cookie = formatSessionCookie("opaque-token", new Date("2030-01-01T00:00:00Z"));

    expect(cookie).toContain("zyron_admin_session=opaque-token");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/admin");
  });
});
