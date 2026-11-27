import { describe, expect, it } from "vitest";

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
    expect(document.nodes).toHaveLength(2);
    expect(document.nodes[0]).toMatchObject({ id: "products-interactive-explorer", type: "PRODUCT_EXPLORER", placement: "REPLACE_LEGACY" });
    expect((document.nodes[0].content as { categories: Array<{ categoryId: string }> }).categories.map((item) => item.categoryId)).toEqual([
      "id-1", "id-2", "id-3", "id-4", "id-5", "id-6", "id-7", "id-8",
    ]);
    expect(document.nodes[1].id).toBe("after-copy");
  });

  it("refuses publication when any required real category is missing", () => {
    expect(() => buildProductsExplorerDocument(categories.slice(0, 7), { schemaVersion: 1, nodes: [] })).toThrow(/Missing required product category: shredders/);
  });
});
