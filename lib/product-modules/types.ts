export const PRODUCT_MODULE_TYPES = [
  "HERO",
  "OVERVIEW",
  "PRODUCT_SHOWCASE",
  "DETAIL_GALLERY",
  "OPTION_CAROUSEL",
  "MATERIAL_GALLERY",
  "PROBLEMS",
  "SOLUTION",
  "PROCESS",
  "APPLICATIONS",
  "MATERIAL_GUIDANCE",
  "ADVANTAGES",
  "STRUCTURE",
  "TECHNICAL",
  "MODEL_CARDS",
  "INDUSTRY_GALLERY",
  "MODEL_GUIDE",
  "COMPARISON",
  "ENERGY_COMPARISON",
  "WORKFLOW",
  "MANUFACTURER_SUPPORT",
  "FAQ",
  "RELATED_LINKS",
  "CTA",
] as const;

export type ProductModuleType = (typeof PRODUCT_MODULE_TYPES)[number];

export type ProductModule<T = unknown> = {
  type: ProductModuleType;
  position: number;
  visible: boolean;
  data: T;
};
