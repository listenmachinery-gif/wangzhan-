import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { defaultHomepageDocument } from "@/lib/page-builder/default-homepage";
import {
  PageConflictError,
  PagePermissionError,
  PageService,
} from "@/lib/services/page-service";

describe("PageService", () => {
  let editor: Principal;
  let sales: Principal;
  let revalidated: string[];
  let service: PageService;

  beforeEach(async () => {
    await resetTestDatabase();
    const [editorUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "page-editor@zyron.test", name: "Page Editor", passwordHash: "test" } }),
      db.user.create({ data: { email: "page-sales@zyron.test", name: "Page Sales", passwordHash: "test" } }),
    ]);
    editor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["CONTENT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    revalidated = [];
    service = new PageService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  it("enforces page permissions and creates an immutable initial version", async () => {
    await expect(service.list(sales)).rejects.toBeInstanceOf(PagePermissionError);
    await expect(service.create(sales, {
      name: "Forbidden",
      slug: "forbidden",
      pageType: "CUSTOM",
      document: defaultHomepageDocument,
    })).rejects.toBeInstanceOf(PagePermissionError);

    const page = await service.create(editor, {
      name: "Home",
      slug: "home",
      pageType: "HOME",
      document: defaultHomepageDocument,
    });

    expect(page).toMatchObject({ status: "DRAFT", version: 1, publishedContent: null });
    await expect(db.pageVersion.findMany({ where: { pageId: page.id } })).resolves.toEqual([
      expect.objectContaining({ version: 1, action: "CREATE", createdById: editor.id }),
    ]);
  });

  it("keeps drafts private, detects stale writes, publishes, and revalidates only affected paths", async () => {
    const page = await service.create(editor, {
      name: "Home",
      slug: "home",
      pageType: "HOME",
      document: defaultHomepageDocument,
    });
    const draft = {
      ...defaultHomepageDocument,
      nodes: defaultHomepageDocument.nodes.map((node) => node.type === "ADVANTAGES"
        ? { ...node, content: { ...(node.content as Record<string, unknown>), heading: "Published buyer advantages" } }
        : node),
    };

    const saved = await service.saveDraft(editor, page.id, { version: page.version, document: draft });
    expect(saved).toMatchObject({ version: 2, status: "DRAFT", publishedContent: null });
    await expect(service.saveDraft(editor, page.id, { version: page.version, document: draft })).rejects.toBeInstanceOf(PageConflictError);

    const published = await service.publish(editor, page.id, { version: saved.version });
    expect(published).toMatchObject({ version: 3, status: "PUBLISHED", publishedVersion: 3 });
    expect(published.publishedContent).toEqual(draft);
    expect(revalidated).toEqual(["/"]);
    await expect(db.pageVersion.findMany({ where: { pageId: page.id }, orderBy: { version: "asc" } })).resolves.toEqual([
      expect.objectContaining({ version: 1, action: "CREATE", publishedAt: null }),
      expect.objectContaining({ version: 2, action: "SAVE", publishedAt: null }),
      expect.objectContaining({ version: 3, action: "PUBLISH", publishedAt: expect.any(Date) }),
    ]);
  });

  it("rolls historical content into a new draft without changing the live snapshot", async () => {
    const page = await service.create(editor, {
      name: "Home",
      slug: "home",
      pageType: "HOME",
      document: defaultHomepageDocument,
    });
    const changed = {
      ...defaultHomepageDocument,
      nodes: defaultHomepageDocument.nodes.map((node) => node.type === "FACTORY_STATS"
        ? { ...node, content: { ...(node.content as Record<string, unknown>), heading: "Changed factory heading" } }
        : node),
    };
    const saved = await service.saveDraft(editor, page.id, { version: 1, document: changed });
    const published = await service.publish(editor, page.id, { version: saved.version });

    const rolledBack = await service.rollback(editor, page.id, { version: published.version, targetVersion: 1 });

    expect(rolledBack).toMatchObject({ version: 4, status: "DRAFT" });
    expect(rolledBack.draftContent).toEqual(defaultHomepageDocument);
    expect(rolledBack.publishedContent).toEqual(changed);
    await expect(db.pageVersion.findFirstOrThrow({ where: { pageId: page.id, version: 4 } })).resolves.toMatchObject({ action: "ROLLBACK" });
    await expect(db.auditLog.findMany({ where: { entityType: "SitePage", entityId: page.id } })).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "page.create" }),
      expect.objectContaining({ action: "page.save" }),
      expect.objectContaining({ action: "page.publish" }),
      expect.objectContaining({ action: "page.rollback" }),
    ]));
  });

  it("returns a committed publication when cache invalidation fails", async () => {
    const page = await service.create(editor, { name: "Home", slug: "home", pageType: "HOME", document: defaultHomepageDocument });
    service = new PageService(db, async () => { throw new Error("cache unavailable"); });

    await expect(service.publish(editor, page.id, { version: page.version })).resolves.toMatchObject({ status: "PUBLISHED", version: 2 });
    await expect(db.sitePage.findUniqueOrThrow({ where: { id: page.id } })).resolves.toMatchObject({ status: "PUBLISHED", version: 2 });
  });
});
