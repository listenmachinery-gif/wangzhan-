import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin } from "lucide-react";

import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { formatAdminEnum, formatCountryName } from "@/lib/admin/localization";
import type { DashboardInquiry } from "@/lib/dashboard/types";

const dateTime = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function safeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function InquiryPulse({ rows, loading, error, canView }: {
  rows: DashboardInquiry[];
  loading: boolean;
  error: string | null;
  canView: boolean;
}) {
  return (
    <DashboardPanel
      title="最新询盘"
      description="仅展示当前账号权限范围内的 CRM 数据"
      action={canView ? <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8DDB00]">全部询盘<ArrowRight className="size-3" aria-hidden /></Link> : undefined}
    >
      {!canView ? <p className="px-5 py-16 text-center text-sm text-[#89939E]">当前账号无权查看询盘</p> : null}
      {canView && loading ? <p role="status" className="px-5 py-16 text-center text-sm text-[#89939E]">正在读取最新询盘…</p> : null}
      {canView && !loading && error ? <p role="alert" className="px-5 py-16 text-center text-sm text-amber-200">{error}</p> : null}
      {canView && !loading && !error && rows.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#89939E]">暂无询盘</p> : null}
      {canView && !loading && !error && rows.length > 0 ? (
        <ul className="divide-y divide-white/[0.07]">
          {rows.map((inquiry) => {
            const createdAt = safeDate(inquiry.createdAt);
            const followUpAt = safeDate(inquiry.nextFollowUpAt);
            const reference = inquiry.inquiryNumber || inquiry.id;
            const stage = inquiry.stage?.name || formatAdminEnum(inquiry.status, "待处理");
            return (
              <li key={inquiry.id}>
                <Link href={`/admin/inquiries/${encodeURIComponent(inquiry.id)}`} className="group block px-5 py-4 outline-none transition hover:bg-white/[0.035] focus-visible:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#76B900]" aria-label={`${reference} · ${stage} · 查看询盘详情`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{reference}</p>
                      <p className="mt-1 truncate text-[11px] text-[#89939E]">{inquiry.interestedProduct?.name || "未关联产品"}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#76B900]/25 bg-[#76B900]/10 px-2 py-1 text-[10px] font-semibold text-[#9BE11B]">{stage}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#78838E]">
                    <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-3" />{formatCountryName(inquiry.country)}</span>
                    <span>{createdAt ? `创建 ${dateTime.format(createdAt)}` : "创建时间未知"}</span>
                    <span className="inline-flex items-center gap-1"><CalendarClock aria-hidden className="size-3" />{followUpAt ? `跟进 ${dateTime.format(followUpAt)}` : "未设置跟进"}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </DashboardPanel>
  );
}
