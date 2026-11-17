import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { formatAdminEnum } from "@/lib/admin/localization";
import { SeoService } from "@/lib/services/seo-service";
export const dynamic = "force-dynamic";
export default async function AdminSeoPage() {
  const principal = await requirePermission("seo.read");
  const records = await new SeoService().list(principal);
  const writable = can(principal, "seo.write.global") || can(principal, "seo.write.product");
  return <div className="space-y-6"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#5F9500]">搜索展示</p><h1 className="mt-2 text-3xl font-semibold">SEO 管理</h1><p className="mt-2 text-sm text-neutral-600">管理精确路径的标题、描述、Canonical、Open Graph 与索引状态，不改变原 URL。</p></div>{writable ? <Link href="/admin/seo/new" className="rounded-lg bg-[#0B0D10] px-5 py-3 text-sm font-semibold text-white">创建 SEO 草稿</Link> : null}</div><div className="overflow-x-auto rounded-xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-neutral-50"><tr><th className="px-4 py-3">路径</th><th className="px-4 py-3">标题</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">索引</th><th className="px-4 py-3">操作</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-t"><td className="px-4 py-3 font-mono text-xs">{record.pathname}</td><td className="px-4 py-3">{record.title}</td><td className="px-4 py-3">{formatAdminEnum(record.status)}</td><td className="px-4 py-3">{record.robotsIndex ? "允许索引" : "禁止索引"}</td><td className="px-4 py-3"><Link className="font-semibold text-[#5F9500]" href={`/admin/seo/${record.id}`}>编辑</Link></td></tr>)}</tbody></table>{records.length === 0 ? <p className="p-8 text-center text-neutral-500">尚无数据库 SEO 记录，前台继续使用现有 Metadata。</p> : null}</div></div>;
}
