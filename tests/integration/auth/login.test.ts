import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { attemptLogin } from "@/lib/auth/login";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { loginInputSchema } from "@/lib/validation/auth";

describe("administrator login", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("hashes passwords with Argon2id and verifies without storing plaintext", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain("correct horse battery staple");
    await expect(verifyPassword(hash, "correct horse battery staple")).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });

  it("rejects empty and malformed credentials at the boundary", () => {
    expect(loginInputSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(loginInputSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
  });

  it("returns the same public failure for unknown accounts and wrong passwords", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");
    await db.user.create({
      data: { email: "admin@example.com", name: "Admin", passwordHash },
    });

    const unknown = await attemptLogin(
      { email: "unknown@example.com", password: "wrong password" },
      { accountKey: "unknown@example.com", networkKey: "network-a" },
    );
    const wrong = await attemptLogin(
      { email: "admin@example.com", password: "wrong password" },
      { accountKey: "admin@example.com", networkKey: "network-b" },
    );

    expect(unknown).toEqual({ ok: false, code: "INVALID_CREDENTIALS" });
    expect(wrong).toEqual({ ok: false, code: "INVALID_CREDENTIALS" });
    expect(await db.auditLog.count({ where: { action: "auth.login.failure" } })).toBe(2);
  });

  it("throttles repeated failures by normalized account and network key", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await attemptLogin(
        { email: "TARGET@EXAMPLE.COM", password: "wrong password" },
        { accountKey: "target@example.com", networkKey: "shared-network" },
      );
    }

    await expect(
      attemptLogin(
        { email: "target@example.com", password: "wrong password" },
        { accountKey: "target@example.com", networkKey: "shared-network" },
      ),
    ).resolves.toEqual({ ok: false, code: "RATE_LIMITED" });
  });

  it("creates an opaque session and audit record after valid credentials", async () => {
    const role = await db.role.create({ data: { key: "ADMIN", name: "Admin" } });
    const user = await db.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin",
        passwordHash: await hashPassword("correct horse battery staple"),
      },
    });
    await db.userRole.create({ data: { userId: user.id, roleId: role.id } });

    const result = await attemptLogin(
      { email: " ADMIN@example.com ", password: "correct horse battery staple" },
      { accountKey: "admin@example.com", networkKey: "network-a", userAgent: "vitest" },
    );

    expect(result).toMatchObject({ ok: true, userId: user.id });
    expect(result.ok && result.token).toHaveLength(64);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
    expect(await db.auditLog.count({ where: { actorId: user.id, action: "auth.login.success" } })).toBe(1);
  });
});
