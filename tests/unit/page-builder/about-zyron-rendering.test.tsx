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

  it("renders all eight About modules as semantic live content", () => {
    const { container } = render(<PageRenderer document={aboutZyronDocument} />);

    expect(container.querySelectorAll("[data-company-section]")).toHaveLength(8);
    expect(container.querySelector('[data-company-layout="gallery-left-copy-right"]')).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Built on Experience[\s\S]*Driven by Excellence/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Practical Checks for Reliable Performance/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Engineered for Precision/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Built in China/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Your Next Step/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /Request a Quote/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Inquiry/i })).toBeInTheDocument();
  });

  it("binds About scalar text fields to independently scoped typography styles", () => {
    const hero = aboutZyronDocument.nodes[0];
    const document = {
      ...aboutZyronDocument,
      nodes: [{
        ...hero,
        textStyles: {
          titleLineOne: { color: "#ff0000", fontSize: 52 },
          titleLineTwo: { color: "#00ff00", fontSize: 40 },
          ctaLabel: { fontSize: 19 },
        },
      }],
    };
    const { container } = render(<PageRenderer document={document} />);
    const stylesheet = container.querySelector("style")?.textContent ?? "";

    expect(container.querySelector('[data-page-text="titleLineOne"]')).toHaveTextContent("Engineered for Precision.");
    expect(container.querySelector('[data-page-text="titleLineTwo"]')).toHaveTextContent("Built for the Future.");
    expect(container.querySelector('[data-page-text="ctaLabel"]')).toHaveTextContent("Discover Our Story");
    expect(stylesheet).toContain('[data-page-node="about-hero"] [data-page-text="titleLineOne"]');
    expect(stylesheet).toContain("font-size:52px!important");
    expect(container.querySelector('[data-page-node="about-hero"]')).toHaveClass("whitespace-pre-line");
  });

  it("renders the global support visual as CMS media with descriptive alt text", () => {
    render(<PageRenderer document={aboutZyronDocument} />);
    expect(screen.getByRole("img", { name: /global machinery project support/i })).toBeInTheDocument();
  });

  it("bypasses Next image optimization for a media-library map redirect", () => {
    const global = aboutZyronDocument.nodes[6];
    const document = {
      ...aboutZyronDocument,
      nodes: [{
        ...global,
        content: {
          ...(global.content as Record<string, unknown>),
          mapImage: "/api/media/global-map",
          mapImageAlt: "Replacement global map",
        },
      }],
    };
    render(<PageRenderer document={document} />);
    expect(screen.getByRole("img", { name: "Replacement global map" })).toHaveAttribute("src", "/api/media/global-map");
  });

  it("keeps the real inquiry fields and descriptive media alternatives", () => {
    render(<PageRenderer document={aboutZyronDocument} />);

    expect(screen.getByLabelText(/Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Email/i)).toBeRequired();
    expect(screen.getAllByRole("img", { name: /factory exterior/i })).toHaveLength(1);
    expect(screen.getByRole("img", { name: /sheet metal machinery inside a manufacturing workshop/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /workshop inspection/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore All Machines/i })).toHaveAttribute("href", "/products");
  });

  it("omits a disabled section and preserves text as live HTML", () => {
    const hero = aboutZyronDocument.nodes[0];
    const document = {
      ...aboutZyronDocument,
      nodes: [{ ...hero, content: { ...(hero.content as Record<string, unknown>), enabled: false } }],
    };
    const { container } = render(<PageRenderer document={document} />);

    expect(container.querySelector("[data-page-component]")).not.toBeInTheDocument();
  });
});
