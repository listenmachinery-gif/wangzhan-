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
    return this.database.$transaction(async (transaction) => {
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
    const references = await this.database.mediaReference.findMany({
      where: { entityType: "ProductSection", entityId: { in: product.sections.map(({ id }) => id) } },
      select: { mediaAssetId: true, entityId: true },
    });
    return {
      ...product,
      sections: product.sections.map((section) => ({
        ...section,
        mediaAssetIds: references.filter(({ entityId }) => entityId === section.id).map(({ mediaAssetId }) => mediaAssetId),
      })),
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
      if (input.categoryId) {
        const category = await transaction.productCategory.count({ where: { id: input.categoryId } });
        if (!category) throw new ProductAdminValidationError("Product category does not exist.");
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
    if (result.after.status === "PUBLISHED") await this.revalidateProduct(result.after.slug, result.after.category.slug);
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

      const mediaIds = [...new Set(input.sections.flatMap(({ mediaAssetIds }) => mediaAssetIds))];
      if (mediaIds.length) {
        const activeMedia = await transaction.mediaAsset.count({
          where: { id: { in: mediaIds }, lifecycleStatus: "ACTIVE" },
        });
        if (activeMedia !== mediaIds.length) throw new ProductAdminValidationError("One or more referenced media assets do not exist.");
      }

      const oldSectionIds = product.sections.map(({ id }) => id);
      if (oldSectionIds.length) {
        await transaction.mediaReference.deleteMany({
          where: { entityType: "ProductSection", entityId: { in: oldSectionIds } },
        });
      }
      await transaction.productSection.deleteMany({ where: { productId } });
      for (const section of input.sections) {
        const created = await transaction.productSection.create({
          data: {
            productId,
            type: section.type,
            position: section.position,
            visible: section.visible,
            content: section.content as Prisma.InputJsonValue,
          },
        });
        if (section.mediaAssetIds.length) {
          await transaction.mediaReference.createMany({
            data: section.mediaAssetIds.map((mediaAssetId) => ({
              mediaAssetId,
              entityType: "ProductSection",
              entityId: created.id,
              field: "content",
            })),
          });
        }
      }

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
    if (result.after.status === "PUBLISHED") await this.revalidateProduct(result.after.slug, result.categorySlug);
    return result.after;
  }

  async copyProduct(principal: Principal, productId: string, input: { name: string; slug: string }) {
    assertPermission(principal, "product.write");
    const source = await this.getProduct(principal, productId);
    const createInput = productCreateSchema.parse({
      categoryId: source.categoryId,
      name: input.name,
      slug: input.slug,
      summary: source.summary,
      description: source.description,
      position: source.position,
      registeredWidget: source.registeredWidget,
    });
    try {
      return await this.database.$transaction(async (transaction) => {
        const copy = await transaction.product.create({ data: { ...createInput, slugLocked: true } });
        for (const section of source.sections) {
          const created = await transaction.productSection.create({
            data: {
              productId: copy.id,
              type: section.type,
              position: section.position,
              visible: section.visible,
              content: section.content as Prisma.InputJsonValue,
            },
          });
          if (section.mediaAssetIds.length) await transaction.mediaReference.createMany({
            data: section.mediaAssetIds.map((mediaAssetId) => ({
              mediaAssetId,
              entityType: "ProductSection",
              entityId: created.id,
              field: "content",
            })),
          });
        }
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
      });
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
    await this.revalidateProduct(result.after.slug, result.categorySlug);
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

  private async revalidateProduct(slug: string, categorySlug: string) {
    await Promise.all([
      this.revalidate(`/products/${slug}`),
      this.revalidate(`/products/series/${categorySlug}`),
      this.revalidate("/products"),
      this.revalidate("/sitemap.xml"),
    ]);
  }
}
