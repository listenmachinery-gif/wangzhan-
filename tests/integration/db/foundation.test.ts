import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { seedRbac } from "@/prisma/seed-rbac";

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

  it("persists the analytics graph with idempotency and query indexes", async () => {
    const category = await db.productCategory.create({
      data: { name: "Shearing Machines", slug: "analytics-shearing-machines" },
    });
    const product = await db.product.create({
      data: {
        categoryId: category.id,
        name: "Analytics Test Shear",
        slug: "analytics-test-shear",
        summary: "Analytics relation target.",
      },
    });
    const lead = await db.lead.create({
      data: { email: "analytics-buyer@example.com", message: "Please contact me." },
    });
    const visitor = await db.analyticsVisitor.create({
      data: {
        anonymousId: "visitor_public_1",
        environment: "TEST",
        firstSeenAt: new Date("2026-11-16T08:00:00Z"),
        lastSeenAt: new Date("2026-11-16T08:05:00Z"),
        linkedLeadId: lead.id,
      },
    });
    const session = await db.analyticsSession.create({
      data: {
        visitorId: visitor.id,
        sessionKey: "session_public_1",
        environment: "TEST",
        startedAt: new Date("2026-11-16T08:00:00Z"),
        lastSeenAt: new Date("2026-11-16T08:05:00Z"),
        landingPath: "/products/analytics-test-shear",
      },
    });
    const pageView = await db.analyticsPageView.create({
      data: {
        visitorId: visitor.id,
        sessionId: session.id,
        productId: product.id,
        environment: "TEST",
        pageViewKey: "page_view_public_1",
        path: "/products/analytics-test-shear",
        startedAt: new Date("2026-11-16T08:00:00Z"),
      },
    });
    await db.analyticsEvent.create({
      data: {
        visitorId: visitor.id,
        sessionId: session.id,
        pageViewId: pageView.id,
        productId: product.id,
        environment: "TEST",
        eventKey: "event_public_1",
        type: "PRODUCT_VIEW",
        path: "/products/analytics-test-shear",
        occurredAt: new Date("2026-11-16T08:00:01Z"),
      },
    });
    await db.siteSearchEvent.create({
      data: {
        visitorId: visitor.id,
        sessionId: session.id,
        pageViewId: pageView.id,
        environment: "TEST",
        eventKey: "search_public_1",
        query: "electric shear",
        resultCount: 1,
        path: "/search",
        occurredAt: new Date("2026-11-16T08:00:02Z"),
      },
    });
    await db.analyticsDailySummary.create({
      data: {
        environment: "TEST",
        date: new Date("2026-11-16T00:00:00Z"),
        dimension: "source",
        dimensionValue: "direct",
        metrics: { visitors: 1, sessions: 1, pageViews: 1 },
      },
    });

    await expect(db.analyticsEvent.create({
      data: {
        visitorId: visitor.id,
        sessionId: session.id,
        environment: "TEST",
        eventKey: "event_public_1",
        type: "PRODUCT_VIEW",
        occurredAt: new Date("2026-11-16T08:00:03Z"),
      },
    })).rejects.toMatchObject({ code: "P2002" });

    const indexes = await db.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = current_schema()
        AND tablename IN ('AnalyticsVisitor', 'AnalyticsSession', 'AnalyticsPageView', 'AnalyticsEvent')
    `;
    const indexNames = indexes.map(({ indexname }) => indexname);
    expect(indexNames.some((name) => name.includes("environment_lastSeenAt_id"))).toBe(true);
    expect(indexNames.some((name) => name.includes("visitorId_startedAt"))).toBe(true);
    expect(indexNames.some((name) => name.includes("sessionId_startedAt"))).toBe(true);
    expect(indexNames.some((name) => name.includes("sessionId_occurredAt"))).toBe(true);

    expect(await db.analyticsVisitor.count({ where: { linkedLeadId: lead.id } })).toBe(1);
    expect(await db.analyticsPageView.count({ where: { productId: product.id } })).toBe(1);
  });

  it("seeds analytics permissions idempotently for administrators only", async () => {
    await seedRbac(db);
    await seedRbac(db);

    const analyticsPermissions = await db.permission.findMany({
      where: { key: { startsWith: "analytics." } },
      orderBy: { key: "asc" },
      include: { roles: { include: { role: true } } },
    });

    expect(analyticsPermissions.map(({ key }) => key)).toEqual([
      "analytics.export",
      "analytics.read.summary",
      "analytics.read.visitors",
    ]);
    for (const permission of analyticsPermissions) {
      expect(permission.roles.map(({ role }) => role.key).sort()).toEqual(["ADMIN", "SUPER_ADMIN"]);
    }
    expect(await db.permission.count({ where: { key: { startsWith: "analytics." } } })).toBe(3);
  });
});
