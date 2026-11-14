import { Prisma } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { products as legacyProducts } from "@/data/products";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { importLegacyCatalogue } from "@/lib/migration/catalogue-importer";
import { readLegacyCatalogue } from "@/lib/migration/legacy-product-reader";
import {
  getPublishedProductBySlug,
  listPublishedProductSlugs,
} from "@/lib/repositories/product-repository";
import {
  getPublishedCategoryBySlug,
  listPublishedCategories,
} from "@/lib/repositories/category-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";
import { publishProduct } from "@/lib/services/publication-service";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("published catalogue repositories", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    const catalogue = await readLegacyCatalogue({ includePageContent: false });
    await importLegacyCatalogue({ database: db, catalogue, write: true });
  });
  afterAll(() => db.$disconnect());

  it("returns only published products and categories", async () => {
    await db.product.update({ where: { slug: "foot-shear" }, data: { status: "DRAFT" } });
    await db.product.update({ where: { slug: "dual-shaft-shredder" }, data: { status: "ARCHIVED" } });
    await db.productCategory.update({ where: { slug: "press-machines" }, data: { status: "DRAFT" } });

    const slugs = await listPublishedProductSlugs({ database: db });
    expect(slugs).not.toContain("foot-shear");
    expect(slugs).not.toContain("dual-shaft-shredder");
    expect(slugs).not.toContain("mechanical-punch-press");
    expect((await listPublishedCategories({ database: db })).map((category) => category.slug)).not.toContain("press-machines");
    await expect(getPublishedCategoryBySlug("press-machines", { database: db })).resolves.toBeNull();

    await expect(getPublishedProductBySlug("foot-shear", {
      database: db,
      allowLegacyFallback: true,
    })).resolves.toBeNull();
  });

  it("returns visible validated modules in deterministic position order", async () => {
    const product = await db.product.findUniqueOrThrow({ where: { slug: "compact-electric-shearing-machine" } });
    await db.productSection.update({
      where: { productId_type: { productId: product.id, type: "OVERVIEW" } },
      data: { visible: false },
    });

    const published = await getPublishedProductBySlug(product.slug, { database: db });
    expect(published?.source).toBe("database");
    if (!published || published.source !== "database") throw new Error("Expected database product.");
    expect(published.modules.some((item) => item.type === "OVERVIEW")).toBe(false);
    expect(published.modules.map((item) => item.position)).toEqual(
      [...published.modules].map((item) => item.position).sort((left, right) => left - right),
    );
    expect(published.modules[0]).toMatchObject({ type: "HERO", visible: true });
  });

  it("exposes only allowlisted registered widgets", async () => {
    await db.product.update({
      where: { slug: "compact-electric-shearing-machine" },
      data: { registeredWidget: "small-electric-selector" },
    });
    await db.product.update({
      where: { slug: "foot-shear" },
      data: { registeredWidget: "arbitrary-component" },
    });

    await expect(getPublishedProductBySlug("compact-electric-shearing-machine", { database: db })).resolves.toMatchObject({
      registeredWidget: "small-electric-selector",
    });
    await expect(getPublishedProductBySlug("foot-shear", { database: db })).resolves.toMatchObject({
      registeredWidget: null,
    });
  });

  it("uses legacy content only when explicit fallback is enabled", async () => {
    const legacy = legacyProducts[0];
    await db.product.deleteMany({ where: { slug: legacy.id } });

    await expect(getPublishedProductBySlug(legacy.id, { database: db })).resolves.toBeNull();
    await expect(getPublishedProductBySlug(legacy.id, {
      database: db,
      allowLegacyFallback: true,
    })).resolves.toMatchObject({ source: "legacy", slug: legacy.id, name: legacy.name });
  });

  it("makes CMS-only published products discoverable without a legacy array entry", async () => {
    const category = await db.productCategory.findUniqueOrThrow({ where: { slug: "shearing-machines" } });
    await db.product.create({
      data: {
        categoryId: category.id,
        slug: "cms-only-test-machine",
        name: "CMS Only Test Machine",
        summary: "Created entirely in the CMS.",
        status: "PUBLISHED",
        publishedAt: new Date(),
        sections: {
          create: {
            type: "HERO",
            position: 0,
            visible: true,
            content: validProductModuleData.HERO as Prisma.InputJsonValue,
          },
        },
      },
    });

    const view = buildPublicCatalogueView(await listPublishedCategories({ database: db }));
    expect(view.products.find((product) => product.id === "cms-only-test-machine")).toMatchObject({
      name: "CMS Only Test Machine",
      image: "/hero.webp",
    });
    await expect(getPublishedProductBySlug("cms-only-test-machine", { database: db })).resolves.toMatchObject({
      source: "database",
      slug: "cms-only-test-machine",
    });
  });

  it("publishes validated content without changing the immutable slug", async () => {
    const product = await db.product.update({
      where: { slug: "compact-electric-shearing-machine" },
      data: { status: "DRAFT", publishedAt: null },
    });
    const revalidated: string[] = [];

    const published = await publishProduct({
      database: db,
      productId: product.id,
      expectedVersion: product.version,
      revalidate: (path) => { revalidated.push(path); },
    });

    expect(published).toMatchObject({
      slug: product.slug,
      slugLocked: true,
      status: "PUBLISHED",
      version: product.version + 1,
    });
    expect(revalidated).toEqual(expect.arrayContaining([
      `/products/${product.slug}`,
      "/products",
      "/sitemap.xml",
    ]));
    await expect(publishProduct({
      database: db,
      productId: product.id,
      expectedVersion: product.version,
      revalidate: () => undefined,
    })).rejects.toThrow(/version/i);
    await expect(db.product.update({
      where: { id: product.id },
      data: { slug: "changed-public-slug" },
    })).rejects.toThrow(/locked product slug/i);
  });
});
