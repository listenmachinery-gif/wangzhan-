import { z } from "zod";

export const PAGE_COMPONENT_TYPES = [
  "HEADING",
  "PARAGRAPH",
  "IMAGE",
  "VIDEO",
  "BUTTON",
  "DIVIDER",
  "SPACER",
  "ICON",
  "RICH_TEXT",
  "SECTION",
  "ROW",
  "COLUMNS",
  "GRID",
  "TABS",
  "ACCORDION",
  "HERO",
  "PRODUCT_CARDS",
  "CATEGORY_CARDS",
  "PRODUCT_CAROUSEL",
  "SPECIFICATION_TABLE",
  "MODEL_COMPARISON",
  "PRODUCT_GALLERY",
  "FACTORY_STATS",
  "CERTIFICATES",
  "CUSTOMER_CASES",
  "APPLICATIONS",
  "ADVANTAGES",
  "FAQ",
  "INQUIRY_CTA",
  "WHATSAPP_CTA",
  "DOWNLOAD_CATALOG",
  "SPLIT_FEATURE",
  "TIMELINE",
  "RESOURCE_LINKS",
  "INQUIRY_FORM",
  "MEDIA_HERO",
  "MEDIA_SHOWCASE",
  "HOME_HERO",
  "HOME_ABOUT",
  "HOME_PRODUCT_SHOWCASE",
  "HOME_WHY_CHOOSE",
  "HOME_NEWS_INSIGHTS",
  "HOME_CONTACT_CTA",
  "ABOUT_HERO",
  "ABOUT_COMPANY_OVERVIEW",
  "ABOUT_MANUFACTURING",
  "ABOUT_NUMBERS",
  "ABOUT_QUALITY",
  "ABOUT_ENGINEERING",
  "ABOUT_GLOBAL_DELIVERY",
  "ABOUT_QUOTE",
  "PRODUCT_EXPLORER",
  "PRODUCT_SEARCH",
] as const;

export type PageComponentType = (typeof PAGE_COMPONENT_TYPES)[number];

export const PRODUCT_PAGE_SLOT_PLACEMENTS = [
  "PRODUCT_AFTER_HERO",
  "PRODUCT_AFTER_ADVANTAGES",
  "PRODUCT_AFTER_APPLICATIONS",
  "PRODUCT_AFTER_GALLERY",
  "PRODUCT_AFTER_MODELS",
  "PRODUCT_AFTER_FEATURES",
  "PRODUCT_AFTER_SELECTION",
  "PRODUCT_AFTER_FAQ",
  "PRODUCT_BEFORE_INQUIRY",
] as const;

export type ProductPageSlotPlacement = (typeof PRODUCT_PAGE_SLOT_PLACEMENTS)[number];

export const PAGE_NODE_PLACEMENTS = [
  "BEFORE_LEGACY",
  "AFTER_LEGACY",
  "REPLACE_LEGACY",
  ...PRODUCT_PAGE_SLOT_PLACEMENTS,
] as const;

export type PageNodePlacement = (typeof PAGE_NODE_PLACEMENTS)[number];

const safeKeySchema = z.string().min(1).max(64).refine(
  (key) => !["html", "script", "dangerouslySetInnerHTML", "__proto__", "constructor", "prototype"].includes(key),
  "Executable or prototype-mutating content keys are not allowed.",
);

type SafeJson = string | number | boolean | null | SafeJson[] | { [key: string]: SafeJson };

const safeJsonSchema: z.ZodType<SafeJson> = z.lazy(() => z.union([
  z.string().max(20_000).refine((value) => !/<\/?script\b/i.test(value), "Script markup is not allowed."),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(safeJsonSchema).max(100),
  z.record(safeKeySchema, safeJsonSchema).superRefine((value, context) => {
    if (Object.keys(value).length > 60) {
      context.addIssue({ code: "custom", message: "Component content has too many fields." });
    }
  }),
]));

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color.");
const mediaUrlSchema = z.string().max(2_048).refine(
  (value) => value.startsWith("/") && !value.startsWith("//"),
  "Media URLs must be site-relative paths.",
);

export const pageStyleSchema = z.object({
  width: z.enum(["auto", "full", "content"]).optional(),
  maxWidth: z.number().int().min(320).max(1_920).optional(),
  minHeight: z.number().int().min(0).max(1_600).optional(),
  marginTop: z.number().int().min(0).max(240).optional(),
  marginBottom: z.number().int().min(0).max(240).optional(),
  paddingX: z.number().int().min(0).max(160).optional(),
  paddingY: z.number().int().min(0).max(240).optional(),
  gap: z.number().int().min(0).max(128).optional(),
  display: z.enum(["block", "flex", "grid"]).optional(),
  columns: z.number().int().min(1).max(6).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z.enum(["start", "center", "end", "between"]).optional(),
  backgroundColor: colorSchema.optional(),
  backgroundImage: mediaUrlSchema.optional(),
  backgroundGradient: z.object({
    direction: z.enum(["to-r", "to-b", "to-br"]),
    from: colorSchema,
    to: colorSchema,
  }).strict().optional(),
  overlayOpacity: z.number().int().min(0).max(100).optional(),
  borderColor: colorSchema.optional(),
  borderWidth: z.number().int().min(0).max(8).optional(),
  borderRadius: z.number().int().min(0).max(64).optional(),
  shadow: z.enum(["none", "sm", "md", "lg"]).optional(),
  fontFamily: z.enum(["sans", "serif", "mono"]).optional(),
  fontSize: z.number().int().min(10).max(96).optional(),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
  lineHeight: z.number().min(1).max(2).optional(),
  letterSpacing: z.number().min(-2).max(8).optional(),
  textColor: colorSchema.optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  objectFit: z.enum(["cover", "contain"]).optional(),
  objectPosition: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  buttonStyle: z.enum(["primary", "secondary", "outline", "link"]).optional(),
  zIndex: z.number().int().min(-1).max(20).optional(),
  visible: z.boolean().optional(),
}).strict();

export type PageStyle = z.infer<typeof pageStyleSchema>;

export const pageTextStyleSchema = z.object({
  color: colorSchema.optional(),
  fontFamily: z.enum(["sans", "serif", "mono"]).optional(),
  fontSize: z.number().int().min(10).max(96).optional(),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
  lineHeight: z.number().min(1).max(2).optional(),
  letterSpacing: z.number().min(-2).max(8).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
}).strict();

export type PageTextStyle = z.infer<typeof pageTextStyleSchema>;

export type PageNode = {
  id: string;
  type: PageComponentType;
  /**
   * Controls where managed modules appear on routes that still have a proven
   * legacy product or catalogue layout. Older documents intentionally default
   * to AFTER_LEGACY so existing publications keep their current appearance.
   */
  placement?: PageNodePlacement;
  content: SafeJson;
  style?: PageStyle;
  responsive?: { tablet?: PageStyle; mobile?: PageStyle };
  textStyles?: Record<string, PageTextStyle>;
  responsiveTextStyles?: {
    tablet?: Record<string, PageTextStyle>;
    mobile?: Record<string, PageTextStyle>;
  };
  children?: PageNode[];
};

export const PAGE_RENDER_MODES = [
  "AUGMENT_LEGACY",
  "REPLACE_LEGACY",
] as const;

export type PageRenderMode = (typeof PAGE_RENDER_MODES)[number];

export const pageNodeSchema: z.ZodType<PageNode> = z.lazy(() => z.object({
  id: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  type: z.enum(PAGE_COMPONENT_TYPES),
  placement: z.enum(PAGE_NODE_PLACEMENTS).optional(),
  content: safeJsonSchema,
  style: pageStyleSchema.optional(),
  responsive: z.object({
    tablet: pageStyleSchema.optional(),
    mobile: pageStyleSchema.optional(),
  }).strict().optional(),
  textStyles: z.record(safeKeySchema, pageTextStyleSchema).optional(),
  responsiveTextStyles: z.object({
    tablet: z.record(safeKeySchema, pageTextStyleSchema).optional(),
    mobile: z.record(safeKeySchema, pageTextStyleSchema).optional(),
  }).strict().optional(),
  children: z.array(pageNodeSchema).max(24).optional(),
}).strict());

export const pageDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  renderMode: z.enum(PAGE_RENDER_MODES).optional(),
  nodes: z.array(pageNodeSchema).max(100),
}).strict().superRefine((document, context) => {
  let total = 0;
  const ids = new Set<string>();
  const visit = (nodes: PageNode[]) => {
    for (const node of nodes) {
      total += 1;
      if (ids.has(node.id)) {
        context.addIssue({ code: "custom", message: `Duplicate page node id: ${node.id}` });
      }
      ids.add(node.id);
      if (node.children) visit(node.children);
    }
  };
  visit(document.nodes);
  if (total > 100) context.addIssue({ code: "custom", message: "A page may contain at most 100 nodes." });
});

export type PageDocument = z.infer<typeof pageDocumentSchema>;

export const emptyPageDocument: PageDocument = { schemaVersion: 1, nodes: [] };
