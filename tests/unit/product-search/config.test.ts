import { describe, expect, it } from "vitest";

import {
  alignProductSearchTypography,
  DEFAULT_PRODUCT_SEARCH_CONTENT,
  buildProductSearchIndex,
  normalizeProductSearchQuery,
  productSearchContentSchema,
  rankProductSearchResults,
  type ProductSearchIndexItem,
} from "@/lib/product-search/config";

const items: ProductSearchIndexItem[] = [
  {
    id: "p-shear",
    slug: "energy-saving-electric-shearing-machine",
    name: "Energy-Saving Electric Shearing Machine",
    summary: "Compact sheet cutting equipment",
    categoryName: "Shearing Machines",
    categorySlug: "shearing-machines",
    image: "/products/catalog/energy-saving-electric-shearing-machine.png",
    imageAlt: "Energy-Saving Electric Shearing Machine",
    models: ["Q11G-2×3000"],
    aliases: ["Electric Shear"],
  },
  {
    id: "p-brake",
    slug: "cnc-press-brake",
    name: "CNC Press Brake",
    summary: "Precision bending system",
    categoryName: "Bending Machines",
    categorySlug: "bending-machines",
    image: "/products/catalog/torsion-bar-cnc-press-brake.png",
    imageAlt: "CNC Press Brake",
    models: ["WE67K-160T3200"],
    aliases: ["Bending Machine"],
  },
];

describe("Product Search configuration and ranking", () => {
  it("parses the complete default module configuration", () => {
    expect(productSearchContentSchema.parse(DEFAULT_PRODUCT_SEARCH_CONTENT)).toEqual(DEFAULT_PRODUCT_SEARCH_CONTENT);
    expect(DEFAULT_PRODUCT_SEARCH_CONTENT.popularItems).toHaveLength(4);
    expect(DEFAULT_PRODUCT_SEARCH_CONTENT.features).toHaveLength(3);
    expect(DEFAULT_PRODUCT_SEARCH_CONTENT.typography).toMatchObject({
      eyebrowSize: 14,
      titleSize: 52,
      descriptionSize: 16,
    });
  });

  it("aligns previously saved search typography with the homepage scale", () => {
    const aligned = alignProductSearchTypography({ ...DEFAULT_PRODUCT_SEARCH_CONTENT, typography: { ...DEFAULT_PRODUCT_SEARCH_CONTENT.typography, titleSize: 68, eyebrowSize: 19, descriptionSize: 23 } });
    expect(aligned.typography).toMatchObject({ titleSize: 52, eyebrowSize: 14, descriptionSize: 16 });
  });

  it("normalizes multiplication signs, hyphens, punctuation, and whitespace", () => {
    expect(normalizeProductSearchQuery("  Q11G–2 × 3000  ")).toBe("q11g 2 x 3000");
  });

  it("ranks exact model matches before name, alias, category, and description matches", () => {
    expect(rankProductSearchResults("Q11G-2x3000", items)[0]?.id).toBe("p-shear");
    expect(rankProductSearchResults("CNC Press Brake", items)[0]?.id).toBe("p-brake");
    expect(rankProductSearchResults("Electric Shear", items)[0]?.id).toBe("p-shear");
    expect(rankProductSearchResults("Bending Machines", items)[0]?.id).toBe("p-brake");
  });

  it("returns no results for short or unrelated queries and enforces the configured limit", () => {
    expect(rankProductSearchResults("a", items)).toEqual([]);
    expect(rankProductSearchResults("not-a-real-machine", items)).toEqual([]);
    expect(rankProductSearchResults("machine", items, 1)).toHaveLength(1);
  });

  it("builds the browser index from real catalogue records and configured product aliases", () => {
    const content = {
      ...DEFAULT_PRODUCT_SEARCH_CONTENT,
      popularItems: DEFAULT_PRODUCT_SEARCH_CONTENT.popularItems.map((item, index) => index === 0
        ? { ...item, productId: "db-product-1", keyword: "Electric Shear" }
        : item),
    };
    expect(buildProductSearchIndex([{
      id: "db-category-1",
      slug: "shearing-machines",
      name: "Shearing Machines",
      products: [{
        id: "db-product-1",
        slug: "energy-saving-electric-shearing-machine",
        name: "Energy-Saving Electric Shearing Machine",
        summary: "Compact cutting",
        models: [{ name: "Q11G-2x3000", sku: "Q11G" }],
      }],
    }], [{
      id: "energy-saving-electric-shearing-machine",
      categoryId: "shearing-machines",
      image: "/products/catalog/energy-saving-electric-shearing-machine.png",
    }], content)).toEqual([expect.objectContaining({
      id: "db-product-1",
      image: "/products/catalog/energy-saving-electric-shearing-machine.png",
      models: ["Q11G-2x3000", "Q11G"],
      aliases: ["Electric Shear"],
    })]);
  });
});
