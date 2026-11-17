import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { formatTrafficSource } from "@/lib/admin/localization";
import type { DashboardBreakdown, DashboardFirstPartyReport } from "@/lib/dashboard/types";

const number = new Intl.NumberFormat("zh-CN");
const percent = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 });

export function ChannelDistribution({ rows }: { rows: DashboardBreakdown[] }) {
  const sorted = rows.toSorted((left, right) => right.visitors - left.visitors).slice(0, 7);
  const total = sorted.reduce((sum, row) => sum + row.visitors, 0);
  return (
    <DashboardPanel title="渠道 / 来源分布" description="第一方来源，不跨平台推断归因">
      {sorted.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#89939E]">所选周期暂无数据</p> : (
        <div className="space-y-4 p-5">
          {sorted.map((row) => {
            const ratio = total > 0 ? row.visitors / total : 0;
            return <div key={row.value}>
              <div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-medium text-white">{formatTrafficSource(row.value)}</span><span className="tabular-nums text-[#A5AEB7]">{number.format(row.visitors)} · {percent.format(ratio)}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#76B900]" style={{ width: `${Math.max(2, ratio * 100)}%` }} /></div>
            </div>;
          })}
        </div>
      )}
    </DashboardPanel>
  );
}

export function ProductRanking({ rows }: { rows: DashboardBreakdown[] }) {
  const sorted = rows.toSorted((left, right) => right.visitors - left.visitors).slice(0, 8);
  return (
    <DashboardPanel title="热门产品" description="按真实产品 ID 聚合" action={<Link href="/admin/products" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8DDB00]">全部产品<ArrowRight className="size-3" /></Link>}>
      {sorted.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#89939E]">所选周期暂无数据</p> : (
        <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-xs"><thead className="bg-white/[0.025] text-[#78838E]"><tr><th className="px-5 py-3 text-left font-medium">排名 / 产品</th><th className="px-3 py-3 text-right font-medium">访客</th><th className="px-3 py-3 text-right font-medium">浏览</th><th className="px-5 py-3 text-right font-medium">询盘</th></tr></thead><tbody className="divide-y divide-white/[0.07]">{sorted.map((row, index) => <tr key={row.value} className="transition hover:bg-white/[0.035]"><td className="max-w-64 truncate px-5 py-3 font-medium text-white"><span className="mr-3 text-[#76B900]">{String(index + 1).padStart(2, "0")}</span>{row.label ?? row.value}</td><td className="px-3 py-3 text-right tabular-nums text-[#A5AEB7]">{number.format(row.visitors)}</td><td className="px-3 py-3 text-right tabular-nums text-[#A5AEB7]">{number.format(row.pageViews)}</td><td className="px-5 py-3 text-right font-semibold tabular-nums text-white">{number.format(row.inquiries)}</td></tr>)}</tbody></table></div>
      )}
    </DashboardPanel>
  );
}

export function ConversionFunnel({ funnel }: { funnel: DashboardFirstPartyReport["firstParty"]["funnel"] }) {
  const steps = [
    { label: "有效访客", value: funnel.visitors },
    { label: "发起在线沟通", value: funnel.chatVisitors },
    { label: "显式关联客户", value: funnel.linkedLeads },
    { label: "提交询盘", value: funnel.inquirySubmissions },
  ];
  const maximum = Math.max(1, funnel.visitors);
  return (
    <DashboardPanel title="第一方转化漏斗" description="仅使用可验证的匿名行为与显式 CRM 关联">
      <div className="space-y-3 p-5">
        {steps.map((step, index) => {
          const ratio = step.value / maximum;
          return <div key={step.label} className="grid grid-cols-[8rem_1fr_4rem] items-center gap-3"><span className="text-xs text-[#A5AEB7]">{step.label}</span><div className="h-8 overflow-hidden rounded-md bg-white/[0.05]"><div className="flex h-full items-center rounded-md px-3 text-[10px] font-semibold text-[#0B0D10]" style={{ width: `${Math.min(100, Math.max(8, ratio * 100))}%`, backgroundColor: `rgba(118,185,0,${1 - index * 0.16})` }}>{percent.format(ratio)}</div></div><strong className="text-right text-sm tabular-nums text-white">{number.format(step.value)}</strong></div>;
        })}
      </div>
    </DashboardPanel>
  );
}
