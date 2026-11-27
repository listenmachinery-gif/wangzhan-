import { describe, expect, it } from "vitest";

import { resolveProductExplorerCard } from "@/lib/product-explorer/config";

const sourceProduct = {
  id: "db-product-1",
  slug: "servo-press-brake",
  name: "Servo Press Brake",
  summary: "Precision bending from the product record",
  image: "/products/catalog/servo-press-brake.webp",
};

describe("product explorer card overrides", () => {
  it("uses a matching display override without changing product identity or link", () => {
    const resolved = resolveProductExplorerCard(sourceProduct, [{
      productId: "db-product-1",
      title: "Custom\nPress Brake",
      summary: "Custom card summary",
      image: "/api/media/custom-card-image",
      imageAlt: "Custom press brake in ZYRON showroom",
    }]);

    expect(resolved).toEqual({
      id: "db-product-1",
      slug: "servo-press-brake",
      name: "Custom\nPress Brake",
      summary: "Custom card summary",
      image: "/api/media/custom-card-image",
      imageAlt: "Custom press brake in ZYRON showroom",
    });
  });

  it("inherits the current product record when no override exists", () => {
    expect(resolveProductExplorerCard(sourceProduct, [])).toEqual({
      ...sourceProduct,
      imageAlt: "Servo Press Brake",
    });
  });
});
