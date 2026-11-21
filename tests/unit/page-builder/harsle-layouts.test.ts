import { describe, expect, it } from "vitest";
import { HARSLE_LAYOUT_TEMPLATES } from "@/lib/page-builder/harsle-layout-templates";
import { pageDocumentSchema } from "@/lib/page-builder/schema";
import { getComponentDefinition } from "@/lib/page-builder/registry";

describe("HARSLE-inspired editable layout presets", () => {
  it("provides nine distinct non-destructive layout presets", () => {
    expect(Object.keys(HARSLE_LAYOUT_TEMPLATES)).toHaveLength(9);
    for (const [key, template] of Object.entries(HARSLE_LAYOUT_TEMPLATES)) {
      expect(template.label).toBeTruthy();
      const parsed = pageDocumentSchema.safeParse(template.document);
      expect(parsed.success, key).toBe(true);
      expect(template.document.nodes.length, key).toBeGreaterThan(2);
      expect(new Set(template.document.nodes.map((node) => node.id)).size).toBe(template.document.nodes.length);
    }
  });

  it("contains only editor-supported components with valid content", () => {
    for (const [key, template] of Object.entries(HARSLE_LAYOUT_TEMPLATES)) {
      for (const node of template.document.nodes) {
        const definition = getComponentDefinition(node.type);
        expect(definition, key + " " + node.type).toBeDefined();
        expect(definition?.contentSchema.safeParse(node.content).success, key + " " + node.id).toBe(true);
      }
    }
  });

  it("supports image and video media hero and mixed showcase", () => {
    const hero = getComponentDefinition("MEDIA_HERO");
    const gallery = getComponentDefinition("MEDIA_SHOWCASE");
    expect(hero?.contentSchema.safeParse(hero.defaultContent).success).toBe(true);
    expect(gallery?.contentSchema.safeParse(gallery.defaultContent).success).toBe(true);
    expect(hero?.editorFields.map((field) => field.key)).toContain("videoSrc");
    expect(gallery?.editorFields.map((field) => field.key)).toContain("items");
  });

  it("keeps previously published layout versions compatible", () => {
    const existing = { schemaVersion: 1, nodes: [{ id: "old-hero", type: "HERO", content: {
      eyebrow: "ZYRON", title: "Machines", description: "Production equipment",
      primaryLabel: "Browse", primaryHref: "/products", image: "/products/hydraulic-press-brake-hero.png", alt: "Machine",
    } }] };
    expect(pageDocumentSchema.safeParse(existing).success).toBe(true);
  });
});
