import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { importLegacyCatalogue } from "@/lib/migration/catalogue-importer";
import { readLegacyCatalogue } from "@/lib/migration/legacy-product-reader";

describe("legacy catalogue import", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("is an idempotent transaction with exact category/product slug parity and stable module order", async () => {
    const catalogue = await readLegacyCatalogue({ includePageContent: false });

    const first = await importLegacyCatalogue({ database: db, catalogue, write: true });
    const second = await importLegacyCatalogue({ database: db, catalogue, write: true });

    expect(first.imported).toMatchObject({ categories: catalogue.categories.length, products: catalogue.products.length });
    expect(second.imported).toEqual(first.imported);
    await expect(db.productCategory.count()).resolves.toBe(catalogue.categories.length);
    await expect(db.product.count()).resolves.toBe(catalogue.products.length);
    const persistedSlugs = (await db.product.findMany({ select: { slug: true }, orderBy: { slug: "asc" } })).map(({ slug }) => slug);
    expect(persistedSlugs).toEqual(catalogue.products.map(({ id }) => id).sort());

    const sample = await db.product.findUniqueOrThrow({
      where: { slug: "compact-electric-shearing-machine" },
      include: { sections: { orderBy: { position: "asc" } } },
    });
    expect(sample.slugLocked).toBe(true);
    expect(sample.sections.map(({ position }) => position)).toEqual(
      Array.from({ length: sample.sections.length }, (_, index) => index),
    );
  });

  it("creates references only for resolved existing media paths", async () => {
    const owner = await db.user.create({
      data: { email: "importer@zyron.test", name: "Importer", passwordHash: "test" },
    });
    const asset = await db.mediaAsset.create({
      data: {
        objectKey: "legacy/small-electric.png",
        originalName: "small-electric.png",
        mimeType: "image/png",
        byteSize: 10,
        checksum: "legacy-media-checksum",
        usage: "EDITORIAL_IMAGE",
        altText: "Small electric shear",
        uploadedById: owner.id,
      },
    });
    const catalogue = {
      categories: [{ id: "shearing-machines", name: "Shearing Machines", summary: "Cutting equipment", description: "Sheet cutting", position: 0 }],
      products: [{
        id: "test-shear",
        name: "Test Shear",
        categoryId: "shearing-machines",
        categoryName: "Shearing Machines",
        tagline: "Test cutting",
        image: "/products/test-shear.png",
        specs: [], highlights: [], applications: [], options: [],
      }],
    };

    await importLegacyCatalogue({
      database: db,
      catalogue,
      write: true,
      mediaPathToAssetId: new Map([["/products/test-shear.png", asset.id]]),
    });

    await expect(db.mediaReference.findFirstOrThrow({ where: { mediaAssetId: asset.id } })).resolves.toMatchObject({
      entityType: "Product",
      field: expect.stringContaining("HERO"),
    });
  });

  it("dry-run writes nothing and invalid input rolls back the whole catalogue", async () => {
    const catalogue = await readLegacyCatalogue({ includePageContent: false });
    const dryRun = await importLegacyCatalogue({ database: db, catalogue, write: false });
    expect(dryRun.dryRun).toBe(true);
    await expect(db.product.count()).resolves.toBe(0);

    await expect(
      importLegacyCatalogue({
        database: db,
        write: true,
        catalogue: {
          categories: catalogue.categories.slice(0, 1),
          products: [catalogue.products[0], { ...catalogue.products[1], id: "", name: "" }],
        },
      }),
    ).rejects.toThrow();
    await expect(db.productCategory.count()).resolves.toBe(0);
    await expect(db.product.count()).resolves.toBe(0);
  });
});
