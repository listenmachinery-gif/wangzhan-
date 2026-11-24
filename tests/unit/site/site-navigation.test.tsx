// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { productCategories, products } from "@/data/products";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import { buildMachinesMenuView } from "@/lib/navigation/machines-menu";

const machinesMenu = buildMachinesMenuView(DEFAULT_NAVIGATION.machines, productCategories, products);

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
        <SiteHeader navigation={DEFAULT_NAVIGATION} machinesMenu={machinesMenu} />
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
    render(<SiteHeader navigation={DEFAULT_NAVIGATION} machinesMenu={machinesMenu} />);

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Site navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Site navigation" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("opens the Machines menu, switches categories, and exposes real product links", async () => {
    const user = userEvent.setup();
    render(<SiteHeader navigation={DEFAULT_NAVIGATION} machinesMenu={machinesMenu} />);

    const trigger = screen.getByRole("button", { name: "Open Machines menu" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Machines mega menu" })).toBeInTheDocument();
    const laserCategory = screen.getByRole("tab", { name: /LASER CUTTING MACHINES/i });
    await user.click(laserCategory);
    expect(screen.getAllByRole("link", { name: /fiber laser/i }).length).toBeGreaterThan(0);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("applies managed menu typography, exposes a product scroll region, and links to the active series", async () => {
    const user = userEvent.setup();
    const config = structuredClone(DEFAULT_NAVIGATION.machines!);
    config.settings.categoryFontSize = 16;
    config.settings.categoryTextColor = "#123456";
    config.settings.categoryActiveTextColor = "#654321";
    config.settings.rightHeadingFontSize = 32;
    config.settings.rightHeadingColor = "#234567";
    config.settings.productTitleFontSize = 18;
    config.settings.productTitleColor = "#345678";
    const styledMenu = buildMachinesMenuView(config, productCategories, products);

    render(<SiteHeader navigation={DEFAULT_NAVIGATION} machinesMenu={styledMenu} />);
    await user.click(screen.getByRole("button", { name: "Open Machines menu" }));

    const shearingTab = screen.getByRole("tab", { name: /SHEARING MACHINES/i });
    expect(shearingTab).toHaveStyle({ fontSize: "16px", color: "#654321" });
    expect(screen.getByRole("heading", { name: "SHEARING MACHINES" })).toHaveStyle({ fontSize: "32px", color: "#234567" });
    expect(screen.getByRole("region", { name: "SHEARING MACHINES products" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("link", { name: "View All SHEARING MACHINES" })).toHaveAttribute("href", "/products/series/shearing-machines");
    expect(within(screen.getByRole("region", { name: "SHEARING MACHINES products" })).getByText(styledMenu.categories[0].products[0].name)).toHaveStyle({ fontSize: "18px", color: "#345678" });

    await user.click(screen.getByRole("tab", { name: /LASER CUTTING MACHINES/i }));
    expect(screen.getByRole("link", { name: "View All LASER CUTTING MACHINES" })).toHaveAttribute("href", "/products/series/laser-cutting-machines");
  });

  it("presents the desktop menu as an indexed industrial product directory", async () => {
    const user = userEvent.setup();
    render(<SiteHeader navigation={DEFAULT_NAVIGATION} machinesMenu={machinesMenu} />);

    await user.click(screen.getByRole("button", { name: "Open Machines menu" }));

    expect(screen.getByText(/product directory/i)).toBeInTheDocument();
    expect(screen.getByText(/08 series/i)).toBeInTheDocument();
    expect(screen.getByText(/series 01/i)).toBeInTheDocument();
    const productDirectory = screen.getByRole("region", { name: "SHEARING MACHINES products" });
    expect(within(productDirectory).getByText(/catalogue 01/i)).toBeInTheDocument();
    expect(within(productDirectory).getAllByRole("link").length).toBeGreaterThan(1);
  });

  it("drills from the mobile root into Machines and a product category", async () => {
    const user = userEvent.setup();
    render(<SiteHeader navigation={DEFAULT_NAVIGATION} machinesMenu={machinesMenu} />);
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const dialog = screen.getByRole("dialog", { name: "Site navigation" });
    await user.click(within(dialog).getByRole("button", { name: "PRODUCTS" }));
    expect(screen.getByRole("heading", { name: "Machines" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /SHEARING MACHINES/i }));
    expect(screen.getByRole("heading", { name: "SHEARING MACHINES" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /shear/i }).length).toBeGreaterThan(0);
  });

  it("uses compatibility catalogue data when the database has no published categories", async () => {
    const view = await getSiteNavigationView();

    expect(view.navigation).toEqual(DEFAULT_NAVIGATION);
    expect(view.categories).toEqual(productCategories);
    expect(view.products).toEqual(products);
    expect(view.machinesMenu.categories).toHaveLength(8);
  });

  it("hydrates a legacy published PRODUCTS snapshot without changing its navigation label", async () => {
    const legacy = structuredClone(DEFAULT_NAVIGATION);
    legacy.primary.find((item) => item.kind === "PRODUCT_DIRECTORY")!.label = "PRODUCTS";
    delete legacy.machines;
    repositoryMocks.resolvePublicNavigation.mockResolvedValue(legacy);

    const view = await getSiteNavigationView();

    expect(view.navigation.primary.find((item) => item.kind === "PRODUCT_DIRECTORY")?.label).toBe("PRODUCTS");
    expect(view.navigation.machines?.categories).toHaveLength(8);
    expect(view.navigation.primary.find((item) => item.id === "home")?.label).toBe("HOME");
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
