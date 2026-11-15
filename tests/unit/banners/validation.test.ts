import { describe, expect, it } from "vitest";

import { bannerCreateSchema, bannerUpdateSchema } from "@/lib/validation/banners";

const validBanner = {
  name: "Homepage launch",
  title: "Built for productive workshops",
  subtitle: "Configured around your material and output.",
  buttonText: "Explore machines",
  buttonUrl: "/products",
  textColor: "#ffffff",
  textPosition: "CENTER" as const,
  maskOpacity: 55,
  desktopMediaId: "desktop-media",
  tabletMediaId: null,
  mobileMediaId: null,
  enabled: true,
  position: 0,
  startsAt: "2026-11-15T00:00:00.000Z",
  endsAt: "2026-11-16T00:00:00.000Z",
};

describe("banner validation", () => {
  it("normalizes a valid scheduled banner", () => {
    const parsed = bannerCreateSchema.parse(validBanner);
    expect(parsed.startsAt).toEqual(new Date(validBanner.startsAt));
    expect(parsed.endsAt).toEqual(new Date(validBanner.endsAt));
  });

  it("requires desktop media and a complete CTA", () => {
    expect(bannerCreateSchema.safeParse({ ...validBanner, desktopMediaId: "" }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, buttonUrl: null }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, buttonText: null }).success).toBe(false);
  });

  it("rejects inverted or empty schedules and unsafe links", () => {
    expect(bannerCreateSchema.safeParse({ ...validBanner, startsAt: validBanner.endsAt, endsAt: validBanner.startsAt }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, startsAt: validBanner.startsAt, endsAt: validBanner.startsAt }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, buttonUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, buttonUrl: "//attacker.test/path" }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, buttonUrl: "/\\attacker.test/path" }).success).toBe(false);
    expect(bannerCreateSchema.safeParse({ ...validBanner, buttonUrl: "https://" }).success).toBe(false);
  });

  it("requires optimistic concurrency on updates", () => {
    expect(bannerUpdateSchema.safeParse({ title: "Changed" }).success).toBe(false);
    expect(bannerUpdateSchema.parse({ version: 2, title: "Changed" })).toEqual({ version: 2, title: "Changed" });
  });
});
