// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StandardProductPage } from "@/components/products/StandardProductPage";
import { SMALL_ELECTRIC_PRODUCT_MODULE_ORDER } from "@/lib/product-modules/small-electric-template";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("StandardProductPage", () => {
  it("renders every visible standardized module with semantic section structure", () => {
    const modules = SMALL_ELECTRIC_PRODUCT_MODULE_ORDER.map((type, position) => ({
      type,
      position,
      visible: true,
      data: validProductModuleData[type],
    }));
    const { container } = render(<StandardProductPage product={{
      slug: "small-electric-shear",
      name: "Small Electric Shearing Machine",
      summary: "Compact precision cutting",
      modules,
      registeredWidget: null,
    }} />);

    expect(container.querySelectorAll("[data-product-module]")).toHaveLength(24);
    expect(container.querySelector("[data-technical-table-scroll]")).toHaveClass("overflow-x-auto");
    expect(screen.getAllByRole("table", { name: "Title" })).toHaveLength(3);
    expect(screen.getByText("Which model fits?")).toBeInTheDocument();
    expect(container.querySelector("script[data-faq-schema]")?.textContent).toContain("Which model fits?");
  });

  it("does not render hidden modules", () => {
    const { container } = render(<StandardProductPage product={{
      slug: "test",
      name: "Test",
      summary: "Test product",
      registeredWidget: null,
      modules: [{
        type: "OVERVIEW",
        position: 1,
        visible: false,
        data: validProductModuleData.OVERVIEW,
      }],
    }} />);
    expect(container.querySelector("[data-product-module]")).toBeNull();
  });
});
