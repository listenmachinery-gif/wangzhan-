import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { getComponentDefinition } from "@/lib/page-builder/registry";
import { pageDocumentSchema, type PageDocument, type PageNode } from "@/lib/page-builder/schema";

type Revalidate = (path: string) => void | Promise<void>;

export class PagePermissionError extends Error {}
export class PageNotFoundError extends Error {}
export class PageConflictError extends Error {}
export class PageValidationError extends Error {}

const pageCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  pageType: z.enum(["HOME", "ABOUT", "PRODUCT_INDEX", "CATEGORY", "PRODUCT", "FACTORY", "CASES", "NEWS", "CONTACT", "LANDING", "CUSTOM"]),
  document: z.unknown(),
}).strict();

const pageSaveSchema = z.object({
  version: z.number().int().positive(),
  name: z.string().trim().min(2).max(120).optional(),
  document: z.unknown(),
}).strict();

const versionSchema = z.object({ version: z.number().int().positive() }).strict();
const rollbackSchema = versionSchema.extend({ targetVersion: z.number().int().positive() }).strict();
const listSchema = z.object({ query: z.string().trim().max(120).optional(), status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional() }).strict();

function validateNode(node: PageNode) {
  const definition = getComponentDefinition(node.type);
  if (!definition) throw new PageValidationError(`Unsupported page component: ${node.type}`);
  const result = definition.contentSchema.safeParse(node.content);
  if (!result.success) throw new PageValidationError(`Invalid content for ${node.type}: ${result.error.message}`);
  node.children?.forEach(validateNode);
}

export function parsePageDocument(raw: unknown): PageDocument {
  const document = pageDocumentSchema.parse(raw);
  document.nodes.forEach(validateNode);
  return document;
}

function json(document: PageDocument) {
  return document as unknown as Prisma.InputJsonValue;
}

export function publicPathsForPageSlug(slug: string) {
  if (slug === "home") return ["/"];
  if (slug === "products") return ["/products"];
  if (slug.startsWith("product-") && slug.length > "product-".length) {
    return [`/products/${slug.slice("product-".length)}`, "/products"];
  }
  if (slug.startsWith("series-") && slug.length > "series-".length) {
    return [`/products/series/${slug.slice("series-".length)}`, "/products"];
  }
  return [`/${slug}`];
}

function uniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function isPageTransactionConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

function throwPageTransactionError(error: unknown): never {
  if (isPageTransactionConflict(error)) {
    throw new PageConflictError("Page changed concurrently. Reload before retrying.");
  }
  throw error;
}

export class PageService {
  constructor(private readonly database: PrismaClient = db, private readonly revalidate: Revalidate = revalidatePath) {}

  async list(principal: Principal, rawQuery: unknown = {}) {
    if (!can(principal, "page.read")) throw new PagePermissionError("Page read permission is required.");
    const query = listSchema.parse(rawQuery);
    return this.database.sitePage.findMany({
      where: {
        status: query.status,
        OR: query.query ? [{ name: { contains: query.query, mode: "insensitive" } }, { slug: { contains: query.query, mode: "insensitive" } }] : undefined,
      },
      select: { id: true, name: true, slug: true, pageType: true, status: true, version: true, publishedVersion: true, publishedAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async get(principal: Principal, id: string) {
    if (!can(principal, "page.read")) throw new PagePermissionError("Page read permission is required.");
    const page = await this.database.sitePage.findUnique({ where: { id } });
    if (!page) throw new PageNotFoundError("Page was not found.");
    return page;
  }

  async create(principal: Principal, rawInput: unknown) {
    if (!can(principal, "page.write")) throw new PagePermissionError("Page write permission is required.");
    const input = pageCreateSchema.parse(rawInput);
    const document = parsePageDocument(input.document);
    try {
      return await this.database.$transaction(async (transaction) => {
        const page = await transaction.sitePage.create({
          data: { name: input.name, slug: input.slug, pageType: input.pageType, draftContent: json(document) },
        });
        await transaction.pageVersion.create({ data: { pageId: page.id, version: 1, snapshot: json(document), action: "CREATE", createdById: principal.id } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "page.create", entityType: "SitePage", entityId: page.id, after: { slug: page.slug, version: page.version } } });
        return page;
      });
    } catch (error) {
      if (uniqueError(error)) throw new PageValidationError("A page with this slug already exists.");
      throw error;
    }
  }

  async saveDraft(principal: Principal, id: string, rawInput: unknown) {
    if (!can(principal, "page.write")) throw new PagePermissionError("Page write permission is required.");
    const input = pageSaveSchema.parse(rawInput);
    const document = parsePageDocument(input.document);
    try {
      return await this.database.$transaction(async (transaction) => {
      const current = await transaction.sitePage.findUnique({ where: { id } });
      if (!current) throw new PageNotFoundError("Page was not found.");
      const nextVersion = current.version + 1;
      const changed = await transaction.sitePage.updateMany({
        where: { id, version: input.version },
        data: { name: input.name, draftContent: json(document), status: "DRAFT", version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new PageConflictError("Page changed. Reload before saving.");
      await transaction.pageVersion.create({ data: { pageId: id, version: nextVersion, snapshot: json(document), action: "SAVE", createdById: principal.id } });
      const updated = await transaction.sitePage.findUniqueOrThrow({ where: { id } });
      await transaction.auditLog.create({ data: { actorId: principal.id, action: "page.save", entityType: "SitePage", entityId: id, before: { version: current.version }, after: { version: updated.version } } });
      return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      throwPageTransactionError(error);
    }
  }

  async publish(principal: Principal, id: string, rawInput: unknown) {
    if (!can(principal, "page.publish")) throw new PagePermissionError("Page publish permission is required.");
    const input = versionSchema.parse(rawInput);
    let page;
    try {
      page = await this.database.$transaction(async (transaction) => {
      const current = await transaction.sitePage.findUnique({ where: { id } });
      if (!current) throw new PageNotFoundError("Page was not found.");
      const document = parsePageDocument(current.draftContent);
      const nextVersion = current.version + 1;
      const publishedAt = new Date();
      const changed = await transaction.sitePage.updateMany({
        where: { id, version: input.version },
        data: { status: "PUBLISHED", publishedContent: json(document), publishedVersion: nextVersion, publishedAt, version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new PageConflictError("Page changed. Reload before publishing.");
      await transaction.pageVersion.create({ data: { pageId: id, version: nextVersion, snapshot: json(document), action: "PUBLISH", createdById: principal.id, publishedAt } });
      const updated = await transaction.sitePage.findUniqueOrThrow({ where: { id } });
      await transaction.auditLog.create({ data: { actorId: principal.id, action: "page.publish", entityType: "SitePage", entityId: id, before: { status: current.status, version: current.version }, after: { status: updated.status, version: updated.version, publishedVersion: updated.publishedVersion } } });
      return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      throwPageTransactionError(error);
    }
    try {
      await Promise.all(publicPathsForPageSlug(page.slug).map((path) => this.revalidate(path)));
    } catch (error) {
      console.error("Page published but cache invalidation failed", error instanceof Error ? error.message : "UnknownError");
    }
    return page;
  }

  async versions(principal: Principal, id: string) {
    if (!can(principal, "page.read")) throw new PagePermissionError("Page read permission is required.");
    const exists = await this.database.sitePage.count({ where: { id } });
    if (!exists) throw new PageNotFoundError("Page was not found.");
    return this.database.pageVersion.findMany({
      where: { pageId: id },
      select: { id: true, version: true, action: true, snapshot: true, createdAt: true, publishedAt: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { version: "desc" },
    });
  }

  async rollback(principal: Principal, id: string, rawInput: unknown) {
    if (!can(principal, "page.write")) throw new PagePermissionError("Page write permission is required.");
    const input = rollbackSchema.parse(rawInput);
    try {
      return await this.database.$transaction(async (transaction) => {
      const [current, target] = await Promise.all([
        transaction.sitePage.findUnique({ where: { id } }),
        transaction.pageVersion.findUnique({ where: { pageId_version: { pageId: id, version: input.targetVersion } } }),
      ]);
      if (!current || !target) throw new PageNotFoundError("Page or target version was not found.");
      const document = parsePageDocument(target.snapshot);
      const nextVersion = current.version + 1;
      const changed = await transaction.sitePage.updateMany({
        where: { id, version: input.version },
        data: { draftContent: json(document), status: "DRAFT", version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new PageConflictError("Page changed. Reload before rolling back.");
      await transaction.pageVersion.create({ data: { pageId: id, version: nextVersion, snapshot: json(document), action: "ROLLBACK", createdById: principal.id } });
      const updated = await transaction.sitePage.findUniqueOrThrow({ where: { id } });
      await transaction.auditLog.create({ data: { actorId: principal.id, action: "page.rollback", entityType: "SitePage", entityId: id, before: { version: current.version }, after: { version: updated.version, targetVersion: input.targetVersion } } });
      return updated;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      throwPageTransactionError(error);
    }
  }
}
