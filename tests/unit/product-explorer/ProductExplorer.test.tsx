// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductExplorer, type ProductExplorerViewCategory } from "@/components/products/ProductExplorer";
import { DEFAULT_PRODUCT_EXPLORER_CONTENT } from "@/lib/product-explorer/config";

const analytics = vi.hoisted(() => ({ trackAnalyticsEvent: vi.fn() }));
vi.mock("@/lib/analytics/client-events", () => analytics);

const categories: ProductExplorerViewCategory[] = DEFAULT_PRODUCT_EXPLORER_CONTENT.categories.map((slot) => ({
  ...slot,
  categoryName: `${slot.navLabel} Machines`,
  categoryHref: slot.seriesHref,
  products: slot.key === "bending"
    ? [{ id: "p-1", slug: "servo-press-brake", name: "Servo Press Brake", summary: "Precision bending", image: "/products/catalog/electro-hydraulic-servo-cnc-press-brake.png", imageAlt: "Custom servo press brake card image" }]
    : slot.key === "shearing"
      ? [{ id: "p-2", slug: "hydraulic-shear", name: "Hydraulic Shear", summary: "Clean cutting", image: "/products/catalog/hydraulic-guillotine-shear.png", imageAlt: "Hydraulic shear card image" }]
      : [],
}));

function renderedImagePath(image: HTMLImageElement | null) {
  const src = image?.getAttribute("src") ?? "";
  return new URL(src, "http://localhost").searchParams.get("url") ?? src;
}

describe("ProductExplorer", () => {
  beforeEach(() => {
    Element.prototype.scrollTo = vi.fn();
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the Bending hero, all eight tabs, and editable product card copy initially", () => {
    const { container } = render(<ProductExplorer content={DEFAULT_PRODUCT_EXPLORER_CONTENT} categories={categories} nodeId="products-explorer" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sheet Metal Fabrication");
    expect(screen.getAllByRole("tab")).toHaveLength(8);
    expect(screen.getByRole("tab", { name: /02 Bending/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("PRESS BRAKES")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Explore Press Brakes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Servo Press Brake/i })).toHaveAttribute("href", "/products/servo-press-brake");
    expect(container.querySelector("[data-product-summary]")).toHaveTextContent("Precision bending");
    expect(screen.getByRole("img", { name: "Custom servo press brake card image" })).toBeInTheDocument();
  });

  it("switches every dependent region together and resets the product scroller", () => {
    const { container } = render(<ProductExplorer content={DEFAULT_PRODUCT_EXPLORER_CONTENT} categories={categories} nodeId="products-explorer" />);
    const scroller = container.querySelector("[data-product-scroller]") as HTMLElement;

    fireEvent.click(screen.getByRole("tab", { name: /01 Shearing/i }));

    expect(screen.getByText("SHEARING MACHINES")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Explore Shearing Machines" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Hydraulic Shear/i })).toHaveAttribute("href", "/products/hydraulic-shear");
    expect(scroller.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: "auto" });
    expect(analytics.trackAnalyticsEvent).toHaveBeenCalledWith("product_category_select", {
      category_id: "shearing",
      category_name: "Shearing Machines",
    });
  });

  it("keeps the full-width background fixed while switching only the foreground machine", () => {
    const { container } = render(<ProductExplorer content={DEFAULT_PRODUCT_EXPLORER_CONTENT} categories={categories} nodeId="products-explorer" />);
    const background = container.querySelector<HTMLImageElement>("[data-explorer-background] img");
    const initialMachine = container.querySelector<HTMLImageElement>("[data-explorer-machine] img");

    expect(renderedImagePath(background)).toBe("/products/explorer/industrial-studio-background.webp");
    expect(renderedImagePath(initialMachine)).toBe("/products/explorer/press-brakes.webp");

    fireEvent.click(screen.getByRole("tab", { name: /01 Shearing/i }));

    expect(renderedImagePath(container.querySelector<HTMLImageElement>("[data-explorer-background] img"))).toBe(
      "/products/explorer/industrial-studio-background.webp",
    );
    expect(renderedImagePath(container.querySelector<HTMLImageElement>("[data-explorer-machine] img"))).toBe(
      "/products/explorer/shearing-machines.webp",
    );
  });

  it("keeps empty categories usable and exposes real category links", () => {
    render(<ProductExplorer content={DEFAULT_PRODUCT_EXPLORER_CONTENT} categories={categories} nodeId="products-explorer" />);
    fireEvent.click(screen.getByRole("tab", { name: /03 Laser Cutting/i }));

    expect(screen.getByText(/No published machines are available in this category yet/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /View Series/i })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /View Series/i })[0]).toHaveAttribute("href", "/products/series/laser-cutting-machines");
  });

  it("supports arrow-key tab navigation and independently targetable CMS text", () => {
    const { container } = render(<ProductExplorer content={DEFAULT_PRODUCT_EXPLORER_CONTENT} categories={categories} nodeId="products-explorer" />);
    const bending = screen.getByRole("tab", { name: /02 Bending/i });
    bending.focus();
    fireEvent.keyDown(bending, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: /03 Laser Cutting/i })).toHaveAttribute("aria-selected", "true");
    expect(container.querySelector('[data-page-text="title"]')).toHaveTextContent("Sheet Metal Fabrication");
    expect(container.querySelector('[data-page-text="subtitle"]')).toHaveTextContent("Precision. Performance. Productivity.");
  });
});
