import { PublicationStatus } from "@prisma/client";
import { z } from "zod";

import { productModuleSchemas } from "@/lib/product-modules/schemas";
import { PRODUCT_MODULE_TYPES, type ProductModuleType } from "@/lib/product-modules/types";

const nonEmpty = z.string().trim().min(1);
const slug = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug.");
const optionalText = z.string().trim().min(1).max(10_000).nullable().optional();
const position = z.coerce.number().int().min(0).max(10_000);
const version = z.coerce.number().int().positive();

export const categoryCreateSchema = z.object({
  parentId: nonEmpty.nullable().optional(),
  name: nonEmpty.max(160),
  slug,
  summary: optionalText,
  description: optionalText,
  position: position.default(0),
}).strict();

export const categoryUpdateSchema = z.object({
  version,
  parentId: nonEmpty.nullable().optional(),
  name: nonEmpty.max(160).optional(),
  summary: optionalText,
  description: optionalText,
  position: position.optional(),
  status: z.enum(PublicationStatus).optional(),
}).strict();

export const productCreateSchema = z.object({
  categoryId: nonEmpty,
  name: nonEmpty.max(200),
  slug,
  summary: nonEmpty.max(2_000),
  description: optionalText,
  position: position.default(0),
  registeredWidget: nonEmpty.nullable().optional(),
}).strict();

export const productUpdateSchema = z.object({
  version,
  categoryId: nonEmpty.optional(),
  name: nonEmpty.max(200).optional(),
  summary: nonEmpty.max(2_000).optional(),
  description: optionalText,
  position: position.optional(),
  registeredWidget: nonEmpty.nullable().optional(),
}).strict();

const sectionSchema = z.object({
  type: z.enum(PRODUCT_MODULE_TYPES),
  position,
  visible: z.boolean(),
  content: z.unknown(),
  mediaAssetIds: z.array(nonEmpty).max(50).default([]),
}).strict().superRefine((section, context) => {
  const result = productModuleSchemas[section.type].safeParse(section.content);
  if (result.success) return;
  for (const issue of result.error.issues) {
    context.addIssue({
      code: "custom",
      path: ["content", ...issue.path],
      message: issue.message,
    });
  }
});

export const productSectionBatchSchema = z.object({
  version,
  sections: z.array(sectionSchema).max(PRODUCT_MODULE_TYPES.length),
}).strict().superRefine(({ sections }, context) => {
  const seenTypes = new Set<ProductModuleType>();
  const seenPositions = new Set<number>();
  sections.forEach((section, index) => {
    if (seenTypes.has(section.type)) {
      context.addIssue({ code: "custom", path: ["sections", index, "type"], message: "Module type must be unique." });
    }
    if (seenPositions.has(section.position)) {
      context.addIssue({ code: "custom", path: ["sections", index, "position"], message: "Module position must be unique." });
    }
    seenTypes.add(section.type);
    seenPositions.add(section.position);
  });
});

const optionalQuery = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  query: optionalQuery,
  status: z.enum(PublicationStatus).optional(),
  categoryId: optionalQuery,
}).strict();

export const categoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  query: optionalQuery,
  status: z.enum(PublicationStatus).optional(),
}).strict();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductSectionBatchInput = z.infer<typeof productSectionBatchSchema>;
