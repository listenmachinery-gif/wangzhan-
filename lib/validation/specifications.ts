import { z } from "zod";

const nonEmpty = z.string().trim().min(1);
const position = z.coerce.number().int().min(0).max(10_000);
const RESERVED_FIELD_NAMES = new Set(["model", "sku", "active"]);

export function isReservedSpecificationFieldName(name: string) {
  return RESERVED_FIELD_NAMES.has(name.trim().toLocaleLowerCase());
}

const specificationFieldSchema = z.object({
  id: nonEmpty.optional(),
  name: nonEmpty.max(160),
  unit: z.string().trim().min(1).max(40).nullable().optional(),
  valueType: z.enum(["TEXT", "NUMBER"]).default("TEXT"),
  position,
}).strict();

export const specificationTemplateSchema = z.object({
  id: nonEmpty.optional(),
  name: nonEmpty.max(160),
  categoryId: nonEmpty.nullable().optional(),
  fields: z.array(specificationFieldSchema).min(1).max(100),
}).strict().superRefine(({ fields }, context) => {
  const names = new Set<string>();
  const positions = new Set<number>();
  fields.forEach((field, index) => {
    const nameKey = field.name.toLocaleLowerCase();
    if (isReservedSpecificationFieldName(field.name)) context.addIssue({ code: "custom", path: ["fields", index, "name"], message: "Field name is reserved for system model identity." });
    if (names.has(nameKey)) context.addIssue({ code: "custom", path: ["fields", index, "name"], message: "Field name must be unique." });
    if (positions.has(field.position)) context.addIssue({ code: "custom", path: ["fields", index, "position"], message: "Field position must be unique." });
    names.add(nameKey);
    positions.add(field.position);
  });
});

const productModelSchema = z.object({
  id: nonEmpty.optional(),
  name: nonEmpty.max(160),
  sku: z.string().trim().min(1).max(160).nullable().optional(),
  position,
  active: z.boolean().default(true),
  values: z.record(nonEmpty, nonEmpty.max(2_000)),
}).strict();

export const productModelBatchSchema = z.object({
  version: z.coerce.number().int().positive(),
  templateId: nonEmpty,
  models: z.array(productModelSchema).min(1).max(1_000),
}).strict().superRefine(({ models }, context) => {
  const names = new Set<string>();
  const positions = new Set<number>();
  models.forEach((model, index) => {
    const nameKey = model.name.toLocaleLowerCase();
    if (names.has(nameKey)) context.addIssue({ code: "custom", path: ["models", index, "name"], message: "Model name must be unique." });
    if (positions.has(model.position)) context.addIssue({ code: "custom", path: ["models", index, "position"], message: "Model position must be unique." });
    names.add(nameKey);
    positions.add(model.position);
  });
});

export function escapeSpreadsheetFormula(value: string) {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

export type SpecificationTemplateInput = z.infer<typeof specificationTemplateSchema>;
export type ProductModelBatchInput = z.infer<typeof productModelBatchSchema>;
