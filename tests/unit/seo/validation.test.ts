import { describe, expect, it } from "vitest";

import { seoCreateSchema, seoUpdateSchema } from "@/lib/validation/seo";

const valid = {
  pathname: "/products/example-machine",
  productId: "product-1",
  title: "Example Machine | ZYRON",
  description: "Industrial example machine configured for global fabrication buyers.",
  canonicalUrl: "https://www.zyroncnc.com/products/example-machine",
  openGraphTitle: "Example Machine",
  openGraphDescription: "Industrial machine from ZYRON.",
  openGraphMediaId: "media-1",
  robotsIndex: true,
  targetKeyword: "example machine",
};

describe("SEO validation", () => {
  it("normalizes a valid exact public path and robots setting", () => {
    expect(seoCreateSchema.parse({ ...valid, title: "  Example Machine | ZYRON  " })).toMatchObject({
      pathname: "/products/example-machine",
      title: "Example Machine | ZYRON",
      robotsIndex: true,
    });
  });

  it("rejects protected, ambiguous, and slug-changing paths", () => {
    for (const pathname of ["admin", "/admin/users", "/api/inquiry", "/products//machine", "/products/machine?draft=1", "/products/machine/"]) {
      expect(() => seoCreateSchema.parse({ ...valid, pathname })).toThrow();
    }
    expect(() => seoUpdateSchema.parse({ ...valid, version: 1, pathname: "/products/changed" })).toThrow();
  });

  it("rejects invalid/off-site canonical URLs and excessive metadata", () => {
    expect(() => seoCreateSchema.parse({ ...valid, canonicalUrl: "javascript:alert(1)" })).toThrow();
    expect(() => seoCreateSchema.parse({ ...valid, canonicalUrl: "https://attacker.example/products/example-machine" })).toThrow();
    expect(() => seoCreateSchema.parse({ ...valid, canonicalUrl: "https://user:pass@www.zyroncnc.com:444/products/example-machine" })).toThrow();
    expect(() => seoCreateSchema.parse({ ...valid, title: "x".repeat(71) })).toThrow();
    expect(() => seoCreateSchema.parse({ ...valid, description: "x".repeat(321) })).toThrow();
    expect(() => seoCreateSchema.parse({ ...valid, openGraphTitle: "x".repeat(71) })).toThrow();
  });

  it("requires title and description while allowing noindex records", () => {
    expect(() => seoCreateSchema.parse({ ...valid, title: "" })).toThrow();
    expect(() => seoCreateSchema.parse({ ...valid, description: "" })).toThrow();
    expect(seoCreateSchema.parse({ ...valid, robotsIndex: false }).robotsIndex).toBe(false);
  });
});
