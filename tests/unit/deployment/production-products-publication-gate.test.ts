import { describe, expect, it } from "vitest";

import { shouldRunProductionProductsPublication } from "@/lib/deployment/production-products-publication-gate";

describe("production Products page publication deployment gate", () => {
  it("stays closed outside an explicitly authorized production deployment", () => {
    expect(shouldRunProductionProductsPublication({})).toBe(false);
    expect(shouldRunProductionProductsPublication({
      VERCEL_ENV: "preview",
      ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true",
      ZYRON_PRODUCTS_RELEASE: "APPROVED_2026_11_27",
    })).toBe(false);
    expect(shouldRunProductionProductsPublication({
      VERCEL_ENV: "production",
      ZYRON_PRODUCTS_RELEASE: "APPROVED_2026_11_27",
    })).toBe(false);
    expect(shouldRunProductionProductsPublication({
      VERCEL_ENV: "production",
      ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true",
    })).toBe(false);
  });

  it("opens only for the approved one-time Products release", () => {
    expect(shouldRunProductionProductsPublication({
      VERCEL_ENV: "production",
      ZYRON_PRODUCTION_CHANGE_AUTHORIZED: "true",
      ZYRON_PRODUCTS_RELEASE: "APPROVED_2026_11_27",
    })).toBe(true);
  });
});
