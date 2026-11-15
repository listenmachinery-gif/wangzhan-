import { z } from "zod";

import {
  SMALL_ELECTRIC_SHEAR_BACKGAUGES,
  SMALL_ELECTRIC_SHEAR_MATERIALS,
  recommendSmallElectricShear,
} from "@/data/small-electric-shear-selector";

export const MAX_INQUIRY_BODY_BYTES = 16_384;

export class MalformedInquiryJsonError extends Error {
  constructor() {
    super("Invalid inquiry data.");
    this.name = "MalformedInquiryJsonError";
  }
}

export class InquiryPayloadTooLargeError extends Error {
  constructor() {
    super("Inquiry data is too large.");
    this.name = "InquiryPayloadTooLargeError";
  }
}

const normalizedText = (maximum: number) => z.string().trim().min(1).max(maximum);
const optionalText = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).max(maximum).optional(),
);
const normalizedPhone = z.preprocess(
  (value) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value,
  z.string().min(1).max(80).optional(),
);
const email = z.string().trim().toLowerCase().email().max(254);

const sharedFields = {
  email,
  whatsapp: normalizedPhone,
  phone: normalizedPhone,
  destinationCountry: optionalText(100),
  country: optionalText(100),
  sourcePage: optionalText(2_000),
  website: z.string().trim().max(200).default(""),
};

const standardInquirySchema = z.object({
  ...sharedFields,
  inquiryType: z.literal("standard").optional(),
  name: normalizedText(160),
  company: optionalText(200),
  productInterest: optionalText(200),
  material: optionalText(200),
  thicknessRange: optionalText(100),
  workingLength: optionalText(100),
  targetOutput: optionalText(100),
  requirement: normalizedText(10_000),
}).strict();

const selectorInquirySchema = z.object({
  ...sharedFields,
  inquiryType: z.literal("small-electric-shear-selector"),
  material: z.enum(SMALL_ELECTRIC_SHEAR_MATERIALS),
  cuttingThickness: z.coerce.number().positive().max(100),
  cuttingWidth: z.coerce.number().positive().max(20_000),
  recommendedModel: optionalText(160),
  backgauge: z.enum(SMALL_ELECTRIC_SHEAR_BACKGAUGES),
}).strict();

export type NormalizedInquiry = {
  kind: "STANDARD" | "SMALL_ELECTRIC_SHEAR_SELECTOR";
  name: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  productInterest: string | null;
  material: string | null;
  thickness: string | null;
  workingLength: string | null;
  quantity: string | null;
  message: string;
  sourcePage: string | null;
  website: string;
  recommendedModel: string | null;
  backgauge: string | null;
};

function nullable(value: string | undefined) {
  return value ?? null;
}

export function parseInquiryPayload(payload: unknown): NormalizedInquiry {
  const selectorResult = selectorInquirySchema.safeParse(payload);
  if (selectorResult.success) {
    const input = selectorResult.data;
    const recommendation = recommendSmallElectricShear(
      input.material,
      input.cuttingThickness,
      input.cuttingWidth,
    );
    const recommendedModel = recommendation?.model ?? "Custom selection required";
    return {
      kind: "SMALL_ELECTRIC_SHEAR_SELECTOR",
      name: null,
      company: null,
      email: input.email,
      phone: nullable(input.phone),
      whatsapp: nullable(input.whatsapp),
      country: nullable(input.country ?? input.destinationCountry),
      productInterest: "Small Electric Shearing Machine",
      material: input.material,
      thickness: `${input.cuttingThickness} mm`,
      workingLength: `${input.cuttingWidth} mm`,
      quantity: null,
      message: [
        "Small electric shear model selection",
        `Material: ${input.material}`,
        `Cutting thickness: ${input.cuttingThickness} mm`,
        `Cutting width: ${input.cuttingWidth} mm`,
        `Recommended model: ${recommendedModel}`,
        `Backgauge: ${input.backgauge}`,
      ].join("\n"),
      sourcePage: nullable(input.sourcePage),
      website: input.website,
      recommendedModel,
      backgauge: input.backgauge,
    };
  }

  const input = standardInquirySchema.parse(payload);
  return {
    kind: "STANDARD",
    name: input.name,
    company: nullable(input.company),
    email: input.email,
    phone: nullable(input.phone),
    whatsapp: nullable(input.whatsapp),
    country: nullable(input.country ?? input.destinationCountry),
    productInterest: nullable(input.productInterest),
    material: nullable(input.material),
    thickness: nullable(input.thicknessRange),
    workingLength: nullable(input.workingLength),
    quantity: nullable(input.targetOutput),
    message: input.requirement,
    sourcePage: nullable(input.sourcePage),
    website: input.website,
    recommendedModel: null,
    backgauge: null,
  };
}

export function hasInquiryHoneypot(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const website = (payload as Record<string, unknown>).website;
  return typeof website === "string" && website.trim().length > 0;
}

export function decodeInquiryJson(body: string): unknown {
  if (new TextEncoder().encode(body).byteLength > MAX_INQUIRY_BODY_BYTES) {
    throw new InquiryPayloadTooLargeError();
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as unknown;
  } catch {
    throw new MalformedInquiryJsonError();
  }
  return payload;
}

export function parseInquiryJson(body: string): NormalizedInquiry {
  return parseInquiryPayload(decodeInquiryJson(body));
}

export function escapeInquirySpreadsheetCell(value: string) {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

const optionalQueryText = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).max(200).optional(),
);

export const leadListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  query: optionalQueryText,
  status: z.enum(["NEW", "CONTACTED", "IN_DISCUSSION", "QUOTED", "WON", "LOST", "SPAM"]).optional(),
  assigneeId: optionalQueryText,
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
}).strict();

export const leadUpdateSchema = z.object({
  version: z.coerce.number().int().positive(),
  status: z.enum(["NEW", "CONTACTED", "IN_DISCUSSION", "QUOTED", "WON", "LOST", "SPAM"]).optional(),
  nextFollowUpAt: z.preprocess(
    (value) => value === "" || value === null ? null : value,
    z.coerce.date().nullable().optional(),
  ),
}).strict().refine(
  (input) => input.status !== undefined || input.nextFollowUpAt !== undefined,
  "At least one lead field must be updated.",
);

export const leadAssignmentSchema = z.object({
  version: z.coerce.number().int().positive(),
  assigneeId: normalizedText(200),
}).strict();

export const leadActivitySchema = z.object({
  type: z.enum(["NOTE", "EMAIL", "FOLLOW_UP"]),
  content: normalizedText(5_000),
}).strict();

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
export type LeadAssignmentInput = z.infer<typeof leadAssignmentSchema>;
export type LeadActivityInput = z.infer<typeof leadActivitySchema>;
