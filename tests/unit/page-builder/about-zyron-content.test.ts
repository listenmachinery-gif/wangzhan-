import { describe, expect, it } from "vitest";

import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";
import { PAGE_COMPONENT_TYPES, pageDocumentSchema } from "@/lib/page-builder/schema";
import { getComponentDefinition } from "@/lib/page-builder/registry";

describe("About ZYRON CMS document", () => {
  it("registers the eight high-fidelity About modules", () => {
    expect(PAGE_COMPONENT_TYPES).toEqual(expect.arrayContaining([
      "ABOUT_HERO",
      "ABOUT_COMPANY_OVERVIEW",
      "ABOUT_MANUFACTURING",
      "ABOUT_NUMBERS",
      "ABOUT_QUALITY",
      "ABOUT_ENGINEERING",
      "ABOUT_GLOBAL_DELIVERY",
      "ABOUT_QUOTE",
    ]));
    for (const type of aboutZyronDocument.nodes.map((node) => node.type)) {
      expect(getComponentDefinition(type)).toBeDefined();
    }
  });

  it("provides a valid, ordered document with durable media paths", () => {
    expect(() => pageDocumentSchema.parse(aboutZyronDocument)).not.toThrow();
    expect(aboutZyronDocument.nodes.map((node) => node.type)).toEqual([
      "ABOUT_HERO",
      "ABOUT_COMPANY_OVERVIEW",
      "ABOUT_MANUFACTURING",
      "ABOUT_NUMBERS",
      "ABOUT_QUALITY",
      "ABOUT_ENGINEERING",
      "ABOUT_GLOBAL_DELIVERY",
      "ABOUT_QUOTE",
    ]);
    expect(new Set(aboutZyronDocument.nodes.map((node) => node.id)).size).toBe(
      aboutZyronDocument.nodes.length,
    );
    expect(JSON.stringify(aboutZyronDocument)).toContain(
      "/images/about/zyron-factory-exterior.webp",
    );
  });

  it("uses the approved hero copy and avoids unsupported business claims", () => {
    const content = JSON.stringify(aboutZyronDocument);
    expect(content).toContain("Engineered for Precision.");
    expect(content).toContain("Built for the Future.");
    expect(content).toContain("Precision Machinery, Built for Modern Manufacturing.");
    expect(content).not.toMatch(
      /world[- ]leading|number one|fortune 500|ISO\s*9001|CE certified|SGS|\b\d{2,}\+\s*(years|countries|customers)|3,?500\s*m|500\s*machines/i,
    );
  });

  it("keeps every content image editable with descriptive alt text", () => {
    const content = JSON.stringify(aboutZyronDocument);
    expect(content).toContain('"imageAlt"');
    expect(content).toContain('"alt"');
    expect(content).not.toContain("harsle");
  });
});
