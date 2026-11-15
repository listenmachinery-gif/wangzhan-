import { z } from "zod";

export const SETTING_KEYS = [
  "company.name",
  "contact.email",
  "contact.whatsapp",
  "contact.address",
  "seo.titleSuffix",
] as const;

export const settingInputSchema = z.object({
  key: z.enum(SETTING_KEYS),
  value: z.string().trim().min(1).max(500),
  version: z.coerce.number().int().min(0),
}).strict().superRefine((input, context) => {
  if (input.key === "contact.email" && !z.string().email().safeParse(input.value).success) {
    context.addIssue({ code: "custom", path: ["value"], message: "Enter a valid contact email." });
  }
});
