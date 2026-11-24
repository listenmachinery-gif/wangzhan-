import type { Product, ProductCategory } from "@/data/products";
import { getCategoryHref } from "@/data/products";
import { DEFAULT_NAVIGATION } from "@/lib/navigation/default-navigation";
import type { MachinesMenuConfig, NavigationSnapshot } from "@/lib/navigation/schema";

export type MachinesMenuProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  alt: string;
  href: string;
};

export type MachinesMenuCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  href: string;
  count: number;
  isDefault: boolean;
  products: MachinesMenuProduct[];
};

export type MachinesMenuView = {
  enabled: boolean;
  categories: MachinesMenuCategory[];
  settings: Required<MachinesMenuConfig["settings"]>;
};

export function getMachinesMenuConfig(config?: MachinesMenuConfig) {
  return config ?? DEFAULT_NAVIGATION.machines!;
}

export function hydrateMachinesNavigation(snapshot: NavigationSnapshot): NavigationSnapshot {
  const hydrated = structuredClone(snapshot);
  hydrated.machines ??= structuredClone(DEFAULT_NAVIGATION.machines!);
  hydrated.machines.settings = {
    ...structuredClone(DEFAULT_NAVIGATION.machines!.settings),
    ...hydrated.machines.settings,
  };
  return hydrated;
}

export function buildMachinesMenuView(
  input: MachinesMenuConfig | undefined,
  categories: ProductCategory[],
  products: Product[],
): MachinesMenuView {
  const config = getMachinesMenuConfig(input);
  const settings: Required<MachinesMenuConfig["settings"]> = {
    ...structuredClone(DEFAULT_NAVIGATION.machines!.settings),
    ...config.settings,
  } as Required<MachinesMenuConfig["settings"]>;
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const productMap = new Map(products.map((product) => [product.id, product]));
  const productsByCategory = new Map<string, Product[]>();
  products.forEach((product) => productsByCategory.set(product.categoryId, [...(productsByCategory.get(product.categoryId) ?? []), product]));

  const resolved = config.categories
    .filter((item) => item.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((item) => {
      const category = categoryMap.get(item.categoryId);
      if (!category) return [];
      const sourceProducts = config.mode === "AUTO"
        ? productsByCategory.get(category.id) ?? []
        : item.products.filter((entry) => entry.enabled).sort((a, b) => a.sortOrder - b.sortOrder).flatMap((entry) => {
            const product = productMap.get(entry.productId);
            return product && product.categoryId === category.id ? [{ product, entry }] : [];
          });
      const resolvedProducts: MachinesMenuProduct[] = sourceProducts.map((source) => {
        const product = "product" in source ? source.product : source;
        const override = "entry" in source ? source.entry : undefined;
        return {
          id: product.id,
          name: override?.displayNameOverride ?? product.name,
          description: override?.shortDescriptionOverride ?? product.tagline,
          image: override?.imageOverride ?? product.image,
          alt: override?.altOverride ?? product.name,
          href: `/products/${product.id}`,
        };
      });
      if (resolvedProducts.length === 0 && !settings.showEmptyCategories) return [];
      return [{
        id: category.id,
        name: item.displayName ?? category.navLabel,
        description: item.description ?? category.summary,
        image: item.image ?? category.image,
        href: getCategoryHref(category.id),
        count: resolvedProducts.length,
        isDefault: item.isDefault,
        products: resolvedProducts,
      }];
    });

  if (resolved.length > 0 && !resolved.some((item) => item.isDefault)) resolved[0] = { ...resolved[0], isDefault: true };
  return { enabled: config.enabled, categories: resolved, settings };
}
