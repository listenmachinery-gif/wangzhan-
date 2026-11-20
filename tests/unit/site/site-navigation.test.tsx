// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  afterEach(cleanup);
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
    expect(screen.getAllByRole("link", { name: "Quote Now" }).length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toMatch(/Buying Guides/i);
    expect(container.textContent).toMatch(/Customer Cases|SHOWCASE/i);
  });

  it("renders all optional footer sections from the published snapshot without a fake subscription form", () => {
    const navigation = structuredClone(DEFAULT_NAVIGATION);
    navigation.footer!.productCategories = { visible: false, label: "Hidden Categories" };
    navigation.footer!.actionLinks = {
      label: "Partner With ZYRON",
      items: [{ id: "footer-partner", kind: "LINK", label: "Become a Distributor", href: "/contact", visible: true }],
    };
    navigation.footer!.newsletter = {
      visible: true,
      title: "Verified Machinery Updates",
      description: "Read new product and delivery information.",
      ctaLabel: "Read Company News",
      ctaHref: "/news",
    };
    navigation.footer!.legalLinks = [{ id: "footer-terms", kind: "LINK", label: "Terms of Use", href: "/privacy", visible: true }];

    render(<SiteFooter navigation={navigation} />);

    expect(screen.queryByText("Hidden Categories")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Become a Distributor" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Read Company News" })).toHaveAttribute("href", "/news");
    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/privacy");
    expect(screen.queryByPlaceholderText("Email address")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Subscribe" })).not.toBeInTheDocument();
  });

  it("opens the mobile navigation as a dialog and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<SiteHeader navigation={DEFAULT_NAVIGATION} categories={productCategories} products={products} />);

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Site navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Site navigation" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
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
