import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";
import { publishAboutZyron } from "@/scripts/publish-about-zyron";

const approvedEnvironment = {
  DATABASE_URL: "postgresql://test",
  VERCEL_ENV: "production",
  ZYRON_ABOUT_RELEASE: "APPROVED_2026_11_26",
  TARGET_ADMIN_EMAIL: "admin@zyroncnc.com",
};

describe("guarded About ZYRON publication", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    const admin = await db.user.create({
      data: { email: "admin@zyroncnc.com", name: "Administrator", passwordHash: "test" },
    });
    const adminRole = await db.role.create({ data: { key: "ADMIN", name: "Administrator" } });
    await db.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
  });

  afterAll(() => db.$disconnect());

  it("refuses writes unless both the approval gate and apply flag are present", async () => {
    await expect(publishAboutZyron({
      database: db,
      env: approvedEnvironment,
      revalidate: () => undefined,
    })).rejects.toThrow("preview mode");
    await expect(publishAboutZyron({
      database: db,
      env: { ...approvedEnvironment, VERCEL_ENV: "preview" },
      apply: true,
      revalidate: () => undefined,
    })).rejects.toThrow("production approval gate");
    await expect(db.sitePage.count()).resolves.toBe(0);
  });

  it("publishes page and SEO data idempotently with version history", async () => {
    const revalidated: string[] = [];
    const first = await publishAboutZyron({
      database: db,
      env: approvedEnvironment,
      apply: true,
      revalidate: (path) => { revalidated.push(path); },
    });

    expect(first.changed).toBe(true);
    await expect(db.sitePage.findUniqueOrThrow({ where: { slug: "company" } })).resolves.toMatchObject({
      name: "关于 ZYRON",
      pageType: "ABOUT",
      status: "PUBLISHED",
      draftContent: aboutZyronDocument,
      publishedContent: aboutZyronDocument,
      version: 2,
      publishedVersion: 2,
    });
    await expect(db.pageVersion.findMany({ where: { pageId: first.pageId }, orderBy: { version: "asc" } })).resolves.toEqual([
      expect.objectContaining({ version: 1, action: "CREATE", snapshot: aboutZyronDocument }),
      expect.objectContaining({ version: 2, action: "PUBLISH", snapshot: aboutZyronDocument }),
    ]);
    await expect(db.seoRecord.findUniqueOrThrow({ where: { pathname: "/factory" } })).resolves.toMatchObject({
      status: "PUBLISHED",
      canonicalUrl: "/factory",
      robotsIndex: true,
      targetKeyword: "sheet metal machinery manufacturer",
      version: 2,
    });
    await expect(db.auditLog.count({ where: { entityType: "SeoRecord", action: "seo.publish" } })).resolves.toBe(1);
    expect(revalidated).toContain("/factory");

    const second = await publishAboutZyron({
      database: db,
      env: approvedEnvironment,
      apply: true,
      revalidate: () => undefined,
    });
    expect(second).toMatchObject({ changed: false, pageVersion: 2, seoVersion: 2 });
    await expect(db.pageVersion.count({ where: { pageId: first.pageId } })).resolves.toBe(2);
    await expect(db.auditLog.count({ where: { entityType: "SeoRecord", action: "seo.publish" } })).resolves.toBe(1);
  });
});
