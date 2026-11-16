"use client";

import { ArrowRight, Download, MessageSquareText, RefreshCw, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Breakdown = { value: string; label?: string; visitors: number; sessions: number; pageViews: number; inquiries: number };
type Report = {
  range: { from: string; to: string };
  firstParty: {
    trend: Array<{ date: string; visitors: number; sessions: number; pageViews: number; inquiries: number }>;
    sources: Breakdown[];
    countries: Breakdown[];
    devices: Breakdown[];
    products: Breakdown[];
    funnel: { visitors: number; chatVisitors: number; linkedLeads: number; inquirySubmissions: number; chatToLeadRate: number };
  };
};

const formatter = new Intl.NumberFormat("zh-CN");
const percent = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 });

function DataTable({ title, rows, label }: { title: string; rows: Breakdown[]; label?: (row: Breakdown) => string }) {
  return (
    <section className="overflow-hidden rounded-admin border border-admin-border bg-white shadow-admin-card">
      <div className="border-b border-admin-border px-5 py-4"><h2 className="font-semibold text-admin-ink">{title}</h2></div>
      {rows.length === 0 ? <p className="px-5 py-10 text-center text-sm text-admin-muted">当前日期范围尚无汇总数据</p> : (
        <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-sm"><thead className="bg-neutral-50 text-left text-xs text-admin-muted"><tr><th className="px-5 py-3 font-medium">项目</th><th className="px-3 py-3 text-right font-medium">访客</th><th className="px-3 py-3 text-right font-medium">会话</th><th className="px-5 py-3 text-right font-medium">询盘</th></tr></thead><tbody className="divide-y divide-admin-border">{rows.slice(0, 8).map((row) => <tr key={row.value} className="transition hover:bg-neutral-50"><td className="max-w-[220px] truncate px-5 py-3 font-medium text-admin-ink">{label?.(row) ?? row.value}</td><td className="px-3 py-3 text-right tabular-nums text-admin-muted">{formatter.format(row.visitors)}</td><td className="px-3 py-3 text-right tabular-nums text-admin-muted">{formatter.format(row.sessions)}</td><td className="px-5 py-3 text-right tabular-nums font-semibold text-admin-ink">{formatter.format(row.inquiries)}</td></tr>)}</tbody></table></div>
      )}
    </section>
  );
}

export function AnalyticsReports({ initialFrom, initialTo, canExport }: { initialFrom: string; initialTo: string; canExport: boolean }) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const query = useMemo(() => new URLSearchParams({ from, to }).toString(), [from, to]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(false);
    try {
      const response = await fetch(`/api/admin/analytics/reports?${query}`, { signal });
      if (!response.ok) throw new Error("Report request failed");
      setReport(await response.json() as Report);
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(true);
    } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  const funnel = report?.firstParty.funnel;

  return (
    <div className="space-y-6">
      <section className="rounded-admin border border-admin-border bg-[#0b0d10] p-5 text-white shadow-admin-card sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">First-party CRM intelligence</p><h2 className="mt-2 text-xl font-semibold">从访问到询盘，一条可验证的增长链路</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">只展示站内实际采集与 CRM 关联结果。GA4 与 Search Console 作为独立聚合数据源，不与个人访客拼接。</p></div>
          <div className="flex flex-wrap items-end gap-3"><label className="text-xs text-neutral-400">开始日期<input aria-label="报告开始日期" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block rounded-admin-sm border border-white/15 bg-white/10 px-3 py-2 text-sm text-white" /></label><label className="text-xs text-neutral-400">结束日期<input aria-label="报告结束日期" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block rounded-admin-sm border border-white/15 bg-white/10 px-3 py-2 text-sm text-white" /></label><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-admin-sm bg-white px-4 py-2 text-sm font-semibold text-black"><RefreshCw className="size-4" />刷新</button>{canExport ? <a href={`/api/admin/analytics/reports/export?${query}`} className="inline-flex items-center gap-2 rounded-admin-sm border border-white/20 px-4 py-2 text-sm font-semibold text-white"><Download className="size-4" />导出 CSV</a> : null}</div>
        </div>
      </section>

      {loading ? <p role="status" className="rounded-admin border border-admin-border bg-white p-10 text-center text-sm text-admin-muted">正在生成增长报告…</p> : null}
      {error ? <p role="alert" className="rounded-admin border border-red-200 bg-red-50 p-5 text-sm text-red-800">报告暂时无法读取，请检查日期后重试。</p> : null}
      {report && funnel ? <>
        <section aria-label="第一方转化漏斗" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "有效访客", value: funnel.visitors, icon: Users },
            { label: "发起在线沟通", value: funnel.chatVisitors, icon: MessageSquareText },
            { label: "已关联客户", value: funnel.linkedLeads, icon: Sparkles },
            { label: "询盘提交", value: funnel.inquirySubmissions, icon: ArrowRight },
          ].map(({ label, value, icon: Icon }) => <article key={label} className="rounded-admin border border-admin-border bg-white p-5 shadow-admin-card"><Icon className="size-4 text-ignition" /><p className="mt-4 text-xs font-medium text-admin-muted">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-admin-ink">{formatter.format(value)}</p></article>)}
          <article className="rounded-admin border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-medium text-amber-800">聊天转客户率</p><p className="mt-5 text-2xl font-semibold tabular-nums text-amber-950">{percent.format(funnel.chatToLeadRate)}</p><p className="mt-2 text-xs text-amber-800">基于显式关联，不推测身份</p></article>
        </section>
        <div className="grid gap-5 xl:grid-cols-2"><DataTable title="流量来源" rows={report.firstParty.sources} /><DataTable title="国家与地区" rows={report.firstParty.countries} /><DataTable title="高意向产品" rows={report.firstParty.products} label={(row) => row.label ?? row.value} /><DataTable title="访问设备" rows={report.firstParty.devices} /></div>
        <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-admin border border-admin-border bg-white p-5"><div className="flex items-center gap-2"><Search className="size-4 text-admin-muted" /><h2 className="font-semibold text-admin-ink">Google 数据保持独立</h2></div><p className="mt-2 text-sm leading-6 text-admin-muted">GA4 与 Search Console 只展示其官方聚合报告，不用于识别或补全单个客户。</p><Link href="/admin/analytics" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-admin-ink">查看 Google 分析 <ArrowRight className="size-4" /></Link></div><div className="rounded-admin border border-admin-border bg-white p-5"><h2 className="font-semibold text-admin-ink">访客明细</h2><p className="mt-2 text-sm leading-6 text-admin-muted">在权限范围内查看已同意统计的匿名轨迹，并关联询盘或在线沟通记录。</p><Link href="/admin/analytics/visitors" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-admin-ink">进入访客分析 <ArrowRight className="size-4" /></Link></div></section>
      </> : null}
    </div>
  );
}
