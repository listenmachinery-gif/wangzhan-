import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import { getPublishedNavigation } from "@/lib/repositories/navigation-repository";
import {
  NavigationConflictError,
  NavigationPermissionError,
  NavigationService,
} from "@/lib/services/navigation-service";

describe("NavigationService", () => {
  let editor: Principal;
  let sales: Principal;
  let revalidated: string[];
  let service: NavigationService;

  beforeEach(async () => {
    await resetTestDatabase();
    const [editorUser, salesUser] = await Promise.all([
      db.user.create({ data: { email: "navigation-editor@zyron.test", name: "Navigation Editor", passwordHash: "test" } }),
      db.user.create({ data: { email: "navigation-sales@zyron.test", name: "Navigation Sales", passwordHash: "test" } }),
    ]);
    editor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["CONTENT_EDITOR"] };
    sales = { id: salesUser.id, email: salesUser.email, name: salesUser.name, roles: ["SALES"] };
    revalidated = [];
    service = new NavigationService(db, (path) => { revalidated.push(path); });
  });

  afterAll(() => db.$disconnect());

  it("enforces permissions and returns a virtual default draft without writing on read", async () => {
    await expect(service.get(sales)).rejects.toBeInstanceOf(NavigationPermissionError);
    await expect(service.saveDraft(sales, { version: 0, document: DEFAULT_NAVIGATION })).rejects.toBeInstanceOf(NavigationPermissionError);

    await expect(service.get(editor)).resolves.toMatchObject({
      id: null,
      key: "PRIMARY",
      status: "DRAFT",
      version: 0,
      draftContent: DEFAULT_NAVIGATION,
      publishedContent: null,
    });
    await expect(db.navigationDocument.count()).resolves.toBe(0);
  });

  it("creates immutable versions and keeps draft edits isolated from the published snapshot", async () => {
    const firstDraft = structuredClone(DEFAULT_NAVIGATION);
    firstDraft.primary[0].label = "START";
    const created = await service.saveDraft(editor, { version: 0, document: firstDraft });
    expect(created).toMatchObject({ key: "PRIMARY", status: "DRAFT", version: 1, publishedContent: null });

    const published = await service.publish(editor, { version: created.version });
    expect(published).toMatchObject({ status: "PUBLISHED", version: 2, publishedVersion: 2 });
    await expect(getPublishedNavigation(db)).resolves.toEqual(firstDraft);
    expect(revalidated).toEqual(["/", "/products", "/factory", "/news", "/shipping-highlights", "/contact"]);

    const secondDraft = structuredClone(firstDraft);
    secondDraft.primary[0].label = "DRAFT ONLY";
    const saved = await service.saveDraft(editor, { version: published.version, document: secondDraft });
    expect(saved).toMatchObject({ status: "DRAFT", version: 3 });
    expect(saved.publishedContent).toEqual(firstDraft);
    await expect(getPublishedNavigation(db)).resolves.toEqual(firstDraft);
    await expect(service.saveDraft(editor, { version: published.version, document: secondDraft })).rejects.toBeInstanceOf(NavigationConflictError);

    const rolledBack = await service.rollback(editor, { version: saved.version, targetVersion: 1 });
    expect(rolledBack).toMatchObject({ status: "DRAFT", version: 4 });
    expect(rolledBack.draftContent).toEqual(firstDraft);
    expect(rolledBack.publishedContent).toEqual(firstDraft);
    await expect(getPublishedNavigation(db)).resolves.toEqual(firstDraft);

    await expect(db.navigationVersion.findMany({ orderBy: { version: "asc" } })).resolves.toEqual([
      expect.objectContaining({ version: 1, action: "CREATE", publishedAt: null }),
      expect.objectContaining({ version: 2, action: "PUBLISH", publishedAt: expect.any(Date) }),
      expect.objectContaining({ version: 3, action: "SAVE", publishedAt: null }),
      expect.objectContaining({ version: 4, action: "ROLLBACK", publishedAt: null }),
    ]);
    await expect(db.auditLog.findMany({ where: { entityType: "NavigationDocument" } })).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "navigation.create" }),
      expect.objectContaining({ action: "navigation.publish" }),
      expect.objectContaining({ action: "navigation.save" }),
      expect.objectContaining({ action: "navigation.rollback" }),
    ]));
  });

  it("returns a committed publication when cache invalidation fails", async () => {
    const created = await service.saveDraft(editor, { version: 0, document: DEFAULT_NAVIGATION });
    service = new NavigationService(db, async () => { throw new Error("cache unavailable"); });

    await expect(service.publish(editor, { version: created.version })).resolves.toMatchObject({
      status: "PUBLISHED",
      version: 2,
    });
    await expect(db.navigationDocument.findUniqueOrThrow({ where: { key: "PRIMARY" } })).resolves.toMatchObject({
      status: "PUBLISHED",
      version: 2,
    });
  });
});
