import { NewProductForm } from "@/components/admin/products/NewProductForm";
import { requirePermission } from "@/lib/auth/guards";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const principal = await requirePermission("product.write");
  const categories = await new ProductAdminService().listCategories(principal, { page: 1, pageSize: 100 });
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">产品内容</p><h1 className="mt-2 text-3xl font-semibold">新建产品</h1><p className="mt-2 text-sm text-neutral-600">先创建草稿，再配置标准详情页模块并发布。</p></div><NewProductForm categories={categories.items.map(({ id, name }) => ({ id, name }))} /></div>;
}
