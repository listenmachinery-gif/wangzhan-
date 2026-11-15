import Link from "next/link";

import { TemplateManager } from "@/components/admin/specifications/TemplateManager";
import { requirePermission } from "@/lib/auth/guards";
import { ProductAdminService } from "@/lib/services/product-admin-service";
import { SpecificationService } from "@/lib/services/specification-service";

export const dynamic = "force-dynamic";

export default async function AdminSpecificationsPage() {
  const principal = await requirePermission("specification.read");
  const products = new ProductAdminService();
  const [templates, productResult, categoryResult] = await Promise.all([
    new SpecificationService().listTemplates(principal),
    products.listProducts(principal, { page: 1, pageSize: 100 }),
    products.listCategories(principal, { page: 1, pageSize: 100 }),
  ]);
  const serializedTemplates = JSON.parse(JSON.stringify(templates));
  const categories = categoryResult.items.map(({ id, name }) => ({ id, name }));
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">产品数据</p><h1 className="mt-2 text-3xl font-semibold">型号参数管理</h1><p className="mt-2 text-sm text-neutral-600">统一维护参数模板和产品型号；保存后同步公开详情页的响应式技术参数表。</p></div><TemplateManager initialTemplates={serializedTemplates} categories={categories} /><section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="text-lg font-semibold">选择产品录入参数</h2><div className="mt-4 divide-y">{productResult.items.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{product.name}</p><p className="text-xs text-neutral-500">{product.category.name} · {product._count.models} 个型号</p></div><Link href={`/admin/products/${product.id}/specifications`} className="rounded-lg border px-4 py-2 text-sm font-semibold">管理型号参数</Link></div>)}</div></section></div>;
}
