import { describe, expect, it } from "vitest";

import type { Product, ProductCategory } from "@/data/products";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import { buildMachinesMenuView } from "@/lib/navigation/machines-menu";

const categories: ProductCategory[] = [
  { id: "shearing-machines", name: "Shearing Series", navLabel: "Shearing", summary: "Shear summary", description: "Shear description", image: "/shear.jpg", heroImage: "/shear-hero.jpg", capability: "Cutting" },
  { id: "bending-machines", name: "Press Brake Series", navLabel: "Bending", summary: "Brake summary", description: "Brake description", image: "/brake.jpg", heroImage: "/brake-hero.jpg", capability: "Bending" },
];

const products: Product[] = [
  { id: "hidden-shear", name: "Hidden Shear", categoryId: "shearing-machines", categoryName: "Shearing", tagline: "Hidden", image: "/hidden.jpg", specs: [], highlights: [], applications: [], options: [] },
  { id: "visible-shear", name: "Visible Shear", categoryId: "shearing-machines", categoryName: "Shearing", tagline: "Visible", image: "/visible.jpg", specs: [], highlights: [], applications: [], options: [] },
  { id: "press-brake", name: "Press Brake", categoryId: "bending-machines", categoryName: "Bending", tagline: "Brake", image: "/brake-product.jpg", specs: [], highlights: [], applications: [], options: [] },
];

describe("Machines menu resolver", () => {
  it("merges display overrides with real routes and filters disabled product references", () => {
    const config = structuredClone(DEFAULT_NAVIGATION.machines!);
    config.mode = "MANUAL";
    config.categories = [
      { categoryId: "shearing-machines", displayName: "SHEARING MACHINES", description: "Configured", sortOrder: 2, enabled: true, isDefault: false, products: [
        { productId: "hidden-shear", sortOrder: 1, enabled: false },
        { productId: "visible-shear", displayNameOverride: "Precision Shear", shortDescriptionOverride: "Configured product", sortOrder: 0, enabled: true },
        { productId: "missing-product", sortOrder: 2, enabled: true },
      ] },
      { categoryId: "bending-machines", displayName: "PRESS BRAKES", sortOrder: 1, enabled: true, isDefault: true, products: [
        { productId: "press-brake", sortOrder: 0, enabled: true },
      ] },
    ];

    const view = buildMachinesMenuView(config, categories, products);

    expect(view.categories.map((item) => [item.id, item.href, item.count, item.isDefault])).toEqual([
      ["bending-machines", "/products/series/bending-machines", 1, true],
      ["shearing-machines", "/products/series/shearing-machines", 1, false],
    ]);
    expect(view.categories[1].products).toEqual([
      expect.objectContaining({ id: "visible-shear", name: "Precision Shear", description: "Configured product", href: "/products/visible-shear" }),
    ]);
  });

  it("auto-syncs real products and omits configured categories that are not in the published catalogue", () => {
    const config = structuredClone(DEFAULT_NAVIGATION.machines!);
    config.mode = "AUTO";
    const view = buildMachinesMenuView(config, categories, products);

    expect(view.categories.map((item) => item.id)).toEqual(["shearing-machines", "bending-machines"]);
    expect(view.categories[0].products.map((item) => item.id)).toEqual(["hidden-shear", "visible-shear"]);
  });
});
