import { describe, expect, it } from "vitest";

import { shouldRunProductionPasswordReset } from "@/lib/deployment/production-password-reset-gate";

describe("production administrator password reset gate", () => {
  it("stays closed unless every one-time Production condition is exact", () => {
    expect(shouldRunProductionPasswordReset({})).toBe(false);
    expect(shouldRunProductionPasswordReset({ VERCEL_ENV: "preview", ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true", ALLOW_PRODUCTION_PASSWORD_RESET: "approved-once" })).toBe(false);
    expect(shouldRunProductionPasswordReset({ VERCEL_ENV: "production", ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true" })).toBe(false);
    expect(shouldRunProductionPasswordReset({ VERCEL_ENV: "production", ALLOW_PRODUCTION_PASSWORD_RESET: "approved-once" })).toBe(false);
  });

  it("opens only for the approved one-time Production reset", () => {
    expect(shouldRunProductionPasswordReset({
      VERCEL_ENV: "production",
      ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true",
      ALLOW_PRODUCTION_PASSWORD_RESET: "approved-once",
    })).toBe(true);
  });
});
