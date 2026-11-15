import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { UserAdminConflictError, UserAdminPermissionError, UserAdminService, UserAdminValidationError } from "@/lib/services/user-admin-service";

describe("user administration", () => {
  let admin: Principal;
  let superAdmin: Principal;
  beforeEach(async () => {
    await resetTestDatabase();
    const roles = await Promise.all(["SUPER_ADMIN", "ADMIN", "PRODUCT_EDITOR", "CONTENT_EDITOR", "SALES"].map((key) => db.role.create({ data: { key, name: key } })));
    const [superUser, adminUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "super@example.com", name: "Super", passwordHash: "test", roles: { create: { roleId: roles[0].id } } } }),
      db.user.create({ data: { email: "admin@example.com", name: "Admin", passwordHash: "test", roles: { create: { roleId: roles[1].id } } } }),
      db.user.create({ data: { email: "sales@example.com", name: "Sales", passwordHash: "test", roles: { create: { roleId: roles[4].id } } } }),
    ]);
    admin = { id: adminUser.id, email: adminUser.email, name: adminUser.name, roles: ["ADMIN"] };
    superAdmin = { id: superUser.id, email: superUser.email, name: superUser.name, roles: ["SUPER_ADMIN"] };
    await db.session.create({ data: { userId: salesUser.id, tokenHash: "active-token", expiresAt: new Date(Date.now() + 60_000) } });
  });
  afterAll(() => db.$disconnect());

  it("prevents Admin escalation and protection bypass", async () => {
    const service = new UserAdminService(db);
    const superUser = await db.user.findUniqueOrThrow({ where: { email: "super@example.com" } });
    const sales = await db.user.findUniqueOrThrow({ where: { email: "sales@example.com" } });
    await expect(service.update(admin, superUser.id, { name: "Changed", isActive: true, roles: ["SUPER_ADMIN"], updatedAt: superUser.updatedAt.toISOString() })).rejects.toBeInstanceOf(UserAdminPermissionError);
    await expect(service.update(admin, sales.id, { name: sales.name, isActive: true, roles: ["SUPER_ADMIN"], updatedAt: sales.updatedAt.toISOString() })).rejects.toBeInstanceOf(UserAdminPermissionError);
  });

  it("revokes sessions on disable, detects stale forms, audits, and keeps 2FA unavailable", async () => {
    const service = new UserAdminService(db);
    const sales = await db.user.findUniqueOrThrow({ where: { email: "sales@example.com" } });
    const updated = await service.update(superAdmin, sales.id, { name: "Sales disabled", isActive: false, roles: ["SALES"], updatedAt: sales.updatedAt.toISOString() });
    expect(updated).toMatchObject({ isActive: false, twoFactor: { enabled: false, configurable: false } });
    await expect(db.session.count({ where: { userId: sales.id, revokedAt: null } })).resolves.toBe(0);
    await expect(service.update(superAdmin, sales.id, { name: "Stale", isActive: true, roles: ["SALES"], updatedAt: sales.updatedAt.toISOString() })).rejects.toBeInstanceOf(UserAdminConflictError);
    await expect(db.auditLog.count({ where: { action: "user.update", entityId: sales.id } })).resolves.toBe(1);
  });

  it("rejects removal or disabling of the last active Super Admin", async () => {
    const service = new UserAdminService(db);
    const current = await db.user.findUniqueOrThrow({ where: { id: superAdmin.id } });
    await expect(service.update(superAdmin, current.id, { name: current.name, isActive: false, roles: ["SUPER_ADMIN"], updatedAt: current.updatedAt.toISOString() })).rejects.toBeInstanceOf(UserAdminValidationError);
  });

  it("keeps at least one active Super Admin during concurrent demotions", async () => {
    const role = await db.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
    const second = await db.user.create({ data: { email: "second-super@example.com", name: "Second", passwordHash: "test", roles: { create: { roleId: role.id } } } });
    const first = await db.user.findUniqueOrThrow({ where: { id: superAdmin.id } });
    const service = new UserAdminService(db);
    const results = await Promise.allSettled([
      service.update(superAdmin, first.id, { name: first.name, isActive: false, roles: ["SUPER_ADMIN"], updatedAt: first.updatedAt.toISOString() }),
      service.update(superAdmin, second.id, { name: second.name, isActive: false, roles: ["SUPER_ADMIN"], updatedAt: second.updatedAt.toISOString() }),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    await expect(db.user.count({ where: { isActive: true, roles: { some: { role: { key: "SUPER_ADMIN" } } } } })).resolves.toBe(1);
  });
});
