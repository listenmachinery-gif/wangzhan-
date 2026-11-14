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
});
