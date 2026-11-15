import { z } from "zod";

export const mediaMetadataSchema = z.object({
  altText: z.string().trim().max(300).nullable().optional(),
  category: z.string().trim().max(80).nullable().optional(),
  usage: z.enum(["EDITORIAL_IMAGE", "DECORATIVE_IMAGE", "DOCUMENT", "VIDEO"]),
});

export const mediaListQuerySchema = z.object({
  query: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const mediaUpdateSchema = z.object({
  altText: z.string().trim().min(1).max(300).nullable().optional(),
  category: z.string().trim().max(80).nullable().optional(),
});
