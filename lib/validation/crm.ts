import { z } from "zod";

import { leadListQuerySchema } from "@/lib/validation/inquiries";
import { DEFAULT_CRM_STAGES } from "@/lib/crm/stages";
import { normalizeEmail, normalizePhoneCandidate } from "@/lib/crm/normalization";

// Assigned ISO 3166-1 alpha-2 codes, including territories.
const countryCodes = new Set(`
  AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
  BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS
  BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN
  CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE
  EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF
  GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM
  HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM
  JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC
  LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK
  ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA
  NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG
  PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW
  SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS
  ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO
  TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI
  VN VU WF WS YE YT ZA ZM ZW
`.trim().split(/\s+/));

const text = (maximum: number) => z.string().trim().min(1).max(maximum);
const id = text(200);
const version = z.number().int().positive().max(2_147_483_647);

const toNullIfBlank = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;
const optionalString = (schema: z.ZodType<string>) =>
  z.preprocess(toNullIfBlank, schema.nullable().optional());
const optionalText = (maximum: number) => optionalString(text(maximum));

const countryCode = text(2).toUpperCase().refine(
  (value) => countryCodes.has(value),
  "Use an assigned ISO 3166-1 alpha-2 country code.",
);
const email = text(254).transform(normalizeEmail).pipe(z.email());
const phone = text(40).refine((value) => {
  const formatted = value.normalize("NFKC");
  return /^\+?[\d\s().-]+$/.test(formatted) &&
    /^(?:\+[1-9]\d{2,14}|\d{3,15})$/.test(normalizePhoneCandidate(formatted));
}, "Enter a valid phone number.");
const customerLevel = z.enum(["A", "B", "C", "D"]);

const companyFields = {
  name: text(200),
  website: optionalString(text(2_048).pipe(z.url({ protocol: /^https?$/ }))),
  industry: optionalText(200),
  companySize: optionalText(100),
  countryCode: optionalString(countryCode),
  state: optionalText(100),
  city: optionalText(100),
  postalCode: optionalText(30),
  address: optionalText(500),
  ownerId: optionalString(id),
};

const contactFields = {
  fullName: text(200),
  firstName: optionalText(100),
  lastName: optionalText(100),
  jobTitle: optionalText(200),
  department: optionalText(200),
  email: optionalString(email),
  phone: optionalString(phone),
  whatsapp: optionalString(phone),
  countryCode: optionalString(countryCode),
  state: optionalText(100),
  city: optionalText(100),
  timezone: optionalText(100),
  preferredLanguage: optionalText(100),
  preferredContactMethod: optionalText(100),
  preferredContactTime: optionalText(100),
  customerLevel: z.preprocess(toNullIfBlank, customerLevel.nullable().optional()),
  customerStatus: optionalText(100),
  ownerId: optionalString(id),
  internalNotes: optionalText(5_000),
  companyId: optionalString(id),
};

function hasChanges(input: { version: number }) {
  return Object.entries(input).some(([field, value]) => field !== "version" && value !== undefined);
}

function hasSingleCompanyOperation(input: { companyId?: string | null; company?: unknown }) {
  return input.companyId === undefined || input.company === undefined;
}

const companyCreateSchema = z.strictObject(companyFields);
const companyUpdateSchema = companyCreateSchema.partial().extend({ version })
  .refine(hasChanges, "At least one company field must be updated.");

export const customerCreateSchema = z.strictObject({
  ...contactFields,
  company: companyCreateSchema.optional(),
}).refine(
  ({ email, phone, whatsapp }) => Boolean(email || phone || whatsapp),
  { path: ["email"], message: "Provide an email, phone or WhatsApp number." },
).refine(hasSingleCompanyOperation, { path: ["company"], message: "Choose one company operation." });

export const customerUpdateSchema = z.strictObject(contactFields).partial().extend({
  version,
  company: companyUpdateSchema.optional(),
}).refine(hasChanges, "At least one customer field must be updated.")
  .refine(hasSingleCompanyOperation, { path: ["company"], message: "Choose one company operation." });

function queryNumber(maximum: number, defaultValue: number) {
  return z.preprocess(
    (value) => typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value,
    z.number().int().min(1).max(maximum).default(defaultValue),
  );
}

export const customerListQuerySchema = z.strictObject({
  page: queryNumber(1_000_000, 1),
  pageSize: queryNumber(100, 20),
  query: optionalText(200),
  countryCode: optionalString(countryCode),
  customerLevel: customerLevel.optional(),
  ownerId: optionalString(id),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

const sourceChannel = z.enum(["WEBSITE", "EMAIL", "WHATSAPP", "PHONE", "FACEBOOK", "LINKEDIN", "TRADE_SHOW", "REFERRAL", "OTHER"]);
export const manualInquirySchema = z.strictObject({
  name: text(160),
  email,
  message: text(10_000),
  phone: optionalString(phone),
  whatsapp: optionalString(phone),
  country: optionalText(100),
  companyName: optionalText(200),
  sourceChannel: sourceChannel.default("OTHER"),
  customerLevel: customerLevel.optional(),
  nextFollowUpAt: z.iso.datetime().transform((value) => new Date(value)).optional(),
  assigneeId: id.optional(),
  contactId: id.optional(),
  companyId: id.optional(),
  contact: z.strictObject(contactFields).omit({ companyId: true }).refine(
    ({ email, phone, whatsapp }) => Boolean(email || phone || whatsapp),
    "Provide an email, phone or WhatsApp number.",
  ).optional(),
  company: companyCreateSchema.optional(),
  confirmDuplicateCreation: z.boolean().default(false),
}).refine(({ contactId, contact }) => !(contactId && contact), "Choose one contact operation.")
  .refine(({ companyId, company }) => !(companyId && company), "Choose one company operation.");

export const inquiryListQuerySchema = leadListQuerySchema.extend({
  stageCode: z.enum(DEFAULT_CRM_STAGES).optional(),
  customerLevel: customerLevel.optional(),
  country: optionalText(100),
  sourceChannel: sourceChannel.optional(),
  ownerId: optionalString(id),
  nextFollowUpFrom: z.coerce.date().optional(),
  nextFollowUpTo: z.coerce.date().optional(),
  overdue: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
}).refine(({ createdFrom, createdTo }) => !createdFrom || !createdTo || createdFrom <= createdTo, "Invalid created date range.")
  .refine(({ nextFollowUpFrom, nextFollowUpTo }) => !nextFollowUpFrom || !nextFollowUpTo || nextFollowUpFrom <= nextFollowUpTo, "Invalid follow-up date range.");
export type ManualInquiryInput = z.infer<typeof manualInquirySchema>;
export type InquiryListQuery = z.infer<typeof inquiryListQuerySchema>;
