import Link from "next/link";

import { requirePermission } from "@/lib/auth/guards";
import { formatAdminEnum } from "@/lib/admin/localization";
import { BannerService } from "@/lib/services/banner-service";

export const dynamic = "force-dynamic";

function formatSchedule(startsAt: Date | null, endsAt: Date | null) {
  if (!startsAt && !endsAt) return "长期有效";
  return `${startsAt?.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) ?? "立即"} — ${endsAt?.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) ?? "长期"}`;
}

export default async function AdminBannersPage() {
  const principal = await requirePermission("banner.read");
  const banners = await new BannerService().list(principal);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold text-[#5F9500]">首页内容</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Banner 管理</h1><p className="mt-2 text-sm text-neutral-600">管理响应式图片、上线排期和展示顺序；发布后联动网站首页。</p></div>
        <Link href="/admin/banners/new" className="rounded-lg bg-[#76B900] px-4 py-2.5 font-semibold">新建 Banner</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600"><tr><th className="px-4 py-3">名称</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">排序</th><th className="px-4 py-3">排期</th><th className="px-4 py-3">操作</th></tr></thead>
          <tbody>{banners.map((banner) => <tr key={banner.id} className="border-t"><td className="px-4 py-3"><p className="font-semibold">{banner.name}</p><p className="mt-1 max-w-md truncate text-neutral-500">{banner.title}</p></td><td className="px-4 py-3">{formatAdminEnum(banner.status)}{banner.enabled ? "" : " · 已停用"}</td><td className="px-4 py-3">{banner.position}</td><td className="px-4 py-3 text-neutral-600">{formatSchedule(banner.startsAt, banner.endsAt)}</td><td className="px-4 py-3"><Link href={`/admin/banners/${banner.id}`} className="font-semibold text-[#5F9500]">编辑</Link></td></tr>)}</tbody>
        </table>
        {banners.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">尚无 Banner。首页会继续显示原有视频 Hero。</p> : null}
      </div>
    </div>
  );
}

