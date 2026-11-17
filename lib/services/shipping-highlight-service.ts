import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import {
  parseShippingHighlightDocument,
  type ShippingHighlightDocument,
  type ShippingPublicationAsset,
  validateShippingPublication,
} from "@/lib/shipping/schema";

type Revalidate = (path: string) => void | Promise<void>;
type Transaction = Prisma.TransactionClient;

export class ShippingPermissionError extends Error {}
export class ShippingNotFoundError extends Error {}
export class ShippingConflictError extends Error {}
export class ShippingValidationError extends Error {
  constructor(message: string, readonly details: string[] = []) {
    super(message);
  }
}

const slugSchema = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const createSchema = z.object({ slug: slugSchema, document: z.unknown() }).strict();
const saveSchema = z.object({ version: z.number().int().positive(), slug: slugSchema.optional(), document: z.unknown() }).strict();
const versionSchema = z.object({ version: z.number().int().positive() }).strict();
const rollbackSchema = versionSchema.extend({ targetVersion: z.number().int().positive() }).strict();
const listSchema = z.object({
  query: z.string().trim().max(160).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  categoryId: z.string().trim().min(1).max(120).optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
}).strict();

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new ShippingPermissionError(`Missing required permission: ${permission}`);
}

function json(document: ShippingHighlightDocument) {
  return document as unknown as Prisma.InputJsonValue;
}

function parseDocument(raw: unknown) {
  try {
    return parseShippingHighlightDocument(raw);
  } catch (error) {
    if (error instanceof ZodError) throw new ShippingValidationError("发货内容格式不正确。", error.issues.map((issue) => issue.message));
    throw error;
  }
}

export function isShippingTransactionConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function throwTransactionError(error: unknown): never {
  if (isShippingTransactionConflict(error)) throw new ShippingConflictError("发货内容发生并发更新，请刷新后重试。");
  if (isUniqueConflict(error)) throw new ShippingValidationError("发货 Slug 或版本已存在，请使用其他值。");
  throw error;
}

async function validateDocumentReferences(transaction: Transaction, document: ShippingHighlightDocument, publication: boolean) {
  if (document.categoryId && document.categorySlug) {
    const category = await transaction.productCategory.findUnique({ where: { id: document.categoryId } });
    if (!category || category.slug !== document.categorySlug) throw new ShippingValidationError("所选产品分类不存在或 Slug 不匹配。");
    if (publication && (category.status !== "PUBLISHED" || !category.publishedAt)) throw new ShippingValidationError("所选产品分类尚未发布。");
  }

  if (document.productId && document.productSlug) {
    const product = await transaction.product.findUnique({ where: { id: document.productId } });
    if (!product || product.slug !== document.productSlug) throw new ShippingValidationError("所选产品不存在或 Slug 不匹配。");
    if (document.categoryId && product.categoryId !== document.categoryId) throw new ShippingValidationError("所选产品不属于当前分类。");
    if (publication && (product.status !== "PUBLISHED" || !product.publishedAt)) throw new ShippingValidationError("所选产品尚未发布。");
  }

  const assetIds = [...new Set(document.media.map((item) => item.mediaAssetId))];
  const assets = assetIds.length === 0 ? [] : await transaction.mediaAsset.findMany({
    where: { id: { in: assetIds } },
    select: { id: true, lifecycleStatus: true, mimeType: true },
  });
  if (assets.length !== assetIds.length) throw new ShippingValidationError("发货内容引用了不存在的媒体资源。");

  if (publication) {
    const quality = validateShippingPublication(document, assets as ShippingPublicationAsset[]);
    if (quality.blockers.length > 0) throw new ShippingValidationError("发货内容尚未达到发布要求。", quality.blockers);
  }
  return assets;
}

async function syncDraftMedia(transaction: Transaction, highlightId: string, document: ShippingHighlightDocument) {
  await transaction.shippingMedia.deleteMany({ where: { shippingHighlightId: highlightId } });
  if (document.media.length > 0) {
    await transaction.shippingMedia.createMany({
      data: document.media.map((item) => ({
        shippingHighlightId: highlightId,
        mediaAssetId: item.mediaAssetId,
        role: item.role,
        position: item.position,
        caption: item.caption,
        altText: item.altText,
      })),
    });
  }
  await syncMediaReferences(transaction, "ShippingHighlightDraft", highlightId, document);
}

async function syncMediaReferences(transaction: Transaction, entityType: string, entityId: string, document: ShippingHighlightDocument) {
  await transaction.mediaReference.deleteMany({ where: { entityType, entityId } });
  if (document.media.length > 0) {
    await transaction.mediaReference.createMany({
      data: document.media.map((item) => ({
        mediaAssetId: item.mediaAssetId,
        entityType,
        entityId,
        field: `media:${item.id}`,
      })),
    });
  }
}

function publicationPaths(slug: string) {
  return ["/", "/shipping-highlights", `/shipping-highlights/${slug}`];
}

export class ShippingHighlightService {
  constructor(private readonly database: PrismaClient = db, private readonly revalidate: Revalidate = revalidatePath) {}

  async list(principal: Principal, rawQuery: unknown = {}) {
    assertPermission(principal, "shipping.read");
    const query = listSchema.parse(rawQuery);
    const start = query.dateFrom ? new Date(`${query.dateFrom}T00:00:00.000Z`) : undefined;
    const end = query.dateTo ? new Date(`${query.dateTo}T23:59:59.999Z`) : undefined;
    return this.database.shippingHighlight.findMany({
      where: {
        status: query.status,
        categoryId: query.categoryId,
        publishedCountryCode: query.countryCode,
        publishedShipmentDate: start || end ? { gte: start, lte: end } : undefined,
        OR: query.query ? [
          { slug: { contains: query.query, mode: "insensitive" } },
          { draftContent: { path: ["title"], string_contains: query.query } },
        ] : undefined,
      },
      select: {
        id: true, slug: true, status: true, version: true, publishedVersion: true, publishedAt: true,
        publishedShipmentDate: true, publishedCountryCode: true, publishedCategorySlug: true,
        categoryId: true, productId: true, coverMediaId: true, draftContent: true, updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async get(principal: Principal, id: string) {
    assertPermission(principal, "shipping.read");
    const highlight = await this.database.shippingHighlight.findUnique({ where: { id }, include: { media: { orderBy: { position: "asc" } } } });
    if (!highlight) throw new ShippingNotFoundError("发货内容不存在。");
    return highlight;
  }

  async create(principal: Principal, rawInput: unknown) {
    assertPermission(principal, "shipping.write");
    const input = createSchema.parse(rawInput);
    const document = parseDocument(input.document);
    try {
      return await this.database.$transaction(async (transaction) => {
        await validateDocumentReferences(transaction, document, false);
        const created = await transaction.shippingHighlight.create({
          data: {
            slug: input.slug,
            draftContent: json(document),
            categoryId: document.categoryId,
            productId: document.productId,
            coverMediaId: document.coverMediaId || null,
          },
        });
        await syncDraftMedia(transaction, created.id, document);
        await transaction.shippingHighlightVersion.create({ data: { shippingHighlightId: created.id, version: 1, snapshot: json(document), action: "CREATE", createdById: principal.id } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "shipping.create", entityType: "ShippingHighlight", entityId: created.id, after: { slug: created.slug, version: created.version } } });
        return transaction.shippingHighlight.findUniqueOrThrow({ where: { id: created.id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof ShippingValidationError) throw error;
      throwTransactionError(error);
    }
  }

  async saveDraft(principal: Principal, id: string, rawInput: unknown) {
    assertPermission(principal, "shipping.write");
    const input = saveSchema.parse(rawInput);
    const document = parseDocument(input.document);
    try {
      return await this.database.$transaction(async (transaction) => {
        const current = await transaction.shippingHighlight.findUnique({ where: { id } });
        if (!current) throw new ShippingNotFoundError("发货内容不存在。");
        await validateDocumentReferences(transaction, document, false);
        const nextVersion = current.version + 1;
        const nextSlug = current.slugLocked ? current.slug : input.slug ?? current.slug;
        const changed = await transaction.shippingHighlight.updateMany({
          where: { id, version: input.version },
          data: {
            slug: nextSlug,
            draftContent: json(document),
            status: "DRAFT",
            categoryId: document.categoryId ?? null,
            productId: document.productId ?? null,
            coverMediaId: document.coverMediaId || null,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ShippingConflictError("发货内容已更新，请刷新后再保存。");
        await syncDraftMedia(transaction, id, document);
        await transaction.shippingHighlightVersion.create({ data: { shippingHighlightId: id, version: nextVersion, snapshot: json(document), action: "SAVE", createdById: principal.id } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "shipping.save", entityType: "ShippingHighlight", entityId: id, before: { version: current.version }, after: { version: nextVersion, slug: nextSlug } } });
        return transaction.shippingHighlight.findUniqueOrThrow({ where: { id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof ShippingConflictError || error instanceof ShippingNotFoundError || error instanceof ShippingValidationError) throw error;
      throwTransactionError(error);
    }
  }

  async publish(principal: Principal, id: string, rawInput: unknown) {
    assertPermission(principal, "shipping.publish");
    const input = versionSchema.parse(rawInput);
    let published;
    try {
      published = await this.database.$transaction(async (transaction) => {
        const current = await transaction.shippingHighlight.findUnique({ where: { id } });
        if (!current) throw new ShippingNotFoundError("发货内容不存在。");
        const document = parseDocument(current.draftContent);
        await validateDocumentReferences(transaction, document, true);
        const nextVersion = current.version + 1;
        const publishedAt = new Date();
        const changed = await transaction.shippingHighlight.updateMany({
          where: { id, version: input.version },
          data: {
            status: "PUBLISHED",
            slugLocked: true,
            publishedContent: json(document),
            publishedVersion: nextVersion,
            publishedAt,
            publishedShipmentDate: new Date(`${document.shipmentDate}T00:00:00.000Z`),
            publishedCountryCode: document.countryCode,
            publishedCategorySlug: document.categorySlug ?? null,
            categoryId: document.categoryId ?? null,
            productId: document.productId ?? null,
            coverMediaId: document.coverMediaId,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ShippingConflictError("发货内容已更新，请刷新后再发布。");
        await syncMediaReferences(transaction, "ShippingHighlightPublished", id, document);
        await transaction.shippingHighlightVersion.create({ data: { shippingHighlightId: id, version: nextVersion, snapshot: json(document), action: "PUBLISH", createdById: principal.id, publishedAt } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "shipping.publish", entityType: "ShippingHighlight", entityId: id, before: { status: current.status, version: current.version }, after: { status: "PUBLISHED", version: nextVersion } } });
        return transaction.shippingHighlight.findUniqueOrThrow({ where: { id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof ShippingConflictError || error instanceof ShippingNotFoundError || error instanceof ShippingValidationError) throw error;
      throwTransactionError(error);
    }
    await this.revalidatePublication(published.slug);
    return published;
  }

  async archive(principal: Principal, id: string, rawInput: unknown) {
    assertPermission(principal, "shipping.publish");
    const input = versionSchema.parse(rawInput);
    let archived;
    try {
      archived = await this.database.$transaction(async (transaction) => {
        const current = await transaction.shippingHighlight.findUnique({ where: { id } });
        if (!current) throw new ShippingNotFoundError("发货内容不存在。");
        const document = parseDocument(current.draftContent);
        const nextVersion = current.version + 1;
        const changed = await transaction.shippingHighlight.updateMany({ where: { id, version: input.version }, data: { status: "ARCHIVED", version: { increment: 1 } } });
        if (changed.count !== 1) throw new ShippingConflictError("发货内容已更新，请刷新后再归档。");
        await transaction.shippingHighlightVersion.create({ data: { shippingHighlightId: id, version: nextVersion, snapshot: json(document), action: "ARCHIVE", createdById: principal.id } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "shipping.archive", entityType: "ShippingHighlight", entityId: id, before: { status: current.status, version: current.version }, after: { status: "ARCHIVED", version: nextVersion } } });
        return transaction.shippingHighlight.findUniqueOrThrow({ where: { id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof ShippingConflictError || error instanceof ShippingNotFoundError || error instanceof ShippingValidationError) throw error;
      throwTransactionError(error);
    }
    await this.revalidatePublication(archived.slug);
    return archived;
  }

  async versions(principal: Principal, id: string) {
    assertPermission(principal, "shipping.read");
    if (!await this.database.shippingHighlight.count({ where: { id } })) throw new ShippingNotFoundError("发货内容不存在。");
    return this.database.shippingHighlightVersion.findMany({
      where: { shippingHighlightId: id },
      select: { id: true, version: true, snapshot: true, action: true, createdAt: true, publishedAt: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { version: "desc" },
    });
  }

  async rollback(principal: Principal, id: string, rawInput: unknown) {
    assertPermission(principal, "shipping.write");
    const input = rollbackSchema.parse(rawInput);
    try {
      return await this.database.$transaction(async (transaction) => {
        const [current, target] = await Promise.all([
          transaction.shippingHighlight.findUnique({ where: { id } }),
          transaction.shippingHighlightVersion.findUnique({ where: { shippingHighlightId_version: { shippingHighlightId: id, version: input.targetVersion } } }),
        ]);
        if (!current || !target) throw new ShippingNotFoundError("发货内容或历史版本不存在。");
        const document = parseDocument(target.snapshot);
        await validateDocumentReferences(transaction, document, false);
        const nextVersion = current.version + 1;
        const changed = await transaction.shippingHighlight.updateMany({
          where: { id, version: input.version },
          data: { draftContent: json(document), status: "DRAFT", categoryId: document.categoryId ?? null, productId: document.productId ?? null, coverMediaId: document.coverMediaId || null, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ShippingConflictError("发货内容已更新，请刷新后再回滚。");
        await syncDraftMedia(transaction, id, document);
        await transaction.shippingHighlightVersion.create({ data: { shippingHighlightId: id, version: nextVersion, snapshot: json(document), action: "ROLLBACK", createdById: principal.id } });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "shipping.rollback", entityType: "ShippingHighlight", entityId: id, before: { version: current.version }, after: { version: nextVersion, targetVersion: input.targetVersion } } });
        return transaction.shippingHighlight.findUniqueOrThrow({ where: { id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof ShippingConflictError || error instanceof ShippingNotFoundError || error instanceof ShippingValidationError) throw error;
      throwTransactionError(error);
    }
  }

  private async revalidatePublication(slug: string) {
    for (const path of publicationPaths(slug)) {
      try {
        await this.revalidate(path);
      } catch (error) {
        console.error("Shipping highlight committed but cache invalidation failed", path, error instanceof Error ? error.message : "UnknownError");
      }
    }
  }
}
