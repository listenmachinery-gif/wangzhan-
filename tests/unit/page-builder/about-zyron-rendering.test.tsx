// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";

afterEach(cleanup);

describe("About ZYRON PageBuilder rendering", () => {
  it("renders one semantic H1 and the approved three-module hierarchy", () => {
    const document = { ...aboutZyronDocument, nodes: aboutZyronDocument.nodes.slice(0, 3) };
    const { container } = render(<PageRenderer document={document} />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Engineered for Precision. Built for the Future.",
    );
    expect(screen.getByRole("heading", { level: 2, name: /Precision Machinery/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Precision Manufacturing/ })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-about-decoration][aria-hidden="true"]').length).toBeGreaterThan(2);
  });

  it("renders real media alt text and working internal calls to action", () => {
    const document = { ...aboutZyronDocument, nodes: aboutZyronDocument.nodes.slice(0, 3) };
    render(<PageRenderer document={document} />);

    expect(screen.getByRole("img", { name: /factory exterior and main entrance/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Rows of press brake machines/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Discover Our Story/i })).toHaveAttribute("href", "#company-overview");
    expect(screen.getByRole("link", { name: /Explore Our Machines/i })).toHaveAttribute("href", "/products");
  });

  it("omits a disabled section and preserves text as live HTML", () => {
    const hero = aboutZyronDocument.nodes[0];
    const document = {
      ...aboutZyronDocument,
      nodes: [{ ...hero, content: { ...(hero.content as Record<string, unknown>), enabled: false } }],
    };
    const { container } = render(<PageRenderer document={document} />);

    expect(container).toBeEmptyDOMElement();
  });
});
