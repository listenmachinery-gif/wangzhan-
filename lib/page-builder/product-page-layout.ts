import { PRODUCT_PAGE_SLOT_PLACEMENTS, type PageDocument, type PageNode, type ProductPageSlotPlacement } from "@/lib/page-builder/schema";

export type ProductPageLayout = {
  before: PageNode[];
  replacement: PageNode[];
  after: PageNode[];
  inner: PageNode[];
  slots: Partial<Record<ProductPageSlotPlacement, PageNode[]>>;
};

export function resolveProductPageLayout(
  document: PageDocument | null | undefined,
): ProductPageLayout {
  if (!document) return { before: [], replacement: [], after: [], inner: [], slots: {} };
  if (document.renderMode === "REPLACE_LEGACY") {
    return { before: [], replacement: document.nodes, after: [], inner: [], slots: {} };
  }

  return document.nodes.reduce<ProductPageLayout>(
    (layout, node) => {
      const placement = node.placement ?? "AFTER_LEGACY";
      if (placement === "BEFORE_LEGACY") layout.before.push(node);
      else if (placement === "REPLACE_LEGACY") layout.replacement.push(node);
      else if ((PRODUCT_PAGE_SLOT_PLACEMENTS as readonly string[]).includes(placement)) {
        const slot = placement as ProductPageSlotPlacement;
        layout.inner.push(node);
        (layout.slots[slot] ??= []).push(node);
      }
      else layout.after.push(node);
      return layout;
    },
    { before: [], replacement: [], after: [], inner: [], slots: {} },
  );
}
