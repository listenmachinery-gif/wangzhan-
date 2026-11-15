import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  ProductAdminConflictError,
  ProductAdminPermissionError,
  ProductAdminService,
  ProductAdminValidationError,
} from "@/lib/services/product-admin-service";
import { validProductModuleData } from "@/tests/fixtures/product-modules";

describe("ProductAdminService", () => {
  let editor: Principal;
  let sales: Principal;
  let categoryId: string;
  let revalidated: string[];
  let service: ProductAdminService;

  beforeEach(async () => {
    await resetTestDatabase();
    const [editorUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "product-editor@zyron.test", name: "Product Editor", passwordHash: "test" } }),
      db.user.create({ data: { email: "sales-products@zyron.test", name: "Sales", passwordHash: "test" } }),
    ]);
    editor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["PRODUCT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    const category = await db.productCategory.create({
      data: {
        name: "Shearing Machines",
        slug: "shearing-machines",
        summary: "Shearing equipment",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    categoryId = category.id;
    revalidated = [];
    service = new ProductAdminService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  it("enforces permissions and supports bounded search, filtering, and pagination", async () => {
    await expect(service.createProduct(sales, {
      categoryId,
      name: "Forbidden Product",
      slug: "forbidden-product",
      summary: "Sales cannot create this.",
      position: 0,
    })).rejects.toBeInstanceOf(ProductAdminPermissionError);

    await service.createProduct(editor, {
      categoryId,
      name: "Alpha Shear",
      slug: "alpha-shear",
      summary: "Alpha summary",
      position: 0,
    });
    await service.createProduct(editor, {
      categoryId,
      name: "Beta Press",
      slug: "beta-press",
      summary: "Beta summary",
      position: 1,
    });

    const result = await service.listProducts(editor, {
      page: 1,
      pageSize: 1,
      query: "shear",
      status: "DRAFT",
      categoryId,
    });
    expect(result).toMatchObject({ total: 1, page: 1, pageSize: 1 });
    expect(result.items.map((item) => item.slug)).toEqual(["alpha-shear"]);
    await expect(db.auditLog.count({ where: { action: "product.create" } })).resolves.toBe(2);
  });

  it("saves registered modules, reconciles real media references, and detects stale versions", async () => {
    const product = await service.createProduct(editor, {
      categoryId,
      name: "Module Product",
      slug: "module-product",
      summary: "Module summary",
      position: 0,
    });
    const media = await db.mediaAsset.create({
      data: {
        objectKey: "products/module-product/hero.webp",
        originalName: "hero.webp",
        mimeType: "image/webp",
        byteSize: 100,
        checksum: "module-product-hero",
        usage: "EDITORIAL_IMAGE",
        altText: "Module product",
        uploadedById: editor.id,
      },
    });

    const saved = await service.saveSections(editor, product.id, {
      version: product.version,
      sections: [{
        type: "HERO",
        position: 0,
        visible: true,
        content: {
          ...(validProductModuleData.HERO as Record<string, unknown>),
          images: { desktop: `/api/media/${media.id}`, alt: "Module product" },
        },
        mediaAssetIds: [media.id],
      }],
    });
    expect(saved.version).toBe(product.version + 1);
    await expect(db.mediaReference.findFirstOrThrow({
      where: { mediaAssetId: media.id, entityType: "Product", entityId: product.id },
    })).resolves.toMatchObject({ field: expect.stringContaining("HERO") });
    await expect(service.saveSections(editor, product.id, {
      version: product.version,
      sections: [],
    })).rejects.toBeInstanceOf(ProductAdminConflictError);
    await expect(service.saveSections(editor, product.id, {
      version: saved.version,
      sections: [{
        type: "HERO",
        position: 0,
        visible: true,
        content: validProductModuleData.HERO,
        mediaAssetIds: ["missing-media"],
      }],
    })).rejects.toBeInstanceOf(ProductAdminValidationError);

    await db.product.update({
      where: { id: product.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    await expect(service.saveSections(editor, product.id, {
      version: saved.version,
      sections: [],
    })).rejects.toThrow(/visible HERO/i);
  });

  it("copies drafts, archives records, and writes audit history", async () => {
    const product = await service.createProduct(editor, {
      categoryId,
      name: "Original",
      slug: "original-product",
      summary: "Original summary",
      position: 0,
    });
    const saved = await service.saveSections(editor, product.id, {
      version: product.version,
      sections: [{
        type: "HERO",
        position: 0,
        visible: true,
        content: validProductModuleData.HERO,
        mediaAssetIds: [],
      }],
    });

    const copy = await service.copyProduct(editor, product.id, {
      name: "Original Copy",
      slug: "original-product-copy",
      expectedVersion: saved.version,
    });
    expect(copy).toMatchObject({ status: "DRAFT", slug: "original-product-copy", publishedAt: null });
    await expect(db.productSection.count({ where: { productId: copy.id } })).resolves.toBe(1);
    await expect(service.copyProduct(editor, product.id, {
      name: "Stale Copy",
      slug: "stale-copy",
      expectedVersion: product.version,
    })).rejects.toBeInstanceOf(ProductAdminConflictError);

    const archived = await service.archiveProduct(editor, product.id, saved.version);
    expect(archived).toMatchObject({ status: "ARCHIVED" });
    expect(archived.archivedAt).toBeInstanceOf(Date);
    await expect(db.auditLog.findMany({ where: { entityId: product.id } })).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "product.archive" })]),
    );
  });

  it("publishes validated drafts and revalidates only affected public routes", async () => {
    const product = await service.createProduct(editor, {
      categoryId,
      name: "Publish Product",
      slug: "publish-product",
      summary: "Publish summary",
      position: 0,
    });
    const saved = await service.saveSections(editor, product.id, {
      version: product.version,
      sections: [{
        type: "HERO",
        position: 0,
        visible: true,
        content: validProductModuleData.HERO,
        mediaAssetIds: [],
      }],
    });

    const published = await service.publishProduct(editor, product.id, saved.version);
    expect(published).toMatchObject({ status: "PUBLISHED", version: saved.version + 1 });
    expect(revalidated.sort()).toEqual([
      "/products",
      "/products/publish-product",
      "/products/series/shearing-machines",
      "/sitemap.xml",
    ].sort());
    await expect(db.auditLog.findFirstOrThrow({
      where: { entityId: product.id, action: "product.publish" },
    })).resolves.toMatchObject({ actorId: editor.id });
  });

  it("revalidates category visibility and both series when moving a published product", async () => {
    const category = await db.productCategory.findUniqueOrThrow({ where: { id: categoryId } });
    const product = await db.product.create({
      data: {
        categoryId,
        name: "Moved Product",
        slug: "moved-product",
        summary: "Moved product summary",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    const destination = await db.productCategory.create({
      data: { name: "Destination", slug: "destination", status: "PUBLISHED", publishedAt: new Date() },
    });

    await service.updateProduct(editor, product.id, { version: product.version, categoryId: destination.id });
    expect(revalidated).toEqual(expect.arrayContaining([
      "/products/moved-product",
      "/products/series/shearing-machines",
      "/products/series/destination",
      "/products",
      "/sitemap.xml",
    ]));

    revalidated.length = 0;
    await service.updateCategory(editor, category.id, { version: category.version, status: "DRAFT" });
    expect(revalidated).toEqual(expect.arrayContaining([
      "/products/series/shearing-machines",
      "/products",
      "/sitemap.xml",
    ]));
  });
});
