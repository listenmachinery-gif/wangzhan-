import Link from "next/link";

import { ProductTable } from "@/components/admin/products/ProductTable";
import { requirePermission } from "@/lib/auth/guards";
import { ProductAdminService } from "@/lib/services/product-admin-service";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const principal = await requirePermission("product.read");
  const raw = await searchParams;
  const query = Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const [result, categories] = await Promise.all([
    new ProductAdminService().listProducts(principal, query),
    new ProductAdminService().listCategories(principal, { page: 1, pageSize: 100 }),
  ]);
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#5F9500]">产品内容</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">产品管理</h1><p className="mt-2 text-sm text-neutral-600">共 {result.total} 个数据库产品；已发布内容直接联动前台原 URL。</p></div><Link href="/admin/products/new" className="rounded-lg bg-[#76B900] px-4 py-2.5 font-semibold">新建产品</Link></div><form className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-4"><input name="query" defaultValue={query.query} placeholder="名称、slug 或摘要" className="rounded-lg border px-3 py-2" /><select name="status" defaultValue={query.status ?? ""} className="rounded-lg border px-3 py-2"><option value="">全部状态</option><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><select name="categoryId" defaultValue={query.categoryId ?? ""} className="rounded-lg border px-3 py-2"><option value="">全部分类</option>{categories.items.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button className="rounded-lg border border-neutral-300 px-4 py-2 font-medium">筛选</button></form><ProductTable items={result.items} /></div>;
}
