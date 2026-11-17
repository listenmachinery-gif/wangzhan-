import { Activity, BarChart3, Box, Eye, MousePointerClick, Radio, Send, TrendingUp, Users } from "lucide-react";

import type { DashboardKpi } from "@/lib/dashboard/types";

const icons = {
  online: Radio,
  "visitors-today": Users,
  "sessions-today": Activity,
  "page-views-today": Eye,
  "period-visitors": Users,
  "period-inquiries": Send,
  "conversion-rate": TrendingUp,
  "ga4-active-users": BarChart3,
  "search-clicks": MousePointerClick,
  "products-total": Box,
  "published-products": Box,
  "new-leads": Send,
} as const;

const number = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 });

function displayValue(kpi: DashboardKpi) {
  if (!kpi.available || kpi.value === null) return "--";
  return kpi.format === "percent" ? percent.format(kpi.value) : number.format(kpi.value);
}

export function DashboardKpiGrid({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section aria-label="核心业务指标" className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = icons[kpi.id as keyof typeof icons] ?? Activity;
        const positive = typeof kpi.changePercent === "number" && kpi.changePercent >= 0;
        return (
          <article
            key={kpi.id}
            data-testid={`dashboard-kpi-${kpi.id}`}
            className="group relative min-h-32 overflow-hidden rounded-xl border border-white/[0.09] bg-[#161A20] p-4 transition duration-200 hover:border-[#76B900]/45 hover:bg-[#191E24]"
          >
            <div className="flex items-start justify-between gap-3">
              <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-[#76B900]/10 text-[#8DDB00]">
                <Icon className="size-4" strokeWidth={1.8} />
              </span>
              <span className="max-w-[7rem] truncate text-[10px] font-medium tracking-wide text-[#78838E]" title={kpi.source}>{kpi.source}</span>
            </div>
            <p className="mt-3 text-xs font-medium text-[#A5AEB7]">{kpi.label}</p>
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p className="text-[1.65rem] font-semibold leading-none tabular-nums tracking-[-0.04em] text-white">{displayValue(kpi)}</p>
              {typeof kpi.changePercent === "number" ? (
                <span className={`text-[10px] font-semibold tabular-nums ${positive ? "text-[#8DDB00]" : "text-rose-400"}`}>
                  {positive ? "+" : ""}{kpi.changePercent.toFixed(1)}%
                </span>
              ) : null}
            </div>
            {!kpi.available && kpi.reason ? <p className="mt-2 truncate text-[10px] text-amber-300/80" title={kpi.reason}>{kpi.reason}</p> : null}
          </article>
        );
      })}
    </section>
  );
}
