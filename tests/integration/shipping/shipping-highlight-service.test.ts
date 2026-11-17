import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import type { ShippingHighlightDocument } from "@/lib/shipping/schema";
import { getPublishedShippingHighlightBySlug } from "@/lib/repositories/shipping-highlight-repository";
import {
  isShippingTransactionConflict,
  ShippingConflictError,
  ShippingHighlightService,
  ShippingPermissionError,
  ShippingValidationError,
} from "@/lib/services/shipping-highlight-service";

describe("ShippingHighlightService", () => {
  let editor: Principal;
  let sales: Principal;
  let category: { id: string; slug: string };
  let product: { id: string; slug: string };
  let cover: { id: string };
  let video: { id: string };
  let revalidated: string[];
  let service: ShippingHighlightService;

  function shippingDocument(patch: Partial<ShippingHighlightDocument> = {}): ShippingHighlightDocument {
    return {
      title: "Three electric shearing machines shipped to Germany",
      summary: "ZYRON completed inspection, export packing, and container loading for a German customer.",
      shipmentDate: "2026-11-16",
      countryCode: "DE",
      city: "Hamburg",
      categoryId: category.id,
      categorySlug: category.slug,
      productId: product.id,
      productSlug: product.slug,
      equipmentName: "Electric Shearing Machine",
      modelName: "Q11-3x1300",
      quantity: 3,
      containerMethod: "20GP container",
      transportMode: "Sea freight",
      packagingMethod: "Export wooden case",
      body: [{ type: "PARAGRAPH", text: "The machines passed final inspection before loading." }],
      coverMediaId: cover.id,
      media: [
        { id: "cover-link", mediaAssetId: cover.id, role: "COVER", position: 0, caption: "Loading", altText: "Electric shearing machines ready for shipment" },
        { id: "video-link", mediaAssetId: video.id, role: "VIDEO", position: 1, caption: "Video", altText: "Container loading video for the shearing machines" },
      ],
      seoTitle: "Electric Shearing Machines Shipped to Germany | ZYRON",
      seoDescription: "See how ZYRON inspected, packed, and loaded three electric shearing machines for sea delivery to a sheet-metal customer in Hamburg, Germany.",
      ...patch,
    };
  }

  beforeEach(async () => {
    await resetTestDatabase();
    const [editorUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "shipping-editor@zyron.test", name: "Shipping Editor", passwordHash: "test" } }),
      db.user.create({ data: { email: "shipping-sales@zyron.test", name: "Shipping Sales", passwordHash: "test" } }),
    ]);
    editor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["CONTENT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    category = await db.productCategory.create({ data: { name: "Shearing Machines", slug: "shearing-machines", status: "PUBLISHED", publishedAt: new Date() } });
    product = await db.product.create({ data: { categoryId: category.id, name: "Electric Shear", slug: "electric-shear", summary: "Electric shear", status: "PUBLISHED", publishedAt: new Date() } });
    cover = await db.mediaAsset.create({ data: { objectKey: "shipping/cover.jpg", originalName: "cover.jpg", mimeType: "image/jpeg", byteSize: 100, checksum: "shipping-cover", usage: "EDITORIAL_IMAGE", altText: "Shipping cover", uploadedById: editor.id } });
    video = await db.mediaAsset.create({ data: { objectKey: "shipping/video.mp4", originalName: "video.mp4", mimeType: "video/mp4", byteSize: 200, checksum: "shipping-video", usage: "EDITORIAL_VIDEO", altText: "Shipping video", uploadedById: editor.id } });
    revalidated = [];
    service = new ShippingHighlightService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  it("enforces permissions and creates a versioned draft with media references and an audit record", async () => {
    await expect(service.list(sales)).rejects.toBeInstanceOf(ShippingPermissionError);
    await expect(service.create(sales, { slug: "germany-shipment", document: shippingDocument() })).rejects.toBeInstanceOf(ShippingPermissionError);

    const created = await service.create(editor, { slug: "germany-shipment", document: shippingDocument() });
    expect(created).toMatchObject({ slug: "germany-shipment", slugLocked: false, status: "DRAFT", version: 1, publishedContent: null });
    await expect(db.shippingHighlightVersion.findMany({ where: { shippingHighlightId: created.id } })).resolves.toEqual([
      expect.objectContaining({ action: "CREATE", version: 1, createdById: editor.id }),
    ]);
    await expect(db.shippingMedia.count({ where: { shippingHighlightId: created.id } })).resolves.toBe(2);
    await expect(db.mediaReference.count({ where: { entityType: "ShippingHighlightDraft", entityId: created.id } })).resolves.toBe(2);
    await expect(db.auditLog.findFirstOrThrow({ where: { action: "shipping.create", entityId: created.id } })).resolves.toMatchObject({ actorId: editor.id });

    await expect(service.create(editor, { slug: "germany-shipment", document: shippingDocument() })).rejects.toBeInstanceOf(ShippingValidationError);
    await expect(service.create(editor, { slug: "second-germany-shipment", document: shippingDocument() })).resolves.toMatchObject({ slug: "second-germany-shipment" });
  });

  it("validates matching category/product records and blocks inactive or mismatched media at publication", async () => {
    await expect(service.create(editor, { slug: "invalid-product", document: shippingDocument({ productSlug: "wrong-slug" }) })).rejects.toBeInstanceOf(ShippingValidationError);

    const created = await service.create(editor, {
      slug: "blocked-media",
      document: shippingDocument({ media: [
        { ...shippingDocument().media[0], altText: "" },
        { ...shippingDocument().media[1], role: "EQUIPMENT" },
      ] }),
    });
    await expect(service.publish(editor, created.id, { version: created.version })).rejects.toBeInstanceOf(ShippingValidationError);
    await expect(db.shippingHighlight.findUniqueOrThrow({ where: { id: created.id } })).resolves.toMatchObject({ status: "DRAFT", version: 1 });

    const inactive = await db.mediaAsset.create({ data: { objectKey: "shipping/inactive.jpg", originalName: "inactive.jpg", mimeType: "image/jpeg", byteSize: 10, checksum: "shipping-inactive", usage: "EDITORIAL_IMAGE", lifecycleStatus: "TOMBSTONED", uploadedById: editor.id } });
    const inactiveDocument = shippingDocument({
      coverMediaId: inactive.id,
      media: [{ id: "inactive-link", mediaAssetId: inactive.id, role: "COVER", position: 0, altText: "Inactive shipment image" }],
    });
    const inactiveRecord = await db.shippingHighlight.create({ data: { slug: "inactive-media", draftContent: inactiveDocument as never } });
    await expect(service.publish(editor, inactiveRecord.id, { version: inactiveRecord.version })).rejects.toBeInstanceOf(ShippingValidationError);
  });

  it("keeps drafts isolated, locks the slug after first publish, rolls back to a new draft, and archives safely", async () => {
    const created = await service.create(editor, { slug: "germany-shipment", document: shippingDocument() });
    const published = await service.publish(editor, created.id, { version: 1 });
    expect(published).toMatchObject({ status: "PUBLISHED", version: 2, publishedVersion: 2, slugLocked: true, publishedCountryCode: "DE", publishedCategorySlug: category.slug });
    expect(published.publishedContent).toEqual(shippingDocument());
    expect(revalidated).toEqual(["/", "/shipping-highlights", "/shipping-highlights/germany-shipment"]);
    await expect(db.mediaReference.count({ where: { entityType: "ShippingHighlightPublished", entityId: created.id } })).resolves.toBe(2);

    const draft = shippingDocument({ title: "Draft-only title", countryCode: "US" });
    const saved = await service.saveDraft(editor, created.id, { version: 2, slug: "renamed-after-publish", document: draft });
    expect(saved).toMatchObject({ slug: "germany-shipment", status: "DRAFT", version: 3, publishedCountryCode: "DE" });
    expect(saved.publishedContent).toEqual(shippingDocument());
    await expect(getPublishedShippingHighlightBySlug("germany-shipment")).resolves.toMatchObject({ document: shippingDocument() });
    await expect(service.saveDraft(editor, created.id, { version: 2, document: draft })).rejects.toBeInstanceOf(ShippingConflictError);

    const rolledBack = await service.rollback(editor, created.id, { version: 3, targetVersion: 1 });
    expect(rolledBack).toMatchObject({ status: "DRAFT", version: 4 });
    expect(rolledBack.draftContent).toEqual(shippingDocument());
    expect(rolledBack.publishedContent).toEqual(shippingDocument());

    const archived = await service.archive(editor, created.id, { version: 4 });
    expect(archived).toMatchObject({ status: "ARCHIVED", version: 5 });
    await expect(getPublishedShippingHighlightBySlug("germany-shipment")).resolves.toBeNull();
    await expect(service.versions(editor, created.id)).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "ARCHIVE", version: 5 }),
      expect.objectContaining({ action: "ROLLBACK", version: 4 }),
      expect.objectContaining({ action: "PUBLISH", version: 2 }),
    ]));
  });

  it("returns committed publication when cache invalidation fails", async () => {
    const created = await service.create(editor, { slug: "cache-safe-shipment", document: shippingDocument() });
    service = new ShippingHighlightService(db, async () => { throw new Error("cache unavailable"); });
    await expect(service.publish(editor, created.id, { version: 1 })).resolves.toMatchObject({ status: "PUBLISHED", version: 2 });
    await expect(db.shippingHighlight.findUniqueOrThrow({ where: { id: created.id } })).resolves.toMatchObject({ status: "PUBLISHED", version: 2 });
  });

  it("recognizes only Prisma serializable transaction conflicts", () => {
    expect(isShippingTransactionConflict({ code: "P2034" })).toBe(true);
    expect(isShippingTransactionConflict({ code: "P2002" })).toBe(false);
    expect(isShippingTransactionConflict(new Error("P2034"))).toBe(false);
  });
});
