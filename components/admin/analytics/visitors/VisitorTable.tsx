"use client";

import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

import { VisitorTimelineDrawer } from "@/components/admin/analytics/visitors/VisitorTimelineDrawer";
import { DataState } from "@/components/admin/ui/DataState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { TableShell } from "@/components/admin/ui/TableShell";

export type VisitorListItem = {
  id: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastActiveAt: Date | null;
  firstSource: Prisma.JsonValue | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  linkedLead: { id: string; name: string | null; email: string; company: string | null; status: string } | null;
  _count: { sessions: number; pageViews: number; events: number };
};

function sourceName(value: Prisma.JsonValue | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "direct";
  const source = (value as Record<string, Prisma.JsonValue>)["source"];
  return typeof source === "string" ? source : "direct";
}

export function anonymousVisitorLabel(id: string) {
  return `访客-${id.slice(-6).toUpperCase()}`;
}

function status(item: VisitorListItem, now: Date) {
  if (Math.max(0, now.getTime() - item.lastSeenAt.getTime()) <= 120_000) return { label: "在线", tone: "success" as const };
  if (item.lastActiveAt && Math.max(0, now.getTime() - item.lastActiveAt.getTime()) <= 5 * 60_000) return { label: "活跃", tone: "info" as const };
  return { label: "离线", tone: "neutral" as const };
}

function pageHref(baseQuery: string, page: number) {
  const query = new URLSearchParams(baseQuery);
  query.set("page", String(page));
  return `/admin/analytics/visitors?${query.toString()}`;
}

export function VisitorTable({ items, total, page, pageSize, now, baseQuery }: {
  items: VisitorListItem[];
  total: number;
  page: number;
  pageSize: number;
  now: Date;
  baseQuery: string;
}) {
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [interactive, setInteractive] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => setInteractive(true), []);

  if (items.length === 0) {
    return <div className="rounded-admin border border-admin-border bg-white shadow-admin-card"><DataState kind="empty" title="暂无符合条件的访客" description="尝试清除部分筛选条件，或等待新的已同意访问数据。" /></div>;
  }

  return (
    <section aria-labelledby="visitor-list-title" className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="visitor-list-title" className="text-sm font-semibold text-admin-ink">访客明细</h2>
        <p className="text-xs text-admin-muted">共 {new Intl.NumberFormat("zh-CN").format(total)} 位</p>
      </div>
      <TableShell caption="访客明细表">
        <thead><tr><th scope="col">访客</th><th scope="col">状态</th><th scope="col">来源</th><th scope="col">地区</th><th scope="col">设备</th><th scope="col">访问深度</th><th scope="col">最近访问</th><th scope="col"><span className="sr-only">操作</span></th></tr></thead>
        <tbody>
          {items.map((item) => {
            const visitorStatus = status(item, now);
            return (
              <tr key={item.id}>
                <td><span className="block font-semibold text-admin-ink">{anonymousVisitorLabel(item.id)}</span>{item.linkedLead ? <span className="mt-0.5 block text-xs text-admin-muted">已关联询盘 · {item.linkedLead.company || item.linkedLead.email}</span> : <span className="mt-0.5 block text-xs text-admin-muted">匿名访客</span>}</td>
                <td><StatusBadge tone={visitorStatus.tone}>{visitorStatus.label}</StatusBadge></td>
                <td className="font-medium text-admin-ink">{sourceName(item.firstSource)}</td>
                <td>{[item.city, item.region, item.countryCode].filter(Boolean).join(" · ") || "未知"}</td>
                <td><span className="block capitalize">{item.deviceType || "未知"}</span><span className="block text-xs text-admin-muted">{[item.browser, item.operatingSystem].filter(Boolean).join(" · ") || "—"}</span></td>
                <td><span className="font-semibold tabular-nums text-admin-ink">{item._count.pageViews}</span><span className="ml-1 text-xs text-admin-muted">浏览 / {item._count.sessions} 会话</span></td>
                <td><time dateTime={item.lastSeenAt.toISOString()}>{new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(item.lastSeenAt)}</time></td>
                <td className="text-right"><button type="button" disabled={!interactive} aria-label={`查看 ${anonymousVisitorLabel(item.id)} 的行为时间线`} onClick={(event) => { returnFocusRef.current = event.currentTarget; setSelectedVisitorId(item.id); }} className="rounded-admin-sm border border-admin-border px-3 py-1.5 text-xs font-semibold text-admin-ink outline-none transition duration-admin hover:border-neutral-400 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-ignition disabled:cursor-wait disabled:opacity-60">查看旅程</button></td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
      <nav aria-label="访客分页" className="flex items-center justify-between gap-3">
        <p className="text-xs text-admin-muted">第 {page} / {totalPages} 页</p>
        <div className="flex gap-2">
          {page > 1 ? <Link href={pageHref(baseQuery, page - 1)} className="rounded-admin-sm border border-admin-border bg-white px-3 py-2 text-xs font-semibold text-admin-ink outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-ignition">上一页</Link> : null}
          {page < totalPages ? <Link href={pageHref(baseQuery, page + 1)} className="rounded-admin-sm border border-admin-border bg-white px-3 py-2 text-xs font-semibold text-admin-ink outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-ignition">下一页</Link> : null}
        </div>
      </nav>
      {selectedVisitorId ? <VisitorTimelineDrawer visitorId={selectedVisitorId} onClose={() => setSelectedVisitorId(null)} returnFocusRef={returnFocusRef} /> : null}
    </section>
  );
}
