import { z } from "zod";

export type NavigationNodeKind = "LINK" | "PRODUCT_DIRECTORY" | "GROUP";

export type NavigationNode = {
  id: string;
  kind: NavigationNodeKind;
  label: string;
  href?: string;
  visible: boolean;
  children?: NavigationNode[];
};

export type LanguageNavigationLink = {
  id: string;
  label: string;
  locale: string;
  href: string;
  visible: boolean;
};

export type FooterNavigationGroup = {
  id: string;
  label: string;
  items: NavigationNode[];
};

export type MachinesProductConfig = {
  productId: string;
  displayNameOverride?: string;
  shortDescriptionOverride?: string;
  imageOverride?: string;
  altOverride?: string;
  hrefOverride?: string;
  sortOrder: number;
  enabled: boolean;
};

export type MachinesCategoryConfig = {
  categoryId: string;
  displayName?: string;
  description?: string;
  image?: string;
  hrefOverride?: string;
  sortOrder: number;
  enabled: boolean;
  isDefault: boolean;
  products: MachinesProductConfig[];
};

export type MachinesMenuConfig = {
  enabled: boolean;
  mode: "MANUAL" | "AUTO";
  categories: MachinesCategoryConfig[];
  settings: {
    visualPresetVersion?: 2;
    desktopColumns: 3 | 4;
    showCounts: boolean;
    showDescriptions: boolean;
    showImages: boolean;
    showEmptyCategories: boolean;
    backdrop: boolean;
    openDelayMs: number;
    closeDelayMs: number;
    mobileShowImages: boolean;
    mobileShowDescriptions: boolean;
    mobileStickyCta: boolean;
    ctaLabel: string;
    ctaHref: string;
    categoryFontSize?: number;
    categoryTextColor?: string;
    categoryActiveTextColor?: string;
    categoryRowGap?: number;
    categoryRowPaddingY?: number;
    rightHeadingFontSize?: number;
    rightHeadingColor?: string;
    rightDescriptionFontSize?: number;
    rightDescriptionColor?: string;
    productTitleFontSize?: number;
    productTitleColor?: string;
    productDescriptionFontSize?: number;
    productDescriptionColor?: string;
    rightLinkFontSize?: number;
    rightLinkColor?: string;
  };
};

export type NavigationSnapshot = {
  schemaVersion: 1;
  primary: NavigationNode[];
  quote: NavigationNode;
  languages: LanguageNavigationLink[];
  footerGroups: FooterNavigationGroup[];
  machines?: MachinesMenuConfig;
  footer?: {
    brandName: string;
    description: string;
    email: string;
    whatsapp: string;
    address: string;
    ctaLabel: string;
    ctaHref: string;
    copyright: string;
    productCategories?: {
      visible: boolean;
      label: string;
    };
    actionLinks?: {
      label: string;
      items: NavigationNode[];
    };
    newsletter?: {
      visible: boolean;
      title: string;
      description: string;
      ctaLabel: string;
      ctaHref: string;
    };
    legalLinks?: NavigationNode[];
  };
};

const idSchema = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const labelSchema = z.string().trim().min(1).max(100);
const localeSchema = z.string().trim().min(2).max(20).regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/);

export function validateInternalHref(href: string) {
  return href.startsWith("/")
    && !href.startsWith("//")
    && !href.includes("\\")
    && !/[\u0000-\u001F\u007F]/.test(href);
}

function validateHref(href: string) {
  if (validateInternalHref(href)) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

const hrefSchema = z.string().trim().min(1).max(500).refine(validateHref, "Navigation href must be an internal path or HTTPS URL.");
const internalMediaSchema = z.string().trim().min(1).max(500).refine(validateInternalHref, "Machines media must use a permanent internal path.");
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Machines colors must use six-digit hex values.");

const navigationNodeSchema: z.ZodType<NavigationNode> = z.lazy(() => z.object({
  id: idSchema,
  kind: z.enum(["LINK", "PRODUCT_DIRECTORY", "GROUP"]),
  label: labelSchema,
  href: hrefSchema.optional(),
  visible: z.boolean(),
  children: z.array(navigationNodeSchema).max(30).optional(),
}).strict().superRefine((node, context) => {
  if (node.kind !== "GROUP" && !node.href) {
    context.addIssue({ code: "custom", path: ["href"], message: `${node.kind} nodes require an href.` });
  }
  if (node.kind === "PRODUCT_DIRECTORY" && node.children?.length) {
    context.addIssue({ code: "custom", path: ["children"], message: "Product directory children come from the published catalogue." });
  }
}));

const languageNavigationLinkSchema: z.ZodType<LanguageNavigationLink> = z.object({
  id: idSchema,
  label: labelSchema,
  locale: localeSchema,
  href: hrefSchema,
  visible: z.boolean(),
}).strict();

const footerNavigationGroupSchema: z.ZodType<FooterNavigationGroup> = z.object({
  id: idSchema,
  label: labelSchema,
  items: z.array(navigationNodeSchema).max(30),
}).strict();

const machinesProductSchema: z.ZodType<MachinesProductConfig> = z.object({
  productId: idSchema,
  displayNameOverride: labelSchema.optional(),
  shortDescriptionOverride: z.string().trim().min(1).max(240).optional(),
  imageOverride: internalMediaSchema.optional(),
  altOverride: z.string().trim().min(1).max(160).optional(),
  hrefOverride: hrefSchema.optional(),
  sortOrder: z.number().int().min(0).max(999),
  enabled: z.boolean(),
}).strict();

const machinesCategorySchema: z.ZodType<MachinesCategoryConfig> = z.object({
  categoryId: idSchema,
  displayName: labelSchema.optional(),
  description: z.string().trim().min(1).max(300).optional(),
  image: internalMediaSchema.optional(),
  hrefOverride: hrefSchema.optional(),
  sortOrder: z.number().int().min(0).max(999),
  enabled: z.boolean(),
  isDefault: z.boolean(),
  products: z.array(machinesProductSchema).max(120),
}).strict().superRefine((category, context) => {
  const productIds = new Set<string>();
  category.products.forEach((product, index) => {
    if (productIds.has(product.productId)) context.addIssue({ code: "custom", path: ["products", index, "productId"], message: `Duplicate Machines product: ${product.productId}` });
    productIds.add(product.productId);
  });
});

const machinesMenuSchema: z.ZodType<MachinesMenuConfig> = z.object({
  enabled: z.boolean(),
  mode: z.enum(["MANUAL", "AUTO"]),
  categories: z.array(machinesCategorySchema).max(30),
  settings: z.object({
    visualPresetVersion: z.literal(2).optional(),
    desktopColumns: z.union([z.literal(3), z.literal(4)]),
    showCounts: z.boolean(),
    showDescriptions: z.boolean(),
    showImages: z.boolean(),
    showEmptyCategories: z.boolean(),
    backdrop: z.boolean(),
    openDelayMs: z.number().int().min(0).max(1_000),
    closeDelayMs: z.number().int().min(0).max(2_000),
    mobileShowImages: z.boolean(),
    mobileShowDescriptions: z.boolean(),
    mobileStickyCta: z.boolean(),
    ctaLabel: labelSchema,
    ctaHref: hrefSchema,
    categoryFontSize: z.number().int().min(10).max(20).optional(),
    categoryTextColor: hexColorSchema.optional(),
    categoryActiveTextColor: hexColorSchema.optional(),
    categoryRowGap: z.number().int().min(0).max(20).optional(),
    categoryRowPaddingY: z.number().int().min(6).max(24).optional(),
    rightHeadingFontSize: z.number().int().min(18).max(40).optional(),
    rightHeadingColor: hexColorSchema.optional(),
    rightDescriptionFontSize: z.number().int().min(11).max(22).optional(),
    rightDescriptionColor: hexColorSchema.optional(),
    productTitleFontSize: z.number().int().min(11).max(22).optional(),
    productTitleColor: hexColorSchema.optional(),
    productDescriptionFontSize: z.number().int().min(10).max(20).optional(),
    productDescriptionColor: hexColorSchema.optional(),
    rightLinkFontSize: z.number().int().min(10).max(18).optional(),
    rightLinkColor: hexColorSchema.optional(),
  }).strict(),
}).strict().superRefine((machines, context) => {
  const categoryIds = new Set<string>();
  let defaults = 0;
  machines.categories.forEach((category, index) => {
    if (categoryIds.has(category.categoryId)) context.addIssue({ code: "custom", path: ["categories", index, "categoryId"], message: `Duplicate Machines category: ${category.categoryId}` });
    categoryIds.add(category.categoryId);
    if (category.enabled && category.isDefault) defaults += 1;
  });
  if (defaults > 1) context.addIssue({ code: "custom", path: ["categories"], message: "Only one enabled Machines category can be the default." });
});

function validateDocumentStructure(snapshot: NavigationSnapshot, context: z.RefinementCtx) {
  const identifiers = new Set<string>();

  function register(id: string, path: Array<string | number>) {
    if (identifiers.has(id)) {
      context.addIssue({ code: "custom", path, message: `Duplicate navigation id: ${id}` });
    }
    identifiers.add(id);
  }

  function visit(node: NavigationNode, depth: number, path: Array<string | number>) {
    register(node.id, [...path, "id"]);
    if (depth > 3) {
      context.addIssue({ code: "custom", path, message: "Navigation depth cannot exceed three levels." });
    }
    node.children?.forEach((child, index) => visit(child, depth + 1, [...path, "children", index]));
  }

  snapshot.primary.forEach((node, index) => visit(node, 1, ["primary", index]));
  visit(snapshot.quote, 1, ["quote"]);
  snapshot.languages.forEach((language, index) => register(language.id, ["languages", index, "id"]));
  snapshot.footerGroups.forEach((group, groupIndex) => {
    register(group.id, ["footerGroups", groupIndex, "id"]);
    group.items.forEach((node, nodeIndex) => visit(node, 1, ["footerGroups", groupIndex, "items", nodeIndex]));
  });
  snapshot.footer?.actionLinks?.items.forEach((node, nodeIndex) => {
    visit(node, 1, ["footer", "actionLinks", "items", nodeIndex]);
  });
  snapshot.footer?.legalLinks?.forEach((node, nodeIndex) => {
    visit(node, 1, ["footer", "legalLinks", nodeIndex]);
  });
}

export const navigationSnapshotSchema: z.ZodType<NavigationSnapshot> = z.object({
  schemaVersion: z.literal(1),
  primary: z.array(navigationNodeSchema).min(1).max(20),
  quote: navigationNodeSchema,
  languages: z.array(languageNavigationLinkSchema).max(30),
  footerGroups: z.array(footerNavigationGroupSchema).max(12),
  machines: machinesMenuSchema.optional(),
  footer: z.object({
    brandName: labelSchema,
    description: z.string().trim().min(1).max(1_000),
    email: z.string().trim().email().max(254),
    whatsapp: z.string().trim().min(1).max(80),
    address: z.string().trim().min(1).max(500),
    ctaLabel: labelSchema,
    ctaHref: hrefSchema,
    copyright: z.string().trim().min(1).max(240),
    productCategories: z.object({
      visible: z.boolean(),
      label: labelSchema,
    }).strict().optional(),
    actionLinks: z.object({
      label: labelSchema,
      items: z.array(navigationNodeSchema).max(30),
    }).strict().optional(),
    newsletter: z.object({
      visible: z.boolean(),
      title: labelSchema,
      description: z.string().trim().min(1).max(500),
      ctaLabel: labelSchema,
      ctaHref: hrefSchema,
    }).strict().optional(),
    legalLinks: z.array(navigationNodeSchema).max(12).optional(),
  }).strict().optional(),
}).strict().superRefine(validateDocumentStructure);

export function parseNavigationSnapshot(raw: unknown) {
  return navigationSnapshotSchema.parse(raw);
}
