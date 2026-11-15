import { describe, expect, it } from "vitest";

import { isBannerActiveAt, toPublicBanner } from "@/lib/repositories/banner-repository";

const media = (id: string, mimeType = "image/webp") => ({ id, altText: `${id} alt`, mimeType });
const base = {
  id: "banner-1",
  name: "Banner",
  title: "Banner title",
  subtitle: null,
  buttonText: null,
  buttonUrl: null,
  textColor: "#ffffff",
  textPosition: "LEFT",
  maskOpacity: 50,
  status: "PUBLISHED" as const,
  enabled: true,
  position: 1,
  startsAt: new Date("2026-11-15T10:00:00.000Z"),
  endsAt: new Date("2026-11-15T11:00:00.000Z"),
  desktopMedia: media("desktop"),
  tabletMedia: null,
  mobileMedia: null,
};

describe("banner public repository helpers", () => {
  it("uses inclusive start and exclusive end schedule boundaries", () => {
    expect(isBannerActiveAt(base, new Date("2026-11-15T09:59:59.999Z"))).toBe(false);
    expect(isBannerActiveAt(base, new Date("2026-11-15T10:00:00.000Z"))).toBe(true);
    expect(isBannerActiveAt(base, new Date("2026-11-15T10:59:59.999Z"))).toBe(true);
    expect(isBannerActiveAt(base, new Date("2026-11-15T11:00:00.000Z"))).toBe(false);
    expect(isBannerActiveAt({ ...base, status: "DRAFT" }, new Date("2026-11-15T10:30:00.000Z"))).toBe(false);
    expect(isBannerActiveAt({ ...base, enabled: false }, new Date("2026-11-15T10:30:00.000Z"))).toBe(false);
  });

  it("falls tablet and mobile sources back without losing alt text", () => {
    expect(toPublicBanner(base)).toMatchObject({
      desktop: { url: "/api/media/desktop", alt: "desktop alt" },
      tablet: { url: "/api/media/desktop", alt: "desktop alt" },
      mobile: { url: "/api/media/desktop", alt: "desktop alt" },
    });
    expect(toPublicBanner({ ...base, tabletMedia: media("tablet") })).toMatchObject({
      desktop: { url: "/api/media/desktop" },
      tablet: { url: "/api/media/tablet" },
      mobile: { url: "/api/media/tablet" },
    });
    expect(toPublicBanner({ ...base, tabletMedia: media("tablet"), mobileMedia: media("mobile") })).toMatchObject({
      mobile: { url: "/api/media/mobile", alt: "mobile alt" },
    });
  });

  it("maps video media explicitly instead of sending it through an image renderer", () => {
    expect(toPublicBanner({ ...base, desktopMedia: media("desktop-video", "video/mp4") })).toMatchObject({
      desktop: { url: "/api/media/desktop-video", kind: "VIDEO", mimeType: "video/mp4" },
      tablet: { kind: "VIDEO" },
      mobile: { kind: "VIDEO" },
    });
  });
});
