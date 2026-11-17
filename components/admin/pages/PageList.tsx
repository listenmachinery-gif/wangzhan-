import Link from "next/link";
import { formatAdminEnum } from "@/lib/admin/localization";

type PageListItem = {
  id: string;
  name: string;
  slug: string;
  pageType: string;
  status: string;
  version: number;
  publishedVersion: number | null;
  updatedAt: Date;
};

export function PageList({ pages }: { pages: PageListItem[] }) {
  if (!pages.length) return <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center"><h2 className="text-lg font-semibold">还没有可视化页面</h2><p className="mt-2 text-sm text-neutral-500">从首页模板或空白页面开始创建。</p><Link href="/admin/pages/new" className="mt-5 inline-flex rounded-lg bg-[#76B900] px-4 py-2.5 text-sm font-semibold text-[#0B0D10]">新建页面</Link></div>;
  return <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-neutral-50 text-xs tracking-wide text-neutral-500"><tr><th className="px-5 py-3">页面</th><th className="px-5 py-3">类型</th><th className="px-5 py-3">状态</th><th className="px-5 py-3">版本</th><th className="px-5 py-3">更新时间</th><th className="px-5 py-3 text-right">操作</th></tr></thead><tbody>{pages.map((page) => <tr key={page.id} className="border-t border-neutral-100"><td className="px-5 py-4"><p className="font-semibold">{page.name}</p><p className="mt-1 text-xs text-neutral-500">/{page.slug === "home" ? "" : page.slug}</p></td><td className="px-5 py-4">{formatAdminEnum(page.pageType)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${page.status === "PUBLISHED" ? "bg-lime-100 text-lime-800" : "bg-amber-100 text-amber-800"}`}>{formatAdminEnum(page.status)}</span></td><td className="px-5 py-4">v{page.version}{page.publishedVersion ? ` / 发布 v${page.publishedVersion}` : ""}</td><td className="px-5 py-4 text-neutral-500">{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(page.updatedAt)}</td><td className="px-5 py-4 text-right"><Link href={`/admin/pages/${page.id}/edit`} className="font-semibold text-[#5F9500]">打开设计器</Link></td></tr>)}</tbody></table></div>;
}
