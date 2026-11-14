import { revalidatePath } from "next/cache";
import { Prisma, type PrismaClient } from "@prisma/client";

import { validateModule } from "@/lib/product-modules/schemas";
import type { ProductModuleType } from "@/lib/product-modules/types";
import { isRegisteredProductWidget } from "@/lib/repositories/product-repository";

type PublishProductInput = {
  database: PrismaClient;
  productId: string;
  expectedVersion: number;
  actorId?: string | null;
  revalidate?: (path: string) => void | Promise<void>;
};

export async function publishProduct(input: PublishProductInput) {
  const before = await input.database.product.findUniqueOrThrow({
    where: { id: input.productId },
    include: {
      category: { select: { slug: true, status: true, publishedAt: true } },
      sections: { where: { visible: true }, orderBy: { position: "asc" } },
    },
  });
  if (before.version !== input.expectedVersion) throw new Error("Product version conflict.");
  if (before.category.status !== "PUBLISHED" || !before.category.publishedAt) {
    throw new Error("Product category must be published first.");
  }
  if (before.registeredWidget && !isRegisteredProductWidget(before.registeredWidget)) {
    throw new Error("Product widget is not registered.");
  }
  for (const section of before.sections) {
    validateModule(section.type as ProductModuleType, section.content);
  }

  const published = await input.database.$transaction(async (transaction) => {
    const result = await transaction.product.updateMany({
      where: { id: before.id, version: input.expectedVersion },
      data: {
        status: "PUBLISHED",
        publishedAt: before.publishedAt ?? new Date(),
        archivedAt: null,
        slugLocked: true,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) throw new Error("Product version conflict.");
    const after = await transaction.product.findUniqueOrThrow({ where: { id: before.id } });
    await transaction.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "product.publish",
        entityType: "Product",
        entityId: after.id,
        before: { status: before.status, version: before.version } as Prisma.InputJsonValue,
        after: { status: after.status, version: after.version } as Prisma.InputJsonValue,
      },
    });
    return after;
  });

  const invalidate = input.revalidate ?? revalidatePath;
  await Promise.all([
    invalidate(`/products/${published.slug}`),
    invalidate(`/products/series/${before.category.slug}`),
    invalidate("/products"),
    invalidate("/sitemap.xml"),
  ]);
  return published;
}
