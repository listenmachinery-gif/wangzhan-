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
      href: "/contact",
      visible: true,
      children: [
        { id: "company-news", kind: "LINK", label: "Company News", href: "/news", visible: true },
        { id: "shipping-highlights", kind: "LINK", label: "Shipping Highlights", href: "/shipping-highlights", visible: true },
      ],
    },
    { id: "contact", kind: "LINK", label: "CONTACT", href: "/contact", visible: true },
  ],
  quote: { id: "quote-now", kind: "LINK", label: "Quote Now", href: "/contact", visible: true },
  languages: [
    { id: "language-en", label: "English", locale: "en", href: "/", visible: true },
  ],
  footerGroups: [
    {
      id: "footer-support",
      label: "Service & Support",
      items: [
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
        { id: "footer-privacy", kind: "LINK", label: "Privacy Policy", href: "/privacy", visible: true },
      ],
    },
  ],
});

