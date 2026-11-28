import type { Metadata } from "next";

import { ProductSearchResults } from "@/components/products/ProductSearchResults";
import {
  buildProductSearchIndex,
  DEFAULT_PRODUCT_SEARCH_CONTENT,
  productSearchContentSchema,
  rankProductSearchResults,
} from "@/lib/product-search/config";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Industrial Machinery | ZYRON",
  description: "Search ZYRON industrial machinery by product name, model or equipment series.",
  robots: { index: false, follow: true },
};

export default async function ProductsSearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0, 240);
  const [categories, page] = await Promise.all([listPublishedCategories(), getPublishedPageBySlug("products")]);
  const node = page?.nodes.find((candidate) => candidate.type === "PRODUCT_SEARCH");
  const parsed = productSearchContentSchema.safeParse(node?.content);
  const content = parsed.success ? parsed.data : DEFAULT_PRODUCT_SEARCH_CONTENT;
  const { products } = buildPublicCatalogueView(categories);
  const index = buildProductSearchIndex(categories, products, content);
  const results = query.length >= 2 ? rankProductSearchResults(query, index, 100) : index;
  return <ProductSearchResults query={query} results={results} />;
}
