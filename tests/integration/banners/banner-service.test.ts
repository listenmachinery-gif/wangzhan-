import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { listActiveBanners } from "@/lib/repositories/banner-repository";
import {
  BannerConflictError,
  BannerPermissionError,
  BannerService,
  BannerValidationError,
} from "@/lib/services/banner-service";

describe("BannerService", () => {
  let editor: Principal;
  let sales: Principal;
  let desktopId: string;
  let tabletId: string;
  let revalidated: string[];
  let service: BannerService;

  beforeEach(async () => {
    await resetTestDatabase();
    const [editorUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "banner-editor@zyron.test", name: "Banner Editor", passwordHash: "test" } }),
      db.user.create({ data: { email: "banner-sales@zyron.test", name: "Sales", passwordHash: "test" } }),
    ]);
    editor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["CONTENT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    const [desktop, tablet] = await Promise.all([
      db.mediaAsset.create({ data: {
        objectKey: "banners/desktop.webp", originalName: "desktop.webp", mimeType: "image/webp", byteSize: 100,
        checksum: "banner-desktop", usage: "BANNER", altText: "Desktop machine banner", uploadedById: editor.id,
      } }),
      db.mediaAsset.create({ data: {
        objectKey: "banners/tablet.webp", originalName: "tablet.webp", mimeType: "image/webp", byteSize: 100,
        checksum: "banner-tablet", usage: "BANNER", altText: "Tablet machine banner", uploadedById: editor.id,
      } }),
    ]);
    desktopId = desktop.id;
    tabletId = tablet.id;
    revalidated = [];
    service = new BannerService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  const input = () => ({
    name: "Homepage banner",
    title: "Productive sheet metal machinery",
    subtitle: "Configured for global workshops.",
    buttonText: "Explore products",
    buttonUrl: "/products",
    textColor: "#ffffff",
    textPosition: "CENTER" as const,
    maskOpacity: 55,
    desktopMediaId: desktopId,
    tabletMediaId: tabletId,
    mobileMediaId: null,
    enabled: true,
    position: 10,
    startsAt: null,
    endsAt: null,
  });

  it("enforces permissions and records audited draft creation", async () => {
    await expect(service.create(sales, input())).rejects.toBeInstanceOf(BannerPermissionError);
    const created = await service.create(editor, input());
    expect(created).toMatchObject({ status: "DRAFT", version: 1, desktopMediaId: desktopId, tabletMediaId: tabletId });
    await expect(db.auditLog.findFirstOrThrow({ where: { action: "banner.create", entityId: created.id } })).resolves.toMatchObject({ actorId: editor.id });
    await expect(service.list(editor)).resolves.toHaveLength(1);
    await expect(service.list(sales)).rejects.toBeInstanceOf(BannerPermissionError);
  });

  it("rejects inactive and non-image media before persistence", async () => {
    const inactive = await db.mediaAsset.create({ data: {
      objectKey: "banners/inactive.webp", originalName: "inactive.webp", mimeType: "image/webp", byteSize: 100,
      checksum: "banner-inactive", usage: "BANNER", lifecycleStatus: "TOMBSTONED", uploadedById: editor.id,
    } });
    const pdf = await db.mediaAsset.create({ data: {
      objectKey: "banners/brochure.pdf", originalName: "brochure.pdf", mimeType: "application/pdf", byteSize: 100,
      checksum: "banner-pdf", usage: "DOCUMENT", uploadedById: editor.id,
    } });
    await expect(service.create(editor, { ...input(), desktopMediaId: inactive.id })).rejects.toBeInstanceOf(BannerValidationError);
    await expect(service.create(editor, { ...input(), desktopMediaId: pdf.id })).rejects.toBeInstanceOf(BannerValidationError);
    await expect(db.banner.count()).resolves.toBe(0);
  });

  it("accepts active video media and exposes its type to the public renderer", async () => {
    const video = await db.mediaAsset.create({ data: {
      objectKey: "banners/factory.mp4", originalName: "factory.mp4", mimeType: "video/mp4", byteSize: 100,
      checksum: "banner-video", usage: "VIDEO", altText: "Factory production video", uploadedById: editor.id,
    } });
    const created = await service.create(editor, { ...input(), desktopMediaId: video.id, tabletMediaId: null });
    await service.publish(editor, created.id, { version: created.version });
    await expect(listActiveBanners(new Date(), db)).resolves.toEqual([
      expect.objectContaining({ desktop: expect.objectContaining({ kind: "VIDEO", mimeType: "video/mp4" }) }),
    ]);
  });

  it("uses optimistic concurrency and requires publish permission for live edits", async () => {
    const created = await service.create(editor, input());
    const published = await service.publish(editor, created.id, { version: created.version });
    expect(published).toMatchObject({ status: "PUBLISHED", version: 2 });
    expect(published.publishedAt).toBeInstanceOf(Date);
    expect(revalidated).toContain("/");

    await expect(service.update(editor, created.id, { version: 1, title: "Stale" })).rejects.toBeInstanceOf(BannerConflictError);
    const updated = await service.update(editor, created.id, { version: 2, title: "Updated live banner" });
    expect(updated).toMatchObject({ title: "Updated live banner", version: 3 });
    expect(revalidated.filter((path) => path === "/")).toHaveLength(2);
    await expect(db.auditLog.findFirstOrThrow({ where: { action: "banner.publish", entityId: created.id } })).resolves.toMatchObject({ actorId: editor.id });
  });

  it("returns only active published banners in deterministic position order with device fallback", async () => {
    const now = new Date("2026-11-15T10:00:00.000Z");
    const first = await service.create(editor, {
      ...input(), name: "First", title: "First", position: 0,
      startsAt: "2026-11-15T10:00:00.000Z", endsAt: "2026-11-15T11:00:00.000Z",
    });
    await service.publish(editor, first.id, { version: first.version });
    const second = await service.create(editor, { ...input(), name: "Second", title: "Second", position: 5, tabletMediaId: null });
    await service.publish(editor, second.id, { version: second.version });
    const future = await service.create(editor, { ...input(), name: "Future", title: "Future", position: 1, startsAt: "2026-11-15T10:00:00.001Z" });
    await service.publish(editor, future.id, { version: future.version });
    const draft = await service.create(editor, { ...input(), name: "Draft", title: "Draft", position: 2 });

    const active = await listActiveBanners(now, db);
    expect(active.map(({ title }) => title)).toEqual(["First", "Second"]);
    expect(active[0]).toMatchObject({ mobile: { url: `/api/media/${tabletId}` } });
    expect(active[1]).toMatchObject({ tablet: { url: `/api/media/${desktopId}` }, mobile: { url: `/api/media/${desktopId}` } });
    expect(active.some(({ id }) => id === draft.id)).toBe(false);
    await expect(listActiveBanners(new Date("2026-11-15T11:00:00.000Z"), db)).resolves.toEqual(expect.not.arrayContaining([expect.objectContaining({ id: first.id })]));
  });
});
