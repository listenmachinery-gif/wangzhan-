import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { publishProduct as publishValidatedProduct } from "@/lib/services/publication-service";
import {
  categoryCreateSchema,
  categoryListQuerySchema,
  categoryUpdateSchema,
  productCreateSchema,
  productListQuerySchema,
  productSectionBatchSchema,
  productUpdateSchema,
  type CategoryCreateInput,
  type CategoryUpdateInput,
  type ProductCreateInput,
  type ProductSectionBatchInput,
  type ProductUpdateInput,
} from "@/lib/validation/products";

type Revalidate = (path: string) => void | Promise<void>;

export class ProductAdminPermissionError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "ProductAdminPermissionError";
  }
}

export class ProductAdminNotFoundError extends Error {
  constructor(entity: "category" | "product") {
    super(`${entity} was not found.`);
    this.name = "ProductAdminNotFoundError";
  }
}

export class ProductAdminConflictError extends Error {
  constructor() {
    super("The record has changed. Reload it before saving again.");
    this.name = "ProductAdminConflictError";
  }
}

export class ProductAdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductAdminValidationError";
  }
}

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new ProductAdminPermissionError(permission);
}

function isUniqueConstraint(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

type MediaPointer = { id?: string; objectKey?: string; field: string };

function mediaPointers(value: unknown, path: Array<string | number> = []): MediaPointer[] {
  if (typeof value === "string") {
    const match = value.match(/^\/api\/media\/([^/?#]+)$/);
    if (match) return [{ id: decodeURIComponent(match[1]), field: path.join(".") }];
    if (value.startsWith("/") && !value.startsWith("//")) return [{ objectKey: value.replace(/^\//, ""), field: path.join(".") }];
    return [];
  }
  if (Array.isArray(value)) return value.flatMap((item, index) => mediaPointers(item, [...path, index]));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, item]) => mediaPointers(item, [...path, key]));
  return [];
}

function equalSets(left: string[], right: string[]) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export class ProductAdminService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly revalidate: Revalidate = revalidatePath,
  ) {}

  async listCategories(principal: Principal, rawQuery: unknown) {
    assertPermission(principal, "category.read");
    const query = categoryListQuerySchema.parse(rawQuery);
    const where: Prisma.ProductCategoryWhereInput = {
      status: query.status,
      OR: query.query ? [
        { name: { contains: query.query, mode: "insensitive" } },
        { slug: { contains: query.query, mode: "insensitive" } },
      ] : undefined,
    };
    const [items, total] = await this.database.$transaction([
      this.database.productCategory.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.productCategory.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async createCategory(principal: Principal, rawInput: CategoryCreateInput) {
    assertPermission(principal, "category.write");
    const input = categoryCreateSchema.parse(rawInput);
    try {
      return await this.database.$transaction(async (transaction) => {
        if (input.parentId) {
          const parent = await transaction.productCategory.count({ where: { id: input.parentId } });
          if (!parent) throw new ProductAdminValidationError("Parent category does not exist.");
        }
        const category = await transaction.productCategory.create({ data: input });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "category.create",
            entityType: "ProductCategory",
            entityId: category.id,
            after: { name: category.name, slug: category.slug, status: category.status },
          },
        });
        return category;
      });
    } catch (error) {
      if (isUniqueConstraint(error)) throw new ProductAdminValidationError("Category slug is already in use.");
      throw error;
    }
  }

  async updateCategory(principal: Principal, categoryId: string, rawInput: CategoryUpdateInput) {
    const input = categoryUpdateSchema.parse(rawInput);
    assertPermission(principal, input.status ? "category.publish" : "category.write");
    const result = await this.database.$transaction(async (transaction) => {
      const before = await transaction.productCategory.findUnique({ where: { id: categoryId } });
      if (!before) throw new ProductAdminNotFoundError("category");
      if (input.parentId === categoryId) throw new ProductAdminValidationError("A category cannot be its own parent.");
      if (input.parentId) {
        const parent = await transaction.productCategory.count({ where: { id: input.parentId } });
        if (!parent) throw new ProductAdminValidationError("Parent category does not exist.");
      }
      const { version, status, ...changes } = input;
      const result = await transaction.productCategory.updateMany({
        where: { id: categoryId, version },
        data: {
          ...changes,
          status,
          publishedAt: status === "PUBLISHED" ? before.publishedAt ?? new Date() : status ? null : undefined,
          archivedAt: status === "ARCHIVED" ? new Date() : status ? null : undefined,
          version: { increment: 1 },
        },
      });
      if (result.count !== 1) throw new ProductAdminConflictError();
      const after = await transaction.productCategory.findUniqueOrThrow({ where: { id: categoryId } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: status ? "category.status" : "category.update",
          entityType: "ProductCategory",
          entityId: categoryId,
          before: { name: before.name, status: before.status, version: before.version },
          after: { name: after.name, status: after.status, version: after.version },
        },
      });
      return after;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    const publishedProducts = await this.database.product.findMany({
      where: { categoryId, status: "PUBLISHED" },
      select: { slug: true },
    });
    await Promise.all([
      this.revalidate(`/products/series/${result.slug}`),
      this.revalidate("/products"),
      this.revalidate("/sitemap.xml"),
      ...publishedProducts.map(({ slug: productSlug }) => this.revalidate(`/products/${productSlug}`)),
    ]);
    return result;
  }

  async listProducts(principal: Principal, rawQuery: unknown) {
    assertPermission(principal, "product.read");
    const query = productListQuerySchema.parse(rawQuery);
    const where: Prisma.ProductWhereInput = {
      status: query.status,
      categoryId: query.categoryId,
      OR: query.query ? [
        { name: { contains: query.query, mode: "insensitive" } },
        { slug: { contains: query.query, mode: "insensitive" } },
        { summary: { contains: query.query, mode: "insensitive" } },
      ] : undefined,
    };
    const [items, total] = await this.database.$transaction([
      this.database.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { sections: true, models: true } },
        },
        orderBy: [{ position: "asc" }, { name: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.product.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getProduct(principal: Principal, productId: string) {
    assertPermission(principal, "product.read");
    const product = await this.database.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        sections: { orderBy: { position: "asc" } },
      },
    });
    if (!product) throw new ProductAdminNotFoundError("product");
    return {
      ...product,
      sections: product.sections.map((section) => ({ ...section, mediaAssetIds: mediaPointers(section.content).flatMap(({ id }) => id ? [id] : []) })),
    };
  }

  async createProduct(principal: Principal, rawInput: ProductCreateInput) {
    assertPermission(principal, "product.write");
    const input = productCreateSchema.parse(rawInput);
    try {
      return await this.database.$transaction(async (transaction) => {
        const category = await transaction.productCategory.count({ where: { id: input.categoryId } });
        if (!category) throw new ProductAdminValidationError("Product category does not exist.");
        const product = await transaction.product.create({ data: { ...input, slugLocked: true } });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "product.create",
            entityType: "Product",
            entityId: product.id,
            after: { name: product.name, slug: product.slug, status: product.status },
          },
        });
        return product;
      });
    } catch (error) {
      if (isUniqueConstraint(error)) throw new ProductAdminValidationError("Product slug is already in use.");
      throw error;
    }
  }

  async updateProduct(principal: Principal, productId: string, rawInput: ProductUpdateInput) {
    assertPermission(principal, "product.write");
    const input = productUpdateSchema.parse(rawInput);
    const result = await this.database.$transaction(async (transaction) => {
      const before = await transaction.product.findUnique({
        where: { id: productId },
        include: { category: { select: { slug: true } } },
      });
      if (!before) throw new ProductAdminNotFoundError("product");
      if (before.status === "PUBLISHED") assertPermission(principal, "product.publish");
      if (input.categoryId) {
        const category = await transaction.productCategory.findUnique({ where: { id: input.categoryId } });
        if (!category) throw new ProductAdminValidationError("Product category does not exist.");
        if (before.status === "PUBLISHED" && (category.status !== "PUBLISHED" || !category.publishedAt)) {
          throw new ProductAdminValidationError("Published products require a published category.");
        }
      }
      const { version, ...changes } = input;
      const updated = await transaction.product.updateMany({
        where: { id: productId, version },
        data: { ...changes, version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ProductAdminConflictError();
      const after = await transaction.product.findUniqueOrThrow({
        where: { id: productId },
        include: { category: { select: { slug: true } } },
      });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "product.update",
          entityType: "Product",
          entityId: productId,
          before: { name: before.name, categoryId: before.categoryId, version: before.version },
          after: { name: after.name, categoryId: after.categoryId, version: after.version },
        },
      });
      return { before, after };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.after.status === "PUBLISHED") {
      await this.revalidateProduct(result.after.slug, [result.before.category.slug, result.after.category.slug]);
    }
    return result.after;
  }

  async saveSections(principal: Principal, productId: string, rawInput: ProductSectionBatchInput) {
    assertPermission(principal, "product.write");
    const input = productSectionBatchSchema.parse(rawInput);
    const result = await this.database.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({
        where: { id: productId },
        include: { category: { select: { slug: true } }, sections: { select: { id: true } } },
      });
      if (!product) throw new ProductAdminNotFoundError("product");
      if (product.version !== input.version) throw new ProductAdminConflictError();
      if (product.status === "PUBLISHED") {
        assertPermission(principal, "product.publish");
        if (!input.sections.some((section) => section.type === "HERO" && section.visible)) {
          throw new ProductAdminValidationError("A visible HERO module is required for published products.");
        }
      }

      const pointers = input.sections.flatMap((section) => mediaPointers(section.content).map((pointer) => ({ ...pointer, type: section.type })));
      const mediaIds = pointers.flatMap(({ id }) => id ? [id] : []);
      const submittedIds = input.sections.flatMap(({ mediaAssetIds }) => mediaAssetIds);
      if (!equalSets(mediaIds, submittedIds)) {
        throw new ProductAdminValidationError("Module media IDs must match /api/media/{id} content URLs.");
      }
      const objectKeys = pointers.flatMap(({ objectKey }) => objectKey ? [objectKey] : []);
      const assets = pointers.length ? await transaction.mediaAsset.findMany({
        where: {
          lifecycleStatus: "ACTIVE",
          OR: [
            ...(mediaIds.length ? [{ id: { in: mediaIds } }] : []),
            ...(objectKeys.length ? [{ objectKey: { in: objectKeys } }] : []),
          ],
        },
        select: { id: true, objectKey: true },
      }) : [];
      if (mediaIds.some((id) => !assets.some((asset) => asset.id === id))) {
        throw new ProductAdminValidationError("One or more referenced media assets do not exist.");
      }
      await transaction.mediaReference.deleteMany({ where: { entityType: "Product", entityId: productId } });
      await transaction.productSection.deleteMany({ where: { productId } });
      for (const section of input.sections) {
        await transaction.productSection.create({
          data: {
            productId,
            type: section.type,
            position: section.position,
            visible: section.visible,
            content: section.content as Prisma.InputJsonValue,
          },
        });
      }
      const references = pointers.flatMap((pointer) => {
        const asset = pointer.id
          ? assets.find((item) => item.id === pointer.id)
          : assets.find((item) => item.objectKey === pointer.objectKey);
        return asset ? [{
          mediaAssetId: asset.id,
          entityType: "Product",
          entityId: productId,
          field: `admin:${pointer.type}:${pointer.field}`,
        }] : [];
      });
      if (references.length) await transaction.mediaReference.createMany({ data: references, skipDuplicates: true });

      const updated = await transaction.product.updateMany({
        where: { id: productId, version: input.version },
        data: { version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ProductAdminConflictError();
      const after = await transaction.product.findUniqueOrThrow({ where: { id: productId } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "product.sections.update",
          entityType: "Product",
          entityId: productId,
          before: { sectionCount: product.sections.length, version: product.version },
          after: { sectionCount: input.sections.length, version: after.version },
        },
      });
      return { after, categorySlug: product.category.slug };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.after.status === "PUBLISHED") await this.revalidateProduct(result.after.slug, [result.categorySlug]);
    return result.after;
  }

  async copyProduct(principal: Principal, productId: string, input: { name: string; slug: string; expectedVersion: number }) {
    assertPermission(principal, "product.write");
    if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
      throw new ProductAdminValidationError("A valid source version is required.");
    }
    try {
      return await this.database.$transaction(async (transaction) => {
        const source = await transaction.product.findUnique({
          where: { id: productId },
          include: { sections: { orderBy: { position: "asc" } } },
        });
        if (!source) throw new ProductAdminNotFoundError("product");
        if (source.version !== input.expectedVersion) throw new ProductAdminConflictError();
        const createInput = productCreateSchema.parse({
          categoryId: source.categoryId,
          name: input.name,
          slug: input.slug,
          summary: source.summary,
          description: source.description,
          position: source.position,
          registeredWidget: source.registeredWidget,
        });
        const copy = await transaction.product.create({ data: { ...createInput, slugLocked: true } });
        for (const section of source.sections) {
          await transaction.productSection.create({
            data: {
              productId: copy.id,
              type: section.type,
              position: section.position,
              visible: section.visible,
              content: section.content as Prisma.InputJsonValue,
            },
          });
        }
        const sourceReferences = await transaction.mediaReference.findMany({
          where: { entityType: "Product", entityId: source.id },
          select: { mediaAssetId: true, field: true },
        });
        if (sourceReferences.length) await transaction.mediaReference.createMany({
          data: sourceReferences.map((reference) => ({ ...reference, entityType: "Product", entityId: copy.id })),
          skipDuplicates: true,
        });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "product.copy",
            entityType: "Product",
            entityId: copy.id,
            before: { sourceProductId: source.id },
            after: { slug: copy.slug, status: copy.status },
          },
        });
        return copy;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (isUniqueConstraint(error)) throw new ProductAdminValidationError("Product slug is already in use.");
      throw error;
    }
  }

  async archiveProduct(principal: Principal, productId: string, expectedVersion: number) {
    assertPermission(principal, "product.publish");
    const result = await this.database.$transaction(async (transaction) => {
      const before = await transaction.product.findUnique({
        where: { id: productId },
        include: { category: { select: { slug: true } } },
      });
      if (!before) throw new ProductAdminNotFoundError("product");
      const updated = await transaction.product.updateMany({
        where: { id: productId, version: expectedVersion },
        data: { status: "ARCHIVED", archivedAt: new Date(), publishedAt: null, version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ProductAdminConflictError();
      const after = await transaction.product.findUniqueOrThrow({ where: { id: productId } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "product.archive",
          entityType: "Product",
          entityId: productId,
          before: { status: before.status, version: before.version },
          after: { status: after.status, version: after.version },
        },
      });
      return { after, categorySlug: before.category.slug };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await this.revalidateProduct(result.after.slug, [result.categorySlug]);
    return result.after;
  }

  async publishProduct(principal: Principal, productId: string, expectedVersion: number) {
    assertPermission(principal, "product.publish");
    try {
      return await publishValidatedProduct({
        database: this.database,
        productId,
        expectedVersion,
        actorId: principal.id,
        revalidate: this.revalidate,
      });
    } catch (error) {
      if (error instanceof Error && /version conflict/i.test(error.message)) throw new ProductAdminConflictError();
      if (error instanceof Error && /not found/i.test(error.message)) throw new ProductAdminNotFoundError("product");
      if (error instanceof Error) throw new ProductAdminValidationError(error.message);
      throw error;
    }
  }

  private async revalidateProduct(slug: string, categorySlugs: string[]) {
    await Promise.all([
      this.revalidate(`/products/${slug}`),
      ...[...new Set(categorySlugs)].map((categorySlug) => this.revalidate(`/products/series/${categorySlug}`)),
      this.revalidate("/products"),
      this.revalidate("/sitemap.xml"),
    ]);
  }
}
