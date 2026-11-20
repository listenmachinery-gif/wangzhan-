import { describe, expect, it } from "vitest";

import {
  categoryCreateSchema,
  productCreateSchema,
  productListQuerySchema,
  productSectionBatchSchema,
  productUpdateSchema,
} from "@/lib/validation/products";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("product administration validation", () => {
  it("normalizes valid category and product inputs", () => {
    expect(categoryCreateSchema.parse({
      name: "  New Shears  ",
      slug: "new-shears",
      summary: "  Compact machines.  ",
      position: 3,
    })).toMatchObject({
      name: "New Shears",
      slug: "new-shears",
      summary: "Compact machines.",
      position: 3,
    });

    expect(productCreateSchema.parse({
      categoryId: "category-1",
      name: "  Test Machine  ",
      slug: "test-machine",
      summary: "  A real draft product.  ",
    })).toMatchObject({
      categoryId: "category-1",
      name: "Test Machine",
      slug: "test-machine",
      summary: "A real draft product.",
    });
  });

  it("rejects invalid slugs and protected slug updates", () => {
    expect(() => categoryCreateSchema.parse({ name: "Category", slug: "Bad Slug" })).toThrow();
    expect(() => productCreateSchema.parse({
      categoryId: "category-1",
      name: "Product",
      slug: "Bad Slug",
      summary: "Summary",
    })).toThrow();
    expect(() => productUpdateSchema.parse({
      version: 1,
      name: "Product",
      slug: "changed-slug",
    })).toThrow();
  });

  it("accepts registered module content and media references", () => {
    const parsed = productSectionBatchSchema.parse({
      version: 2,
      sections: [
        {
          type: "HERO",
          position: 0,
          visible: true,
          content: validProductModuleData.HERO,
          mediaAssetIds: ["media-1", "media-2"],
        },
        {
          type: "OVERVIEW",
          position: 1,
          visible: false,
          content: validProductModuleData.OVERVIEW,
          mediaAssetIds: [],
        },
      ],
    });

    expect(parsed.sections).toHaveLength(2);
    expect(parsed.sections[0]).toMatchObject({ type: "HERO", position: 0, visible: true });
  });

  it("allows repeated module types but rejects duplicate ordering, invalid modules, and oversized batches", () => {
    const hero = {
      type: "HERO" as const,
      position: 0,
      visible: true,
      content: validProductModuleData.HERO,
      mediaAssetIds: [],
    };

    expect(productSectionBatchSchema.parse({
      version: 1,
      sections: [hero, { ...hero, position: 1 }],
    }).sections).toHaveLength(2);
    expect(() => productSectionBatchSchema.parse({
      version: 1,
      sections: [hero, {
        type: "OVERVIEW",
        position: 0,
        visible: true,
        content: validProductModuleData.OVERVIEW,
        mediaAssetIds: [],
      }],
    })).toThrow(/position/i);
    expect(() => productSectionBatchSchema.parse({
      version: 1,
      sections: [{ ...hero, content: { title: "Incomplete" } }],
    })).toThrow();
    expect(() => productSectionBatchSchema.parse({
      version: 1,
      sections: Array.from({ length: 101 }, (_, position) => ({
        ...hero,
        position,
        type: position === 0 ? "HERO" : "OVERVIEW",
      })),
    })).toThrow();
  });

  it("bounds and validates product list filters", () => {
    expect(productListQuerySchema.parse({
      page: "2",
      pageSize: "25",
      query: "  shear  ",
      status: "PUBLISHED",
      categoryId: "category-1",
    })).toEqual({
      page: 2,
      pageSize: 25,
      query: "shear",
      status: "PUBLISHED",
      categoryId: "category-1",
    });

    expect(() => productListQuerySchema.parse({ page: "0" })).toThrow();
    expect(() => productListQuerySchema.parse({ pageSize: "101" })).toThrow();
    expect(() => productListQuerySchema.parse({ status: "DELETED" })).toThrow();
    expect(() => productListQuerySchema.parse({ unexpected: "value" })).toThrow();
  });
});
