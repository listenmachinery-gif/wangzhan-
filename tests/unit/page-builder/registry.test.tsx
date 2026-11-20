// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageRenderer } from "@/components/page-builder/PageRenderer";
import {
  componentRegistry,
  getComponentDefinition,
} from "@/lib/page-builder/registry";
import type { PageDocument, PageNode } from "@/lib/page-builder/schema";

describe("page builder component registry", () => {
  it("registers at least 25 components whose defaults are editable and schema-valid", () => {
    expect(componentRegistry.length).toBeGreaterThanOrEqual(25);

    for (const definition of componentRegistry) {
      expect(definition.label.length).toBeGreaterThan(0);
      expect(definition.editorFields.length).toBeGreaterThan(0);
      expect(
        definition.contentSchema.safeParse(definition.defaultContent).success,
      ).toBe(true);
      expect(getComponentDefinition(definition.type)).toBe(definition);
    }
  });

  it("does not publish unverified company metrics or certifications as component defaults", () => {
    const factory = getComponentDefinition("FACTORY_STATS")!;
    const certificates = getComponentDefinition("CERTIFICATES")!;
    const serializedDefaults = JSON.stringify({
      factory: factory.defaultContent,
      certificates: certificates.defaultContent,
    });

    expect(serializedDefaults).not.toMatch(/15\+|60\+|200\+|10,000m²\+/);
    expect(serializedDefaults).not.toMatch(/CE Machinery Directive|ISO 9001/);
    expect(serializedDefaults).toContain("Machine specification confirmation");
  });

  it("server-renders every registered component from its validated default content", () => {
    const document: PageDocument = {
      schemaVersion: 1,
      nodes: componentRegistry.map(
        (definition, index) =>
          ({
            id: `component-${index}`,
            type: definition.type,
            content: definition.defaultContent,
          }) as PageNode,
      ),
    };

    const { container } = render(<PageRenderer document={document} />);

    expect(container.querySelectorAll("[data-page-component]")).toHaveLength(
      componentRegistry.length,
    );
    expect(
      screen.getByText("Build better production lines."),
    ).toBeInTheDocument();
    expect(screen.getByText("Why choose ZYRON")).toBeInTheDocument();
  });

  it("drops unknown or invalid nodes instead of rendering their content", () => {
    const invalidDocument = {
      schemaVersion: 1,
      nodes: [
        { id: "unsafe", type: "SCRIPT", content: { text: "execute me" } },
      ],
    } as unknown as PageDocument;

    const { container } = render(<PageRenderer document={invalidDocument} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("execute me")).not.toBeInTheDocument();
  });

  it("emits scoped tablet and mobile styles for published nodes", () => {
    const document: PageDocument = {
      schemaVersion: 1,
      nodes: [
        {
          id: "responsive-heading",
          type: "HEADING",
          content: { text: "Responsive heading", level: 2 },
          style: { fontSize: 48, paddingY: 40 },
          responsive: {
            tablet: { fontSize: 36 },
            mobile: { fontSize: 24, paddingY: 16, visible: false },
          },
        },
      ],
    };

    const { container } = render(<PageRenderer document={document} />);
    const stylesheet = container.querySelector("style")?.textContent ?? "";

    expect(stylesheet).toContain('[data-page-node="responsive-heading"]');
    expect(stylesheet).toContain("@media (min-width: 640px) and (max-width: 1023px)");
    expect(stylesheet).toContain("font-size:36px");
    expect(stylesheet).toContain("@media (max-width: 639px)");
    expect(stylesheet).toContain("font-size:24px");
    expect(stylesheet).toContain("display:none");
  });

  it("scopes independent title and body typography to the selected text field", () => {
    const hero = getComponentDefinition("HERO")!;
    const document: PageDocument = {
      schemaVersion: 1,
      nodes: [{
        id: "styled-hero",
        type: "HERO",
        content: hero.defaultContent as PageNode["content"],
        textStyles: {
          title: { color: "#76B900", fontSize: 64, fontWeight: "bold" },
          description: { color: "#FFFFFF", fontSize: 18, lineHeight: 1.7 },
        },
      }],
    };

    const { container } = render(<PageRenderer document={document} />);
    const stylesheet = container.querySelector("style")?.textContent ?? "";
    expect(container.querySelector('[data-page-text="title"]')).toBeInTheDocument();
    expect(container.querySelector('[data-page-text="description"]')).toBeInTheDocument();
    expect(stylesheet).toContain('[data-page-node="styled-hero"] [data-page-text="title"]');
    expect(stylesheet).toContain("font-size:64px!important");
  });

  it("rejects protocol-relative and remote image sources", () => {
    const image = getComponentDefinition("IMAGE")!;
    const factory = getComponentDefinition("FACTORY_STATS")!;

    expect(image.contentSchema.safeParse({ src: "//cdn.example.com/a.jpg", alt: "A", caption: "" }).success).toBe(false);
    expect(image.contentSchema.safeParse({ src: "https://cdn.example.com/a.jpg", alt: "A", caption: "" }).success).toBe(false);
    expect(factory.contentSchema.safeParse({ ...factory.defaultContent, image: "//cdn.example.com/a.jpg" }).success).toBe(false);
    expect(image.contentSchema.safeParse({ src: "/api/media/image-1", alt: "A", caption: "" }).success).toBe(true);
  });
});
