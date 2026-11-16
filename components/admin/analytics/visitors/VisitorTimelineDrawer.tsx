"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ArrowUpRight, CircleDot, Search, Trash2, X } from "lucide-react";

import { DataState } from "@/components/admin/ui/DataState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

type ProductLink = { id: string; name: string; slug: string } | null;
type PageView = { id: string; path: string; title: string | null; startedAt: string; activeSeconds: number; product: ProductLink };
type BusinessEvent = { id: string; type: string; path: string | null; properties: unknown; occurredAt: string; product: ProductLink };
type SiteSearch = { id: string; query: string; resultCount: number | null; path: string; occurredAt: string };
type VisitorDetail = {
  id: string;
  environment: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastActiveAt: string | null;
  firstSource: unknown;
  lastSource: unknown;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  linkedLead: { id: string; name: string | null; email: string; company: string | null; status: string } | null;
  sessions: Array<{
    id: string;
    startedAt: string;
    lastSeenAt: string;
    landingPath: string;
    exitPath: string | null;
    source: string | null;
    medium: string | null;
    pageViews: PageView[];
    events: BusinessEvent[];
    siteSearches: SiteSearch[];
  }>;
};

type TimelineItem = {
  id: string;
  at: string;
  kind: "page" | "search" | "event";
  title: string;
  path?: string | null;
  detail?: string;
  product?: ProductLink;
  properties?: Array<[string, string]>;
};

const eventLabels: Record<string, string> = {
  PRODUCT_VIEW: "查看产品",
  INQUIRY_START: "开始询盘",
  INQUIRY_SUBMIT: "提交询盘",
  WHATSAPP_CLICK: "点击 WhatsApp",
  EMAIL_CLICK: "点击邮件",
  CATALOG_DOWNLOAD: "下载目录",
  CHAT_STARTED: "发起在线聊天",
  CHAT_MESSAGE_SENT: "发送聊天消息",
};
const allowedPropertyKeys = new Set(["placement", "asset_name", "asset_path", "product_slug", "product_name", "product_category", "form_kind", "link_path"]);

function sourceName(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "direct";
  const source = (value as Record<string, unknown>)["source"];
  return typeof source === "string" ? source : "direct";
}

function safeProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value)
    .filter(([key, item]) => allowedPropertyKeys.has(key) && ["string", "number", "boolean"].includes(typeof item))
    .map(([key, item]) => [key, String(item)] as [string, string]);
}

function itemsForSession(session: VisitorDetail["sessions"][number]) {
  const items: TimelineItem[] = [
    ...session.pageViews.map((item) => ({ id: item.id, at: item.startedAt, kind: "page" as const, title: "页面浏览", path: item.path, detail: item.title || undefined, product: item.product })),
    ...session.siteSearches.map((item) => ({ id: item.id, at: item.occurredAt, kind: "search" as const, title: "站内搜索", path: item.path, detail: `${item.query}${item.resultCount === null ? "" : ` · ${item.resultCount} 个结果`}` })),
    ...session.events.map((item) => ({ id: item.id, at: item.occurredAt, kind: "event" as const, title: eventLabels[item.type] ?? item.type, path: item.path, product: item.product, properties: safeProperties(item.properties) })),
  ];
  return items.sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime());
}

function visitorLabel(id: string) {
  return `访客-${id.slice(-6).toUpperCase()}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(value));
}

export function VisitorTimelineDrawer({ visitorId, onClose, returnFocusRef, canDelete = false, onDeleted }: {
  visitorId: string;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  canDelete?: boolean;
  onDeleted?: () => void;
}) {
  const [detail, setDetail] = useState<VisitorDetail | null>(null);
  const [error, setError] = useState<"not-found" | "forbidden" | "unavailable" | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  async function deleteVisitor() {
    if (!window.confirm("确认删除该访客的匿名分析轨迹与聊天记录？已建立的询盘客户会被保留。此操作无法撤销。")) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      const response = await fetch(`/api/admin/analytics/visitors/${encodeURIComponent(visitorId)}/delete`, { method: "DELETE" });
      if (!response.ok) throw new Error("Visitor deletion failed");
      onClose();
      onDeleted?.();
    } catch {
      setDeleteError(true);
      setDeleting(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setDetail(null);
    setError(null);
    fetch(`/api/admin/analytics/visitors/${encodeURIComponent(visitorId)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 404) throw new Error("not-found");
          if (response.status === 403) throw new Error("forbidden");
          throw new Error("unavailable");
        }
        return response.json() as Promise<VisitorDetail>;
      })
      .then(setDetail)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        const message = requestError instanceof Error ? requestError.message : "unavailable";
        setError(message === "not-found" || message === "forbidden" ? message : "unavailable");
      });
    return () => controller.abort();
  }, [visitorId]);

  useEffect(() => {
    const focusReturnTarget = returnFocusRef?.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? []);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      focusReturnTarget?.focus();
    };
  }, [onClose, returnFocusRef]);

  const sessions = useMemo(() => detail ? [...detail.sessions].sort((left, right) => new Date(left.startedAt).getTime() - new Date(right.startedAt).getTime()) : [], [detail]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="访客行为时间线"
        data-mobile-fullscreen="true"
        className="flex h-full w-full flex-col bg-admin-canvas shadow-2xl sm:max-w-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-admin-border bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ignition">Visitor journey</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-admin-ink">{detail ? visitorLabel(detail.id) : "访客行为时间线"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {canDelete ? <button type="button" disabled={deleting} onClick={() => void deleteVisitor()} className="inline-flex items-center gap-2 rounded-admin-sm border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 outline-none transition hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60"><Trash2 aria-hidden className="size-4" />{deleting ? "正在删除…" : "删除访客数据"}</button> : null}
            <button ref={closeRef} type="button" aria-label="关闭访客时间线" onClick={onClose} className="rounded-admin-sm border border-admin-border bg-white p-2 text-admin-muted outline-none transition duration-admin hover:bg-neutral-50 hover:text-admin-ink focus-visible:ring-2 focus-visible:ring-ignition"><X aria-hidden className="size-5" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {deleteError ? <p role="alert" className="mb-4 rounded-admin-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">删除失败，数据未被修改，请稍后重试。</p> : null}
          {!detail && !error ? <DataState kind="loading" title="正在读取访客旅程" description="正在汇总会话、页面浏览与关键事件。" /> : null}
          {error === "not-found" ? <DataState kind="empty" title="找不到该访客记录" description="记录可能已按数据保留策略清理。" /> : null}
          {error === "forbidden" ? <DataState kind="error" title="没有权限查看访客详情" description="请联系超级管理员检查数据分析权限。" /> : null}
          {error === "unavailable" ? <DataState kind="error" title="访客详情暂时不可用" description="请稍后关闭并重新打开。" /> : null}
          {detail ? (
            <div className="space-y-6">
              <section aria-label="访客摘要" className="rounded-admin border border-admin-border bg-white p-5 shadow-admin-card">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs text-admin-muted">首次来源</p><p className="mt-1 text-sm font-semibold text-admin-ink">{sourceName(detail.firstSource)}</p></div>
                  <div><p className="text-xs text-admin-muted">地区</p><p className="mt-1 text-sm font-semibold text-admin-ink">{[detail.city, detail.region, detail.countryCode].filter(Boolean).join(" · ") || "未知"}</p></div>
                  <div><p className="text-xs text-admin-muted">设备</p><p className="mt-1 text-sm font-semibold text-admin-ink">{[detail.deviceType, detail.browser, detail.operatingSystem].filter(Boolean).join(" · ") || "未知"}</p></div>
                  <div><p className="text-xs text-admin-muted">最后访问</p><p className="mt-1 text-sm font-semibold text-admin-ink">{formatTime(detail.lastSeenAt)}</p></div>
                </div>
                {detail.linkedLead ? <Link href={`/admin/leads/${detail.linkedLead.id}`} className="mt-4 flex items-center justify-between gap-3 rounded-admin-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 outline-none focus-visible:ring-2 focus-visible:ring-ignition"><span>已关联询盘 · {detail.linkedLead.company || detail.linkedLead.name || detail.linkedLead.email}</span><ArrowUpRight aria-hidden className="size-4" /></Link> : null}
              </section>
              <div className="space-y-5">
                {sessions.map((session, sessionIndex) => {
                  const items = itemsForSession(session);
                  return (
                    <section key={session.id} aria-label={`会话 ${sessionIndex + 1}`} className="rounded-admin border border-admin-border bg-white p-5 shadow-admin-card">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-admin-border pb-4">
                        <div><h3 className="text-sm font-semibold text-admin-ink">会话 {sessionIndex + 1}</h3><p className="mt-1 text-xs text-admin-muted">{formatTime(session.startedAt)} · {session.source || "direct"} / {session.medium || "none"}</p></div>
                        <StatusBadge tone="neutral">{items.length} 个行为</StatusBadge>
                      </div>
                      {items.length > 0 ? (
                        <ol className="relative mt-4 space-y-0 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-admin-border">
                          {items.map((item) => (
                            <li key={`${item.kind}-${item.id}`} data-testid="timeline-item" className="relative grid grid-cols-[16px_1fr] gap-3 pb-5 last:pb-0">
                              <span aria-hidden className="relative z-10 mt-1 grid size-4 place-items-center rounded-full bg-white text-ignition"><CircleDot className="size-4" /></span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-semibold text-admin-ink">{item.kind === "search" ? <Search aria-hidden className="mr-1.5 inline size-3.5" /> : null}{item.title}</p><time dateTime={item.at} className="text-[10px] text-admin-muted">{formatTime(item.at)}</time></div>
                                {item.detail ? <p className="mt-1 text-xs text-admin-muted">{item.detail}</p> : null}
                                {item.path ? <p className="mt-1 break-all rounded-md bg-neutral-50 px-2 py-1 font-mono text-[11px] leading-5 text-neutral-600">{item.path}</p> : null}
                                {item.product ? <Link href={`/products/${item.product.slug}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ignition outline-none hover:text-neon focus-visible:ring-2 focus-visible:ring-ignition">{item.product.name}<ArrowUpRight aria-hidden className="size-3" /></Link> : null}
                                {item.properties?.length ? <ul className="mt-2 flex flex-wrap gap-1.5">{item.properties.map(([key, value]) => <li key={key} className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600">{key}：{value}</li>)}</ul> : null}
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : <p className="py-8 text-center text-sm text-admin-muted">该会话没有可展示的行为。</p>}
                    </section>
                  );
                })}
                {sessions.length === 0 ? <DataState kind="empty" title="尚无会话轨迹" description="访客已建立匿名记录，但还没有可展示的页面或事件。" /> : null}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
