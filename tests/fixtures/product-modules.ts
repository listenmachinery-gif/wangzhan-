import type { ProductModuleType } from "@/lib/product-modules/types";

const editorial = { eyebrow: "Section", title: "Title", paragraphs: ["Useful product information."] };
const gallery = {
  ...editorial,
  items: [{ image: "/products/example.webp", alt: "Machine example", title: "Example", text: "Detail", label: "Featured" }],
};
const cards = { ...editorial, items: [{ title: "Capability", text: "Clear explanation" }] };

export const validProductModuleData: Record<ProductModuleType, unknown> = {
  HERO: {
    eyebrow: "Q11G Series",
    title: "Small Electric Shearing Machine",
    subtitle: "Compact precision cutting",
    images: { desktop: "/hero.webp", tablet: "/hero-tablet.webp", mobile: "/hero-mobile.webp", alt: "Small electric shearing machine" },
    badges: ["Electric Drive"],
    valuePoints: ["600–2500 mm widths"],
    primaryCta: { label: "Request a Quote", href: "#quote" },
  },
  OVERVIEW: editorial,
  PRODUCT_SHOWCASE: gallery,
  DETAIL_GALLERY: gallery,
  OPTION_CAROUSEL: gallery,
  MATERIAL_GALLERY: gallery,
  PROBLEMS: cards,
  SOLUTION: { ...editorial, fit: ["Small workshops"] },
  PROCESS: cards,
  APPLICATIONS: cards,
  MATERIAL_GUIDANCE: { ...editorial, materials: ["Mild steel"], note: "Confirm grade and thickness." },
  ADVANTAGES: cards,
  STRUCTURE: cards,
  TECHNICAL: {
    ...editorial,
    columns: [{ key: "model", label: "Model" }, { key: "width", label: "Width", unit: "mm" }],
    rows: [{ model: "Q11G-2x600", width: "600" }],
  },
  MODEL_CARDS: {
    ...editorial,
    items: [{ name: "Q11G-2x600", specs: [{ label: "Width", value: "600", unit: "mm" }] }],
  },
  INDUSTRY_GALLERY: gallery,
  MODEL_GUIDE: editorial,
  COMPARISON: {
    ...editorial,
    columns: ["Feature", "Electric", "Hydraulic"],
    rows: [{ label: "Footprint", values: ["Compact", "Large"] }],
  },
  ENERGY_COMPARISON: {
    ...editorial,
    columns: ["Metric", "Electric", "Hydraulic"],
    rows: [{ label: "Idle power", values: ["Low", "Higher"] }],
  },
  WORKFLOW: cards,
  MANUFACTURER_SUPPORT: cards,
  FAQ: { ...editorial, items: [{ question: "Which model fits?", answer: "Confirm material and cutting length." }] },
  RELATED_LINKS: { ...editorial, items: [{ label: "Shearing machines", href: "/products/series/shearing-machines", description: "Browse the full cutting range." }] },
  CTA: { ...editorial, primaryCta: { label: "Request a Quote", href: "#quote" }, requiredInfo: ["Material"] },
};
