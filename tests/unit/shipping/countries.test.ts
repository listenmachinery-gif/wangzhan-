import { describe, expect, it } from "vitest";

import { countryOptionsZh, getCountryName } from "@/lib/shipping/countries";

describe("shipping country localization", () => {
  it("returns Chinese and English country names from ISO alpha-2 codes", () => {
    expect(getCountryName("DE", "zh-CN")).toMatch(/德国/);
    expect(getCountryName("DE", "en")).toBe("Germany");
    expect(getCountryName("us", "zh-CN")).toMatch(/美国/);
  });

  it("returns the normalized code when no assigned country exists", () => {
    expect(getCountryName("ZZ", "zh-CN")).toBe("ZZ");
  });

  it("provides sorted Chinese options with stable ISO values", () => {
    expect(countryOptionsZh.length).toBeGreaterThan(200);
    expect(countryOptionsZh).toContainEqual(expect.objectContaining({ value: "CN", label: expect.stringMatching(/中国/) }));
    expect(countryOptionsZh).toContainEqual(expect.objectContaining({ value: "DE", label: expect.stringMatching(/德国/) }));
    expect(new Set(countryOptionsZh.map((option) => option.value)).size).toBe(countryOptionsZh.length);
  });
});
