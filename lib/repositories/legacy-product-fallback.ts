import { products, type Product as LegacyProduct } from "@/data/products";

export type LegacyPublishedProduct = {
  source: "legacy";
  slug: string;
  name: string;
  summary: string;
  categorySlug: string;
  legacy: LegacyProduct;
};

export function getLegacyProductFallback(slug: string): LegacyPublishedProduct | null {
  const legacy = products.find((product) => product.id === slug);
  if (!legacy) return null;
  return {
    source: "legacy",
    slug: legacy.id,
    name: legacy.name,
    summary: legacy.tagline,
    categorySlug: legacy.categoryId,
    legacy,
  };
}
