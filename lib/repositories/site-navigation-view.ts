import type { Product, ProductCategory } from "@/data/products";
import { productCategories, products } from "@/data/products";
import type { NavigationSnapshot } from "@/lib/navigation/schema";
import { buildMachinesMenuView, hydrateMachinesNavigation, type MachinesMenuView } from "@/lib/navigation/machines-menu";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { resolvePublicNavigation } from "@/lib/repositories/navigation-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";

export type SiteNavigationView = {
  navigation: NavigationSnapshot;
  categories: ProductCategory[];
  products: Product[];
  machinesMenu: MachinesMenuView;
};

export async function getSiteNavigationView(): Promise<SiteNavigationView> {
  const [publishedNavigation, publishedCategories] = await Promise.all([
    resolvePublicNavigation(),
    listPublishedCategories(),
  ]);
  const navigation = hydrateMachinesNavigation(publishedNavigation);

  if (publishedCategories.length === 0) {
    return { navigation, categories: productCategories, products, machinesMenu: buildMachinesMenuView(navigation.machines, productCategories, products) };
  }

  const catalogue = buildPublicCatalogueView(publishedCategories);
  return { navigation, ...catalogue, machinesMenu: buildMachinesMenuView(navigation.machines, catalogue.categories, catalogue.products) };
}
