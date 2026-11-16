import { z } from "zod";

const optionalText = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).max(maximum).optional(),
);

function dateBoundary(endOfDay: boolean) {
  return z.preprocess((value) => {
    if (typeof value !== "string" || value.trim() === "") return undefined;
    const normalized = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return new Date(`${normalized}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
    }
    return new Date(normalized);
  }, z.date().optional());
}

function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.enum(values).optional(),
  );
}

export const visitorListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  from: dateBoundary(false),
  to: dateBoundary(true),
  source: optionalText(200),
  countryCode: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : typeof value === "string" ? value.trim().toUpperCase() : value,
    z.string().regex(/^[A-Z]{2}$/).optional(),
  ),
  deviceType: optionalEnum(["desktop", "mobile", "tablet"]),
  status: optionalEnum(["online", "active", "offline"]),
  productId: optionalText(200),
}).strict().superRefine((query, context) => {
  if (query.from && query.to && query.from > query.to) {
    context.addIssue({ code: "custom", path: ["to"], message: "The end date must not precede the start date." });
  }
});

export type ValidatedVisitorListQuery = z.infer<typeof visitorListQuerySchema>;
