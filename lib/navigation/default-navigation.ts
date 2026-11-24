import type { NavigationSnapshot } from "@/lib/navigation/schema";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

export const DEFAULT_NAVIGATION = deepFreeze<NavigationSnapshot>({
  schemaVersion: 1,
  primary: [
    { id: "home", kind: "LINK", label: "HOME", href: "/", visible: true },
    { id: "about-zyron", kind: "LINK", label: "ABOUT ZYRON", href: "/factory", visible: true },
    { id: "products", kind: "PRODUCT_DIRECTORY", label: "PRODUCTS", href: "/products", visible: true },
    {
      id: "support",
      kind: "GROUP",
      label: "SUPPORT",
      href: "/support",
      visible: true,
      children: [
        { id: "support-center", kind: "LINK", label: "Support Center", href: "/support", visible: true },
        { id: "company-news", kind: "LINK", label: "Company News", href: "/news", visible: true },
        { id: "shipping-highlights", kind: "LINK", label: "Shipping Highlights", href: "/shipping-highlights", visible: true },
      ],
    },
    { id: "showcase", kind: "GROUP", label: "SHOWCASE", href: "/showcase", visible: true, children: [
      { id: "showcase-overview", kind: "LINK", label: "Overview", href: "/showcase", visible: true },
      { id: "showcase-shipping", kind: "LINK", label: "Shipping Highlights", href: "/shipping-highlights", visible: true },
      { id: "showcase-cases", kind: "LINK", label: "Customer Cases", href: "/cases", visible: true },
    ] },
    { id: "contact", kind: "LINK", label: "CONTACT", href: "/contact", visible: true },
  ],
  machines: {
    enabled: true,
    mode: "AUTO",
    categories: [
      ["shearing-machines", "SHEARING MACHINES"],
      ["bending-machines", "PRESS BRAKES"],
      ["laser-cutting-machines", "LASER CUTTING MACHINES"],
      ["plate-rolling-machines", "PLATE ROLLING MACHINES"],
      ["press-machines", "HYDRAULIC PRESSES"],
      ["rectangular-duct-production", "RECTANGULAR DUCT MACHINES"],
      ["round-duct-production", "ROUND DUCT MACHINES"],
      ["shredders", "SHREDDING MACHINES"],
    ].map(([categoryId, displayName], sortOrder) => ({
      categoryId,
      displayName,
      sortOrder,
      enabled: true,
      isDefault: sortOrder === 0,
      products: [],
    })),
    settings: {
      desktopColumns: 3,
      showCounts: true,
      showDescriptions: true,
      showImages: true,
      showEmptyCategories: false,
      backdrop: true,
      openDelayMs: 100,
      closeDelayMs: 250,
      mobileShowImages: true,
      mobileShowDescriptions: true,
      mobileStickyCta: true,
      ctaLabel: "Request a Quote",
      ctaHref: "/contact",
    },
  },
  quote: { id: "quote-now", kind: "LINK", label: "Quote Now", href: "/contact", visible: true },
  languages: [
    { id: "language-en", label: "English", locale: "en", href: "/", visible: true },
  ],
  footerGroups: [
    {
      id: "footer-support",
      label: "Service & Support",
      items: [
        { id: "footer-support-center", kind: "LINK", label: "Support Center", href: "/support", visible: true },
        { id: "footer-contact-support", kind: "LINK", label: "Contact Support", href: "/contact", visible: true },
        { id: "footer-company-news", kind: "LINK", label: "Company News", href: "/news", visible: true },
        { id: "footer-shipping-highlights", kind: "LINK", label: "Shipping Highlights", href: "/shipping-highlights", visible: true },
      ],
    },
    {
      id: "footer-company",
      label: "Company",
      items: [
        { id: "footer-about-zyron", kind: "LINK", label: "About ZYRON", href: "/factory", visible: true },
        { id: "footer-contact", kind: "LINK", label: "Contact", href: "/contact", visible: true },
      ],
    },
  ],
  footer: {
    brandName: "ZYRON Heavy Industry",
    description: "One-stop manufacturer of sheet metal machinery, HVAC duct production equipment, laser cutting machines, press machines, rolling machines, and shredding solutions.",
    email: "info@zyroncnc.com",
    whatsapp: "+8615655537083",
    address: "Dongjiao Industrial Park, Bowang Town, Bowang District, Ma'anshan City, Anhui Province, China",
    ctaLabel: "Start a Project",
    ctaHref: "/contact",
    copyright: "Copyright 2026 ZYRON Heavy Industry. All rights reserved.",
    productCategories: {
      visible: true,
      label: "Product Categories",
    },
    actionLinks: {
      label: "Where to Buy",
      items: [
        { id: "footer-action-quote", kind: "LINK", label: "Get a Quote", href: "/contact", visible: true },
        { id: "footer-action-engineer", kind: "LINK", label: "Contact an Engineer", href: "/contact", visible: true },
        { id: "footer-action-oem", kind: "LINK", label: "OEM / ODM Cooperation", href: "/contact", visible: true },
        { id: "footer-action-distributor", kind: "LINK", label: "Distributor Inquiry", href: "/contact", visible: true },
      ],
    },
    newsletter: {
      visible: true,
      title: "Machinery Updates",
      description: "Read verified product releases, delivery updates, and production line ideas.",
      ctaLabel: "Read Company News",
      ctaHref: "/news",
    },
    legalLinks: [
      { id: "footer-legal-privacy", kind: "LINK", label: "Privacy Policy", href: "/privacy", visible: true },
    ],
  },
});
