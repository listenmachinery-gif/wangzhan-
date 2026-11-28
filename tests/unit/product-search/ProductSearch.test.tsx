// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductSearch } from "@/components/products/ProductSearch";
import { DEFAULT_PRODUCT_SEARCH_CONTENT, type ProductSearchIndexItem } from "@/lib/product-search/config";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const index: ProductSearchIndexItem[] = [
  {
    id: "product-1",
    slug: "cnc-press-brake",
    name: "CNC Press Brake",
    summary: "Precision sheet bending",
    categoryName: "Bending Machines",
    categorySlug: "bending-machines",
    image: "/products/catalog/torsion-bar-cnc-press-brake.png",
    imageAlt: "CNC Press Brake",
    models: ["WE67K-160T3200"],
    aliases: ["Bending Machine"],
  },
];

describe("ProductSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    push.mockReset();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the supplied premium search structure and exact SVG assets", () => {
    render(<ProductSearch content={DEFAULT_PRODUCT_SEARCH_CONTENT} index={index} nodeId="product-search" />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Find the Right Sheet Metal Machine in Seconds");
    expect(screen.getByRole("combobox", { name: "Search ZYRON products" })).toHaveAttribute("placeholder", "Enter a machine name, model or series...");
    expect(screen.getByRole("button", { name: "Find Machine" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search for Shearing Machine" })).toBeInTheDocument();
    expect(document.querySelector('[data-icon-src="/icons/product-search/shearing-machine.svg"]')).toBeInTheDocument();
    expect(screen.getByText("Fast Search")).toBeInTheDocument();
  });

  it("shows ranked real-product suggestions and provides a crawlable product link", async () => {
    render(<ProductSearch content={{ ...DEFAULT_PRODUCT_SEARCH_CONTENT, debounceMs: 100 }} index={index} nodeId="product-search" />);

    fireEvent.change(screen.getByRole("combobox", { name: "Search ZYRON products" }), { target: { value: "WE67K-160T3200" } });
    await act(async () => vi.advanceTimersByTime(110));

    expect(screen.getByRole("option", { name: /CNC Press Brake/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /CNC Press Brake/ })).toHaveAttribute("href", "/products/cnc-press-brake");
    expect(screen.getByRole("link", { name: "View All Results" })).toHaveAttribute("href", "/products/search?q=WE67K-160T3200");
  });

  it("supports popular search, keyboard selection, and full-result submission", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ProductSearch content={{ ...DEFAULT_PRODUCT_SEARCH_CONTENT, debounceMs: 100 }} index={index} nodeId="product-search" />);

    await user.click(screen.getByRole("button", { name: "Search for CNC Press Brake" }));
    await act(async () => vi.advanceTimersByTime(110));
    const input = screen.getByRole("combobox", { name: "Search ZYRON products" });
    expect(input).toHaveValue("CNC Press Brake");

    await user.keyboard("{ArrowDown}{Enter}");
    expect(push).toHaveBeenCalledWith("/products/cnc-press-brake");

    fireEvent.change(input, { target: { value: "plate rolling" } });
    fireEvent.submit(input.closest("form")!);
    expect(push).toHaveBeenLastCalledWith("/products/search?q=plate+rolling");
  });
});
