import { z } from "zod";

const shortText = z.string().max(240);
const text = z.string().max(5_000);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const mediaPath = z.string().max(2_048).refine((value) => value === "" || (value.startsWith("/") && !value.startsWith("//")), "Use a site-relative media path.");
const safeId = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);

export const productSelectionFilterSchema = z.object({
  id: safeId,
  label: shortText.min(1),
  adminLabel: shortText.min(1),
  categorySlugs: z.array(shortText).max(16),
  machineTypes: z.array(shortText).max(30),
  unit: shortText,
  dataType: z.enum(["TEXT", "NUMBER", "BOOLEAN"]),
  control: z.enum(["SINGLE_SELECT", "MULTI_SELECT", "NUMBER_MIN", "NUMBER_MAX", "NUMBER_RANGE", "BOOLEAN"]),
  sourceFields: z.array(shortText.min(1)).min(1).max(12),
  options: z.array(shortText.min(1)).max(60),
  min: z.number().finite().nullable(),
  max: z.number().finite().nullable(),
  step: z.number().positive().max(100_000),
  enabled: z.boolean(),
  expanded: z.boolean(),
  showOnCard: z.boolean(),
  showInCompare: z.boolean(),
  position: z.number().int().min(0).max(1_000),
}).strict();

const productOverrideSchema = z.object({
  productId: z.string().min(1).max(120),
  title: shortText,
  summary: text,
  image: mediaPath,
  imageAlt: shortText,
  recommendedPosition: z.number().int().min(0).max(10_000),
  hidden: z.boolean(),
}).strict();

export const productSelectionContentSchema = z.object({
  enabled: z.boolean(),
  eyebrow: shortText.min(1),
  title: shortText.min(1),
  subtitle: shortText.min(1),
  description: text,
  search: z.object({
    enabled: z.boolean(), placeholder: shortText, buttonLabel: shortText, suggestions: z.boolean(),
    noResultsTitle: shortText, noResultsBody: text, resetLabel: shortText,
    synonyms: z.array(z.object({ term: shortText.min(1), aliases: z.array(shortText.min(1)).min(1).max(30) }).strict()).max(100),
  }).strict(),
  display: z.object({
    defaultCategorySlug: shortText, defaultSort: z.enum(["RECOMMENDED", "NEWEST", "NAME_AZ", "NAME_ZA"]),
    perPage: z.number().int().min(3).max(60), loadMoreLabel: shortText, filtersLabel: shortText, resetAllLabel: shortText,
    sortLabel: shortText, resultsLabel: shortText, allMachinesLabel: shortText, gridColumnsDesktop: z.number().int().min(2).max(4),
    gridColumnsTablet: z.number().int().min(1).max(3), gridColumnsMobile: z.number().int().min(1).max(2),
  }).strict(),
  design: z.object({
    backgroundColor: color, backgroundImage: mediaPath, maxWidth: z.number().int().min(960).max(1_920),
    paddingY: z.number().int().min(48).max(180), paddingX: z.number().int().min(16).max(96), filterWidth: z.number().int().min(220).max(360),
    gap: z.number().int().min(16).max(64), cardBackground: color, cardBorder: color, cardRadius: z.number().int().min(0).max(24),
    imageBackground: color, accentColor: color, titleColor: color, bodyColor: color,
    eyebrowSize: z.number().int().min(11).max(24), titleSize: z.number().int().min(32).max(72), subtitleSize: z.number().int().min(16).max(36),
    bodySize: z.number().int().min(13).max(24), titleAlign: z.enum(["left", "center", "right"]),
  }).strict(),
  cards: z.object({
    viewLabel: shortText, compareLabel: shortText, removeCompareLabel: shortText, parameterCount: z.number().int().min(2).max(6),
    seriesLabel: shortText, missingValueLabel: shortText, overrides: z.array(productOverrideSchema).max(200),
  }).strict(),
  compare: z.object({
    enabled: z.boolean(), maxItems: z.number().int().min(2).max(6), minItems: z.number().int().min(2).max(6),
    allowCrossCategory: z.boolean(), title: shortText, clearLabel: shortText, buttonLabel: shortText, closeLabel: shortText, quoteLabel: shortText,
  }).strict().refine((value) => value.minItems <= value.maxItems, "Minimum compare items must not exceed maximum."),
  consultation: z.object({ enabled: z.boolean(), title: shortText, description: text, buttonLabel: shortText, href: z.string().max(2_048).refine((value) => value.startsWith("/") && !value.startsWith("//")) }).strict(),
  filters: z.array(productSelectionFilterSchema).max(80),
}).strict();

export type ProductSelectionContent = z.infer<typeof productSelectionContentSchema>;
export type ProductSelectionFilter = z.infer<typeof productSelectionFilterSchema>;

const defaultFilter = (id: string, label: string, sourceFields: string[], dataType: "TEXT" | "NUMBER" = "TEXT", control: ProductSelectionFilter["control"] = "MULTI_SELECT", categorySlugs: string[] = []): ProductSelectionFilter => ({
  id, label, adminLabel: label, categorySlugs, machineTypes: [], unit: dataType === "NUMBER" ? "mm" : "", dataType, control, sourceFields, options: [], min: null, max: null, step: 1, enabled: true, expanded: false, showOnCard: true, showInCompare: true, position: 0,
});

export const DEFAULT_PRODUCT_SELECTION_CONTENT: ProductSelectionContent = {
  enabled: true,
  eyebrow: "PRODUCT EXPLORER",
  title: "Explore All Machines",
  subtitle: "Find the Right Machine for Your Production.",
  description: "Explore our range of industrial sheet metal fabrication machinery. Filter by material, processing capacity, working dimensions and control system to find the right equipment for your production requirements.",
  search: {
    enabled: true, placeholder: "Search by product name, model or keyword...", buttonLabel: "Search", suggestions: true,
    noResultsTitle: "No machines match your current selection.", noResultsBody: "Try adjusting your filters or contact our engineering team for assistance.", resetLabel: "Reset Filters",
    synonyms: [
      { term: "hydraulic shear", aliases: ["guillotine shear", "sheet metal cutter"] },
      { term: "press brake", aliases: ["bending machine", "metal bender"] },
      { term: "fiber laser", aliases: ["laser cutter", "sheet laser"] },
    ],
  },
  display: {
    defaultCategorySlug: "", defaultSort: "RECOMMENDED", perPage: 9, loadMoreLabel: "Load More Machines", filtersLabel: "Filters",
    resetAllLabel: "Reset All", sortLabel: "Sort By", resultsLabel: "machine series", allMachinesLabel: "All Machines",
    gridColumnsDesktop: 3, gridColumnsTablet: 2, gridColumnsMobile: 1,
  },
  design: {
    backgroundColor: "#F5F6F8", backgroundImage: "", maxWidth: 1440, paddingY: 110, paddingX: 32, filterWidth: 272, gap: 32,
    cardBackground: "#FFFFFF", cardBorder: "#E1E4E8", cardRadius: 6, imageBackground: "#F2F4F6", accentColor: "#80C900",
    titleColor: "#0B0D10", bodyColor: "#595E66", eyebrowSize: 14, titleSize: 52, subtitleSize: 22, bodySize: 16, titleAlign: "left",
  },
  cards: { viewLabel: "View Details", compareLabel: "Add to Compare", removeCompareLabel: "Selected", parameterCount: 4, seriesLabel: "MACHINE SERIES", missingValueLabel: "By Model", overrides: [] },
  compare: { enabled: true, maxItems: 3, minItems: 2, allowCrossCategory: true, title: "Compare Machines", clearLabel: "Clear All", buttonLabel: "Compare Machines", closeLabel: "Close Comparison", quoteLabel: "Request a Quote" },
  consultation: { enabled: true, title: "Need Help Finding the Right Machine?", description: "Our engineering team can help you evaluate your processing requirements and select the right equipment for your production.", buttonLabel: "Get Expert Advice", href: "/contact" },
  filters: [
    defaultFilter("machine-type", "Machine Type", ["Machine Type", "Type"]),
    defaultFilter("material", "Material", ["Material", "Applicable Material"]),
    defaultFilter("working-thickness", "Working Thickness", ["Working Thickness", "Cutting Thickness", "Material Thickness", "Rolling Thickness"], "NUMBER", "NUMBER_MIN"),
    defaultFilter("working-length", "Working Length", ["Working Length", "Cutting Length", "Bending Length", "Rolling Width", "Working Width"], "NUMBER", "NUMBER_MIN"),
    defaultFilter("control-system", "Control System", ["Control System", "Controller", "CNC System"]),
    defaultFilter("automation", "Automation Level", ["Automation Level", "Automation"]),
    defaultFilter("application", "Application", ["Application", "Applications", "Processing Type"]),
  ].map((filter, position) => ({ ...filter, position })),
};

export type ProductSelectionSpecification = { value: string; unit: string };
export type ProductSelectionModel = { id: string; name: string; sku: string | null; specifications: Record<string, ProductSelectionSpecification[]> };
export type ProductSelectionItem = {
  id: string; slug: string; name: string; summary: string; categoryId: string; categorySlug: string; categoryName: string;
  image: string; imageAlt: string; position: number; publishedAt: string; models: ProductSelectionModel[];
};

type CategorySource = { id: string; slug: string; name: string; products: Array<{ id: string; slug: string; name: string; summary: string; position: number; publishedAt: Date | null; models: Array<{ id: string; name: string; sku: string | null; values: Array<{ value: string; field: { name: string; unit: string | null } }> }> }> };
type PublicProduct = { id: string; categoryId: string; image: string };

export function buildProductSelectionIndex(categories: CategorySource[], publicProducts: PublicProduct[]): ProductSelectionItem[] {
  const publicBySlug = new Map(publicProducts.map((product) => [product.id, product]));
  return categories.flatMap((category) => category.products.flatMap((product) => {
    const publicProduct = publicBySlug.get(product.slug);
    if (!publicProduct) return [];
    return [{
      id: product.id, slug: product.slug, name: product.name, summary: product.summary, categoryId: category.id, categorySlug: category.slug, categoryName: category.name,
      image: publicProduct.image, imageAlt: product.name, position: product.position, publishedAt: product.publishedAt?.toISOString() ?? "",
      models: product.models.map((model) => ({
        id: model.id, name: model.name, sku: model.sku,
        specifications: model.values.reduce<Record<string, ProductSelectionSpecification[]>>((output, entry) => {
          (output[entry.field.name] ??= []).push({ value: entry.value, unit: entry.field.unit ?? "" });
          return output;
        }, {}),
      })),
    }];
  }));
}

export function normalizeSelectionText(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[×✕]/g, "x").replace(/(?<=\d)x(?=\d)/g, " x ").replace(/[‐‑‒–—−/_.-]+/g, " ").replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim().replace(/\s+/g, " ");
}

export function parseSpecificationNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return null;
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  const number = match ? Number(match[0]) : Number.NaN;
  return Number.isFinite(number) ? number : null;
}

function fieldEntries(model: ProductSelectionModel, filter: ProductSelectionFilter) {
  const names = new Set(filter.sourceFields.map(normalizeSelectionText));
  return Object.entries(model.specifications).flatMap(([name, entries]) => names.has(normalizeSelectionText(name)) ? entries : []);
}

function matchesFilter(model: ProductSelectionModel, filter: ProductSelectionFilter, selected: string[]) {
  if (!selected.length) return true;
  const entries = fieldEntries(model, filter);
  if (!entries.length) return false;
  if (filter.dataType === "NUMBER") {
    const values = entries.map((entry) => parseSpecificationNumber(entry.value)).filter((value): value is number => value !== null);
    if (!values.length) return false;
    const requested = selected.map(Number).filter(Number.isFinite);
    if (!requested.length) return true;
    if (filter.control === "NUMBER_MIN") return values.some((value) => value >= requested[0]);
    if (filter.control === "NUMBER_MAX") return values.some((value) => value <= requested[0]);
    if (filter.control === "NUMBER_RANGE") return values.some((value) => value >= Math.min(...requested) && value <= Math.max(...requested));
  }
  const actual = entries.map((entry) => normalizeSelectionText(entry.value));
  const desired = selected.map(normalizeSelectionText);
  return filter.control === "SINGLE_SELECT" ? actual.includes(desired[0]) : desired.some((value) => actual.includes(value));
}

function searchTerms(query: string, content: ProductSelectionContent) {
  const normalized = normalizeSelectionText(query);
  for (const group of content.search.synonyms) {
    const values = [group.term, ...group.aliases].map(normalizeSelectionText);
    if (values.some((value) => normalized.includes(value))) return normalizeSelectionText(group.term).split(" ").filter(Boolean);
  }
  return normalized.split(" ").filter(Boolean);
}

export type ProductSelectionState = { query: string; category: string; filters: Record<string, string[]>; sort: "RECOMMENDED" | "NEWEST" | "NAME_AZ" | "NAME_ZA"; page: number };

export function applyProductSelection(items: ProductSelectionItem[], content: ProductSelectionContent, state: ProductSelectionState) {
  const terms = searchTerms(state.query, content);
  const activeFilters = content.filters.filter((filter) => filter.enabled && (state.filters[filter.id]?.length ?? 0) > 0);
  const overrides = new Map(content.cards.overrides.map((override) => [override.productId, override]));
  const filtered = items.filter((item) => {
    const override = overrides.get(item.id);
    if (override?.hidden) return false;
    if (state.category && item.categorySlug !== state.category) return false;
    const haystack = normalizeSelectionText([item.name, item.summary, item.categoryName, ...item.models.flatMap((model) => [model.name, model.sku ?? "", ...Object.values(model.specifications).flatMap((entries) => entries.map((entry) => entry.value))])].join(" "));
    if (terms.length && !terms.every((term) => haystack.includes(term))) return false;
    if (!activeFilters.length) return true;
    return item.models.some((model) => activeFilters.every((filter) => {
      if (filter.categorySlugs.length && !filter.categorySlugs.includes(item.categorySlug)) return true;
      return matchesFilter(model, filter, state.filters[filter.id] ?? []);
    }));
  });
  filtered.sort((left, right) => {
    if (state.sort === "NEWEST") return right.publishedAt.localeCompare(left.publishedAt);
    if (state.sort === "NAME_AZ") return left.name.localeCompare(right.name);
    if (state.sort === "NAME_ZA") return right.name.localeCompare(left.name);
    return (overrides.get(left.id)?.recommendedPosition ?? left.position) - (overrides.get(right.id)?.recommendedPosition ?? right.position);
  });
  const page = Math.max(1, state.page);
  const visible = filtered.slice(0, page * content.display.perPage);
  return { items: visible, total: filtered.length, hasMore: visible.length < filtered.length };
}

export function productDisplay(item: ProductSelectionItem, content: ProductSelectionContent) {
  const override = content.cards.overrides.find((candidate) => candidate.productId === item.id);
  return { ...item, name: override?.title || item.name, summary: override?.summary || item.summary, image: override?.image || item.image, imageAlt: override?.imageAlt || item.imageAlt };
}

export function cardSpecifications(item: ProductSelectionItem, content: ProductSelectionContent) {
  return content.filters.filter((filter) => filter.enabled && filter.showOnCard && (!filter.categorySlugs.length || filter.categorySlugs.includes(item.categorySlug))).sort((a, b) => a.position - b.position).slice(0, content.cards.parameterCount).map((filter) => {
    const values = item.models.flatMap((model) => fieldEntries(model, filter).map((entry) => `${entry.value}${entry.unit ? ` ${entry.unit}` : ""}`));
    return { id: filter.id, label: filter.label, value: values.length ? Array.from(new Set(values)).slice(0, 2).join(" / ") : content.cards.missingValueLabel };
  });
}

export function filterOptions(items: ProductSelectionItem[], filter: ProductSelectionFilter, categorySlug = "") {
  const values = items.filter((item) => !categorySlug || item.categorySlug === categorySlug).flatMap((item) => item.models.flatMap((model) => fieldEntries(model, filter).map((entry) => entry.value)));
  return Array.from(new Set([...filter.options, ...values])).sort((a, b) => a.localeCompare(b));
}
