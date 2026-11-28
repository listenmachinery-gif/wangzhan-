// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductSelectionCenter } from "@/components/products/ProductSelectionCenter";
import { DEFAULT_PRODUCT_SELECTION_CONTENT, type ProductSelectionItem } from "@/lib/product-selection/config";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));

const items: ProductSelectionItem[] = [
  { id: "shear", slug: "electric-shear", name: "Electric Shearing Machine", summary: "Compact sheet cutting.", categoryId: "c1", categorySlug: "shearing-machines", categoryName: "Shearing Machines", image: "/shear.webp", imageAlt: "Electric shear", position: 1, publishedAt: "2026-11-01T00:00:00.000Z", models: [{ id: "m1", name: "Q11-3x2500", sku: null, specifications: { Material: [{ value: "Mild Steel", unit: "" }], "Cutting Thickness": [{ value: "3", unit: "mm" }] } }] },
  { id: "brake", slug: "cnc-brake", name: "CNC Press Brake", summary: "CNC sheet bending.", categoryId: "c2", categorySlug: "bending-machines", categoryName: "Bending / Press Brakes", image: "/brake.webp", imageAlt: "CNC press brake", position: 2, publishedAt: "2026-10-01T00:00:00.000Z", models: [{ id: "m2", name: "WE67K", sku: null, specifications: { Material: [{ value: "Stainless Steel", unit: "" }] } }] },
];
const categories = [{ slug: "shearing-machines", name: "Shearing Machines" }, { slug: "bending-machines", name: "Bending / Press Brakes" }];

describe("ProductSelectionCenter", () => {
  afterEach(cleanup);
  beforeEach(() => { window.history.replaceState(null, "", "/products"); window.localStorage.clear(); });

  it("renders real product links, professional headings and verified parameter values", () => {
    render(<ProductSelectionCenter content={DEFAULT_PRODUCT_SELECTION_CONTENT} items={items} categories={categories} nodeId="selection" />);
    expect(screen.getByRole("heading", { level: 2, name: "Explore All Machines" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Electric Shearing Machine/ })).toHaveAttribute("href", "/products/electric-shear");
    expect(screen.getByText("3 mm")).toBeInTheDocument();
    expect(screen.getByText(/2 machine series/)).toBeInTheDocument();
  });

  it("links search, category and dynamic filters and exposes a useful reset empty state", async () => {
    const user = userEvent.setup();
    render(<ProductSelectionCenter content={DEFAULT_PRODUCT_SELECTION_CONTENT} items={items} categories={categories} nodeId="selection" />);
    await user.type(screen.getByRole("searchbox", { name: "Search machines" }), "press");
    await waitFor(() => expect(screen.queryByRole("heading", { level: 3, name: "Electric Shearing Machine" })).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { level: 3, name: "CNC Press Brake" })).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox", { name: "Search machines" }));
    await waitFor(() => expect(screen.getByRole("heading", { level: 3, name: "Electric Shearing Machine" })).toBeInTheDocument());
    await user.click(screen.getByRole("radio", { name: /Shearing Machines/ }));
    expect(screen.getByRole("heading", { level: 3, name: "Electric Shearing Machine" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "CNC Press Brake" })).not.toBeInTheDocument();
    const filters = screen.getByTestId("selection-filters");
    expect(within(filters).getByText("Material")).toBeInTheDocument();
  });

  it("persists comparison, enforces the maximum and opens the technical comparison dialog", async () => {
    const user = userEvent.setup();
    render(<ProductSelectionCenter content={{ ...DEFAULT_PRODUCT_SELECTION_CONTENT, compare: { ...DEFAULT_PRODUCT_SELECTION_CONTENT.compare, maxItems: 2 } }} items={items} categories={categories} nodeId="selection" />);
    const compareButtons = screen.getAllByRole("button", { name: "Add to Compare" });
    await user.click(compareButtons[0]);
    await user.click(compareButtons[1]);
    expect(screen.getByTestId("selection-compare-bar")).toHaveTextContent("2 / 2");
    await user.click(within(screen.getByTestId("selection-compare-bar")).getByRole("button", { name: "Compare Machines" }));
    expect(screen.getByRole("dialog", { name: "Compare Machines" })).toBeInTheDocument();
    expect(window.localStorage.getItem("zyron-product-comparison-v1")).toContain("shear");
  });
});
