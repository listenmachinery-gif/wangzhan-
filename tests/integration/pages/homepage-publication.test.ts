import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { defaultHomepageDocument, homepageRedesignDocument } from "@/lib/page-builder/default-homepage";
import { publishHomepageRedesign } from "@/scripts/publish-homepage-redesign";

describe("guarded homepage redesign publication", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    const admin = await db.user.create({
      data: { email: "admin@zyroncnc.com", name: "Administrator", passwordHash: "test" },
    });
    const adminRole = await db.role.create({ data: { key: "ADMIN", name: "Administrator" } });
    await db.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
  });

  afterAll(() => db.$disconnect());

  it("refuses to write without the explicit production approval gate", async () => {
    await expect(publishHomepageRedesign({
      database: db,
      env: { DATABASE_URL: "postgresql://test", VERCEL_ENV: "preview" },
      revalidate: () => undefined,
    })).rejects.toThrow("production approval gate");
    await expect(db.sitePage.count()).resolves.toBe(0);
  });

  it("preserves other pages and creates recoverable save and publish versions", async () => {
    const principal = await db.user.findUniqueOrThrow({ where: { email: "admin@zyroncnc.com" } });
    const [home, other] = await Promise.all([
      db.sitePage.create({ data: {
        name: "Home",
        slug: "home",
        pageType: "HOME",
        draftContent: defaultHomepageDocument as never,
        publishedContent: defaultHomepageDocument as never,
        status: "PUBLISHED",
        version: 1,
        publishedVersion: 1,
        publishedAt: new Date(),
      } }),
      db.sitePage.create({ data: {
        name: "Company",
        slug: "factory",
        pageType: "FACTORY",
        draftContent: defaultHomepageDocument as never,
      } }),
    ]);
    await db.pageVersion.create({ data: {
      pageId: home.id,
      version: 1,
      snapshot: defaultHomepageDocument as never,
      action: "PUBLISH",
      createdById: principal.id,
      publishedAt: new Date(),
    } });
    const revalidated: string[] = [];

    const result = await publishHomepageRedesign({
      database: db,
      env: {
        DATABASE_URL: "postgresql://test",
        VERCEL_ENV: "production",
        ZYRON_HOMEPAGE_RELEASE: "APPROVED_2026_11_24",
        TARGET_ADMIN_EMAIL: "admin@zyroncnc.com",
      },
      revalidate: (path) => { revalidated.push(path); },
    });

    expect(result).toMatchObject({ changed: true, slug: "home" });
    await expect(db.sitePage.findUniqueOrThrow({ where: { id: home.id } })).resolves.toMatchObject({
      status: "PUBLISHED",
      draftContent: homepageRedesignDocument,
      publishedContent: homepageRedesignDocument,
      version: 3,
    });
    await expect(db.pageVersion.findMany({ where: { pageId: home.id }, orderBy: { version: "asc" } })).resolves.toEqual([
      expect.objectContaining({ version: 1, action: "PUBLISH", snapshot: defaultHomepageDocument }),
      expect.objectContaining({ version: 2, action: "SAVE", snapshot: homepageRedesignDocument }),
      expect.objectContaining({ version: 3, action: "PUBLISH", snapshot: homepageRedesignDocument }),
    ]);
    await expect(db.sitePage.findUnique({ where: { id: other.id } })).resolves.toBeTruthy();
    expect(revalidated).toEqual(["/"]);

    const second = await publishHomepageRedesign({
      database: db,
      env: {
        DATABASE_URL: "postgresql://test",
        VERCEL_ENV: "production",
        ZYRON_HOMEPAGE_RELEASE: "APPROVED_2026_11_24",
      },
      revalidate: () => undefined,
    });
    expect(second).toMatchObject({ changed: false, slug: "home" });
    await expect(db.pageVersion.count({ where: { pageId: home.id } })).resolves.toBe(3);
  });

  it("snapshots distinct unversioned draft and published content before replacement", async () => {
    const oldPublished = {
      ...defaultHomepageDocument,
      nodes: defaultHomepageDocument.nodes.map((node, index) => index === 0
        ? { ...node, content: { ...(node.content as Record<string, unknown>), heading: "Previous live homepage" } }
        : node),
    };
    const home = await db.sitePage.create({ data: {
      name: "Home",
      slug: "home",
      pageType: "HOME",
      draftContent: defaultHomepageDocument as never,
      publishedContent: oldPublished as never,
      status: "PUBLISHED",
      version: 7,
      publishedVersion: 6,
      publishedAt: new Date(),
    } });

    await publishHomepageRedesign({
      database: db,
      env: {
        DATABASE_URL: "postgresql://test",
        VERCEL_ENV: "production",
        ZYRON_HOMEPAGE_RELEASE: "APPROVED_2026_11_24",
      },
      revalidate: () => undefined,
    });

    const versions = await db.pageVersion.findMany({
      where: { pageId: home.id },
      orderBy: { version: "asc" },
    });
    expect(versions).toEqual([
      expect.objectContaining({ version: 8, action: "SAVE", snapshot: defaultHomepageDocument }),
      expect.objectContaining({ version: 9, action: "SAVE", snapshot: oldPublished }),
      expect.objectContaining({ version: 10, action: "SAVE", snapshot: homepageRedesignDocument }),
      expect.objectContaining({ version: 11, action: "PUBLISH", snapshot: homepageRedesignDocument }),
    ]);
  });

  it("keeps the redesign draft active after preserving different legacy published content", async () => {
    const home = await db.sitePage.create({ data: {
      name: "Home",
      slug: "home",
      pageType: "HOME",
      draftContent: homepageRedesignDocument as never,
      publishedContent: defaultHomepageDocument as never,
      status: "DRAFT",
      version: 4,
      publishedVersion: 3,
      publishedAt: new Date(),
    } });

    await publishHomepageRedesign({
      database: db,
      env: {
        DATABASE_URL: "postgresql://test",
        VERCEL_ENV: "production",
        ZYRON_HOMEPAGE_RELEASE: "APPROVED_2026_11_24",
      },
      revalidate: () => undefined,
    });

    await expect(db.sitePage.findUniqueOrThrow({ where: { id: home.id } })).resolves.toMatchObject({
      status: "PUBLISHED",
      draftContent: homepageRedesignDocument,
      publishedContent: homepageRedesignDocument,
      version: 8,
    });
    await expect(db.pageVersion.findMany({ where: { pageId: home.id }, orderBy: { version: "asc" } })).resolves.toEqual([
      expect.objectContaining({ version: 5, snapshot: homepageRedesignDocument }),
      expect.objectContaining({ version: 6, snapshot: defaultHomepageDocument }),
      expect.objectContaining({ version: 7, snapshot: homepageRedesignDocument }),
      expect.objectContaining({ version: 8, action: "PUBLISH", snapshot: homepageRedesignDocument }),
    ]);
  });
});
