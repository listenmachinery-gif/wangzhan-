import { z } from "zod";

const shortText = z.string().max(240);
const text = z.string().max(5_000);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const mediaPath = z.string().max(2_048).refine(
  (value) => value.startsWith("/") && !value.startsWith("//"),
  "Use a site-relative media path.",
);
const cssPosition = z.string().trim().min(1).max(40).regex(
  /^(?:left|center|right|top|bottom|\d{1,3}%)(?:\s+(?:left|center|right|top|bottom|\d{1,3}%))?$/,
  "Use a safe CSS background position.",
);

export const productSearchPopularItemSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  label: shortText.min(1),
  keyword: shortText.min(1),
  productId: z.string().max(120),
  icon: mediaPath,
  visible: z.boolean(),
  iconColor: color,
  iconHoverColor: color,
  iconSize: z.number().int().min(24).max(80),
}).strict();

export const productSearchFeatureSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  title: shortText.min(1),
  description: text,
  icon: mediaPath,
  visible: z.boolean(),
  iconColor: color,
  iconSize: z.number().int().min(28).max(88),
}).strict();

export const productSearchContentSchema = z.object({
  enabled: z.boolean(),
  eyebrow: shortText.min(1),
  titleLineOne: shortText.min(1),
  titleAccent: shortText.min(1),
  titleSuffix: shortText.min(1),
  description: text,
  placeholder: shortText.min(1),
  buttonLabel: shortText.min(1),
  popularTitle: shortText.min(1),
  viewAllLabel: shortText.min(1),
  loadingLabel: shortText.min(1),
  noResultsLabel: shortText.min(1),
  errorLabel: shortText.min(1),
  background: z.object({
    desktopImage: mediaPath,
    tabletImage: mediaPath,
    mobileImage: mediaPath,
    desktopPosition: cssPosition,
    tabletPosition: cssPosition,
    mobilePosition: cssPosition,
    fit: z.enum(["cover", "contain"]),
    color,
    overlayColor: color,
    overlayOpacity: z.number().int().min(0).max(100),
    gradientDirection: z.enum(["to-right", "to-bottom", "to-bottom-right"]),
    gradientStop: z.number().int().min(20).max(100),
  }).strict(),
  typography: z.object({
    eyebrowSize: z.number().int().min(12).max(30),
    eyebrowSpacing: z.number().min(0).max(8),
    titleSize: z.number().int().min(40).max(96),
    titleWeight: z.number().int().min(400).max(800),
    titleLineHeight: z.number().min(1).max(1.5),
    titleColor: color,
    accentColor: color,
    accentItalic: z.boolean(),
    suffixItalic: z.boolean(),
    descriptionSize: z.number().int().min(14).max(32),
    descriptionColor: color,
  }).strict(),
  appearance: z.object({
    maxWidth: z.number().int().min(960).max(1_920),
    sectionHeight: z.number().int().min(640).max(1_200),
    paddingY: z.number().int().min(48).max(180),
    searchHeight: z.number().int().min(64).max(140),
    searchWidth: z.number().int().min(70).max(100),
    buttonWidth: z.number().int().min(220).max(460),
    cutSize: z.number().int().min(0).max(50),
    borderColor: color,
    searchBackground: color,
    searchOpacity: z.number().int().min(20).max(100),
    buttonColor: color,
    buttonHoverColor: color,
    buttonTextColor: color,
    dividerColor: color,
  }).strict(),
  responsive: z.object({
    tabletTitleSize: z.number().int().min(32).max(72),
    tabletSearchHeight: z.number().int().min(56).max(110),
    mobileTitleSize: z.number().int().min(28).max(48),
    mobileSearchHeight: z.number().int().min(52).max(80),
    mobilePaddingY: z.number().int().min(40).max(120),
  }).strict(),
  suggestionLimit: z.number().int().min(1).max(10),
  debounceMs: z.number().int().min(100).max(1_000),
  popularItems: z.array(productSearchPopularItemSchema).max(12),
  features: z.array(productSearchFeatureSchema).max(8),
}).strict();

export type ProductSearchContent = z.infer<typeof productSearchContentSchema>;

const backgroundImage = "/products/search/precision-metal-background.webp";

export const DEFAULT_PRODUCT_SEARCH_CONTENT: ProductSearchContent = {
  enabled: true,
  eyebrow: "PRODUCT SEARCH",
  titleLineOne: "Find the Right",
  titleAccent: "Sheet Metal Machine",
  titleSuffix: "in Seconds",
  description: "Already know the machine you need? Enter its name, model or series below to quickly find the right equipment.",
  placeholder: "Enter a machine name, model or series...",
  buttonLabel: "Find Machine",
  popularTitle: "POPULAR SEARCHES",
  viewAllLabel: "View All Results",
  loadingLabel: "Searching machines...",
  noResultsLabel: "No matching machines found.",
  errorLabel: "Search is temporarily unavailable.",
  background: {
    desktopImage: backgroundImage,
    tabletImage: backgroundImage,
    mobileImage: backgroundImage,
    desktopPosition: "center center",
    tabletPosition: "60% center",
    mobilePosition: "68% center",
    fit: "cover",
    color: "#0B0D10",
    overlayColor: "#071019",
    overlayOpacity: 86,
    gradientDirection: "to-right",
    gradientStop: 72,
  },
  typography: {
    eyebrowSize: 14,
    eyebrowSpacing: 3,
    titleSize: 52,
    titleWeight: 650,
    titleLineHeight: 1.08,
    titleColor: "#FFFFFF",
    accentColor: "#80C900",
    accentItalic: true,
    suffixItalic: true,
    descriptionSize: 16,
    descriptionColor: "#C5CBD2",
  },
  appearance: {
    maxWidth: 1600,
    sectionHeight: 900,
    paddingY: 72,
    searchHeight: 116,
    searchWidth: 95,
    buttonWidth: 380,
    cutSize: 28,
    borderColor: "#FFFFFF",
    searchBackground: "#1A1D21",
    searchOpacity: 76,
    buttonColor: "#80C900",
    buttonHoverColor: "#9BE000",
    buttonTextColor: "#0B0D10",
    dividerColor: "#69727C",
  },
  responsive: {
    tabletTitleSize: 48,
    tabletSearchHeight: 88,
    mobileTitleSize: 36,
    mobileSearchHeight: 62,
    mobilePaddingY: 56,
  },
  suggestionLimit: 5,
  debounceMs: 250,
  popularItems: [
    { id: "shearing", label: "Shearing Machine", keyword: "Shearing Machine", productId: "", icon: "/icons/product-search/shearing-machine.svg", visible: true, iconColor: "#FFFFFF", iconHoverColor: "#80C900", iconSize: 48 },
    { id: "press-brake", label: "CNC Press Brake", keyword: "CNC Press Brake", productId: "", icon: "/icons/product-search/cnc-press-brake.svg", visible: true, iconColor: "#FFFFFF", iconHoverColor: "#80C900", iconSize: 48 },
    { id: "fiber-laser", label: "Fiber Laser", keyword: "Fiber Laser", productId: "", icon: "/icons/product-search/fiber-laser.svg", visible: true, iconColor: "#FFFFFF", iconHoverColor: "#80C900", iconSize: 48 },
    { id: "plate-rolling", label: "Plate Rolling", keyword: "Plate Rolling", productId: "", icon: "/icons/product-search/plate-rolling.svg", visible: true, iconColor: "#FFFFFF", iconHoverColor: "#80C900", iconSize: 48 },
  ],
  features: [
    { id: "fast-search", title: "Fast Search", description: "Find the equipment you need quickly.", icon: "/icons/product-search/fast-search.svg", visible: true, iconColor: "#80C900", iconSize: 52 },
    { id: "precise-match", title: "Precise Match", description: "Search by machine name, model or series.", icon: "/icons/product-search/precise-match.svg", visible: true, iconColor: "#80C900", iconSize: 52 },
    { id: "full-range", title: "Full Product Range", description: "Explore our complete machine portfolio.", icon: "/icons/product-search/full-product-range.svg", visible: true, iconColor: "#80C900", iconSize: 52 },
  ],
};

export type ProductSearchIndexItem = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  categoryName: string;
  categorySlug: string;
  image: string;
  imageAlt: string;
  models: string[];
  aliases: string[];
};

type ProductSearchCategorySource = {
  id: string;
  slug: string;
  name: string;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    summary: string;
    models: Array<{ name: string; sku: string | null }>;
  }>;
};

type ProductSearchPublicProduct = {
  id: string;
  categoryId: string;
  image: string;
};

export function buildProductSearchIndex(
  categories: ProductSearchCategorySource[],
  publicProducts: ProductSearchPublicProduct[],
  content: ProductSearchContent,
): ProductSearchIndexItem[] {
  const publicBySlug = new Map(publicProducts.map((product) => [product.id, product]));
  const aliasesByProductId = new Map<string, string[]>();
  for (const popular of content.popularItems) {
    if (!popular.productId) continue;
    const aliases = aliasesByProductId.get(popular.productId) ?? [];
    aliases.push(popular.keyword);
    aliasesByProductId.set(popular.productId, aliases);
  }

  return categories.flatMap((category) => category.products.flatMap((product) => {
    const publicProduct = publicBySlug.get(product.slug);
    if (!publicProduct) return [];
    const modelNames = product.models.flatMap((model) => [model.name, ...(model.sku ? [model.sku] : [])]);
    return [{
      id: product.id,
      slug: product.slug,
      name: product.name,
      summary: product.summary,
      categoryName: category.name,
      categorySlug: category.slug,
      image: publicProduct.image,
      imageAlt: product.name,
      models: Array.from(new Set(modelNames)),
      aliases: Array.from(new Set(aliasesByProductId.get(product.id) ?? [])),
    }];
  }));
}

export function normalizeProductSearchQuery(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[×✕]/g, "x")
    .replace(/(?<=\d)x(?=\d)/g, " x ")
    .replace(/[‐‑‒–—−/_.-]+/g, " ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreProduct(query: string, item: ProductSearchIndexItem) {
  const name = normalizeProductSearchQuery(item.name);
  const slug = normalizeProductSearchQuery(item.slug);
  const category = normalizeProductSearchQuery(item.categoryName);
  const summary = normalizeProductSearchQuery(item.summary);
  const models = item.models.map(normalizeProductSearchQuery);
  const aliases = item.aliases.map(normalizeProductSearchQuery);

  if (models.includes(query)) return 1_000;
  if (name === query) return 900;
  if (name.startsWith(query)) return 800;
  if (name.includes(query) || slug.includes(query)) return 700;
  if (aliases.includes(query)) return 650;
  if (aliases.some((alias) => alias.includes(query))) return 600;
  if (models.some((model) => model.includes(query))) return 580;
  if (category === query) return 500;
  if (category.includes(query)) return 450;
  if (summary.includes(query)) return 300;

  const tokens = query.split(" ");
  const haystack = [name, slug, category, summary, ...models, ...aliases].join(" ");
  return tokens.every((token) => haystack.includes(token)) ? 250 : 0;
}

export function rankProductSearchResults(query: string, items: ProductSearchIndexItem[], limit = 5) {
  const normalized = normalizeProductSearchQuery(query);
  if (normalized.length < 2) return [];
  return items
    .map((item) => ({ item, score: scoreProduct(normalized, item) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name))
    .slice(0, Math.max(0, limit))
    .map(({ item }) => item);
}
