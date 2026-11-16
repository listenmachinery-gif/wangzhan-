import { z } from "zod";

export const MAX_ANALYTICS_BODY_BYTES = 16_384;
export const MAX_ANALYTICS_BATCH_EVENTS = 20;

export class AnalyticsPayloadTooLargeError extends Error {
  constructor() {
    super("Analytics batch is too large.");
    this.name = "AnalyticsPayloadTooLargeError";
  }
}

export class MalformedAnalyticsJsonError extends Error {
  constructor() {
    super("Analytics batch contains malformed JSON.");
    this.name = "MalformedAnalyticsJsonError";
  }
}

const publicId = z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/);
const publicPath = z.string().trim().min(1).max(2_000)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"), "Expected a same-site path.");
const optionalPublicPath = publicPath.optional();
const occurredAt = z.string().datetime({ offset: true }).transform((value) => new Date(value));
const optionalText = (maximum: number) => z.string().trim().min(1).max(maximum).optional();

const common = {
  eventId: publicId,
  pageViewId: publicId,
  path: publicPath,
  occurredAt,
};

const pageViewSchema = z.object({
  kind: z.literal("page_view"),
  ...common,
  title: optionalText(500),
  referrer: z.string().trim().url().max(2_000).optional(),
  productSlug: optionalText(200),
}).strict();

const activitySchema = z.object({
  kind: z.enum(["heartbeat", "page_exit"]),
  ...common,
  activeSeconds: z.number().int().min(0).max(86_400),
}).strict();

const allowedEventPropertyKeys = new Set([
  "placement",
  "asset_name",
  "asset_path",
  "product_slug",
  "product_name",
  "product_category",
  "form_kind",
  "link_path",
]);

const eventProperties = z.record(
  z.string(),
  z.union([z.string().trim().max(500), z.number().finite(), z.boolean()]),
).superRefine((properties, context) => {
  for (const key of Object.keys(properties)) {
    if (!allowedEventPropertyKeys.has(key)) {
      context.addIssue({ code: "custom", path: [key], message: "Analytics property is not allowlisted." });
    }
  }
});

const businessEventSchema = z.object({
  kind: z.literal("event"),
  eventId: publicId,
  pageViewId: publicId.optional(),
  eventType: z.enum([
    "PRODUCT_VIEW",
    "INQUIRY_START",
    "INQUIRY_SUBMIT",
    "WHATSAPP_CLICK",
    "EMAIL_CLICK",
    "CATALOG_DOWNLOAD",
    "CHAT_STARTED",
    "CHAT_MESSAGE_SENT",
  ]),
  path: optionalPublicPath,
  productSlug: optionalText(200),
  properties: eventProperties.optional(),
  occurredAt,
}).strict();

export const analyticsEventSchema = z.discriminatedUnion("kind", [
  pageViewSchema,
  activitySchema,
  businessEventSchema,
]);

export const analyticsBatchSchema = z.object({
  events: z.array(analyticsEventSchema).min(1).max(MAX_ANALYTICS_BATCH_EVENTS),
}).strict();

export type AnalyticsBatch = z.infer<typeof analyticsBatchSchema>;
export type FirstPartyAnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export function parseAnalyticsBatch(input: unknown): AnalyticsBatch {
  return analyticsBatchSchema.parse(input);
}

export function decodeAnalyticsJson(body: string) {
  if (new TextEncoder().encode(body).byteLength > MAX_ANALYTICS_BODY_BYTES) {
    throw new AnalyticsPayloadTooLargeError();
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new MalformedAnalyticsJsonError();
  }
}
