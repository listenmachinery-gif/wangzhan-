import { notFound } from "next/navigation";

import { ShippingHighlightEditor } from "@/components/admin/shipping/ShippingHighlightEditor";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { ShippingHighlightService, ShippingNotFoundError } from "@/lib/services/shipping-highlight-service";

export const dynamic = "force-dynamic";

export default async function EditShippingHighlightPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("shipping.read");
  const { id } = await params;
  const service = new ShippingHighlightService();
  try {
    const [record, versions, categories, products, media] = await Promise.all([
      service.get(principal, id), service.versions(principal, id),
      db.productCategory.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, slug: true, name: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
      db.product.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, slug: true, name: true, categoryId: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
      db.mediaAsset.findMany({ where: { lifecycleStatus: "ACTIVE", OR: [{ mimeType: { startsWith: "image/" } }, { mimeType: { startsWith: "video/" } }] }, select: { id: true, originalName: true, mimeType: true, altText: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    ]);
    const serialized = JSON.parse(JSON.stringify({ record, versions }));
    const title = typeof record.draftContent === "object" && record.draftContent && "title" in record.draftContent ? String(record.draftContent.title) : record.slug;
    return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">真实交付内容</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">编辑：{title}</h1><p className="mt-2 text-sm text-neutral-600">版本回滚只生成新草稿，不会静默替换线上内容。</p></div><ShippingHighlightEditor initialRecord={serialized.record} categories={categories} products={products} media={media} versions={serialized.versions} canWrite={can(principal, "shipping.write")} canPublish={can(principal, "shipping.publish")} /></div>;
  } catch (error) {
    if (error instanceof ShippingNotFoundError) notFound();
    throw error;
  }
}
