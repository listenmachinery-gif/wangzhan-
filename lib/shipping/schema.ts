import { z } from "zod";

import { isIsoCountryCode } from "@/lib/shipping/countries";

export type ShippingMediaRole = "COVER" | "LOADING" | "EQUIPMENT" | "VIDEO";

export type ShippingBodyBlock =
  | { type: "HEADING"; text: string }
  | { type: "PARAGRAPH"; text: string }
  | { type: "LINK"; text: string; href: string };

export type ShippingMediaItem = {
  id: string;
  mediaAssetId: string;
  role: ShippingMediaRole;
  position: number;
  caption?: string;
  altText: string;
};

export type ShippingHighlightDocument = {
  title: string;
  summary: string;
  shipmentDate: string;
  countryCode: string;
  city?: string;
  categoryId?: string;
  categorySlug?: string;
  productId?: string;
  productSlug?: string;
  equipmentName: string;
  modelName?: string;
  quantity: number;
  containerMethod?: string;
  transportMode?: string;
  packagingMethod?: string;
  body: ShippingBodyBlock[];
  coverMediaId: string;
  media: ShippingMediaItem[];
  seoTitle: string;
  seoDescription: string;
};

export type ShippingPublicationAsset = {
  id: string;
  lifecycleStatus: string;
  mimeType: string;
};

const identifierSchema = z.string().trim().min(1).max(120);
const optionalText = (maximum: number) => z.string().trim().max(maximum).optional();
const slugSchema = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers, and hyphens only.");

function isSafeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\") && !/[\u0000-\u001F\u007F]/.test(href)) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

const hrefSchema = z.string().trim().min(1).max(500).refine(isSafeHref, "Links must use an internal path or HTTPS URL.");
const textBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("HEADING"), text: z.string().trim().min(1).max(160) }).strict(),
  z.object({ type: z.literal("PARAGRAPH"), text: z.string().trim().min(1).max(3000) }).strict(),
  z.object({ type: z.literal("LINK"), text: z.string().trim().min(1).max(160), href: hrefSchema }).strict(),
]);

const mediaSchema = z.object({
  id: identifierSchema,
  mediaAssetId: identifierSchema,
  role: z.enum(["COVER", "LOADING", "EQUIPMENT", "VIDEO"]),
  position: z.number().int().min(0).max(999),
  caption: optionalText(300),
  altText: z.string().trim().max(300),
}).strict();

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const shippingHighlightDocumentSchema: z.ZodType<ShippingHighlightDocument> = z.object({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(500),
  shipmentDate: z.string().trim().refine(isCalendarDate, "Shipment date must be a valid YYYY-MM-DD date."),
  countryCode: z.string().trim().transform((value) => value.toUpperCase()).refine(isIsoCountryCode, "Country code must be an assigned ISO alpha-2 code."),
  city: optionalText(120),
  categoryId: identifierSchema.optional(),
  categorySlug: slugSchema.optional(),
  productId: identifierSchema.optional(),
  productSlug: slugSchema.optional(),
  equipmentName: z.string().trim().min(1).max(160),
  modelName: optionalText(120),
  quantity: z.number().int().min(1).max(100000),
  containerMethod: optionalText(160),
  transportMode: optionalText(160),
  packagingMethod: optionalText(160),
  body: z.array(textBlockSchema).max(100),
  coverMediaId: z.string().trim().max(120),
  media: z.array(mediaSchema).max(100),
  seoTitle: z.string().trim().min(1).max(70),
  seoDescription: z.string().trim().min(1).max(320),
}).strict().superRefine((document, context) => {
  if (Boolean(document.categoryId) !== Boolean(document.categorySlug)) {
    context.addIssue({ code: "custom", path: ["categorySlug"], message: "Category id and slug must be supplied together." });
  }
  if (Boolean(document.productId) !== Boolean(document.productSlug)) {
    context.addIssue({ code: "custom", path: ["productSlug"], message: "Product id and slug must be supplied together." });
  }
  const identifiers = new Set<string>();
  const positions = new Set<number>();
  document.media.forEach((item, index) => {
    if (identifiers.has(item.id)) context.addIssue({ code: "custom", path: ["media", index, "id"], message: "Shipping media ids must be unique." });
    if (positions.has(item.position)) context.addIssue({ code: "custom", path: ["media", index, "position"], message: "Shipping media positions must be unique." });
    identifiers.add(item.id);
    positions.add(item.position);
  });
});

export function parseShippingHighlightDocument(raw: unknown) {
  return shippingHighlightDocumentSchema.parse(raw);
}

export function validateShippingPublication(document: ShippingHighlightDocument, assets: ShippingPublicationAsset[]) {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  const cover = document.media.find((item) => item.mediaAssetId === document.coverMediaId && item.role === "COVER");

  if (!document.coverMediaId || !cover) blockers.push("必须选择一项封面媒体，并把它标记为封面。");
  if (document.media.length === 0) blockers.push("至少需要一项真实媒体。");

  let usableMedia = 0;
  document.media.forEach((item, index) => {
    const asset = assetsById.get(item.mediaAssetId);
    if (!item.altText.trim()) blockers.push(`第 ${index + 1} 项媒体缺少 alt 替代文本。`);
    if (!asset || asset.lifecycleStatus !== "ACTIVE") {
      blockers.push(`第 ${index + 1} 项媒体不是有效媒体。`);
      return;
    }
    const matchesRole = item.role === "VIDEO" ? asset.mimeType.startsWith("video/") : asset.mimeType.startsWith("image/");
    if (!matchesRole) {
      blockers.push(`第 ${index + 1} 项媒体类型与角色不匹配。`);
      return;
    }
    usableMedia += 1;
  });

  if (usableMedia === 0 && document.media.length > 0) blockers.push("至少需要一项可公开使用的有效媒体。");
  if (document.seoTitle.length < 30 || document.seoTitle.length > 60) warnings.push("SEO 标题建议保持在 30–60 个字符。");
  if (document.seoDescription.length < 120 || document.seoDescription.length > 160) warnings.push("SEO 描述建议保持在 120–160 个字符。");

  return { blockers: [...new Set(blockers)], warnings: [...new Set(warnings)] };
}
