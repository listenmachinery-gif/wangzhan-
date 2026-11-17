import Link from "next/link";

import { ShippingHighlightList } from "@/components/admin/shipping/ShippingHighlightList";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { ShippingHighlightService } from "@/lib/services/shipping-highlight-service";

export const dynamic = "force-dynamic";

export default async function AdminShippingHighlightsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const principal = await requirePermission("shipping.read");
  const raw = await searchParams;
  const filters = Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const [items, categories] = await Promise.all([
    new ShippingHighlightService().list(principal, filters),
    db.productCategory.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, name: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
  ]);
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#5F9500]">真实交付内容</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">发货集锦</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">用真实图片、视频和设备信息建立客户信任；草稿不会影响已上线内容。</p></div><Link href="/admin/shipping-highlights/new" className="rounded-admin-sm bg-ignition px-4 py-2.5 text-sm font-semibold text-white">新建发货记录</Link></div>
    <ShippingHighlightList items={JSON.parse(JSON.stringify(items))} categories={categories} filters={filters} />
  </div>;
}
