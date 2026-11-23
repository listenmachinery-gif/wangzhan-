import { describe, expect, it } from "vitest";

import { isPageTransactionConflict, publicPathsForPageSlug } from "@/lib/services/page-service";

describe("page service transaction errors", () => {
  it("recognizes Prisma serializable transaction conflicts", () => {
    expect(isPageTransactionConflict({ code: "P2034" })).toBe(true);
    expect(isPageTransactionConflict({ code: "P2002" })).toBe(false);
    expect(isPageTransactionConflict(new Error("P2034"))).toBe(false);
  });

  it("maps managed product and series slugs to their real public routes", () => {
    expect(publicPathsForPageSlug("home")).toEqual(["/"]);
    expect(publicPathsForPageSlug("products")).toEqual(["/products"]);
    expect(publicPathsForPageSlug("product-compact-electric-shearing-machine")).toEqual([
      "/products/compact-electric-shearing-machine",
      "/products",
    ]);
    expect(publicPathsForPageSlug("series-shearing-machines")).toEqual([
      "/products/series/shearing-machines",
      "/products",
    ]);
    expect(publicPathsForPageSlug("factory")).toEqual(["/factory"]);
    expect(publicPathsForPageSlug("support")).toEqual(["/support"]);
    expect(publicPathsForPageSlug("showcase")).toEqual(["/showcase"]);
    expect(publicPathsForPageSlug("contact")).toEqual(["/contact"]);
  });
});
