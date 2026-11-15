import { z } from "zod";

import type { ProductModuleType } from "@/lib/product-modules/types";

const nonEmpty = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const editorialSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  paragraphs: z.array(nonEmpty).min(1),
}).strict();

const gallerySchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  paragraphs: z.array(nonEmpty).optional(),
  items: z.array(z.object({
    image: nonEmpty,
    alt: nonEmpty,
    title: nonEmpty,
    text: optionalText,
    label: optionalText,
  }).strict()).min(1),
}).strict();

const cardCollectionSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  paragraphs: z.array(nonEmpty).optional(),
  items: z.array(z.object({
    title: nonEmpty,
    text: nonEmpty,
    image: optionalText,
    alt: optionalText,
  }).strict()).min(1),
}).strict();

const comparisonSchema = z.object({
  eyebrow: nonEmpty,
  title: nonEmpty,
  paragraphs: z.array(nonEmpty).min(1),
  columns: z.array(nonEmpty).min(2),
  rows: z.array(z.object({ label: nonEmpty, values: z.array(nonEmpty).min(1) }).strict()).min(1),
}).strict();

export const productModuleSchemas = {
  HERO: z.object({
    eyebrow: nonEmpty,
    title: nonEmpty,
    subtitle: optionalText,
    intro: optionalText,
    images: z.object({
      desktop: nonEmpty,
      tablet: optionalText,
      mobile: optionalText,
      alt: nonEmpty,
    }).strict(),
    badges: z.array(nonEmpty).optional(),
    valuePoints: z.array(nonEmpty).optional(),
    primaryCta: z.object({ label: nonEmpty, href: nonEmpty }).strict(),
    secondaryCta: z.object({ label: nonEmpty, href: nonEmpty }).strict().optional(),
  }).strict(),
  OVERVIEW: editorialSchema,
  PRODUCT_SHOWCASE: gallerySchema,
  DETAIL_GALLERY: gallerySchema,
  OPTION_CAROUSEL: gallerySchema,
  MATERIAL_GALLERY: gallerySchema,
  PROBLEMS: cardCollectionSchema,
  SOLUTION: editorialSchema.extend({ fit: z.array(nonEmpty).optional() }).strict(),
  PROCESS: cardCollectionSchema,
  APPLICATIONS: cardCollectionSchema,
  MATERIAL_GUIDANCE: editorialSchema.extend({ materials: z.array(nonEmpty).min(1), note: nonEmpty }).strict(),
  ADVANTAGES: cardCollectionSchema,
  STRUCTURE: cardCollectionSchema,
  TECHNICAL: editorialSchema.extend({
    columns: z.array(z.object({ key: nonEmpty, label: nonEmpty, unit: optionalText }).strict()).min(1),
    rows: z.array(z.record(z.string(), nonEmpty)).min(1),
  }).strict().superRefine(({ columns, rows }, context) => {
    const columnKeys = new Set<string>();
    columns.forEach((column, index) => {
      if (columnKeys.has(column.key)) context.addIssue({ code: "custom", path: ["columns", index, "key"], message: "Technical column keys must be unique." });
      columnKeys.add(column.key);
    });
    rows.forEach((row, rowIndex) => {
      const rowKeys = Object.keys(row);
      if (rowKeys.length !== columnKeys.size || rowKeys.some((key) => !columnKeys.has(key))) {
        context.addIssue({ code: "custom", path: ["rows", rowIndex], message: "Technical row keys must match the declared columns." });
      }
    });
  }),
  MODEL_CARDS: editorialSchema.extend({
    items: z.array(z.object({
      name: nonEmpty,
      description: optionalText,
      specs: z.array(z.object({ label: nonEmpty, value: nonEmpty, unit: optionalText }).strict()).min(1),
    }).strict()).min(1),
  }).strict(),
  INDUSTRY_GALLERY: gallerySchema,
  MODEL_GUIDE: editorialSchema,
  COMPARISON: comparisonSchema,
  ENERGY_COMPARISON: comparisonSchema,
  WORKFLOW: cardCollectionSchema,
  MANUFACTURER_SUPPORT: cardCollectionSchema,
  FAQ: editorialSchema.extend({
    items: z.array(z.object({ question: nonEmpty, answer: nonEmpty }).strict()).min(1),
  }).strict(),
  RELATED_LINKS: editorialSchema.extend({
    items: z.array(z.object({ label: nonEmpty, href: nonEmpty, description: optionalText }).strict()).min(1),
  }).strict(),
  CTA: editorialSchema.extend({
    primaryCta: z.object({ label: nonEmpty, href: nonEmpty }).strict(),
    secondaryCta: z.object({ label: nonEmpty, href: nonEmpty }).strict().optional(),
    requiredInfo: z.array(nonEmpty).optional(),
  }).strict(),
} satisfies Record<ProductModuleType, z.ZodType>;

export function validateModule<T extends ProductModuleType>(type: T, data: unknown) {
  return productModuleSchemas[type].parse(data);
}
