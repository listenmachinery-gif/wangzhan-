import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

import { readLegacyCatalogue } from "../lib/migration/legacy-product-reader";

async function main() {
  config({ path: ".env.test", override: true, quiet: true });
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required.");

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const catalogue = await readLegacyCatalogue({ includePageContent: false });
    const expected = catalogue.products.map(({ id }) => id).sort();
    const actual = (await database.product.findMany({ select: { slug: true }, orderBy: { slug: "asc" } })).map(({ slug }) => slug);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Catalogue slug parity failed: expected ${expected.length}, found ${actual.length}.`);
    }
    console.log(`Catalogue verification passed: ${actual.length} product slugs match.`);
  } finally {
    await database.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
