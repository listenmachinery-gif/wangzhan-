import { describe, expect, it } from "vitest";

import {
  DEFAULT_PRODUCT_EXPLORER_CONTENT,
  PRODUCT_EXPLORER_CATEGORY_KEYS,
  productExplorerContentSchema,
  resolveProductExplorerData,
} from "@/lib/product-explorer/config";

const published = [
  {
    id: "db-shear",
    slug: "shearing-machines",
    name: "Shearing Machine Series",
    summary: "Cutting",
    description: null,
    position: 1,
    products: [],
  },
  {
    id: "db-bend",
    slug: "bending-machines",
    name: "Bending Machine Series",
    summary: "Bending",
    description: null,
    position: 2,
    products: [
      {
        id: "product-1",
        slug: "servo-press-brake",
        name: "Servo Press Brake",
        summary: "Precision bending",
        description: null,
        position: 1,
        sections: [],
      },
    ],
  },
];

describe("product explorer configuration", () => {
  it("defines eight immutable slots and opens on Bending", () => {
    expect(PRODUCT_EXPLORER_CATEGORY_KEYS).toEqual([
      "shearing",
      "bending",
      "laser-cutting",
      "rolling",
      "pressing",
      "rectangular-duct",
      "round-duct",
      "shredding",
    ]);
    expect(DEFAULT_PRODUCT_EXPLORER_CONTENT.categories).toHaveLength(8);
    expect(DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.map((item) => [item.number, item.navLabel])).toEqual([
      ["01", "Shearing"],
      ["02", "Bending"],
      ["03", "Laser Cutting"],
      ["04", "Rolling"],
      ["05", "Pressing"],
      ["06", "Rectangular Duct"],
      ["07", "Round Duct"],
      ["08", "Shredding"],
    ]);
    expect(DEFAULT_PRODUCT_EXPLORER_CONTENT.defaultCategoryKey).toBe("bending");
  });

  it("accepts the complete default and rejects reordered or missing slots", () => {
    expect(productExplorerContentSchema.safeParse(DEFAULT_PRODUCT_EXPLORER_CONTENT).success).toBe(true);
    const invalid = {
      ...DEFAULT_PRODUCT_EXPLORER_CONTENT,
      categories: DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.slice(0, 7),
    };
    expect(productExplorerContentSchema.safeParse(invalid).success).toBe(false);
  });

  it("maps categories by real database id and keeps empty categories", () => {
    const content = {
      ...DEFAULT_PRODUCT_EXPLORER_CONTENT,
      categories: DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.map((item) => ({
        ...item,
        categoryId: item.key === "bending" ? "db-bend" : item.key === "shearing" ? "db-shear" : "",
      })),
    };
    const result = resolveProductExplorerData(content, published);
    expect(result[1].databaseCategory?.id).toBe("db-bend");
    expect(result[1].products.map((item) => item.slug)).toEqual(["servo-press-brake"]);
    expect(result[0].products).toEqual([]);
    expect(result[2].databaseCategory).toBeNull();
  });

  it("uses database position only as a pre-publication migration fallback", () => {
    const result = resolveProductExplorerData(DEFAULT_PRODUCT_EXPLORER_CONTENT, published);
    expect(result[0].databaseCategory?.id).toBe("db-shear");
    expect(result[1].databaseCategory?.id).toBe("db-bend");
    expect(result[2].databaseCategory).toBeNull();
  });
});
