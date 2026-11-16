import { Activity, Clock3, Eye, Radio, Users } from "lucide-react";

import { DataState } from "@/components/admin/ui/DataState";

export type FirstPartyOverview = {
  generatedAt: string;
  environment: "PRODUCTION" | "PREVIEW" | "TEST";
  summary: {
    onlineVisitors: number;
    activeVisitors: number;
    visitorsToday: number;
    sessionsToday: number;
    pageViewsToday: number;
  };
};

const metrics = [
  { key: "onlineVisitors", label: "当前在线", icon: Radio },
  { key: "activeVisitors", label: "5 分钟活跃", icon: Activity },
  { key: "visitorsToday", label: "今日访客", icon: Users },
  { key: "sessionsToday", label: "今日会话", icon: Clock3 },
  { key: "pageViewsToday", label: "今日浏览", icon: Eye },
] as const;

export function RealtimeVisitorPanel({ data, error = false }: { data: FirstPartyOverview | null; error?: boolean }) {
  if (error) {
    return (
      <section aria-label="第一方实时访客" className="rounded-admin border border-admin-border bg-white shadow-admin-card">
        <DataState kind="error" title="实时访客数据暂时不可用" description="Google 报表仍可独立查看，请稍后刷新第一方数据。" />
      </section>
    );
  }

  if (!data) {
    return (
      <section aria-label="第一方实时访客" className="rounded-admin border border-admin-border bg-white shadow-admin-card">
        <DataState kind="loading" title="正在读取实时访客" description="数据直接来自 ZYRON 网站的已同意访客。" />
      </section>
    );
  }

  return (
    <section aria-label="第一方实时访客" className="overflow-hidden rounded-admin border border-admin-border bg-graphite-950 text-white shadow-admin-card">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-2 rounded-full bg-neon shadow-[0_0_0_4px_rgba(141,219,0,0.12)]" />
            <h2 className="text-sm font-semibold">第一方实时访客</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{data.environment === "PRODUCTION" ? "生产环境" : data.environment === "PREVIEW" ? "预览环境" : "测试环境"}</p>
        </div>
        <time dateTime={data.generatedAt} className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">
          {new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(data.generatedAt))}
        </time>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-5 xl:grid-cols-1">
        {metrics.map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-graphite-950 px-5 py-4">
            <dt className="flex items-center gap-2 text-xs text-zinc-500"><Icon aria-hidden className="size-3.5" />{label}</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white">{new Intl.NumberFormat("zh-CN").format(data.summary[key])}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-white/10 px-5 py-3 text-[11px] leading-5 text-zinc-500">仅统计已同意分析的匿名访问；不会与 Google 用户数据合并。</p>
    </section>
  );
}
