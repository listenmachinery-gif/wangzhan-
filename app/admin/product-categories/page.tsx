import { CategoryManager } from "@/components/admin/products/CategoryManager";
import { requirePermission } from "@/lib/auth/guards";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const principal = await requirePermission("category.read");
  const result = await new ProductAdminService().listCategories(principal, { page: 1, pageSize: 100 });
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">产品内容</p><h1 className="mt-2 text-3xl font-semibold">产品分类</h1><p className="mt-2 text-sm text-neutral-600">分类发布状态决定其系列页与所属产品是否可公开访问。</p></div><CategoryManager initialCategories={result.items.map((item) => ({ ...item, createdAt: undefined, updatedAt: undefined, publishedAt: undefined, archivedAt: undefined, parentId: undefined, description: undefined })) as never} /></div>;
}
