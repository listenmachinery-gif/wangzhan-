import type { Metadata } from "next";

import {
  ProductExplorer,
  type ProductExplorerViewCategory,
} from "@/components/products/ProductExplorer";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductSelectionCenter } from "@/components/products/ProductSelectionCenter";
import { elementTypographyOverrides } from "@/components/page-builder/PageRenderer";
import { ManagedPageSections } from "@/components/site/ManagedPageSections";
import {
  DEFAULT_PRODUCT_EXPLORER_CONTENT,
  productExplorerContentSchema,
  resolveProductExplorerCard,
  resolveProductExplorerCardLayout,
  resolveProductExplorerData,
} from "@/lib/product-explorer/config";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";
import { overlayPublishedSeo } from "@/lib/repositories/seo-repository";
import {
  buildProductSearchIndex,
  DEFAULT_PRODUCT_SEARCH_CONTENT,
  productSearchContentSchema,
} from "@/lib/product-search/config";
import {
  buildProductSelectionIndex,
  DEFAULT_PRODUCT_SELECTION_CONTENT,
  productSelectionContentSchema,
} from "@/lib/product-selection/config";

export const dynamic = "force-dynamic";

const fallbackMetadata: Metadata = {
  title: "Industrial Machinery & Sheet Metal Fabrication Equipment | ZYRON",
  description:
    "Explore ZYRON shearing machines, press brakes, laser cutting machines, plate rolling equipment, hydraulic presses, duct machinery, and industrial shredders.",
  alternates: { canonical: "/products" },
};

export function generateMetadata() {
  return overlayPublishedSeo("/products", fallbackMetadata);
}

function safeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function ProductsPage() {
  const [publishedCategories, publishedPage] = await Promise.all([
    listPublishedCategories(),
    getPublishedPageBySlug("products"),
  ]);
  const explorerNode = publishedPage?.nodes.find((node) => node.type === "PRODUCT_EXPLORER");
  const searchNode = publishedPage?.nodes.find((node) => node.type === "PRODUCT_SEARCH");
  const selectionNode = publishedPage?.nodes.find((node) => node.type === "PRODUCT_SELECTION_CENTER");
  const parsedContent = productExplorerContentSchema.safeParse(explorerNode?.content);
  const content = parsedContent.success ? parsedContent.data : DEFAULT_PRODUCT_EXPLORER_CONTENT;
  const parsedSearch = productSearchContentSchema.safeParse(searchNode?.content);
  const searchContent = parsedSearch.success ? parsedSearch.data : DEFAULT_PRODUCT_SEARCH_CONTENT;
  const parsedSelection = productSelectionContentSchema.safeParse(selectionNode?.content);
  const selectionContent = parsedSelection.success ? parsedSelection.data : DEFAULT_PRODUCT_SELECTION_CONTENT;
  const resolved = resolveProductExplorerData(content, publishedCategories);
  const { categories: publicCategories, products: publicProducts } = buildPublicCatalogueView(publishedCategories);
  const searchIndex = buildProductSearchIndex(publishedCategories, publicProducts, searchContent);
  const selectionIndex = buildProductSelectionIndex(publishedCategories, publicProducts);
  const selectionCategories = publicCategories.map((category) => ({ slug: category.id, name: category.name }));

  const categories: ProductExplorerViewCategory[] = resolved.map((slot) => {
    const databaseCategory = slot.databaseCategory;
    const publicCategory = databaseCategory
      ? publicCategories.find((category) => category.id === databaseCategory.slug)
      : null;
    const sourceProducts = publicCategory
      ? publicProducts
          .filter((product) => product.categoryId === publicCategory.id)
          .map((product) => resolveProductExplorerCard({
            id: slot.products.find((candidate) => candidate.slug === product.id)?.id ?? product.id,
            slug: product.id,
            name: product.name,
            summary: product.tagline,
            image: product.image,
          }, content.productCardOverrides))
      : [];
    const products = resolveProductExplorerCardLayout(slot.key, sourceProducts, content.productCardLayouts);
    return {
      ...slot,
      categoryName: databaseCategory?.name ?? slot.fullSeriesName,
      categoryHref: databaseCategory ? `/products/series/${databaseCategory.slug}` : slot.seriesHref,
      products,
    };
  });

  const itemList = categories.flatMap((category) => category.products).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: product.name,
    url: `https://www.zyroncnc.com/products/${product.slug}`,
  }));
  const explorerTypography = explorerNode
    ? elementTypographyOverrides([explorerNode])
    : "";

  return (
    <main>
      <script
        type="application/ld+json"
        data-products-breadcrumb-schema
        dangerouslySetInnerHTML={{ __html: safeJsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.zyroncnc.com/" },
            { "@type": "ListItem", position: 2, name: "Products", item: "https://www.zyroncnc.com/products" },
          ],
        }) }}
      />
      <script
        type="application/ld+json"
        data-products-item-list-schema
        dangerouslySetInnerHTML={{ __html: safeJsonLd({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "ZYRON Industrial Machinery",
          itemListElement: itemList,
        }) }}
      />
      <ManagedPageSections slug="products" placement="BEFORE_LEGACY" />
      {explorerTypography ? <style>{explorerTypography}</style> : null}
      <ProductExplorer
        content={content}
        categories={categories}
        nodeId={explorerNode?.id ?? "products-explorer-default"}
      />
      <ProductSearch
        content={searchContent}
        index={searchIndex}
        nodeId={searchNode?.id ?? "products-premium-search"}
      />
      <ProductSelectionCenter
        content={selectionContent}
        items={selectionIndex}
        categories={selectionCategories}
        nodeId={selectionNode?.id ?? "product-selection-center"}
      />
      <ManagedPageSections slug="products" placement="AFTER_LEGACY" />
    </main>
  );
}
