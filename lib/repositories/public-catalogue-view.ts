import type { Product, ProductCategory, ProductDirectoryGroup } from "@/data/products";
import { productCategories, products } from "@/data/products";
import { validateModule } from "@/lib/product-modules/schemas";

type PublishedProductRow = {
  slug: string;
  name: string;
  summary: string;
  description: string | null;
  sections: Array<{ content: unknown }>;
};

type PublishedCategoryRow = {
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  products: PublishedProductRow[];
};

const fallbackCatalogueImage = "/products/product-center-hero.png";

export function toPublicCategory(category: PublishedCategoryRow): ProductCategory {
  const legacy = productCategories.find((item) => item.id === category.slug);
  return {
    id: category.slug,
    name: category.name,
    navLabel: legacy?.navLabel ?? category.name,
    summary: category.summary ?? legacy?.summary ?? "",
    description: category.description ?? legacy?.description ?? category.summary ?? "",
    image: legacy?.image ?? fallbackCatalogueImage,
    heroImage: legacy?.heroImage ?? fallbackCatalogueImage,
    capability: legacy?.capability ?? category.summary ?? category.name,
  };
}

export function toPublicProduct(product: PublishedProductRow, category: ProductCategory): Product {
  const legacy = products.find((item) => item.id === product.slug);
  const hero = product.sections[0]
    ? validateModule("HERO", product.sections[0].content) as {
        images: { desktop: string };
        badges?: string[];
        valuePoints?: string[];
      }
    : null;
  return {
    id: product.slug,
    name: product.name,
    categoryId: category.id,
    categoryName: category.name,
    parentName: legacy?.parentName,
    tagline: product.summary,
    image: hero?.images.desktop ?? legacy?.image ?? fallbackCatalogueImage,
    specs: legacy?.specs ?? [],
    highlights: hero?.badges ?? hero?.valuePoints ?? legacy?.highlights ?? [],
    applications: legacy?.applications ?? [],
    options: legacy?.options ?? [],
    seoTerms: legacy?.seoTerms,
    performanceFeatures: product.description ?? legacy?.performanceFeatures,
    advantages: legacy?.advantages,
    technicalParameters: legacy?.technicalParameters,
  };
}

export function buildPublicCatalogueView(categories: PublishedCategoryRow[]) {
  const publicCategories = categories.map(toPublicCategory);
  const publicProducts = categories.flatMap((category, index) =>
    category.products.map((product) => toPublicProduct(product, publicCategories[index])),
  );
  return { categories: publicCategories, products: publicProducts };
}

export function buildProductDirectory(categoryProducts: Product[]): ProductDirectoryGroup[] {
  const groups = new Map<string, ProductDirectoryGroup>();
  for (const product of categoryProducts) {
    const id = product.parentName ?? product.id;
    const existing = groups.get(id);
    if (existing) existing.products.push(product);
    else groups.set(id, {
      id,
      name: product.parentName ?? product.name,
      products: [product],
      isDirectProduct: !product.parentName,
    });
  }
  return [...groups.values()];
}
