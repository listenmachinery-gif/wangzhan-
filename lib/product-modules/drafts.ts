import type { ProductModuleType } from "@/lib/product-modules/types";

const editorial = { eyebrow: "", title: "", paragraphs: [""] };
const gallery = { ...editorial, items: [{ image: "", alt: "", title: "" }] };
const cards = { ...editorial, items: [{ title: "", text: "" }] };
const comparison = { ...editorial, columns: ["", ""], rows: [{ label: "", values: [""] }] };

const drafts: Record<ProductModuleType, unknown> = {
  HERO: { eyebrow: "", title: "", images: { desktop: "", alt: "" }, primaryCta: { label: "", href: "" } },
  OVERVIEW: editorial,
  PRODUCT_SHOWCASE: gallery,
  DETAIL_GALLERY: gallery,
  OPTION_CAROUSEL: gallery,
  MATERIAL_GALLERY: gallery,
  PROBLEMS: cards,
  SOLUTION: editorial,
  PROCESS: cards,
  APPLICATIONS: cards,
  MATERIAL_GUIDANCE: { ...editorial, materials: [""], note: "" },
  ADVANTAGES: cards,
  STRUCTURE: cards,
  TECHNICAL: { ...editorial, columns: [{ key: "value", label: "" }], rows: [{ value: "" }] },
  MODEL_CARDS: { ...editorial, items: [{ name: "", specs: [{ label: "", value: "" }] }] },
  INDUSTRY_GALLERY: gallery,
  MODEL_GUIDE: editorial,
  COMPARISON: comparison,
  ENERGY_COMPARISON: comparison,
  WORKFLOW: cards,
  MANUFACTURER_SUPPORT: cards,
  FAQ: { ...editorial, items: [{ question: "", answer: "" }] },
  RELATED_LINKS: { ...editorial, items: [{ label: "", href: "" }] },
  CTA: { ...editorial, primaryCta: { label: "", href: "" } },
};

export function createDraftProductModule(type: ProductModuleType) {
  return structuredClone(drafts[type]);
}
