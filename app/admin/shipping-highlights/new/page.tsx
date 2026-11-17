import { ShippingHighlightEditor } from "@/components/admin/shipping/ShippingHighlightEditor";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function NewShippingHighlightPage() {
  const principal = await requirePermission("shipping.write");
  const [categories, products, media] = await Promise.all([
    db.productCategory.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, slug: true, name: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
    db.product.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, slug: true, name: true, categoryId: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
    db.mediaAsset.findMany({ where: { lifecycleStatus: "ACTIVE", OR: [{ mimeType: { startsWith: "image/" } }, { mimeType: { startsWith: "video/" } }] }, select: { id: true, originalName: true, mimeType: true, altText: true }, orderBy: { createdAt: "desc" }, take: 300 }),
  ]);
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">真实交付内容</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">新建发货记录</h1><p className="mt-2 text-sm text-neutral-600">先保存真实资料为草稿，核对媒体、SEO 和关联产品后再发布。</p></div><ShippingHighlightEditor initialRecord={null} categories={categories} products={products} media={media} versions={[]} canWrite canPublish={can(principal, "shipping.publish")} /></div>;
}
