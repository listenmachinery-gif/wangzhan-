import { describe, expect, it } from "vitest";

import { normalizeCompanyName, normalizeEmail, normalizePhoneCandidate } from "@/lib/crm/normalization";

describe("CRM duplicate keys", () => {
  it("normalizes company whitespace, case and full-width letters", () => {
    expect(normalizeCompanyName("  ＡCME\t  Heavy\nINDUSTRIES  ")).toBe("acme heavy industries");
  });

  it("trims and lowercases email without changing the address or alias", () => {
    expect(normalizeEmail("  Jane.Doe+Quotes@EXAMPLE.COM ")).toBe("jane.doe+quotes@example.com");
  });

  it.each([
    ["+44 (20) 7123-4567", "+442071234567"],
    ["0044 20 7123 4567", "+442071234567"],
    ["(020) 7123-4567", "02071234567"],
    ["  ", ""],
  ])("normalizes formatted phone candidate %j to %j", (phone, expected) => {
    expect(normalizePhoneCandidate(phone)).toBe(expected);
  });
});
