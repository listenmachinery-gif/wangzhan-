import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";

import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { validateModule } from "@/lib/product-modules/schemas";
import {
  productModelBatchSchema,
  isReservedSpecificationFieldName,
  specificationTemplateSchema,
  type ProductModelBatchInput,
  type SpecificationTemplateInput,
} from "@/lib/validation/specifications";

type Revalidate = (path: string) => void | Promise<void>;

export class SpecificationPermissionError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "SpecificationPermissionError";
  }
}

export class SpecificationNotFoundError extends Error {
  constructor(entity: "product" | "template") {
    super(`${entity} was not found.`);
    this.name = "SpecificationNotFoundError";
  }
}

export class SpecificationConflictError extends Error {
  constructor() {
    super("The product has changed. Reload before saving specifications.");
    this.name = "SpecificationConflictError";
  }
}

export class SpecificationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpecificationValidationError";
  }
}

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new SpecificationPermissionError(permission);
}

export class SpecificationService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly revalidate: Revalidate = revalidatePath,
  ) {}

  async listTemplates(principal: Principal, categoryId?: string) {
    assertPermission(principal, "specification.read");
    return this.database.specificationTemplate.findMany({
      where: categoryId ? { OR: [{ categoryId }, { categoryId: null }] } : undefined,
      include: { fields: { orderBy: { position: "asc" } }, category: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  }

  async createTemplate(principal: Principal, rawInput: SpecificationTemplateInput) {
    assertPermission(principal, "specification.write");
    const input = specificationTemplateSchema.parse(rawInput);
    try {
      return await this.database.$transaction(async (transaction) => {
        if (input.categoryId) {
          const category = await transaction.productCategory.count({ where: { id: input.categoryId } });
          if (!category) throw new SpecificationValidationError("Template category does not exist.");
        }
        const duplicate = await transaction.specificationTemplate.findFirst({
          where: { categoryId: input.categoryId ?? null, name: { equals: input.name, mode: "insensitive" } },
          select: { id: true },
        });
        if (duplicate) throw new SpecificationValidationError("A template with this name already exists in the selected scope.");
        const template = await transaction.specificationTemplate.create({
          data: {
            name: input.name,
            categoryId: input.categoryId,
            fields: {
              create: input.fields.map((field) => ({
                name: field.name,
                unit: field.unit,
                valueType: field.valueType,
                position: field.position,
              })),
            },
          },
          include: { fields: { orderBy: { position: "asc" } } },
        });
        await transaction.auditLog.create({
          data: {
            actorId: principal.id,
            action: "specification.template.create",
            entityType: "SpecificationTemplate",
            entityId: template.id,
            after: { name: template.name, categoryId: template.categoryId, fieldCount: template.fields.length },
          },
        });
        return template;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SpecificationValidationError("A template or field with this name/order already exists.");
      }
      throw error;
    }
  }

  async getProductGrid(principal: Principal, productId: string) {
    assertPermission(principal, "specification.read");
    const product = await this.database.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        models: {
          orderBy: { position: "asc" },
          include: { values: true },
        },
      },
    });
    if (!product) throw new SpecificationNotFoundError("product");
    const valueFieldIds = [...new Set(product.models.flatMap((model) => model.values.map((value) => value.fieldId)))];
    const template = valueFieldIds.length ? await this.database.specificationTemplate.findFirst({
      where: { fields: { some: { id: { in: valueFieldIds } } } },
      include: { fields: { orderBy: { position: "asc" } } },
    }) : null;
    return { product, template };
  }

  async saveModels(principal: Principal, productId: string, rawInput: ProductModelBatchInput) {
    assertPermission(principal, "specification.write");
    const input = productModelBatchSchema.parse(rawInput);
    const result = await this.database.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { id: true, slug: true } },
          sections: { where: { type: "TECHNICAL" }, take: 1 },
          models: { select: { id: true } },
        },
      });
      if (!product) throw new SpecificationNotFoundError("product");
      if (product.version !== input.version) throw new SpecificationConflictError();
      if (product.status === "PUBLISHED") assertPermission(principal, "specification.publish");

      const template = await transaction.specificationTemplate.findUnique({
        where: { id: input.templateId },
        include: { fields: { orderBy: { position: "asc" } } },
      });
      if (!template) throw new SpecificationNotFoundError("template");
      if (template.categoryId && template.categoryId !== product.category.id) {
        throw new SpecificationValidationError("Template category does not match the product category.");
      }
      if (template.fields.some(({ name }) => isReservedSpecificationFieldName(name))) {
        throw new SpecificationValidationError("Template fields cannot use Model, SKU, or Active because those columns are managed by the system.");
      }
      const fieldIds = new Set(template.fields.map(({ id }) => id));
      for (const [modelIndex, model] of input.models.entries()) {
        const valueIds = Object.keys(model.values);
        if (valueIds.length !== fieldIds.size || valueIds.some((fieldId) => !fieldIds.has(fieldId))) {
          throw new SpecificationValidationError(`Model row ${modelIndex + 1} must provide every template field exactly once.`);
        }
        template.fields.forEach((field) => {
          const value = model.values[field.id];
          if (field.valueType === "NUMBER" && !Number.isFinite(Number(value))) {
            throw new SpecificationValidationError(`${field.name} must be numeric in row ${modelIndex + 1}.`);
          }
        });
      }

      await transaction.productModel.deleteMany({ where: { productId } });
      for (const model of input.models) {
        const created = await transaction.productModel.create({
          data: {
            productId,
            name: model.name,
            sku: model.sku,
            position: model.position,
            active: model.active,
          },
        });
        await transaction.specificationValue.createMany({
          data: template.fields.map((field) => ({ modelId: created.id, fieldId: field.id, value: model.values[field.id] })),
        });
      }

      const technical = product.sections[0];
      if (!technical) throw new SpecificationValidationError("Add a TECHNICAL module before saving model parameters.");
      const current = technical.content as Prisma.JsonObject;
      const activeModels = input.models.filter(({ active }) => active);
      const includeSku = activeModels.some(({ sku }) => Boolean(sku));
      const content = validateModule("TECHNICAL", {
        ...current,
        columns: [
          { key: "__model", label: "Model" },
          ...(includeSku ? [{ key: "__sku", label: "SKU" }] : []),
          ...template.fields.map((field) => ({
          key: field.id,
          label: field.name,
          ...(field.unit ? { unit: field.unit } : {}),
          })),
        ],
        rows: activeModels.map((model) => ({
          __model: model.name,
          ...(includeSku ? { __sku: model.sku ?? "—" } : {}),
          ...model.values,
        })),
      });
      await transaction.productSection.update({
        where: { id: technical.id },
        data: { content: content as Prisma.InputJsonValue, version: { increment: 1 } },
      });
      const updated = await transaction.product.updateMany({
        where: { id: productId, version: input.version },
        data: { version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new SpecificationConflictError();
      const after = await transaction.product.findUniqueOrThrow({ where: { id: productId } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "specification.models.update",
          entityType: "Product",
          entityId: productId,
          before: { modelCount: product.models.length, version: product.version },
          after: { modelCount: input.models.length, templateId: template.id, version: after.version },
        },
      });
      return { after, categorySlug: product.category.slug };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result.after.status === "PUBLISHED") await Promise.all([
      this.revalidate(`/products/${result.after.slug}`),
      this.revalidate(`/products/series/${result.categorySlug}`),
      this.revalidate("/products"),
    ]);
    return result.after;
  }
}
