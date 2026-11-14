import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

import { importLegacyCatalogue } from "../lib/migration/catalogue-importer";
import { readLegacyCatalogue } from "../lib/migration/legacy-product-reader";

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function option(name: string) {
  const prefix = `${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function productionLike(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  return !local || /prod(?:uction)?/i.test(url.pathname);
}

async function main() {
  const write = hasFlag("--write");
  const explicitDryRun = hasFlag("--dry-run");
  const target = option("--database") ?? "current";
  if (target === "test") config({ path: ".env.test", override: true, quiet: true });
  const databaseUrl = target === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  if (write && explicitDryRun) throw new Error("Choose either --write or --dry-run, not both.");
  if (write && productionLike(databaseUrl)) {
    const authorized = hasFlag("--authorize-production") && process.env.ZYRON_PRODUCTION_CHANGE_AUTHORIZED === "true";
    if (!authorized) throw new Error("Refusing production-like catalogue writes without separate explicit authorization.");
  }

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const catalogue = await readLegacyCatalogue({ includePageContent: true });
    const report = await importLegacyCatalogue({ database, catalogue, write });
    const output = hasFlag("--summary")
      ? {
          dryRun: report.dryRun,
          imported: report.imported,
          skippedCount: report.skipped.length,
          ambiguousCount: report.ambiguous.length,
          unmappedCount: report.unmapped.length,
        }
      : report;
    console.log(JSON.stringify(output, null, 2));
  } finally {
    await database.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
