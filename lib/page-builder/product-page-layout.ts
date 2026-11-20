import type { PageDocument, PageNode } from "@/lib/page-builder/schema";

export type ProductPageLayout = {
  before: PageNode[];
  replacement: PageNode[];
  after: PageNode[];
};

export function resolveProductPageLayout(
  document: PageDocument | null | undefined,
): ProductPageLayout {
  if (!document) return { before: [], replacement: [], after: [] };
  if (document.renderMode === "REPLACE_LEGACY") {
    return { before: [], replacement: document.nodes, after: [] };
  }

  return document.nodes.reduce<ProductPageLayout>(
    (layout, node) => {
      const placement = node.placement ?? "AFTER_LEGACY";
      if (placement === "BEFORE_LEGACY") layout.before.push(node);
      else if (placement === "REPLACE_LEGACY") layout.replacement.push(node);
      else layout.after.push(node);
      return layout;
    },
    { before: [], replacement: [], after: [] },
  );
}
