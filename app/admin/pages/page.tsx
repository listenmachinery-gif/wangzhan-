import Link from "next/link";

import { PageList } from "@/components/admin/pages/PageList";
import { requirePermission } from "@/lib/auth/guards";
import { PageService } from "@/lib/services/page-service";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const principal = await requirePermission("page.read");
  const pages = await new PageService().list(principal);
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#5F9500]">内容与页面</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">页面设计</h1><p className="mt-2 text-sm text-neutral-600">管理草稿、响应式内容、发布版本与回滚。</p></div><Link href="/admin/pages/new" className="rounded-lg bg-[#76B900] px-4 py-2.5 text-sm font-semibold text-[#0B0D10]">新建页面</Link></div><PageList pages={pages} /></div>;
}
