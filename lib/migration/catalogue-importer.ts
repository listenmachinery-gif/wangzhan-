import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { stableImportReport, type ImportReport } from "@/lib/migration/import-report";
import type { LegacyCatalogue } from "@/lib/migration/legacy-product-reader";
import { mapLegacyProduct } from "@/lib/migration/product-mapper";

const catalogueSchema = z.object({
  categories: z.array(z.object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    summary: z.string(),
    description: z.string(),
    position: z.number().int().nonnegative(),
  })),
  products: z.array(z.object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    categoryId: z.string().trim().min(1),
    categoryName: z.string().trim().min(1),
    tagline: z.string().trim().min(1),
    image: z.string().trim().min(1),
    specs: z.array(z.object({ label: z.string(), value: z.string() })),
    highlights: z.array(z.string()),
    applications: z.array(z.string()),
    options: z.array(z.string()),
  }).passthrough()),
});

function mediaPaths(value: unknown, path = "content"): Array<{ path: string; value: string }> {
  if (typeof value === "string") {
    return value.startsWith("/products/") || value.startsWith("/images/") ? [{ path, value }] : [];
  }
  if (Array.isArray(value)) return value.flatMap((item, index) => mediaPaths(item, `${path}.${index}`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => mediaPaths(item, `${path}.${key}`));
  }
  return [];
}

export async function importLegacyCatalogue(options: {
  database: PrismaClient;
  catalogue: LegacyCatalogue;
  write: boolean;
  mediaPathToAssetId?: ReadonlyMap<string, string>;
}): Promise<ImportReport> {
  const catalogue = catalogueSchema.parse(options.catalogue) as LegacyCatalogue;
  const mappings = catalogue.products.map(mapLegacyProduct);
  const unmapped = mappings.flatMap((mapping) =>
    mapping.unmapped.map((item) => ({ ...item, productSlug: mapping.product.slug })),
  );
  const baseReport: ImportReport = {
    dryRun: !options.write,
    imported: {
      categories: catalogue.categories.length,
      products: mappings.length,
      sections: mappings.reduce((total, mapping) => total + mapping.modules.length, 0),
      mediaReferences: 0,
    },
    skipped: [],
    ambiguous: [],
    unmapped,
  };
  if (!options.write) return stableImportReport(baseReport);

  let mediaReferenceCount = 0;
  await options.database.$transaction(async (transaction) => {
    for (const category of catalogue.categories) {
      await transaction.productCategory.upsert({
        where: { slug: category.id },
        update: {
          name: category.name,
          summary: category.summary,
          description: category.description,
          position: category.position,
        },
        create: {
          slug: category.id,
          name: category.name,
          summary: category.summary,
          description: category.description,
          position: category.position,
        },
      });
    }

    for (const mapping of mappings) {
      const category = await transaction.productCategory.findUniqueOrThrow({
        where: { slug: mapping.product.categorySlug },
      });
      const product = await transaction.product.upsert({
        where: { slug: mapping.product.slug },
        update: {
          categoryId: category.id,
          name: mapping.product.name,
          summary: mapping.product.summary,
          description: mapping.product.description,
          slugLocked: true,
        },
        create: {
          categoryId: category.id,
          slug: mapping.product.slug,
          name: mapping.product.name,
          summary: mapping.product.summary,
          description: mapping.product.description,
          slugLocked: true,
        },
      });

      await transaction.mediaReference.deleteMany({
        where: {
          entityType: "Product",
          entityId: product.id,
          field: { startsWith: "legacy-import:" },
        },
      });
      for (const productModule of mapping.modules) {
        const section = await transaction.productSection.upsert({
          where: { productId_type: { productId: product.id, type: productModule.type } },
          update: {
            position: productModule.position,
            visible: productModule.visible,
            content: (productModule.data ?? {}) as Prisma.InputJsonValue,
          },
          create: {
            productId: product.id,
            type: productModule.type,
            position: productModule.position,
            visible: productModule.visible,
            content: (productModule.data ?? {}) as Prisma.InputJsonValue,
          },
        });

        const resolved = mediaPaths(productModule.data)
          .map((item) => ({ ...item, mediaAssetId: options.mediaPathToAssetId?.get(item.value) }))
          .filter((item): item is typeof item & { mediaAssetId: string } => Boolean(item.mediaAssetId));
        for (const item of resolved) {
          await transaction.mediaReference.upsert({
            where: {
              mediaAssetId_entityType_entityId_field: {
                mediaAssetId: item.mediaAssetId,
                entityType: "Product",
                entityId: product.id,
                field: `legacy-import:${section.type}:${item.path}`,
              },
            },
            update: {},
            create: {
              mediaAssetId: item.mediaAssetId,
              entityType: "Product",
              entityId: product.id,
              field: `legacy-import:${section.type}:${item.path}`,
            },
          });
          mediaReferenceCount += 1;
        }
      }
    }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return stableImportReport({
    ...baseReport,
    imported: { ...baseReport.imported, mediaReferences: mediaReferenceCount },
  });
}
