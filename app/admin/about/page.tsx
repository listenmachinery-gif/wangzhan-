import Link from "next/link";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/guards";
import { PageService } from "@/lib/services/page-service";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const principal = await requirePermission("page.read");
  const page = await new PageService().getBySlug(principal, "company");
  if (page) redirect(`/admin/pages/${page.id}/edit`);

  return (
    <section className="mx-auto max-w-3xl rounded-admin border border-neutral-200 bg-white p-8 shadow-admin-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5F9500]">内容运营</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">关于 ZYRON</h1>
      <p className="mt-4 leading-7 text-neutral-600">
        页面内容尚未初始化。前台会安全使用新版默认内容，初始化后即可在页面设计器中保存草稿、预览、发布和回滚。
      </p>
      <Link href="/admin/pages" className="mt-7 inline-flex rounded-admin-sm bg-[#76B900] px-5 py-3 text-sm font-semibold text-[#0B0D10]">
        返回页面设计
      </Link>
    </section>
  );
}
