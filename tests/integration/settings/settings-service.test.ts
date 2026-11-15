import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { SettingsConflictError, SettingsPermissionError, SettingsService, SettingsValidationError } from "@/lib/services/settings-service";

describe("non-secret site settings", () => {
  const admin: Principal = { id: "admin", email: "admin@example.com", name: "Admin", roles: ["ADMIN"] };
  const editor: Principal = { id: "editor", email: "editor@example.com", name: "Editor", roles: ["CONTENT_EDITOR"] };
  beforeEach(async () => {
    await resetTestDatabase();
    await db.user.createMany({ data: [
      { id: admin.id, email: admin.email, name: admin.name, passwordHash: "test" },
      { id: editor.id, email: editor.email, name: editor.name, passwordHash: "test" },
    ] });
  });
  afterAll(() => db.$disconnect());

  it("stores only allowlisted non-secret values with optimistic concurrency and audit", async () => {
    const service = new SettingsService(db);
    const created = await service.save(admin, { key: "contact.email", value: "sales@zyroncnc.com", version: 0 });
    expect(created).toMatchObject({ key: "contact.email", value: "sales@zyroncnc.com", version: 1 });
    await expect(service.save(admin, { key: "contact.email", value: "info@zyroncnc.com", version: 0 })).rejects.toBeInstanceOf(SettingsConflictError);
    await expect(db.auditLog.count({ where: { action: "settings.update", entityId: "contact.email" } })).resolves.toBe(1);
  });

  it("rejects secret-like or unknown keys and unauthorized writers", async () => {
    const service = new SettingsService(db);
    await expect(service.save(admin, { key: "SESSION_SECRET", value: "nope", version: 0 })).rejects.toBeInstanceOf(SettingsValidationError);
    await expect(service.save(admin, { key: "database.url", value: "nope", version: 0 })).rejects.toBeInstanceOf(SettingsValidationError);
    await expect(service.save(editor, { key: "contact.email", value: "x@example.com", version: 0 })).rejects.toBeInstanceOf(SettingsPermissionError);
  });

  it("never returns unknown historical keys and maps concurrent creation to a conflict", async () => {
    const service = new SettingsService(db);
    await db.siteSetting.create({ data: { key: "legacy.apiSecret", value: "must-not-leak" } });
    await expect(service.list(admin)).resolves.toEqual([]);
    const results = await Promise.allSettled([
      service.save(admin, { key: "company.name", value: "ZYRON", version: 0 }),
      service.save(admin, { key: "company.name", value: "ZYRON CNC", version: 0 }),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(results.filter(({ status }) => status === "rejected")[0]).toMatchObject({ reason: expect.any(SettingsConflictError) });
  });

  it("saves multiple settings atomically", async () => {
    const service = new SettingsService(db);
    await service.save(admin, { key: "contact.email", value: "old@zyroncnc.com", version: 0 });
    await expect(service.saveMany(admin, [
      { key: "company.name", value: "Should roll back", version: 0 },
      { key: "contact.email", value: "new@zyroncnc.com", version: 0 },
    ])).rejects.toBeInstanceOf(SettingsConflictError);
    await expect(db.siteSetting.findUnique({ where: { key: "company.name" } })).resolves.toBeNull();
    await expect(db.siteSetting.findUniqueOrThrow({ where: { key: "contact.email" } })).resolves.toMatchObject({ value: "old@zyroncnc.com" });
  });
});
