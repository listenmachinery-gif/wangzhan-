import Link from "next/link";

import { PageBuilder } from "@/components/admin/pages/PageBuilder";
import type { PageDocument } from "@/lib/page-builder/schema";

type HomepageRecord = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version: number;
  document: PageDocument;
};

export function HomepageAdmin({ page, canWrite, canPublish }: {
  page: HomepageRecord | null;
  canWrite: boolean;
  canPublish: boolean;
}) {
  if (page) return <PageBuilder page={page} canPublish={canPublish} />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#5F9500]">网站首页</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">首页管理</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">统一管理首页六大内容模块；Footer 继续由导航管理维护，避免重复配置。</p>
      </div>
      <section className="rounded-xl border border-neutral-200 bg-white p-8">
        <h2 className="text-xl font-semibold">尚未创建首页内容</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">创建操作只会生成草稿，不会自动替换前台首页；确认发布后才会生效。</p>
        {canWrite ? (
          <Link href="/admin/pages/new?name=ZYRON%20%E9%A6%96%E9%A1%B5&slug=home&pageType=HOME&template=homepage-redesign" className="mt-6 inline-flex rounded-lg bg-[#76B900] px-5 py-3 text-sm font-semibold text-[#0B0D10]">
            创建首页并打开设计器
          </Link>
        ) : <p className="mt-6 text-sm text-amber-700">当前账号只有查看权限，请联系管理员创建首页草稿。</p>}
      </section>
    </div>
  );
}
