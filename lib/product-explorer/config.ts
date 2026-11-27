import { z } from "zod";

export const PRODUCT_EXPLORER_CATEGORY_KEYS = [
  "shearing",
  "bending",
  "laser-cutting",
  "rolling",
  "pressing",
  "rectangular-duct",
  "round-duct",
  "shredding",
] as const;

export type ProductExplorerCategoryKey = (typeof PRODUCT_EXPLORER_CATEGORY_KEYS)[number];

const sitePath = z.string().max(2_048).refine(
  (value) => value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//")),
  "Use a page anchor or site-relative URL.",
);
const mediaPath = z.string().max(2_048).refine(
  (value) => value.startsWith("/") && !value.startsWith("//"),
  "Use a site-relative media path.",
);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const text = z.string().max(5_000);
const shortText = z.string().max(240);
const defaultBackgroundImage = "/products/explorer/industrial-studio-background.webp";

export const productExplorerCategorySchema = z.object({
  key: z.enum(PRODUCT_EXPLORER_CATEGORY_KEYS),
  number: z.string().regex(/^0[1-8]$/),
  navLabel: shortText.min(1),
  fullSeriesName: shortText.min(1),
  categoryId: z.string().max(120),
  heroImage: mediaPath,
  heroAlt: shortText.min(1),
  seriesHref: sitePath,
  seriesCtaLabel: shortText.min(1),
  productSectionTitle: shortText.min(1),
  desktopScale: z.number().min(0.5).max(1.8),
  desktopX: z.number().int().min(-300).max(300),
  desktopY: z.number().int().min(-200).max(200),
  tabletScale: z.number().min(0.5).max(1.8),
  tabletX: z.number().int().min(-200).max(200),
  tabletY: z.number().int().min(-160).max(160),
  mobileScale: z.number().min(0.5).max(1.8),
  mobileX: z.number().int().min(-120).max(120),
  mobileY: z.number().int().min(-120).max(120),
}).strict();

export const productExplorerContentSchema = z.object({
  enabled: z.boolean(),
  backgroundImage: mediaPath.default(defaultBackgroundImage),
  eyebrow: shortText,
  title: shortText.min(1),
  subtitle: shortText,
  description: text,
  primaryLabel: shortText.min(1),
  primaryHref: sitePath,
  secondaryLabel: shortText.min(1),
  secondaryHref: sitePath,
  defaultCategoryKey: z.enum(PRODUCT_EXPLORER_CATEGORY_KEYS),
  animationMs: z.number().int().min(0).max(1_000),
  maxWidth: z.number().int().min(960).max(1_920),
  heroHeight: z.number().int().min(520).max(820),
  backgroundColor: hexColor,
  panelColor: hexColor,
  accentColor: hexColor,
  textColor: hexColor,
  mutedTextColor: hexColor,
  productSectionBackground: hexColor,
  cardBackground: hexColor,
  cardBorderColor: hexColor,
  cardRadius: z.number().int().min(0).max(40),
  cardGap: z.number().int().min(8).max(48),
  desktopCards: z.number().min(2).max(6),
  tabletCards: z.number().min(1.5).max(4),
  mobileCards: z.number().min(1).max(2),
  showArrows: z.boolean(),
  showProgress: z.boolean(),
  categories: z.array(productExplorerCategorySchema).length(8),
}).strict().superRefine((content, context) => {
  content.categories.forEach((category, index) => {
    const expectedKey = PRODUCT_EXPLORER_CATEGORY_KEYS[index];
    const expectedNumber = String(index + 1).padStart(2, "0");
    if (category.key !== expectedKey || category.number !== expectedNumber) {
      context.addIssue({
        code: "custom",
        path: ["categories", index],
        message: "Product explorer category order and numbers are fixed.",
      });
    }
  });
});

export type ProductExplorerContent = z.infer<typeof productExplorerContentSchema>;

const categoryDefaults: ProductExplorerContent["categories"] = [
  { key: "shearing", number: "01", navLabel: "Shearing", fullSeriesName: "SHEARING MACHINES", categoryId: "", heroImage: "/products/explorer/shearing-machines.webp", heroAlt: "ZYRON shearing machine series", seriesHref: "/products/series/shearing-machines", seriesCtaLabel: "View Series", productSectionTitle: "Explore Shearing Machines", desktopScale: 1.02, desktopX: 8, desktopY: 6, tabletScale: 1, tabletX: 2, tabletY: 5, mobileScale: 1.02, mobileX: 0, mobileY: 8 },
  { key: "bending", number: "02", navLabel: "Bending", fullSeriesName: "PRESS BRAKES", categoryId: "", heroImage: "/products/explorer/press-brakes.webp", heroAlt: "ZYRON press brake series", seriesHref: "/products/series/bending-machines", seriesCtaLabel: "View Series", productSectionTitle: "Explore Press Brakes", desktopScale: 1.02, desktopX: 12, desktopY: 3, tabletScale: 1, tabletX: 4, tabletY: 4, mobileScale: 1, mobileX: 0, mobileY: 6 },
  { key: "laser-cutting", number: "03", navLabel: "Laser Cutting", fullSeriesName: "LASER CUTTING MACHINES", categoryId: "", heroImage: "/products/explorer/laser-cutting-machines.webp", heroAlt: "ZYRON fiber laser cutting machine series", seriesHref: "/products/series/laser-cutting-machines", seriesCtaLabel: "View Series", productSectionTitle: "Explore Laser Cutting Machines", desktopScale: 1.08, desktopX: 12, desktopY: 8, tabletScale: 1.04, tabletX: 4, tabletY: 8, mobileScale: 1.05, mobileX: 0, mobileY: 9 },
  { key: "rolling", number: "04", navLabel: "Rolling", fullSeriesName: "PLATE ROLLING MACHINES", categoryId: "", heroImage: "/products/explorer/plate-rolling-machines.webp", heroAlt: "ZYRON plate rolling machine series", seriesHref: "/products/series/plate-rolling-machines", seriesCtaLabel: "View Series", productSectionTitle: "Explore Plate Rolling Machines", desktopScale: 1.04, desktopX: 8, desktopY: 12, tabletScale: 1.02, tabletX: 2, tabletY: 10, mobileScale: 1.03, mobileX: 0, mobileY: 10 },
  { key: "pressing", number: "05", navLabel: "Pressing", fullSeriesName: "HYDRAULIC PRESSES", categoryId: "", heroImage: "/products/explorer/hydraulic-presses.webp", heroAlt: "ZYRON hydraulic press series", seriesHref: "/products/series/press-machines", seriesCtaLabel: "View Series", productSectionTitle: "Explore Hydraulic Presses", desktopScale: 0.88, desktopX: 54, desktopY: 4, tabletScale: 0.9, tabletX: 24, tabletY: 4, mobileScale: 0.94, mobileX: 8, mobileY: 5 },
  { key: "rectangular-duct", number: "06", navLabel: "Rectangular Duct", fullSeriesName: "RECTANGULAR DUCT MACHINES", categoryId: "", heroImage: "/products/explorer/rectangular-duct-machines.webp", heroAlt: "ZYRON rectangular duct production machine series", seriesHref: "/products/series/rectangular-duct-production", seriesCtaLabel: "View Series", productSectionTitle: "Explore Rectangular Duct Machines", desktopScale: 1.02, desktopX: 6, desktopY: 16, tabletScale: 1, tabletX: 2, tabletY: 14, mobileScale: 1, mobileX: 0, mobileY: 14 },
  { key: "round-duct", number: "07", navLabel: "Round Duct", fullSeriesName: "ROUND DUCT MACHINES", categoryId: "", heroImage: "/products/explorer/round-duct-machines.webp", heroAlt: "ZYRON round duct production machine series", seriesHref: "/products/series/round-duct-production", seriesCtaLabel: "View Series", productSectionTitle: "Explore Round Duct Machines", desktopScale: 1.02, desktopX: 4, desktopY: 15, tabletScale: 1, tabletX: 0, tabletY: 13, mobileScale: 1, mobileX: 0, mobileY: 14 },
  { key: "shredding", number: "08", navLabel: "Shredding", fullSeriesName: "SHREDDING MACHINES", categoryId: "", heroImage: "/products/explorer/shredding-machines.webp", heroAlt: "ZYRON industrial shredder series", seriesHref: "/products/series/shredders", seriesCtaLabel: "View Series", productSectionTitle: "Explore Shredding Machines", desktopScale: 0.9, desktopX: 45, desktopY: 5, tabletScale: 0.92, tabletX: 20, tabletY: 5, mobileScale: 0.95, mobileX: 6, mobileY: 6 },
];

export const DEFAULT_PRODUCT_EXPLORER_CONTENT: ProductExplorerContent = {
  enabled: true,
  backgroundImage: defaultBackgroundImage,
  eyebrow: "EXPLORE OUR MACHINERY",
  title: "Sheet Metal Fabrication & Industrial Machinery.",
  subtitle: "Precision. Performance. Productivity.",
  description: "Discover machinery for cutting, bending, forming, rolling and duct manufacturing.",
  primaryLabel: "Explore Machines",
  primaryHref: "#machine-series",
  secondaryLabel: "Find My Machine",
  secondaryHref: "/contact",
  defaultCategoryKey: "bending",
  animationMs: 350,
  maxWidth: 1600,
  heroHeight: 660,
  backgroundColor: "#0B0D10",
  panelColor: "#1A1D21",
  accentColor: "#80C900",
  textColor: "#FFFFFF",
  mutedTextColor: "#A1A1AA",
  productSectionBackground: "#F4F5F6",
  cardBackground: "#FFFFFF",
  cardBorderColor: "#E0E2E5",
  cardRadius: 14,
  cardGap: 24,
  desktopCards: 4,
  tabletCards: 2.5,
  mobileCards: 1.18,
  showArrows: true,
  showProgress: true,
  categories: categoryDefaults,
};

export type PublishedExplorerProduct = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string | null;
  position: number;
  sections: Array<{ content: unknown }>;
};

export type PublishedExplorerCategory = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  position: number;
  products: PublishedExplorerProduct[];
};

export type ResolvedProductExplorerCategory = ProductExplorerContent["categories"][number] & {
  databaseCategory: PublishedExplorerCategory | null;
  products: PublishedExplorerProduct[];
};

export function resolveProductExplorerData(
  content: ProductExplorerContent,
  publishedCategories: PublishedExplorerCategory[],
): ResolvedProductExplorerCategory[] {
  return content.categories.map((slot, index) => {
    const exact = slot.categoryId
      ? publishedCategories.find((category) => category.id === slot.categoryId) ?? null
      : null;
    const migrationFallback = slot.categoryId ? null : publishedCategories[index] ?? null;
    const databaseCategory = exact ?? migrationFallback;
    return {
      ...slot,
      databaseCategory,
      products: databaseCategory?.products ?? [],
    };
  });
}
