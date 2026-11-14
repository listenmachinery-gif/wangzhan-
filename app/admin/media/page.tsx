import { MediaLibrary, type MediaLibraryItem } from "@/components/admin/media/MediaLibrary";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { MediaService } from "@/lib/services/media-service";
import { getStorageAdapter } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;
  const storage = getStorageAdapter();
  const result = await new MediaService(storage).list(principal, { limit: 24 });
  const initialItems: MediaLibraryItem[] = await Promise.all(
    result.items.map(async (item) => ({
      id: item.id,
      originalName: item.originalName,
      mimeType: item.mimeType,
      byteSize: item.byteSize,
      altText: item.altText,
      category: item.category,
      _count: item._count,
      previewUrl: await storage.getSignedUrl(item.objectKey).catch(() => null),
    })),
  );

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-[#5F9500]">内容资产</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">媒体资源</h1><p className="mt-2 text-sm text-neutral-600">上传、检索和安全复用网站图片、文档与视频。</p></div>
      <MediaLibrary initialItems={initialItems} />
    </div>
  );
}
