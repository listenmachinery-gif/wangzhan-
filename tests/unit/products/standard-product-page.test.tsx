// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StandardProductPage } from "@/components/products/StandardProductPage";
import {
  SMALL_ELECTRIC_PRODUCT_LAYOUT_GROUPS,
  SMALL_ELECTRIC_PRODUCT_MODULE_ORDER,
} from "@/lib/product-modules/small-electric-template";
import { PRODUCT_MODULE_TYPES } from "@/lib/product-modules/types";
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
    expect(Array.from(container.querySelectorAll("[data-product-layout-group]"), (element) => (
      element.getAttribute("data-product-layout-group")
    ))).toEqual([
      "hero",
      "advantages",
      "applications",
      "gallery",
      "models",
      "features",
      "selection",
      "faq",
      "inquiry",
    ]);
    expect(container.querySelector("[data-technical-table-scroll]")).toHaveClass("overflow-x-auto");
    expect(screen.getAllByRole("table", { name: "Title" })).toHaveLength(3);
    expect(screen.getByText("Which model fits?")).toBeInTheDocument();
    expect(screen.getByText("Electric Drive")).toBeInTheDocument();
    expect(screen.getAllByText("Featured").length).toBeGreaterThan(0);
    expect(screen.getByText("Browse the full cutting range.")).toBeInTheDocument();
    expect(screen.getByText("Information to include")).toBeInTheDocument();
    expect(container.querySelector("source[media='(max-width: 639px)']")).toHaveAttribute("srcset", "/hero-mobile.webp");
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
    expect(container.querySelector("[data-product-layout-group]")).toBeNull();
  });

  it("omits empty layout groups without changing the module renderer contract", () => {
    const { container } = render(<StandardProductPage product={{
      slug: "test",
      name: "Test",
      summary: "Test product",
      registeredWidget: null,
      modules: [{
        type: "TECHNICAL",
        position: 1,
        visible: true,
        data: validProductModuleData.TECHNICAL,
      }],
    }} />);

    expect(container.querySelectorAll("[data-product-layout-group]")).toHaveLength(1);
    expect(container.querySelector("[data-product-layout-group='models']")).not.toBeNull();
    expect(container.querySelectorAll("[data-product-module='TECHNICAL']")).toHaveLength(1);
  });

  it("assigns every supported module type to exactly one layout group", () => {
    const groupedTypes = SMALL_ELECTRIC_PRODUCT_LAYOUT_GROUPS.flatMap((group) => group.moduleTypes);

    expect(groupedTypes).toHaveLength(PRODUCT_MODULE_TYPES.length);
    expect(new Set(groupedTypes).size).toBe(PRODUCT_MODULE_TYPES.length);
    expect([...groupedTypes].sort()).toEqual([...PRODUCT_MODULE_TYPES].sort());
  });

  it("renders CMS modules inside named product slots without replacing real modules", () => {
    const { container } = render(<StandardProductPage product={{
      slug: "slot-product",
      name: "Slot Product",
      summary: "Real product summary",
      registeredWidget: null,
      modules: [
        { type: "HERO", position: 0, visible: true, data: validProductModuleData.HERO },
        { type: "TECHNICAL", position: 1, visible: true, data: validProductModuleData.TECHNICAL },
        { type: "CTA", position: 2, visible: true, data: validProductModuleData.CTA },
      ],
    }} cmsSlots={{
      PRODUCT_AFTER_HERO: [{ id: "cms-after-hero", type: "PARAGRAPH", content: { text: "CMS engineering detail" } }],
      PRODUCT_BEFORE_INQUIRY: [{ id: "cms-before-inquiry", type: "PARAGRAPH", content: { text: "CMS inquiry introduction" } }],
    }} />);

    expect(screen.getByText("CMS engineering detail")).toBeInTheDocument();
    expect(screen.getByText("CMS inquiry introduction")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-product-module='HERO']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-product-module='TECHNICAL']")).toHaveLength(1);
    const heroGroup = container.querySelector("[data-product-layout-group='hero']")!;
    expect(heroGroup.querySelector("[data-page-node='cms-after-hero']")).toBeInTheDocument();
    const inquiryGroup = container.querySelector("[data-product-layout-group='inquiry']")!;
    expect(inquiryGroup.firstElementChild).toHaveAttribute("data-page-node", "cms-before-inquiry");
  });
});
