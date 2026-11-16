import { describe, expect, it } from "vitest";

import { customerCreateSchema, customerListQuerySchema, customerUpdateSchema } from "@/lib/validation/crm";

const contact = { fullName: "Jane Doe", email: "jane@example.com" };

describe("CRM customer validation", () => {
  it("normalizes supplied values and turns blank optional values into null", () => {
    expect(customerCreateSchema.parse({
      fullName: " Jane Doe ",
      email: "  JANE@EXAMPLE.COM  ",
      phone: "",
      city: "  ",
      internalNotes: null,
      countryCode: " gb ",
      company: { name: " Acme  Tools ", industry: "  " },
    })).toEqual({
      ...contact,
      phone: null,
      city: null,
      internalNotes: null,
      countryCode: "GB",
      company: { name: "Acme  Tools", industry: null },
    });

    expect(customerUpdateSchema.parse({ version: 2, internalNotes: " " }))
      .toEqual({ version: 2, internalNotes: null });
  });

  it.each([
    { fullName: "x".repeat(201) },
    { internalNotes: "x".repeat(5001) },
    { email: `${"a".repeat(250)}@example.com` },
    { phone: "1".repeat(41) },
    { company: { name: "x".repeat(201) } },
  ])("rejects input exceeding the field length limits", (fields) => {
    expect(customerCreateSchema.safeParse({ ...contact, ...fields }).success).toBe(false);
  });

  it.each(["UK", "ZZ", "USA", "12"])("rejects unassigned country code %s", (countryCode) => {
    expect(customerCreateSchema.safeParse({ ...contact, countryCode }).success).toBe(false);
    expect(customerCreateSchema.safeParse({ ...contact, company: { name: "Acme", countryCode } }).success)
      .toBe(false);
    expect(customerListQuerySchema.safeParse({ countryCode }).success).toBe(false);
  });

  it("accepts assigned ISO country codes and preserves optional field omission", () => {
    expect(customerCreateSchema.parse({ ...contact, countryCode: "aq" })).toEqual({
      ...contact,
      countryCode: "AQ",
    });
  });

  it("requires at least one valid way to reach a new manual contact", () => {
    expect(customerCreateSchema.safeParse({ fullName: "Jane Doe", email: " ", whatsapp: null }).success)
      .toBe(false);
    expect(customerCreateSchema.safeParse({ fullName: "Jane Doe", phone: "---" }).success).toBe(false);
    expect(customerCreateSchema.safeParse({ fullName: "Jane Doe", phone: "Call 555-0101" }).success).toBe(false);
    expect(customerCreateSchema.safeParse({ fullName: "Jane Doe", whatsapp: "+44 (20) 7123-4567" }).success)
      .toBe(true);
  });

  it("rejects unknown fields and ambiguous company operations", () => {
    expect(customerCreateSchema.safeParse({ ...contact, normalizedEmail: contact.email }).success).toBe(false);
    expect(customerCreateSchema.safeParse({ ...contact, company: { name: "Acme", version: 1 } }).success)
      .toBe(false);
    expect(customerCreateSchema.safeParse({ ...contact, companyId: "existing", company: { name: "Acme" } }).success)
      .toBe(false);
    expect(customerUpdateSchema.safeParse({ version: 1, companyId: null, company: { version: 1, name: "Acme" } }).success)
      .toBe(false);
    expect(customerListQuerySchema.safeParse({ includeNotes: true }).success).toBe(false);
  });

  it("requires positive integer versions and an actual update payload", () => {
    for (const version of [0, -1, 1.5, "1", true, null, 2147483648]) {
      expect(customerUpdateSchema.safeParse({ version, fullName: "Jane" }).success).toBe(false);
    }
    expect(customerUpdateSchema.safeParse({ version: 1 }).success).toBe(false);
    expect(customerUpdateSchema.safeParse({ version: 1, company: { name: "Acme" } }).success).toBe(false);
    expect(customerUpdateSchema.safeParse({ version: 1, company: { version: 1 } }).success).toBe(false);
    expect(customerUpdateSchema.safeParse({ version: 1, company: { version: 2, name: "Acme" } }).success)
      .toBe(true);
  });

  it("bounds and parses list pagination without coercing arbitrary values", () => {
    expect(customerListQuerySchema.parse({ page: "2", pageSize: "30", query: " Jane " }))
      .toEqual({ page: 2, pageSize: 30, query: "Jane" });
    expect(customerListQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    for (const input of [{ page: false }, { page: "1e2" }, { pageSize: 101 }, { page: 0 }]) {
      expect(customerListQuerySchema.safeParse(input).success).toBe(false);
    }
  });
});
