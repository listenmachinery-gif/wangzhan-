import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mapLegacyProduct, type LegacyProductInput } from "@/lib/migration/product-mapper";
import { readLegacyCatalogue } from "@/lib/migration/legacy-product-reader";
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

  it("reports nested fields that are not represented by standardized module schemas", () => {
    const result = mapLegacyProduct({
      ...fixtures[0],
      page: {
        solutionParagraphs: ["Exact solution copy"],
        solutionFitEyebrow: "Unmapped fit eyebrow",
        structureParts: [{ title: "Frame", text: "Rigid frame" }],
        structureImageAlt: "Unmapped structure image",
        structureCallouts: [{ label: "Blade" }],
        modelCards: [{
          model: "Q11G-2x600",
          image: "/products/model.png",
          alt: "Model image",
          specifications: [{ label: "Width", value: "600", unit: "mm" }],
        }],
        comparisonRows: [{ label: "Drive", electric: "Motor" }],
        comparisonElectricLabel: "Electric",
        comparisonHighlight: "Unmapped highlight",
        binaryComparison: { enabled: true },
        materialRangeGallery: {
          title: "Material range",
          note: "Unmapped gallery note",
          items: [{ image: "/products/material.png", alt: "Material", title: "Steel" }],
        },
      },
    });

    expect(result.unmapped.map((item) => item.path)).toEqual(expect.arrayContaining([
      "page.solutionFitEyebrow",
      "page.structureImageAlt",
      "page.structureCallouts",
      "page.modelCards.0.image",
      "page.modelCards.0.alt",
      "page.modelCards.0.specifications.0.unit",
      "page.comparisonElectricLabel",
      "page.comparisonHighlight",
      "page.binaryComparison",
      "page.materialRangeGallery.note",
    ]));
  });

  it("maps real representatives from every product family without changing identity", async () => {
    const catalogue = await readLegacyCatalogue({ includePageContent: true });
    const slugs = [
      "compact-electric-shearing-machine",
      "nc-hydraulic-press-brake",
      "exchange-table-fiber-laser-cutting-machine",
      "hydraulic-four-roll-plate-rolling-machine",
      "mechanical-punch-press",
      "u-shaped-auto-duct-production-line-5",
      "dual-shaft-shredder",
    ];

    for (const slug of slugs) {
      const legacy = catalogue.products.find((product) => product.id === slug);
      expect(legacy, `missing real fixture for ${slug}`).toBeDefined();
      const result = mapLegacyProduct(legacy!);
      expect(result.product).toMatchObject({
        slug: legacy!.id,
        categorySlug: legacy!.categoryId,
        name: legacy!.name,
      });
      expect(result.modules.find((item) => item.type === "HERO")?.data).toMatchObject({
        title: legacy!.page?.title ?? legacy!.name,
      });

      const pageApplications = Array.isArray(legacy!.page?.applications)
        ? legacy!.page.applications as Array<Record<string, unknown>>
        : undefined;
      const expectedApplication = pageApplications?.length
        ? {
            title: String(pageApplications[0].title),
            text: String(pageApplications[0].text),
          }
        : {
            title: legacy!.applications[0],
            text: legacy!.applications[0],
          };
      const applications = result.modules.find((item) => item.type === "APPLICATIONS")?.data as {
        items: Array<{ title: string; text: string }>;
      };
      expect(applications.items[0], `application mapping for ${slug}`).toMatchObject(expectedApplication);

      const pagePainPoints = Array.isArray(legacy!.page?.painPoints)
        ? legacy!.page.painPoints as Array<Record<string, unknown>>
        : undefined;
      if (pagePainPoints?.length) {
        const problems = result.modules.find((item) => item.type === "PROBLEMS")?.data as {
          items: Array<{ title: string; text: string }>;
        };
        expect(problems.items[0], `problem mapping for ${slug}`).toEqual({
          title: String(pagePainPoints[0].title),
          text: String(pagePainPoints[0].text),
        });
      }

      if (legacy!.page?.hero && typeof legacy!.page.hero === "object") {
        expect(result.unmapped.find((item) => item.path === "page.hero")?.value).toEqual(legacy!.page.hero);
      }
    }

    const compact = catalogue.products.find((product) => product.id === "compact-electric-shearing-machine")!;
    const compactMapping = mapLegacyProduct(compact);
    expect(compactMapping.modules.find((item) => item.type === "HERO")?.data).toMatchObject({
      images: { desktop: compact.page?.heroBackgroundImage },
      subtitle: compact.page?.heroSubtitle,
    });

    const pressBrake = mapLegacyProduct(catalogue.products.find((product) => product.id === "nc-hydraulic-press-brake")!);
    expect(pressBrake.modules.find((item) => item.type === "PROBLEMS")).toMatchObject({ visible: true });
    expect(pressBrake.unmapped.map((item) => item.path)).toEqual(expect.arrayContaining([
      "page.hero",
      "page.solutions",
      "page.materials",
    ]));
  });
});
