import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/admin/pages/PageBuilder";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";
import { parsePageDocument, PageNotFoundError, PageService } from "@/lib/services/page-service";
import { ProductAdminService } from "@/lib/services/product-admin-service";
import { alignProductSearchTypography, DEFAULT_PRODUCT_SEARCH_CONTENT, productSearchContentSchema } from "@/lib/product-search/config";
import { DEFAULT_PRODUCT_SELECTION_CONTENT } from "@/lib/product-selection/config";

export const dynamic = "force-dynamic";

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("page.read");
  const { id } = await params;
  try {
    const [page, categoryResult, publishedCategories] = await Promise.all([
      new PageService().get(principal, id),
      can(principal, "category.read")
        ? new ProductAdminService().listCategories(principal, { page: 1, pageSize: 100 })
        : Promise.resolve({ items: [] }),
      listPublishedCategories(),
    ]);
    const categoryOptions = categoryResult.items.map((item) => ({ id: item.id, name: item.name, slug: item.slug, status: item.status }));
    const { products: publicProducts } = buildPublicCatalogueView(publishedCategories);
    const publicProductBySlug = new Map(publicProducts.map((product) => [product.id, product]));
    const productOptions = publishedCategories.flatMap((category) => category.products.map((product) => {
      const publicProduct = publicProductBySlug.get(product.slug);
      return {
        id: product.id,
        categoryId: category.id,
        name: product.name,
        slug: product.slug,
        summary: product.summary,
        image: publicProduct?.image ?? "/products/product-center-hero.png",
        imageAlt: product.name,
      };
    }));
    const parsedDocument = parsePageDocument(page.draftContent);
    const storedDocument = {
      ...parsedDocument,
      nodes: parsedDocument.nodes.map((node) => {
        if (node.type !== "PRODUCT_SEARCH") return node;
        const parsed = productSearchContentSchema.safeParse(node.content);
        return parsed.success ? { ...node, content: alignProductSearchTypography(parsed.data) } : node;
      }),
    };
    const document = page.slug === "products"
      ? {
          ...storedDocument,
          nodes: [
            ...storedDocument.nodes,
            ...(!storedDocument.nodes.some((node) => node.type === "PRODUCT_SEARCH")
              ? [{ id: "products-premium-search", type: "PRODUCT_SEARCH" as const, placement: "REPLACE_LEGACY" as const, content: DEFAULT_PRODUCT_SEARCH_CONTENT }]
              : []),
            ...(!storedDocument.nodes.some((node) => node.type === "PRODUCT_SELECTION_CENTER")
              ? [{ id: "product-selection-center", type: "PRODUCT_SELECTION_CENTER" as const, placement: "REPLACE_LEGACY" as const, content: DEFAULT_PRODUCT_SELECTION_CONTENT }]
              : []),
          ],
        }
      : storedDocument;
    return <PageBuilder page={{ id: page.id, name: page.name, slug: page.slug, status: page.status, version: page.version, document }} canPublish={can(principal, "page.publish")} categoryOptions={categoryOptions} productOptions={productOptions} />;
  } catch (error) { if (error instanceof PageNotFoundError) notFound(); throw error; }
}
