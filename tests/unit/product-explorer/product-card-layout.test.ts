import { describe, expect, it } from "vitest";

import { resolveProductExplorerCardLayout } from "@/lib/product-explorer/config";

const products = [
  { id: "product-a", name: "Machine A" },
  { id: "product-b", name: "Machine B" },
  { id: "product-c", name: "Machine C" },
];

describe("product explorer card layout", () => {
  it("applies saved order and automatically appends newly published products", () => {
    const result = resolveProductExplorerCardLayout("bending", products, [{
      categoryKey: "bending",
      orderedProductIds: ["product-b", "product-a"],
      hiddenProductIds: [],
    }]);

    expect(result.map((product) => product.id)).toEqual(["product-b", "product-a", "product-c"]);
  });

  it("keeps hidden products out even when they remain in saved order", () => {
    const result = resolveProductExplorerCardLayout("bending", products, [{
      categoryKey: "bending",
      orderedProductIds: ["product-b", "product-a", "product-c"],
      hiddenProductIds: ["product-b"],
    }]);

    expect(result.map((product) => product.id)).toEqual(["product-a", "product-c"]);
  });

  it("ignores stale and duplicate saved ids without duplicating valid cards", () => {
    const result = resolveProductExplorerCardLayout("bending", products, [{
      categoryKey: "bending",
      orderedProductIds: ["missing", "product-b", "product-b", "product-a"],
      hiddenProductIds: ["missing-hidden"],
    }]);

    expect(result.map((product) => product.id)).toEqual(["product-b", "product-a", "product-c"]);
  });

  it("keeps database order when the category has no layout", () => {
    expect(resolveProductExplorerCardLayout("shearing", products, []).map((product) => product.id)).toEqual([
      "product-a",
      "product-b",
      "product-c",
    ]);
  });
});
