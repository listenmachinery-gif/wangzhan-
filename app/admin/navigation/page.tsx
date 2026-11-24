import { NavigationEditor } from "@/components/admin/navigation/NavigationEditor";
import { productCategories, products } from "@/data/products";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { parseNavigationSnapshot } from "@/lib/navigation/schema";
import { NavigationService } from "@/lib/services/navigation-service";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { buildPublicCatalogueView } from "@/lib/repositories/public-catalogue-view";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const principal = await requirePermission("navigation.read");
  const service = new NavigationService();
  const [record, versions, publishedCategories] = await Promise.all([service.get(principal), service.versions(principal), listPublishedCategories()]);
  const catalogue = publishedCategories.length ? buildPublicCatalogueView(publishedCategories) : { categories: productCategories, products };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#5F9500]">全站内容</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">导航管理</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">统一管理桌面端、移动端和页脚导航。保存仅生成草稿，发布后才会同步官网。</p>
      </div>
      <NavigationEditor
        initialDocument={parseNavigationSnapshot(record.draftContent)}
        version={record.version}
        status={record.status}
        versions={versions.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          publishedAt: item.publishedAt?.toISOString() ?? null,
        }))}
        canWrite={can(principal, "navigation.write")}
        canPublish={can(principal, "navigation.publish")}
        categories={catalogue.categories}
        products={catalogue.products}
      />
    </div>
  );
}
