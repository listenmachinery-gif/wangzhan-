import { describe, expect, it } from "vitest";

import { DEFAULT_PRODUCT_EXPLORER_CONTENT } from "@/lib/product-explorer/config";
import { DEFAULT_PRODUCT_SEARCH_CONTENT } from "@/lib/product-search/config";
import { buildProductsExplorerDocument } from "@/scripts/publish-products-explorer";

const categories = [
  ["id-1", "shearing-machines"],
  ["id-2", "bending-machines"],
  ["id-3", "laser-cutting-machines"],
  ["id-4", "plate-rolling-machines"],
  ["id-5", "press-machines"],
  ["id-6", "rectangular-duct-production"],
  ["id-7", "round-duct-production"],
  ["id-8", "shredders"],
].map(([id, slug], position) => ({ id, slug, name: slug, position }));

describe("Products explorer production publisher", () => {
  it("maps all eight fixed slots to real ids and preserves unrelated managed modules", () => {
    const document = buildProductsExplorerDocument(categories, {
      schemaVersion: 1,
      nodes: [{ id: "after-copy", type: "PARAGRAPH", placement: "AFTER_LEGACY", content: { text: "Keep me" } }],
    });

    expect(document.renderMode).toBe("REPLACE_LEGACY");
    expect(document.nodes).toHaveLength(4);
    expect(document.nodes[0]).toMatchObject({ id: "products-interactive-explorer", type: "PRODUCT_EXPLORER", placement: "REPLACE_LEGACY" });
    expect((document.nodes[0].content as { categories: Array<{ categoryId: string }> }).categories.map((item) => item.categoryId)).toEqual([
      "id-1", "id-2", "id-3", "id-4", "id-5", "id-6", "id-7", "id-8",
    ]);
    expect(document.nodes[1]).toMatchObject({ id: "products-premium-search", type: "PRODUCT_SEARCH", placement: "REPLACE_LEGACY" });
    expect(document.nodes[2]).toMatchObject({ id: "product-selection-center", type: "PRODUCT_SELECTION_CENTER", placement: "REPLACE_LEGACY" });
    expect(document.nodes[3].id).toBe("after-copy");
  });

  it("refuses publication when any required real category is missing", () => {
    expect(() => buildProductsExplorerDocument(categories.slice(0, 7), { schemaVersion: 1, nodes: [] })).toThrow(/Missing required product category: shredders/);
  });

  it("preserves manually edited product cards and their layout when rebuilding category mappings", () => {
    const productCardOverrides = [{
      productId: "product-1",
      title: "Custom card title",
      summary: "Custom card summary",
      image: "/api/media/custom-card",
      imageAlt: "Custom card Alt text",
    }];
    const productCardLayouts = [{
      categoryKey: "bending" as const,
      orderedProductIds: ["product-2", "product-1"],
      hiddenProductIds: ["product-3"],
    }];
    const document = buildProductsExplorerDocument(categories, {
      schemaVersion: 1,
      nodes: [{
        id: "existing-products-explorer",
        type: "PRODUCT_EXPLORER",
        placement: "REPLACE_LEGACY",
        content: { ...DEFAULT_PRODUCT_EXPLORER_CONTENT, productCardOverrides, productCardLayouts },
      }],
    });

    expect((document.nodes[0].content as { productCardOverrides: unknown }).productCardOverrides).toEqual(productCardOverrides);
    expect((document.nodes[0].content as { productCardLayouts: unknown }).productCardLayouts).toEqual(productCardLayouts);
  });

  it("migrates the preserved premium search typography to the homepage type scale", () => {
    const document = buildProductsExplorerDocument(categories, {
      schemaVersion: 1,
      nodes: [{
        id: "products-premium-search",
        type: "PRODUCT_SEARCH",
        placement: "REPLACE_LEGACY",
        content: { ...DEFAULT_PRODUCT_SEARCH_CONTENT, typography: { ...DEFAULT_PRODUCT_SEARCH_CONTENT.typography, titleSize: 68, eyebrowSize: 19, descriptionSize: 23 } },
      }],
    });
    expect(document.nodes[1].content).toMatchObject({ typography: { titleSize: 52, eyebrowSize: 14, descriptionSize: 16 } });
  });
});
