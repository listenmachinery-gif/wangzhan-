import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mapLegacyProduct, type LegacyProductInput } from "@/lib/migration/product-mapper";
import { SMALL_ELECTRIC_PRODUCT_MODULE_ORDER } from "@/lib/product-modules/small-electric-template";

const fixtures = JSON.parse(
  readFileSync(new URL("../../fixtures/legacy-catalogue/products.json", import.meta.url), "utf8"),
) as LegacyProductInput[];

describe("legacy product mapper", () => {
  it.each(fixtures)("preserves exact identity and base content for $id", (legacy) => {
    const result = mapLegacyProduct(legacy);

    expect(result.product).toMatchObject({
      slug: legacy.id,
      name: legacy.name,
      categorySlug: legacy.categoryId,
      categoryName: legacy.categoryName,
      summary: legacy.tagline,
    });
    expect(result.modules.map((module) => module.type)).toEqual(SMALL_ELECTRIC_PRODUCT_MODULE_ORDER);
    expect(result.modules.find((module) => module.type === "HERO")).toMatchObject({
      visible: true,
      data: { title: legacy.name, images: { desktop: legacy.image } },
    });
    expect(result.modules.find((module) => module.type === "APPLICATIONS")?.visible).toBe(
      legacy.applications.length > 0,
    );
    expect(result.unmapped).toEqual([]);
  });

  it("maps exact technical table values without fabrication", () => {
    const result = mapLegacyProduct(fixtures[0]);
    expect(result.modules.find((module) => module.type === "TECHNICAL")).toMatchObject({
      visible: true,
      data: {
        columns: [{ key: "model", label: "Model" }, { key: "width", label: "Width" }],
        rows: [{ model: "Q11G-2x600", width: "600" }],
      },
    });
  });

  it("keeps absent standardized content hidden and reports unknown legacy content", () => {
    const result = mapLegacyProduct({
      ...fixtures[1],
      page: { unknownProductionClaim: "Do not discard me" },
    });

    expect(result.modules.find((module) => module.type === "ENERGY_COMPARISON")).toMatchObject({
      visible: false,
      data: null,
    });
    expect(result.unmapped).toEqual([
      { path: "page.unknownProductionClaim", value: "Do not discard me", reason: "No standardized mapping" },
    ]);
  });

  it("reports known-but-unimplemented page fields instead of silently consuming them", () => {
    const result = mapLegacyProduct({
      ...fixtures[1],
      page: {
        schemaName: "Legacy schema name",
        energyUse: { idle: "1 kW" },
        manufacturer: { title: "Legacy manufacturer section" },
      },
    });

    expect(result.unmapped.map((item) => item.path)).toEqual([
      "page.schemaName",
      "page.energyUse",
      "page.manufacturer",
    ]);
  });
});
