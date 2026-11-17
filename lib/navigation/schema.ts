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

export type NavigationSnapshot = {
  schemaVersion: 1;
  primary: NavigationNode[];
  quote: NavigationNode;
  languages: LanguageNavigationLink[];
  footerGroups: FooterNavigationGroup[];
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
}

export const navigationSnapshotSchema: z.ZodType<NavigationSnapshot> = z.object({
  schemaVersion: z.literal(1),
  primary: z.array(navigationNodeSchema).min(1).max(20),
  quote: navigationNodeSchema,
  languages: z.array(languageNavigationLinkSchema).max(30),
  footerGroups: z.array(footerNavigationGroupSchema).max(12),
}).strict().superRefine(validateDocumentStructure);

export function parseNavigationSnapshot(raw: unknown) {
  return navigationSnapshotSchema.parse(raw);
}
