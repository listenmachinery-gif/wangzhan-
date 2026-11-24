import { describe, expect, it } from "vitest";

import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import {
  parseNavigationSnapshot,
  type NavigationSnapshot,
  validateInternalHref,
} from "@/lib/navigation/schema";

function validSnapshot(): NavigationSnapshot {
  return {
    schemaVersion: 1,
    primary: [
      { id: "home", kind: "LINK", label: "HOME", href: "/", visible: true },
      {
        id: "support",
        kind: "GROUP",
        label: "SUPPORT",
        href: "/contact",
        visible: true,
        children: [
          { id: "news", kind: "LINK", label: "Company News", href: "/news", visible: true },
        ],
      },
    ],
    quote: { id: "quote", kind: "LINK", label: "Quote Now", href: "/contact", visible: true },
    languages: [
      { id: "language-en", label: "English", locale: "en", href: "/", visible: true },
    ],
    footerGroups: [
      {
        id: "footer-support",
        label: "Support",
        items: [
          { id: "footer-contact", kind: "LINK", label: "Contact", href: "/contact", visible: true },
        ],
      },
    ],
  };
}

describe("managed navigation schema", () => {
  it("provides the approved fallback navigation without retired labels", () => {
    expect(DEFAULT_NAVIGATION.primary.map((item) => item.label)).toEqual([
      "HOME",
      "ABOUT ZYRON",
      "PRODUCTS",
      "SUPPORT",
      "SHOWCASE",
      "CONTACT",
    ]);
    const support = DEFAULT_NAVIGATION.primary.find((item) => item.label === "SUPPORT");
    expect(support?.children?.map((item) => item.label)).toEqual([
      "Support Center",
      "Company News",
      "Shipping Highlights",
    ]);
    expect(JSON.stringify(DEFAULT_NAVIGATION)).not.toMatch(/Buying Guides/);
    expect(DEFAULT_NAVIGATION.footer?.brandName).toBe("ZYRON Heavy Industry");
    expect(Object.isFrozen(DEFAULT_NAVIGATION)).toBe(true);
    expect(Object.isFrozen(DEFAULT_NAVIGATION.primary)).toBe(true);
    expect(DEFAULT_NAVIGATION.machines?.categories.map((item) => item.categoryId)).toEqual([
      "shearing-machines",
      "bending-machines",
      "laser-cutting-machines",
      "plate-rolling-machines",
      "press-machines",
      "rectangular-duct-production",
      "round-duct-production",
      "shredders",
    ]);
  });

  it("accepts managed Machines settings while rejecting duplicate category references", () => {
    const snapshot = structuredClone(DEFAULT_NAVIGATION);
    snapshot.machines!.settings.desktopColumns = 4;
    snapshot.machines!.settings.openDelayMs = 120;
    expect(parseNavigationSnapshot(snapshot).machines?.settings.desktopColumns).toBe(4);

    snapshot.machines!.categories[1].categoryId = snapshot.machines!.categories[0].categoryId;
    expect(() => parseNavigationSnapshot(snapshot)).toThrow(/duplicate machines category/i);
  });

  it("keeps Machines media references on permanent internal paths", () => {
    const snapshot = structuredClone(DEFAULT_NAVIGATION);
    snapshot.machines!.categories[0].image = "https://temporary-cdn.example/menu.jpg";
    expect(() => parseNavigationSnapshot(snapshot)).toThrow(/permanent internal path/i);
  });

  it("accepts a valid version-one navigation document", () => {
    expect(parseNavigationSnapshot(validSnapshot())).toMatchObject({ schemaVersion: 1 });
  });

  it("accepts a fully managed footer while preserving older snapshots", () => {
    const snapshot = validSnapshot();
    snapshot.footer = {
      brandName: "ZYRON Heavy Industry",
      description: "Industrial machinery solutions.",
      email: "info@zyroncnc.com",
      whatsapp: "+8615655537083",
      address: "Ma'anshan, Anhui, China",
      ctaLabel: "Start a Project",
      ctaHref: "/contact",
      copyright: "Copyright 2026 ZYRON Heavy Industry.",
      productCategories: { visible: false, label: "Machine Categories" },
      actionLinks: {
        label: "Work With Us",
        items: [{ id: "footer-distributor", kind: "LINK", label: "Distributor Inquiry", href: "/contact", visible: true }],
      },
      newsletter: {
        visible: true,
        title: "Machinery Updates",
        description: "Read verified product and delivery updates.",
        ctaLabel: "View News",
        ctaHref: "/news",
      },
      legalLinks: [{ id: "footer-legal-privacy", kind: "LINK", label: "Privacy Policy", href: "/privacy", visible: true }],
    };

    expect(parseNavigationSnapshot(snapshot).footer).toMatchObject({
      productCategories: { visible: false, label: "Machine Categories" },
      newsletter: { ctaHref: "/news" },
    });
    expect(parseNavigationSnapshot(validSnapshot()).footer).toBeUndefined();
  });

  it("rejects unsafe managed footer links and duplicate footer ids", () => {
    const snapshot = structuredClone(DEFAULT_NAVIGATION);
    snapshot.footer!.newsletter!.ctaHref = "javascript:alert(1)";
    expect(() => parseNavigationSnapshot(snapshot)).toThrow();

    snapshot.footer!.newsletter!.ctaHref = "/news";
    snapshot.footer!.legalLinks = [{ id: "home", kind: "LINK", label: "Privacy", href: "/privacy", visible: true }];
    expect(() => parseNavigationSnapshot(snapshot)).toThrow(/duplicate/i);
  });

  it.each([
    ["/", true],
    ["/products", true],
    ["/shipping-highlights?country=DE", true],
    ["//evil.test", false],
    ["/unsafe\\path", false],
    ["/line\nbreak", false],
    ["https://example.com", false],
  ])("validates internal href %s", (href, expected) => {
    expect(validateInternalHref(href)).toBe(expected);
  });

  it.each(["http://example.com", "javascript:alert(1)", "//example.com"])(
    "rejects unsafe external navigation href %s",
    (href) => {
      const snapshot = validSnapshot();
      snapshot.primary[0].href = href;
      expect(() => parseNavigationSnapshot(snapshot)).toThrow();
    },
  );

  it("rejects duplicate node identifiers across the whole document", () => {
    const snapshot = validSnapshot();
    snapshot.footerGroups[0].items[0].id = "home";
    expect(() => parseNavigationSnapshot(snapshot)).toThrow(/duplicate/i);
  });

  it("rejects navigation trees deeper than three levels", () => {
    const snapshot = validSnapshot();
    snapshot.primary[1].children = [
      {
        id: "level-two",
        kind: "GROUP",
        label: "Level two",
        visible: true,
        children: [
          {
            id: "level-three",
            kind: "GROUP",
            label: "Level three",
            visible: true,
            children: [
              { id: "level-four", kind: "LINK", label: "Too deep", href: "/contact", visible: true },
            ],
          },
        ],
      },
    ];
    expect(() => parseNavigationSnapshot(snapshot)).toThrow(/depth/i);
  });
});
