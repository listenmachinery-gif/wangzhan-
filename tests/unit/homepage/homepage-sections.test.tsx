// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { homepageRedesignDocument } from "@/lib/page-builder/default-homepage";

afterEach(cleanup);

describe("homepage redesign sections", () => {
  it("renders the six modules with semantic content and uncropped supplied media", () => {
    render(<PageRenderer document={homepageRedesignDocument} />);

    expect(screen.getByRole("heading", { level: 1, name: "Precision in Every Bend." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Precision Engineering. Lasting Performance." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Solutions Built Around Precision." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Built for Precision. Focused on Your Production." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Insights That Move Production Forward." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Your Next Production Solution Starts Here." })).toBeInTheDocument();

    expect(screen.getByAltText("ZYRON Heavy Industry factory exterior")).toHaveClass("object-contain");
    expect(screen.getByAltText("ZYRON precision engineering and industrial technology")).toHaveClass("object-contain");
    expect(screen.getByText("3,500")).toBeInTheDocument();
  });

  it("does not expose draft or linkless insight entries as published article links", () => {
    render(<PageRenderer document={homepageRedesignDocument} />);

    expect(screen.queryByRole("link", { name: /What Defines a High-Precision Press Brake/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /How to Choose the Right Shearing Machine/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View All Insights →" })).toHaveAttribute("href", "/news");
    expect(screen.getByText("New verified insights are being prepared.")).toBeInTheDocument();
  });
});
