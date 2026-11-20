import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";

/**
 * Optional published marketing sections for an existing route.
 * Preserves the operational product catalogue, existing SEO and working inquiry form.
 * Drafts are never exposed by this component.
 */
export async function ManagedPageSections({ slug }: { slug: string }) {
  const document = await getPublishedPageBySlug(slug);
  if (!document?.nodes.length) return null;
  return <PageRenderer document={document} />;
}
