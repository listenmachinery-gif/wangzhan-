import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";

describe("CMS PostgreSQL foundation", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("persists the P0 entity graph with real foreign keys", async () => {
    const permission = await db.permission.create({
      data: { key: "product.write", description: "Edit products" },
    });
    const role = await db.role.create({ data: { key: "PRODUCT_EDITOR", name: "Product Editor" } });
    const user = await db.user.create({
      data: { email: "editor@example.com", name: "Editor", passwordHash: "argon2id:test" },
    });

    await db.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } });
    await db.userRole.create({ data: { userId: user.id, roleId: role.id } });
    await db.session.create({
      data: { userId: user.id, tokenHash: "session-hash", expiresAt: new Date("2030-01-01T00:00:00Z") },
    });
    await db.auditLog.create({
      data: { actorId: user.id, action: "product.create", entityType: "Product", entityId: "pending" },
    });

    const category = await db.productCategory.create({
      data: { name: "Shearing Machines", slug: "shearing-machines", status: "PUBLISHED" },
    });
    const product = await db.product.create({
      data: {
        categoryId: category.id,
        name: "Compact Electric Shearing Machine",
        slug: "compact-electric-shearing-machine",
        summary: "Compact powered cutting.",
        status: "PUBLISHED",
      },
    });
    await db.productSection.create({
      data: { productId: product.id, type: "OVERVIEW", position: 0, content: { title: "Overview" } },
    });
    const model = await db.productModel.create({
      data: { productId: product.id, name: "Q11G-2x600", position: 0 },
    });
    const template = await db.specificationTemplate.create({
      data: { name: "Q11G specifications", categoryId: category.id },
    });
    const field = await db.specificationField.create({
      data: { templateId: template.id, name: "Cutting Width", unit: "mm", position: 0 },
    });
    await db.specificationValue.create({
      data: { modelId: model.id, fieldId: field.id, value: "600" },
    });

    const media = await db.mediaAsset.create({
      data: {
        objectKey: "products/q11g.webp",
        originalName: "q11g.webp",
        mimeType: "image/webp",
        byteSize: 1024,
        checksum: "sha256:q11g",
        usage: "EDITORIAL_IMAGE",
        altText: "Q11G compact electric shearing machine",
        uploadedById: user.id,
      },
    });
    await db.mediaReference.create({
      data: { mediaAssetId: media.id, entityType: "Product", entityId: product.id, field: "featuredImage" },
    });
    await db.banner.create({
      data: { name: "Homepage hero", title: "Precision Cutting", desktopMediaId: media.id, status: "DRAFT" },
    });

    const lead = await db.lead.create({
      data: {
        name: "Buyer",
        email: "buyer@example.com",
        interestedProductId: product.id,
        message: "Please quote this model.",
      },
    });
    await db.leadAssignment.create({ data: { leadId: lead.id, assigneeId: user.id, assignedById: user.id } });
    await db.leadActivity.create({
      data: { leadId: lead.id, actorId: user.id, type: "NOTE", content: "Requested voltage details." },
    });
    await db.seoRecord.create({
      data: {
        pathname: "/products/compact-electric-shearing-machine",
        productId: product.id,
        title: "Compact Electric Shearing Machine | ZYRON",
        description: "Explore Q11G compact electric shearing machines.",
        status: "PUBLISHED",
      },
    });
    await db.siteSetting.create({ data: { key: "site.name", value: "ZYRON Heavy Industry" } });

    expect(await db.user.count()).toBe(1);
    expect(await db.product.count()).toBe(1);
    expect(await db.specificationValue.count()).toBe(1);
    expect(await db.mediaReference.count()).toBe(1);
    expect(await db.lead.count()).toBe(1);
    expect(await db.seoRecord.count()).toBe(1);
  });

  it("enforces unique slugs and relational integrity", async () => {
    await db.productCategory.create({
      data: { name: "Shearing Machines", slug: "shearing-machines" },
    });

    await expect(
      db.productCategory.create({
        data: { name: "Duplicate", slug: "shearing-machines" },
      }),
    ).rejects.toMatchObject({ code: "P2002" });

    await expect(
      db.product.create({
        data: {
          categoryId: "missing-category",
          name: "Invalid Product",
          slug: "invalid-product",
          summary: "Must fail foreign-key validation.",
        },
      }),
    ).rejects.toMatchObject({ code: "P2003" });
  });
});
