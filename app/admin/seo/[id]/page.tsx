import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { SeoEditor } from "@/components/admin/seo/SeoEditor";
import { SeoService } from "@/lib/services/seo-service";
import { db } from "@/lib/db/client";
export const dynamic = "force-dynamic";
export default async function AdminSeoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("seo.read");
  const { id } = await params;
  const [record, media] = await Promise.all([
    new SeoService().get(principal, id),
    db.mediaAsset.findMany({
      where: { lifecycleStatus: "ACTIVE", mimeType: { startsWith: "image/" } },
      select: { id: true, originalName: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);
  const canPublish = can(principal, "seo.publish") && (record.productId ? can(principal, "seo.write.product") : can(principal, "seo.write.global"));
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">SEO 编辑</p><h1 className="mt-2 text-3xl font-semibold">{record.title}</h1></div><SeoEditor record={record} media={media.map((item) => ({ id: item.id, name: item.originalName }))} canPublish={canPublish} /></div>;
}
