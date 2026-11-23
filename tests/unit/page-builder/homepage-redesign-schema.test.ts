import { describe, expect, it } from "vitest";

import {
  defaultHomepageDocument,
  homepageRedesignDocument,
} from "@/lib/page-builder/default-homepage";
import { getComponentDefinition } from "@/lib/page-builder/registry";
import { pageDocumentSchema } from "@/lib/page-builder/schema";

const expectedTypes = [
  "HOME_HERO",
  "HOME_ABOUT",
  "HOME_PRODUCT_SHOWCASE",
  "HOME_WHY_CHOOSE",
  "HOME_NEWS_INSIGHTS",
  "HOME_CONTACT_CTA",
] as const;

const expectedProductRoutes = [
  "/products/series/shearing-machines",
  "/products/series/bending-machines",
  "/products/series/laser-cutting-machines",
  "/products/series/plate-rolling-machines",
  "/products/series/press-machines",
  "/products/series/rectangular-duct-production",
  "/products/series/round-duct-production",
  "/products/series/shredders",
];

const expectedProductImages = [
  "/images/products/shearing-machine.webp",
  "/images/products/press-brake.webp",
  "/images/products/laser-cutting-machine.webp",
  "/images/products/plate-rolling-machine.webp",
  "/images/products/hydraulic-press.webp",
  "/images/products/rectangular-duct-machine.webp",
  "/images/products/round-duct-machine.webp",
  "/images/products/shredding-machine.webp",
];

describe("homepage redesign content contract", () => {
  it("validates six ordered editable homepage modules", () => {
    expect(pageDocumentSchema.safeParse(homepageRedesignDocument).success).toBe(true);
    expect(homepageRedesignDocument.nodes.map((node) => node.type)).toEqual(expectedTypes);

    for (const node of homepageRedesignDocument.nodes) {
      const definition = getComponentDefinition(node.type);
      expect(definition, `${node.type} must be registered`).toBeDefined();
      expect(definition?.contentSchema.safeParse(node.content).success).toBe(true);
    }
  });

  it("keeps the supplied hero and company media on durable site-relative paths", () => {
    const hero = homepageRedesignDocument.nodes[0].content as Record<string, unknown>;
    const about = homepageRedesignDocument.nodes[1].content as Record<string, unknown>;
    const why = homepageRedesignDocument.nodes[3].content as Record<string, unknown>;

    expect(hero).toMatchObject({
      title: "Precision in Every Bend.",
      image: "/images/products/press-brake.webp",
    });
    expect(about).toMatchObject({
      title: "Precision Engineering. Lasting Performance.",
      image: "/images/about/zyron-factory-exterior.webp",
    });
    expect(why.image).toBe("/images/about/zyron-why-choose-us.webp");
  });

  it("defines the eight product categories with exact routes and supplied images", () => {
    const products = homepageRedesignDocument.nodes[2].content as {
      items: Array<Record<string, unknown>>;
    };

    expect(products.items).toHaveLength(8);
    expect(products.items.map((item) => item.href)).toEqual(expectedProductRoutes);
    expect(products.items.map((item) => item.image)).toEqual(expectedProductImages);
    expect(products.items[0]).toMatchObject({
      name: "SHEARING MACHINES",
      eyebrow: "PRECISION SHEET CUTTING",
      headline: "A Cleaner Cut. A Smarter Workflow.",
      buttonText: "Explore Shearing Machines",
    });
    expect(products.items[7]).toMatchObject({
      name: "SHREDDING MACHINES",
      headline: "Engineered for Demanding Reduction.",
    });
  });

  it("keeps unverified insight entries as non-clickable drafts", () => {
    const news = homepageRedesignDocument.nodes[4].content as {
      items: Array<Record<string, unknown>>;
    };

    expect(news.items).toHaveLength(3);
    expect(news.items.every((item) => item.status === "draft")).toBe(true);
    expect(news.items.every((item) => item.href === "")).toBe(true);
    expect(news.items.every((item) => !("date" in item))).toBe(true);
  });

  it("preserves the legacy managed homepage document unchanged", () => {
    expect(defaultHomepageDocument.nodes.map((node) => node.type)).toEqual([
      "FACTORY_STATS",
      "ADVANTAGES",
    ]);
    expect(pageDocumentSchema.safeParse(defaultHomepageDocument).success).toBe(true);
  });
});
