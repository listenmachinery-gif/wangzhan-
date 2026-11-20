import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/admin/products/ProductEditor";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { ProductAdminNotFoundError, ProductAdminService } from "@/lib/services/product-admin-service";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("product.read");
  const { id } = await params;
  const service = new ProductAdminService();
  try {
    const [product, categories, media] = await Promise.all([
      service.getProduct(principal, id),
      service.listCategories(principal, { page: 1, pageSize: 100 }),
      db.mediaAsset.findMany({
        where: { lifecycleStatus: "ACTIVE", mimeType: { startsWith: "image/" } },
        select: { id: true, originalName: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);
    const productPage = await db.sitePage.findUnique({ where: { slug: `product-${product.slug}` }, select: { id: true } });
    const createParams = new URLSearchParams({ name: product.name, slug: `product-${product.slug}`, pageType: "PRODUCT", template: "detail" });
    const pageDesignerHref = productPage ? `/admin/pages/${productPage.id}/edit` : `/admin/pages/new?${createParams.toString()}`;
    const serialized = JSON.parse(JSON.stringify(product));
    return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">产品内容</p><h1 className="mt-2 text-3xl font-semibold">编辑：{product.name}</h1><p className="mt-2 text-sm text-neutral-600">模块为空时隐藏；所有内容保存前均通过对应模块 schema 校验。</p></div><ProductEditor initialProduct={serialized} categories={categories.items.map(({ id: categoryId, name }) => ({ id: categoryId, name }))} media={media.map(({ id: mediaId, originalName }) => ({ id: mediaId, name: originalName }))} pageDesignerHref={pageDesignerHref} /></div>;
  } catch (error) {
    if (error instanceof ProductAdminNotFoundError) notFound();
    throw error;
  }
}
