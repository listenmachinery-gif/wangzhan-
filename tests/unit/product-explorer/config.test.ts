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

  it("uses one persistent full-width background and eight transparent equipment assets", () => {
    expect(DEFAULT_PRODUCT_EXPLORER_CONTENT.backgroundImage).toBe(
      "/products/explorer/industrial-studio-background.webp",
    );
    expect(DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.map((item) => item.heroImage)).toEqual([
      "/products/explorer/shearing-machines.webp",
      "/products/explorer/press-brakes.webp",
      "/products/explorer/laser-cutting-machines.webp",
      "/products/explorer/plate-rolling-machines.webp",
      "/products/explorer/hydraulic-presses.webp",
      "/products/explorer/rectangular-duct-machines.webp",
      "/products/explorer/round-duct-machines.webp",
      "/products/explorer/shredding-machines.webp",
    ]);
  });

  it("fits every complete machine inside the dedicated safety frame without cropping", () => {
    for (const category of DEFAULT_PRODUCT_EXPLORER_CONTENT.categories) {
      expect(category.desktopX).toBe(0);
      expect(category.desktopY).toBe(0);
      expect(category.tabletX).toBe(0);
      expect(category.tabletY).toBe(0);
      expect(category.mobileX).toBe(0);
      expect(category.mobileY).toBe(0);
      expect(category.desktopScale).toBeLessThanOrEqual(1);
      expect(category.tabletScale).toBeLessThanOrEqual(1);
      expect(category.mobileScale).toBeLessThanOrEqual(1);
    }
  });

  it("accepts the complete default and rejects reordered or missing slots", () => {
    expect(productExplorerContentSchema.safeParse(DEFAULT_PRODUCT_EXPLORER_CONTENT).success).toBe(true);
    const invalid = {
      ...DEFAULT_PRODUCT_EXPLORER_CONTENT,
      categories: DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.slice(0, 7),
    };
    expect(productExplorerContentSchema.safeParse(invalid).success).toBe(false);
  });

  it("upgrades previously published content with the fixed background without losing edits", () => {
    const legacyContent = Object.fromEntries(
      Object.entries(DEFAULT_PRODUCT_EXPLORER_CONTENT).filter(([key]) => key !== "backgroundImage"),
    );
    const parsed = productExplorerContentSchema.parse({
      ...legacyContent,
      title: "A previously edited product title",
    });

    expect(parsed.backgroundImage).toBe("/products/explorer/industrial-studio-background.webp");
    expect(parsed.title).toBe("A previously edited product title");
  });

  it("upgrades legacy content without product card overrides to an empty override list", () => {
    const legacyContent = Object.fromEntries(
      Object.entries(DEFAULT_PRODUCT_EXPLORER_CONTENT).filter(([key]) => key !== "productCardOverrides"),
    );

    const parsed = productExplorerContentSchema.parse(legacyContent);

    expect(parsed.productCardOverrides).toEqual([]);
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
