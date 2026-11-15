import { notFound } from "next/navigation";

import { BannerEditor } from "@/components/admin/banners/BannerEditor";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { BannerNotFoundError, BannerService } from "@/lib/services/banner-service";

export const dynamic = "force-dynamic";

export default async function AdminBannerEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("banner.read");
  const { id } = await params;
  const media = await db.mediaAsset.findMany({
    where: {
      lifecycleStatus: "ACTIVE",
      OR: [{ mimeType: { startsWith: "image/" } }, { mimeType: { startsWith: "video/" } }],
    },
    select: { id: true, originalName: true, altText: true, mimeType: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 500,
  });
  if (id === "new") return <BannerEditor initialBanner={null} media={media} />;
  try {
    const banner = await new BannerService().get(principal, id);
    return <BannerEditor initialBanner={JSON.parse(JSON.stringify(banner))} media={media} />;
  } catch (error) {
    if (error instanceof BannerNotFoundError) notFound();
    throw error;
  }
}
