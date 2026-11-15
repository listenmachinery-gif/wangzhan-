import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

import { readLegacyCatalogue } from "../lib/migration/legacy-product-reader";
import { mapLegacyProduct } from "../lib/migration/product-mapper";

async function main() {
  // Preserve an explicitly supplied target so Preview/Production verification
  // cannot silently fall back to the local test database.
  config({ path: ".env.test", quiet: true });
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required.");

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const catalogue = await readLegacyCatalogue({ includePageContent: false });
    const expectedCategories = catalogue.categories.map(({ id }) => id).sort();
    const actualCategories = (await database.productCategory.findMany({ select: { slug: true }, orderBy: { slug: "asc" } })).map(({ slug }) => slug);
    const expected = catalogue.products.map(({ id }) => id).sort();
    const actual = (await database.product.findMany({ select: { slug: true }, orderBy: { slug: "asc" } })).map(({ slug }) => slug);
    const expectedSections = catalogue.products
      .flatMap((legacyProduct) => mapLegacyProduct(legacyProduct).modules.map((section) => ({
        productSlug: legacyProduct.id,
        type: section.type,
        position: section.position,
      })))
      .sort((left, right) => `${left.productSlug}:${left.position}`.localeCompare(`${right.productSlug}:${right.position}`));
    const actualSections = (await database.productSection.findMany({
      select: { type: true, position: true, product: { select: { slug: true } } },
    }))
      .map((section) => ({ productSlug: section.product.slug, type: section.type, position: section.position }))
      .sort((left, right) => `${left.productSlug}:${left.position}`.localeCompare(`${right.productSlug}:${right.position}`));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Catalogue slug parity failed: expected ${expected.length}, found ${actual.length}.`);
    }
    if (JSON.stringify(actualCategories) !== JSON.stringify(expectedCategories)) {
      throw new Error(`Category slug parity failed: expected ${expectedCategories.length}, found ${actualCategories.length}.`);
    }
    if (JSON.stringify(actualSections) !== JSON.stringify(expectedSections)) {
      throw new Error(`Product section parity failed: expected ${expectedSections.length}, found ${actualSections.length}.`);
    }
    console.log(
      `Catalogue verification passed: ${actualCategories.length} categories, ${actual.length} products, and ${actualSections.length} sections match.`,
    );
  } finally {
    await database.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
