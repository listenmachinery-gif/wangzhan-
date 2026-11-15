import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { getPublishedSeoByPath, listIndexableSeoPaths, overlayPublishedSeo, seoRecordToMetadata } from "@/lib/repositories/seo-repository";
import { SeoConflictError, SeoPermissionError, SeoService, SeoValidationError } from "@/lib/services/seo-service";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("SEO service and published repository", () => {
  let admin: Principal;
  let productEditor: Principal;
  let contentEditor: Principal;
  let sales: Principal;
  let productId: string;
  let categoryId: string;
  let mediaId: string;
  let revalidated: string[];
  let service: SeoService;

  beforeEach(async () => {
    await resetTestDatabase();
    const [adminUser, editorUser, salesUser, contentUser] = await Promise.all([
      db.user.create({ data: { email: "seo-admin@zyron.test", name: "SEO Admin", passwordHash: "test" } }),
      db.user.create({ data: { email: "seo-product@zyron.test", name: "SEO Product", passwordHash: "test" } }),
      db.user.create({ data: { email: "seo-sales@zyron.test", name: "SEO Sales", passwordHash: "test" } }),
      db.user.create({ data: { email: "seo-content@zyron.test", name: "SEO Content", passwordHash: "test" } }),
    ]);
    admin = { id: adminUser.id, email: adminUser.email, name: adminUser.name, roles: ["ADMIN"] };
    productEditor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["PRODUCT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    contentEditor = { id: contentUser.id, email: contentUser.email, name: contentUser.name, roles: ["CONTENT_EDITOR"] };
    const category = await db.productCategory.create({ data: { name: "SEO Shears", slug: "seo-shears", status: "PUBLISHED", publishedAt: new Date() } });
    categoryId = category.id;
    const product = await db.product.create({ data: { categoryId: category.id, name: "SEO Machine", slug: "seo-machine", summary: "SEO test", status: "PUBLISHED", publishedAt: new Date() } });
    productId = product.id;
    const media = await db.mediaAsset.create({ data: { objectKey: "seo/og.webp", originalName: "og.webp", mimeType: "image/webp", byteSize: 100, checksum: "seo-og", usage: "EDITORIAL_IMAGE", uploadedById: admin.id } });
    mediaId = media.id;
    revalidated = [];
    service = new SeoService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  const input = () => ({
    pathname: "/products/seo-machine",
    productId,
    title: "SEO Machine | ZYRON",
    description: "Published database-backed metadata for the SEO machine.",
    canonicalUrl: "/products/seo-machine",
    openGraphTitle: "SEO Machine",
    openGraphDescription: "SEO Machine for industrial buyers.",
    openGraphMediaId: mediaId,
    robotsIndex: true,
    targetKeyword: "seo machine",
  });

  it("keeps drafts invisible, publishes exact-path metadata, and preserves the URL", async () => {
    const created = await service.create(productEditor, input());
    expect(created.record).toMatchObject({ pathname: "/products/seo-machine", status: "DRAFT", version: 1 });
    await expect(getPublishedSeoByPath("/products/seo-machine", db)).resolves.toBeNull();

    const published = await service.publish(admin, created.record.id, { version: 1 });
    expect(published).toMatchObject({ status: "PUBLISHED", version: 2 });
    expect(revalidated).toEqual(["/products/seo-machine", "/sitemap.xml"]);
    const record = await getPublishedSeoByPath("/products/seo-machine", db);
    expect(seoRecordToMetadata(record!)).toMatchObject({
      title: "SEO Machine | ZYRON",
      alternates: { canonical: "/products/seo-machine" },
      robots: { index: true, follow: true },
      openGraph: { title: "SEO Machine", images: [{ url: `/api/media/${mediaId}` }] },
    });
  });

  it("enforces product path ownership, media validity, permissions, and stale versions", async () => {
    await expect(service.create(productEditor, { ...input(), pathname: "/products/other" })).rejects.toBeInstanceOf(SeoValidationError);
    await expect(service.create(productEditor, { ...input(), openGraphMediaId: "missing" })).rejects.toBeInstanceOf(SeoValidationError);
    await expect(service.create(sales, input())).rejects.toBeInstanceOf(SeoPermissionError);
    await expect(service.create(contentEditor, { ...input(), productId: null })).rejects.toBeInstanceOf(SeoPermissionError);
    const created = await service.create(productEditor, input());
    await expect(service.publish(contentEditor, created.record.id, { version: created.record.version })).rejects.toBeInstanceOf(SeoPermissionError);
    await expect(service.update(productEditor, created.record.id, { version: 99, title: "Stale" })).rejects.toBeInstanceOf(SeoConflictError);
  });

  it("keeps published metadata unchanged while a newer draft is edited", async () => {
    const created = await service.create(productEditor, input());
    const published = await service.publish(admin, created.record.id, { version: created.record.version });
    const draft = await service.update(productEditor, published.id, { version: published.version, title: "Unpublished replacement title" });
    expect(draft.record.title).toBe("Unpublished replacement title");
    await expect(getPublishedSeoByPath(input().pathname, db)).resolves.toMatchObject({ title: "SEO Machine | ZYRON" });
    await service.publish(admin, published.id, { version: draft.record.version });
    await expect(getPublishedSeoByPath(input().pathname, db)).resolves.toMatchObject({ title: "Unpublished replacement title" });
  });

  it("preserves fallback social metadata and hides SEO for an unpublished product", async () => {
    const created = await service.create(productEditor, { ...input(), openGraphMediaId: null });
    await service.publish(admin, created.record.id, { version: created.record.version });
    const metadata = await overlayPublishedSeo(input().pathname, {
      keywords: ["existing keyword"],
      openGraph: { images: [{ url: "/existing-og.webp" }] },
      twitter: { card: "summary_large_image", images: ["/existing-twitter.webp"] },
    }, db);
    expect(metadata).toMatchObject({
      title: input().title,
      keywords: ["existing keyword"],
      openGraph: { images: [{ url: "/existing-og.webp" }] },
      twitter: { card: "summary_large_image", images: ["/existing-twitter.webp"] },
    });
    await db.product.update({ where: { id: productId }, data: { publishedAt: null } });
    await expect(getPublishedSeoByPath(input().pathname, db)).resolves.toBeNull();
    await db.product.update({ where: { id: productId }, data: { publishedAt: new Date() } });
    await db.productCategory.update({ where: { id: categoryId }, data: { status: "DRAFT", publishedAt: null } });
    await expect(getPublishedSeoByPath(input().pathname, db)).resolves.toBeNull();
  });

  it("reports duplicate title/description warnings and excludes published noindex paths", async () => {
    await service.create(admin, { ...input(), pathname: "/factory", productId: null, openGraphMediaId: null });
    const duplicate = await service.create(admin, { ...input(), pathname: "/contact", productId: null, openGraphMediaId: null });
    expect(duplicate.warnings).toEqual(expect.arrayContaining(["DUPLICATE_TITLE", "DUPLICATE_DESCRIPTION"]));
    const published = await service.publish(admin, duplicate.record.id, { version: duplicate.record.version });
    const noindexDraft = await service.update(admin, published.id, { version: published.version, robotsIndex: false });
    await service.publish(admin, published.id, { version: noindexDraft.record.version });
    await expect(listIndexableSeoPaths(db)).resolves.not.toContain("/contact");
    expect((await sitemap()).map(({ url }) => url)).not.toContain("https://www.zyroncnc.com/contact");
    expect(robots().rules).toMatchObject({ disallow: expect.arrayContaining(["/admin", "/api/admin", "/api/inquiry"]) });
    await expect(db.auditLog.count({ where: { entityType: "SeoRecord" } })).resolves.toBeGreaterThanOrEqual(4);
  });
});
