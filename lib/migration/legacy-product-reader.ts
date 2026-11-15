import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { legacyProductRedirects, productCategories, products } from "@/data/products";
import type { LegacyProductInput } from "@/lib/migration/product-mapper";

export type LegacyCategoryInput = {
  id: string;
  name: string;
  summary: string;
  description: string;
  position: number;
};

export type LegacyCatalogue = {
  categories: LegacyCategoryInput[];
  products: LegacyProductInput[];
};

const PAGE_PRODUCT_ALIASES: Record<string, string> = {
  "small-electric-shear": "compact-electric-shearing-machine",
  "energy-saving-electric-shear": "energy-saving-electric-shearing-machine",
  "foot-shear": "foot-shear",
  "reel-shear-beading": "reel-shear-beading-machine",
  ...Object.fromEntries(legacyProductRedirects.map(({ source, destination }) => [
    source.replace(/^\/products\//, ""),
    destination.replace(/^\/products\//, ""),
  ])),
};

function mainPageObject(module: Record<string, unknown>) {
  return Object.values(module)
    .filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value))
    .sort((left, right) => Object.keys(right).length - Object.keys(left).length)[0];
}

async function readPageContent() {
  const dataDirectory = path.resolve(process.cwd(), "data");
  const files = (await readdir(dataDirectory)).filter((file) => file.endsWith("-page.ts"));
  const content = new Map<string, Record<string, unknown>>();

  for (const file of files) {
    const basename = file.replace(/-page\.ts$/, "");
    const productSlug = PAGE_PRODUCT_ALIASES[basename] ?? basename;
    if (!products.some((product) => product.id === productSlug)) continue;
    const loaded = await import(pathToFileURL(path.join(dataDirectory, file)).href) as Record<string, unknown>;
    const page = mainPageObject(loaded);
    if (page) content.set(productSlug, page);
  }
  return content;
}

export async function readLegacyCatalogue(options: { includePageContent?: boolean } = {}): Promise<LegacyCatalogue> {
  const pages = options.includePageContent === false ? new Map<string, Record<string, unknown>>() : await readPageContent();
  return {
    categories: productCategories.map((category, position) => ({
      id: category.id,
      name: category.name,
      summary: category.summary,
      description: category.description,
      position,
    })),
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      tagline: product.tagline,
      image: product.image,
      specs: product.specs,
      highlights: product.highlights,
      applications: product.applications,
      options: product.options,
      performanceFeatures: product.performanceFeatures,
      advantages: product.advantages,
      technicalParameters: product.technicalParameters,
      page: pages.get(product.id),
    })),
  };
}
