import { describe, expect, it } from "vitest";

import { readLegacyCatalogue } from "@/lib/migration/legacy-product-reader";

describe("legacy product reader", () => {
  it("attaches aliased specialized page content to the current immutable slug", async () => {
    const catalogue = await readLegacyCatalogue({ includePageContent: true });
    const footShear = catalogue.products.find((product) => product.id === "foot-shear");

    expect(footShear?.page).toMatchObject({
      title: "Foot Operated Shearing Machine",
      overview: { title: "Product Overview" },
    });
    expect(catalogue.products.filter((product) => product.page)).toHaveLength(21);
  });
});
