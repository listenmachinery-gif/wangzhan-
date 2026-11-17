import type { Product, ProductCategory } from "@/data/products";
import { productCategories, products } from "@/data/products";
import type { NavigationSnapshot } from "@/lib/navigation/schema";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { resolvePublicNavigation } from "@/lib/repositories/navigation-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";

export type SiteNavigationView = {
  navigation: NavigationSnapshot;
  categories: ProductCategory[];
  products: Product[];
};

export async function getSiteNavigationView(): Promise<SiteNavigationView> {
  const [navigation, publishedCategories] = await Promise.all([
    resolvePublicNavigation(),
    listPublishedCategories(),
  ]);

  if (publishedCategories.length === 0) {
    return { navigation, categories: productCategories, products };
  }

  return { navigation, ...buildPublicCatalogueView(publishedCategories) };
}
