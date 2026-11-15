import { z } from "zod";

const required = z.string().trim().min(1);
const nullable = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().min(1).max(maximum).nullable().optional(),
);

const pathname = required.max(500).refine((value) => {
  if (value !== "/" && value.endsWith("/")) return false;
  if (value.startsWith("/admin") || value.startsWith("/api") || value.startsWith("/_next")) return false;
  return /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/.test(value);
}, "Use an exact, lowercase public pathname without a trailing slash.");

const canonical = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(2_000).refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes("?") && !value.includes("#")) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:"
        && ["zyroncnc.com", "www.zyroncnc.com"].includes(url.hostname)
        && !url.username
        && !url.password
        && !url.port
        && !url.search
        && !url.hash;
    } catch {
      return false;
    }
  }, "Canonical URL must be a site path or an HTTPS zyroncnc.com URL.").nullable().optional(),
);

const fields = {
  title: required.max(70),
  description: required.max(320),
  canonicalUrl: canonical,
  openGraphTitle: nullable(70),
  openGraphDescription: nullable(320),
  openGraphMediaId: nullable(200),
  robotsIndex: z.boolean().default(true),
  targetKeyword: nullable(160),
};

export const seoCreateSchema = z.object({
  pathname,
  productId: required.max(200).nullable().optional(),
  ...fields,
}).strict();

export const seoUpdateSchema = z.object(fields).partial().extend({
  version: z.coerce.number().int().positive(),
}).strict();

export const seoPublishSchema = z.object({ version: z.coerce.number().int().positive() }).strict();

export const seoListQuerySchema = z.object({
  query: z.string().trim().max(200).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
}).strict();

export type SeoCreateInput = z.input<typeof seoCreateSchema>;
export type SeoUpdateInput = z.input<typeof seoUpdateSchema>;
