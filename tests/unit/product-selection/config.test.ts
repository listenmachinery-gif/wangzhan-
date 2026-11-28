import { describe, expect, it } from "vitest";

import {
  applyProductSelection,
  buildProductSelectionIndex,
  DEFAULT_PRODUCT_SELECTION_CONTENT,
  parseSpecificationNumber,
  productSelectionContentSchema,
  type ProductSelectionItem,
} from "@/lib/product-selection/config";

const items: ProductSelectionItem[] = [
  {
    id: "swing",
    slug: "hydraulic-swing-beam-shearing-machine",
    name: "Hydraulic Swing Beam Shearing Machine",
    summary: "Reliable hydraulic sheet cutting.",
    categoryId: "cat-shear",
    categorySlug: "shearing-machines",
    categoryName: "Shearing Machines",
    image: "/swing.webp",
    imageAlt: "Hydraulic swing beam shearing machine",
    position: 1,
    publishedAt: "2026-11-01T00:00:00.000Z",
    models: [
      { id: "m1", name: "QC12Y-6x3200", sku: "QC12Y63200", specifications: { "Cutting Thickness": [{ value: "6", unit: "mm" }], "Cutting Length": [{ value: "3200", unit: "mm" }], Material: [{ value: "Mild Steel", unit: "" }] } },
      { id: "m2", name: "QC12Y-3x2500", sku: null, specifications: { "Cutting Thickness": [{ value: "3", unit: "mm" }], "Cutting Length": [{ value: "2500", unit: "mm" }], Material: [{ value: "Stainless Steel", unit: "" }] } },
    ],
  },
  {
    id: "brake",
    slug: "cnc-press-brake",
    name: "CNC Press Brake",
    summary: "CNC bending solution.",
    categoryId: "cat-brake",
    categorySlug: "bending-machines",
    categoryName: "Bending / Press Brakes",
    image: "/brake.webp",
    imageAlt: "CNC press brake",
    position: 2,
    publishedAt: "2026-10-01T00:00:00.000Z",
    models: [],
  },
];

describe("product selection configuration", () => {
  it("accepts its default managed-page content", () => {
    expect(productSelectionContentSchema.safeParse(DEFAULT_PRODUCT_SELECTION_CONTENT).success).toBe(true);
  });

  it("normalizes common numeric specification formats without treating missing values as zero", () => {
    expect(parseSpecificationNumber("3,200 mm")).toBe(3200);
    expect(parseSpecificationNumber("6–12 mm")).toBe(6);
    expect(parseSpecificationNumber("")).toBeNull();
    expect(parseSpecificationNumber("By Model")).toBeNull();
  });

  it("requires one concrete model to satisfy every selected technical condition", () => {
    const filters = [
      { ...DEFAULT_PRODUCT_SELECTION_CONTENT.filters[0], id: "material", label: "Material", sourceFields: ["Material"], dataType: "TEXT" as const, control: "MULTI_SELECT" as const },
      { ...DEFAULT_PRODUCT_SELECTION_CONTENT.filters[0], id: "thickness", label: "Working Thickness", sourceFields: ["Cutting Thickness"], dataType: "NUMBER" as const, control: "NUMBER_MIN" as const },
      { ...DEFAULT_PRODUCT_SELECTION_CONTENT.filters[0], id: "length", label: "Working Length", sourceFields: ["Cutting Length"], dataType: "NUMBER" as const, control: "NUMBER_MIN" as const },
    ];
    const content = { ...DEFAULT_PRODUCT_SELECTION_CONTENT, filters };

    expect(applyProductSelection(items, content, { query: "", category: "", filters: { material: ["Stainless Steel"], thickness: ["3"], length: ["3000"] }, sort: "RECOMMENDED", page: 1 }).items).toEqual([]);
    expect(applyProductSelection(items, content, { query: "", category: "", filters: { material: ["Mild Steel"], thickness: ["3"], length: ["3000"] }, sort: "RECOMMENDED", page: 1 }).items.map((item) => item.id)).toEqual(["swing"]);
  });

  it("uses aliases, model names, categories and multiple search tokens", () => {
    const content = { ...DEFAULT_PRODUCT_SELECTION_CONTENT, search: { ...DEFAULT_PRODUCT_SELECTION_CONTENT.search, synonyms: [{ term: "hydraulic shear", aliases: ["guillotine shear", "sheet metal cutter"] }] } };
    expect(applyProductSelection(items, content, { query: "sheet metal cutter", category: "", filters: {}, sort: "RECOMMENDED", page: 1 }).items[0]?.id).toBe("swing");
    expect(applyProductSelection(items, content, { query: "qc12y 3200", category: "", filters: {}, sort: "RECOMMENDED", page: 1 }).items[0]?.id).toBe("swing");
    expect(applyProductSelection(items, content, { query: "bending press", category: "", filters: {}, sort: "RECOMMENDED", page: 1 }).items[0]?.id).toBe("brake");
  });

  it("sorts and paginates without inventing missing capacity", () => {
    const content = { ...DEFAULT_PRODUCT_SELECTION_CONTENT, display: { ...DEFAULT_PRODUCT_SELECTION_CONTENT.display, perPage: 1 } };
    const result = applyProductSelection(items, content, { query: "", category: "", filters: {}, sort: "NAME_ZA", page: 2 });
    expect(result.total).toBe(2);
    expect(result.items.map((item) => item.id)).toEqual(["swing", "brake"]);
    expect(result.hasMore).toBe(false);
  });

  it("builds the public selection index from published category data and real model values", () => {
    const result = buildProductSelectionIndex([{
      id: "cat-shear", slug: "shearing-machines", name: "Shearing Machines", products: [{
        id: "db-product", slug: "electric-shearing-machine", name: "Electric Shearing Machine", summary: "Compact electric shear", position: 1, publishedAt: new Date("2026-11-10"), models: [{ id: "db-model", name: "Q11-3x2500", sku: null, values: [{ value: "3", field: { name: "Cutting Thickness", unit: "mm" } }] }],
      }],
    }], [{ id: "electric-shearing-machine", categoryId: "shearing-machines", image: "/electric.webp" }]);
    expect(result[0]).toMatchObject({ id: "db-product", image: "/electric.webp", models: [{ name: "Q11-3x2500", specifications: { "Cutting Thickness": [{ value: "3", unit: "mm" }] } }] });
  });
});
