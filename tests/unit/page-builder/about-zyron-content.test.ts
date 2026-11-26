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

  it("uses the approved hero copy and the requested About numbers content", () => {
    const content = JSON.stringify(aboutZyronDocument);
    expect(content).toContain("Engineered for Precision.");
    expect(content).toContain("Built for the Future.");
    expect(content).toContain("Precision Machinery, Built for Modern Manufacturing.");
    expect(content).toContain("Built on Experience.\\nDriven by Excellence.");
    expect(content).toContain('"value":"15+","label":"Years of Experience"');
    expect(content).toContain('"value":"100+","label":"Countries Served"');
    expect(content).toContain('"value":"3,500 m²","label":"Manufacturing Area"');
    expect(content).toContain('"value":"500","label":"Machines per Year"');
    expect(content).not.toMatch(/world[- ]leading|number one|fortune 500|ISO\s*9001|CE certified|SGS/i);
  });

  it("pins the requested line breaks and exposes a replaceable global map image", () => {
    const hero = aboutZyronDocument.nodes.find((node) => node.type === "ABOUT_HERO")!;
    const overview = aboutZyronDocument.nodes.find((node) => node.type === "ABOUT_COMPANY_OVERVIEW")!;
    const global = aboutZyronDocument.nodes.find((node) => node.type === "ABOUT_GLOBAL_DELIVERY")!;

    expect((hero.content as { values: Array<{ title: string }> }).values.map((item) => item.title)).toEqual([
      "Reliable\nMachines",
      "Professional\nSolutions",
      "Long-Term\nSupport",
    ]);
    expect((overview.content as { values: Array<{ title: string }> }).values.map((item) => item.title)).toEqual([
      "Comprehensive\nProduct\nRange",
      "Reliable\nManufacturing\nQuality",
      "Dedicated\nTechnical\nSupport",
    ]);
    expect(global.content).toMatchObject({
      mapImage: expect.stringMatching(/^\//),
      mapImageAlt: expect.any(String),
      mapImageFocus: expect.any(String),
    });
  });

  it("keeps the previously published global delivery document renderable during deployment", () => {
    const definition = getComponentDefinition("ABOUT_GLOBAL_DELIVERY")!;
    const current = aboutZyronDocument.nodes.find((node) => node.type === "ABOUT_GLOBAL_DELIVERY")!.content as Record<string, unknown>;
    const legacy: Record<string, unknown> = { ...current, mapAriaLabel: "Global support map" };
    delete legacy.mapImage;
    delete legacy.mapImageAlt;
    delete legacy.mapImageFocus;

    const parsed = definition.contentSchema.safeParse(legacy);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        mapImage: "/images/about/zyron-global-delivery-map.png",
        mapImageFocus: "center",
      });
    }
  });

  it("keeps every content image editable with descriptive alt text", () => {
    const content = JSON.stringify(aboutZyronDocument);
    expect(content).toContain('"imageAlt"');
    expect(content).toContain('"alt"');
    expect(content).not.toContain("harsle");
  });
});
