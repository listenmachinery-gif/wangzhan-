import { z } from "zod";

const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).max(5_000).nullable().optional();
const optionalMediaId = requiredText.nullable().optional();
const optionalDate = z.preprocess(
  (value) => value === "" || value === null ? null : value,
  z.coerce.date().nullable().optional(),
);
const safeUrl = z.string().trim().min(1).max(2_000).refine(
  (value) => {
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
    try {
      const url = new URL(value);
      return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
    } catch {
      return false;
    }
  },
  "Use a site-relative path or an HTTP(S) URL.",
);

const bannerFields = {
  name: requiredText.max(160),
  title: requiredText.max(240),
  subtitle: optionalText,
  buttonText: z.string().trim().min(1).max(80).nullable().optional(),
  buttonUrl: safeUrl.nullable().optional(),
  textColor: z.string().trim().regex(/^#[0-9a-f]{6}$/i, "Use a six-digit hex color.").nullable().optional(),
  textPosition: z.enum(["LEFT", "CENTER", "RIGHT"]).nullable().optional(),
  maskOpacity: z.coerce.number().int().min(0).max(100).nullable().optional(),
  desktopMediaId: requiredText,
  tabletMediaId: optionalMediaId,
  mobileMediaId: optionalMediaId,
  enabled: z.boolean(),
  position: z.coerce.number().int().min(0).max(10_000),
  startsAt: optionalDate,
  endsAt: optionalDate,
};

function validateBannerRelationships(
  input: { buttonText?: string | null; buttonUrl?: string | null; startsAt?: Date | null; endsAt?: Date | null },
  context: z.RefinementCtx,
) {
  if (Boolean(input.buttonText) !== Boolean(input.buttonUrl)) {
    context.addIssue({ code: "custom", path: [input.buttonText ? "buttonUrl" : "buttonText"], message: "CTA text and URL must be provided together." });
  }
  if (input.startsAt && input.endsAt && input.startsAt >= input.endsAt) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "End time must be after start time." });
  }
}

export const bannerCreateSchema = z.object({
  ...bannerFields,
  enabled: bannerFields.enabled.default(true),
  position: bannerFields.position.default(0),
}).strict().superRefine(validateBannerRelationships);

export const bannerUpdateSchema = z.object(bannerFields)
  .partial()
  .extend({ version: z.coerce.number().int().positive() })
  .strict();

export const bannerPublishSchema = z.object({ version: z.coerce.number().int().positive() }).strict();

export type BannerCreateInput = z.input<typeof bannerCreateSchema>;
export type BannerUpdateInput = z.input<typeof bannerUpdateSchema>;
