import { PageRenderer } from "@/components/page-builder/PageRenderer";
import type { PageNodePlacement } from "@/lib/page-builder/schema";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";

/**
 * Optional published marketing sections for an existing route.
 * Preserves the operational product catalogue, existing SEO and working inquiry form.
 * Drafts are never exposed by this component.
 */
export async function ManagedPageSections({
  slug,
  placement = "AFTER_LEGACY",
}: {
  slug: string;
  placement?: PageNodePlacement;
}) {
  const document = await getPublishedPageBySlug(slug);
  if (!document?.nodes.length) return null;
  const nodes = document.nodes.filter(
    (node) => (node.placement ?? "AFTER_LEGACY") === placement,
  );
  if (!nodes.length) return null;
  return <PageRenderer document={{ ...document, nodes }} />;
}
