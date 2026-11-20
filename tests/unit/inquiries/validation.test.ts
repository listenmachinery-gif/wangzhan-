import { describe, expect, it } from "vitest";

import {
  InquiryPayloadTooLargeError,
  MalformedInquiryJsonError,
  escapeInquirySpreadsheetCell,
  parseInquiryJson,
  parseInquiryPayload,
} from "@/lib/validation/inquiries";

describe("inquiry validation", () => {
  it("rejects malformed JSON and bodies larger than the public intake limit", () => {
    expect(() => parseInquiryJson('{"name":')).toThrow(MalformedInquiryJsonError);

    const oversized = JSON.stringify({
      name: "A",
      email: "buyer@example.com",
      requirement: "x".repeat(20_000),
    });
    expect(() => parseInquiryJson(oversized)).toThrow(InquiryPayloadTooLargeError);
  });

  it("normalizes the standard website form into bounded lead fields", () => {
    const parsed = parseInquiryPayload({
      name: "  María Buyer  ",
      company: "  Acme Fabrication  ",
      email: "  MARIA.BUYER@Example.COM  ",
      whatsapp: "  +34   600  123  456  ",
      country: "  Spain  ",
      productInterest: "  Hydraulic Shears  ",
      material: "  Mild steel  ",
      thicknessRange: "  1–6 mm  ",
      workingLength: "  3200 mm  ",
      targetOutput: "  80 parts/day  ",
      requirement: "  Please quote a CE-compliant machine.  ",
      sourcePage: "  /company  ",
      website: "",
    });

    expect(parsed).toEqual({
      kind: "STANDARD",
      name: "María Buyer",
      company: "Acme Fabrication",
      email: "maria.buyer@example.com",
      phone: null,
      whatsapp: "+34 600 123 456",
      country: "Spain",
      productInterest: "Hydraulic Shears",
      material: "Mild steel",
      thickness: "1–6 mm",
      workingLength: "3200 mm",
      quantity: "80 parts/day",
      message: "Please quote a CE-compliant machine.",
      sourcePage: "/company",
      website: "",
      recommendedModel: null,
      backgauge: null,
    });
  });

  it("accepts blank optional phone fields submitted by the public HTML form", () => {
    expect(parseInquiryPayload({
      name: "Buyer",
      email: "buyer@example.com",
      whatsapp: "",
      requirement: "Please quote a suitable machine.",
      website: "",
    })).toMatchObject({ phone: null, whatsapp: null });
  });

  it("accepts the existing small-electric-shear selector shape and derives its message", () => {
    const parsed = parseInquiryPayload({
      inquiryType: "small-electric-shear-selector",
      email: " buyer@example.com ",
      whatsapp: "+1 202 555 0100",
      destinationCountry: " United States ",
      material: "Mild Steel Sheet",
      cuttingThickness: "2",
      cuttingWidth: "1250",
      recommendedModel: "untrusted browser value",
      backgauge: "Manually Adjustable Backgauge",
      website: "",
    });

    expect(parsed).toMatchObject({
      kind: "SMALL_ELECTRIC_SHEAR_SELECTOR",
      email: "buyer@example.com",
      country: "United States",
      material: "Mild Steel Sheet",
      thickness: "2 mm",
      workingLength: "1250 mm",
      backgauge: "Manually Adjustable Backgauge",
      website: "",
    });
    expect(parsed.recommendedModel).not.toBe("untrusted browser value");
    expect(parsed.message).toContain(`Recommended model: ${parsed.recommendedModel}`);
    expect(parsed.message).toContain("Backgauge: Manually Adjustable Backgauge");
  });

  it("rejects missing required data, unknown fields, invalid selector values, and overlong fields", () => {
    expect(() => parseInquiryPayload({ name: "Buyer", email: "bad", requirement: "Quote" })).toThrow();
    expect(() => parseInquiryPayload({ name: "Buyer", email: "buyer@example.com", requirement: "Quote", admin: true })).toThrow();
    expect(() => parseInquiryPayload({
      inquiryType: "small-electric-shear-selector",
      email: "buyer@example.com",
      material: "Mild Steel Sheet",
      cuttingThickness: "0",
      cuttingWidth: "1250",
      backgauge: "not-an-option",
    })).toThrow();
    expect(() => parseInquiryPayload({
      name: "x".repeat(161),
      email: "buyer@example.com",
      requirement: "Quote",
    })).toThrow();
    expect(() => parseInquiryPayload({
      name: "Buyer",
      email: "buyer@example.com",
      requirement: "x".repeat(10_001),
    })).toThrow();
  });

  it("neutralizes every spreadsheet formula prefix used by lead export", () => {
    expect(escapeInquirySpreadsheetCell("=HYPERLINK(\"https://evil.example\")")).toBe("'=HYPERLINK(\"https://evil.example\")");
    expect(escapeInquirySpreadsheetCell(" +SUM(1,1)")).toBe("' +SUM(1,1)");
    expect(escapeInquirySpreadsheetCell("-10+20")).toBe("'-10+20");
    expect(escapeInquirySpreadsheetCell("@IMPORTDATA(A1)")).toBe("'@IMPORTDATA(A1)");
    expect(escapeInquirySpreadsheetCell("ordinary buyer text")).toBe("ordinary buyer text");
  });
});
