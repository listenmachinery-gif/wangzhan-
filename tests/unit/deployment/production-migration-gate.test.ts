import { describe, expect, it } from "vitest";

import { shouldRunProductionMigrations } from "@/lib/deployment/production-migration-gate";

describe("production migration deployment gate", () => {
  it("stays closed for ordinary local, Preview, and Production builds", () => {
    expect(shouldRunProductionMigrations({})).toBe(false);
    expect(shouldRunProductionMigrations({ VERCEL_ENV: "preview", ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true", ALLOW_PRODUCTION_MIGRATIONS: "approved-once" })).toBe(false);
    expect(shouldRunProductionMigrations({ VERCEL_ENV: "production", ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true" })).toBe(false);
    expect(shouldRunProductionMigrations({ VERCEL_ENV: "production", ALLOW_PRODUCTION_MIGRATIONS: "approved-once" })).toBe(false);
  });

  it("opens only for the exact approved one-time Production combination", () => {
    expect(shouldRunProductionMigrations({
      VERCEL_ENV: "production",
      ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true",
      ALLOW_PRODUCTION_MIGRATIONS: "approved-once",
    })).toBe(true);
  });
});
