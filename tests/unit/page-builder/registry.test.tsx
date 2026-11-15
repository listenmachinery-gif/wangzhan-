// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { componentRegistry, getComponentDefinition } from "@/lib/page-builder/registry";
import type { PageDocument, PageNode } from "@/lib/page-builder/schema";

describe("page builder component registry", () => {
  it("registers at least 25 components whose defaults are editable and schema-valid", () => {
    expect(componentRegistry.length).toBeGreaterThanOrEqual(25);

    for (const definition of componentRegistry) {
      expect(definition.label.length).toBeGreaterThan(0);
      expect(definition.editorFields.length).toBeGreaterThan(0);
      expect(definition.contentSchema.safeParse(definition.defaultContent).success).toBe(true);
      expect(getComponentDefinition(definition.type)).toBe(definition);
    }
  });

  it("server-renders every registered component from its validated default content", () => {
    const document: PageDocument = {
      schemaVersion: 1,
      nodes: componentRegistry.map((definition, index) => ({
        id: `component-${index}`,
        type: definition.type,
        content: definition.defaultContent,
      } as PageNode)),
    };

    const { container } = render(<PageRenderer document={document} />);

    expect(container.querySelectorAll("[data-page-component]")).toHaveLength(componentRegistry.length);
    expect(screen.getByText("Build better production lines.")).toBeInTheDocument();
    expect(screen.getByText("Why choose ZYRON")).toBeInTheDocument();
  });

  it("drops unknown or invalid nodes instead of rendering their content", () => {
    const invalidDocument = {
      schemaVersion: 1,
      nodes: [{ id: "unsafe", type: "SCRIPT", content: { text: "execute me" } }],
    } as unknown as PageDocument;

    const { container } = render(<PageRenderer document={invalidDocument} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("execute me")).not.toBeInTheDocument();
  });
});
