import { describe, expect, it } from "vitest";

import { PRODUCT_MODULE_TYPES } from "@/lib/product-modules/types";
import { validateModule } from "@/lib/product-modules/schemas";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("standard product module schemas", () => {
  it.each(PRODUCT_MODULE_TYPES)("accepts a valid %s module", (type) => {
    expect(validateModule(type, validProductModuleData[type])).toEqual(validProductModuleData[type]);
  });

  it.each(PRODUCT_MODULE_TYPES)("rejects malformed %s content", (type) => {
    expect(() => validateModule(type, { title: "" })).toThrow();
  });

  it("rejects unknown properties so legacy content cannot disappear silently", () => {
    expect(() => validateModule("OVERVIEW", {
      ...(validProductModuleData.OVERVIEW as object),
      legacyMystery: true,
    })).toThrow();
  });

  it("rejects duplicate technical column keys and row keys outside the declared columns", () => {
    const technical = validProductModuleData.TECHNICAL as {
      columns: Array<{ key: string; label: string; unit?: string }>;
      rows: Array<Record<string, string>>;
    };
    expect(() => validateModule("TECHNICAL", {
      ...technical,
      columns: [technical.columns[0], { ...technical.columns[1], key: technical.columns[0].key }],
    })).toThrow(/unique/i);
    expect(() => validateModule("TECHNICAL", {
      ...technical,
      rows: [{ ...technical.rows[0], undeclared: "value" }],
    })).toThrow(/declared columns/i);
  });
});
