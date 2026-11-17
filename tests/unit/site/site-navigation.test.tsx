// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { productCategories, products } from "@/data/products";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";

const repositoryMocks = vi.hoisted(() => ({
  resolvePublicNavigation: vi.fn(),
  listPublishedCategories: vi.fn(),
}));

vi.mock("@/lib/repositories/navigation-repository", () => ({
  resolvePublicNavigation: repositoryMocks.resolvePublicNavigation,
}));

vi.mock("@/lib/repositories/category-repository", () => ({
  listPublishedCategories: repositoryMocks.listPublishedCategories,
}));

import { getSiteNavigationView } from "@/lib/repositories/site-navigation-view";

describe("public managed site navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repositoryMocks.resolvePublicNavigation.mockResolvedValue(DEFAULT_NAVIGATION);
    repositoryMocks.listPublishedCategories.mockResolvedValue([]);
  });

  it("renders the approved desktop, mobile, product, and footer navigation", () => {
    const { container } = render(
      <>
        <SiteHeader navigation={DEFAULT_NAVIGATION} categories={productCategories} products={products} />
        <SiteFooter navigation={DEFAULT_NAVIGATION} />
      </>,
    );

    expect(screen.getAllByText("Shipping Highlights").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText("Shearing Machines").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Quote Now" }).length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).not.toMatch(/Buying Guides|Customer Cases|SHOWCASE/i);
  });

  it("uses compatibility catalogue data when the database has no published categories", async () => {
    const view = await getSiteNavigationView();

    expect(view.navigation).toEqual(DEFAULT_NAVIGATION);
    expect(view.categories).toEqual(productCategories);
    expect(view.products).toEqual(products);
  });

  it("prefers published database categories and products when present", async () => {
    repositoryMocks.listPublishedCategories.mockResolvedValue([
      {
        id: "category-db",
        slug: "database-shears",
        name: "Database Shearing Series",
        summary: "Published database category",
        description: "Database controlled category",
        position: 0,
        publishedAt: new Date("2026-11-17T00:00:00Z"),
        products: [
          {
            id: "product-db",
            slug: "database-shear",
            name: "Database Shear",
            summary: "Published product",
            description: "Database controlled product",
            position: 0,
            publishedAt: new Date("2026-11-17T00:00:00Z"),
            sections: [],
          },
        ],
      },
    ]);

    const view = await getSiteNavigationView();

    expect(view.categories.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: "database-shears", name: "Database Shearing Series" },
    ]);
    expect(view.products.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: "database-shear", name: "Database Shear" },
    ]);
  });
});
