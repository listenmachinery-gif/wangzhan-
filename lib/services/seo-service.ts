import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { seoCreateSchema, seoListQuerySchema, seoPublishSchema, seoUpdateSchema } from "@/lib/validation/seo";

type Revalidate = (path: string) => void | Promise<void>;

export class SeoPermissionError extends Error {}
export class SeoNotFoundError extends Error {}
export class SeoConflictError extends Error {}
export class SeoValidationError extends Error {}

function uniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export class SeoService {
  constructor(private readonly database: PrismaClient = db, private readonly revalidate: Revalidate = revalidatePath) {}

  async list(principal: Principal, rawQuery: unknown = {}) {
    if (!can(principal, "seo.read")) throw new SeoPermissionError("SEO read permission is required.");
    const query = seoListQuerySchema.parse(rawQuery);
    return this.database.seoRecord.findMany({
      where: {
        status: query.status,
        OR: query.query ? [
          { pathname: { contains: query.query, mode: "insensitive" } },
          { title: { contains: query.query, mode: "insensitive" } },
        ] : undefined,
      },
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { pathname: "asc" },
    });
  }

  async get(principal: Principal, id: string) {
    if (!can(principal, "seo.read")) throw new SeoPermissionError("SEO read permission is required.");
    const record = await this.database.seoRecord.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        openGraphMedia: { select: { id: true, originalName: true, altText: true, mimeType: true } },
      },
    });
    if (!record) throw new SeoNotFoundError("SEO record was not found.");
    return record;
  }

  private async assertWriteScope(principal: Principal, pathname: string, productId?: string | null) {
    const productMatch = /^\/products\/([^/]+)$/.exec(pathname);
    if (productMatch) {
      if (!productId || !can(principal, "seo.write.product")) {
        throw new SeoPermissionError("Product SEO write permission is required.");
      }
      const product = await this.database.product.findUnique({ where: { id: productId }, select: { slug: true } });
      if (!product || product.slug !== productMatch[1]) {
        throw new SeoValidationError("Product SEO pathname must match the existing product URL.");
      }
      return;
    }
    if (productId) throw new SeoValidationError("A product can only be linked to its exact product pathname.");
    if (!can(principal, "seo.write.global")) throw new SeoPermissionError("Global SEO write permission is required.");
    const supportedGlobalPaths = new Set(["/", "/products", "/factory", "/cases", "/news", "/contact"]);
    if (supportedGlobalPaths.has(pathname)) return;
    const seriesMatch = /^\/products\/series\/([^/]+)$/.exec(pathname);
    if (seriesMatch) {
      const category = await this.database.productCategory.findUnique({ where: { slug: seriesMatch[1] }, select: { id: true } });
      if (category) return;
    }
    throw new SeoValidationError("This pathname does not have a database-backed SEO integration.");
  }

  private async assertMedia(mediaId: string) {
    const count = await this.database.mediaAsset.count({ where: { id: mediaId, lifecycleStatus: "ACTIVE", mimeType: { startsWith: "image/" } } });
    if (!count) throw new SeoValidationError("Open Graph media must be an active image.");
  }

  private async warnings(title: string, description: string, excludeId?: string) {
    const matches = await this.database.seoRecord.findMany({
      where: { id: excludeId ? { not: excludeId } : undefined, OR: [{ title }, { description }] },
      select: { title: true, description: true },
    });
    return [
      ...(matches.some((item) => item.title === title) ? ["DUPLICATE_TITLE" as const] : []),
      ...(matches.some((item) => item.description === description) ? ["DUPLICATE_DESCRIPTION" as const] : []),
    ];
  }

  async create(principal: Principal, rawInput: unknown) {
    const input = seoCreateSchema.parse(rawInput);
    await this.assertWriteScope(principal, input.pathname, input.productId);
    if (input.openGraphMediaId) await this.assertMedia(input.openGraphMediaId);
    try {
      const record = await this.database.$transaction(async (transaction) => {
        const created = await transaction.seoRecord.create({ data: input });
        await transaction.auditLog.create({ data: { actorId: principal.id, action: "seo.create", entityType: "SeoRecord", entityId: created.id, after: { pathname: created.pathname, version: created.version } } });
        return created;
      });
      return { record, warnings: await this.warnings(record.title, record.description, record.id) };
    } catch (error) {
      if (uniqueError(error)) throw new SeoValidationError("An SEO record already exists for this pathname.");
      throw error;
    }
  }

  async update(principal: Principal, id: string, rawInput: unknown) {
    const input = seoUpdateSchema.parse(rawInput);
    const current = await this.database.seoRecord.findUnique({ where: { id } });
    if (!current) throw new SeoNotFoundError("SEO record was not found.");
    await this.assertWriteScope(principal, current.pathname, current.productId);
    if (input.openGraphMediaId) await this.assertMedia(input.openGraphMediaId);
    const { version, ...changes } = input;
    const record = await this.database.$transaction(async (transaction) => {
      const changed = await transaction.seoRecord.updateMany({ where: { id, version }, data: { ...changes, version: { increment: 1 } } });
      if (changed.count !== 1) throw new SeoConflictError("SEO record changed. Reload before saving.");
      const updated = await transaction.seoRecord.findUniqueOrThrow({ where: { id } });
      await transaction.auditLog.create({ data: { actorId: principal.id, action: "seo.update", entityType: "SeoRecord", entityId: id, before: { version: current.version, robotsIndex: current.robotsIndex }, after: { version: updated.version, robotsIndex: updated.robotsIndex } } });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { record, warnings: await this.warnings(record.title, record.description, record.id) };
  }

  async publish(principal: Principal, id: string, rawInput: unknown) {
    if (!can(principal, "seo.publish")) throw new SeoPermissionError("SEO publish permission is required.");
    const input = seoPublishSchema.parse(rawInput);
    const record = await this.database.$transaction(async (transaction) => {
      const current = await transaction.seoRecord.findUnique({ where: { id } });
      if (!current) throw new SeoNotFoundError("SEO record was not found.");
      await this.assertWriteScope(principal, current.pathname, current.productId);
      const changed = await transaction.seoRecord.updateMany({ where: { id, version: input.version }, data: { status: "PUBLISHED", publishedAt: new Date(), version: { increment: 1 } } });
      if (changed.count !== 1) throw new SeoConflictError("SEO record changed. Reload before publishing.");
      const updated = await transaction.seoRecord.findUniqueOrThrow({ where: { id } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "seo.publish",
          entityType: "SeoRecord",
          entityId: id,
          before: { status: current.status, version: current.version },
          after: {
            pathname: updated.pathname,
            productId: updated.productId,
            title: updated.title,
            description: updated.description,
            canonicalUrl: updated.canonicalUrl,
            openGraphTitle: updated.openGraphTitle,
            openGraphDescription: updated.openGraphDescription,
            openGraphMediaId: updated.openGraphMediaId,
            robotsIndex: updated.robotsIndex,
            targetKeyword: updated.targetKeyword,
            status: updated.status,
            version: updated.version,
          },
        },
      });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await Promise.all([this.revalidate(record.pathname), this.revalidate("/sitemap.xml")]);
    return record;
  }
}
