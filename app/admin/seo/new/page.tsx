import { SeoCreateForm } from "@/components/admin/seo/SeoCreateForm";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function AdminSeoCreatePage() {
  const principal = await requirePermission("seo.read");
  const [products, categories, media] = await Promise.all([
    can(principal, "seo.write.product") ? db.product.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" }, take: 500 }) : [],
    can(principal, "seo.write.global") ? db.productCategory.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" }, take: 200 }) : [],
    db.mediaAsset.findMany({
      where: { lifecycleStatus: "ACTIVE", mimeType: { startsWith: "image/" } },
      select: { id: true, originalName: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);
  const globalTargets = can(principal, "seo.write.global")
    ? [
      ["首页", "/"], ["产品中心", "/products"], ["工厂", "/factory"],
      ["案例", "/cases"], ["新闻", "/news"], ["联系", "/contact"],
    ].map(([label, pathname]) => ({ label, pathname, productId: null }))
    : [];
  const targets = [
    ...globalTargets,
    ...categories.map((category) => ({ label: `产品系列：${category.name}`, pathname: `/products/series/${category.slug}`, productId: null })),
    ...products.map((product) => ({ label: `产品：${product.name}`, pathname: `/products/${product.slug}`, productId: product.id })),
  ];
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">SEO 新建</p><h1 className="mt-2 text-3xl font-semibold">创建 SEO 草稿</h1><p className="mt-2 text-sm text-neutral-600">只能选择已有前台页面；创建后需单独发布才会生效。</p></div><SeoCreateForm targets={targets} media={media.map((item) => ({ id: item.id, name: item.originalName }))} /></div>;
}
