import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";

export type DashboardHealthSource = {
  label: string;
  status: "loading" | "healthy" | "unavailable" | "restricted";
  message: string;
  href: string;
};

const statusMeta = {
  loading: { label: "检查中", icon: Clock3, tone: "text-amber-300", dot: "bg-amber-300" },
  healthy: { label: "正常", icon: CheckCircle2, tone: "text-[#8DDB00]", dot: "bg-[#76B900]" },
  unavailable: { label: "需处理", icon: ShieldAlert, tone: "text-rose-300", dot: "bg-rose-400" },
  restricted: { label: "权限受限", icon: ShieldAlert, tone: "text-[#89939E]", dot: "bg-[#66717C]" },
} as const;

export function DataSourceHealth({ sources }: { sources: DashboardHealthSource[] }) {
  return (
    <DashboardPanel title="数据源健康状态" description="每个来源独立运行，异常不会阻断其他模块" action={<Link href="/admin/analytics" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8DDB00]">数据源设置<ArrowRight aria-hidden className="size-3" /></Link>}>
      <div className="grid gap-px bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-4">
        {sources.map((source) => {
          const meta = statusMeta[source.status];
          const Icon = meta.icon;
          return (
            <Link key={source.label} href={source.href} className="group flex items-center justify-between gap-4 bg-[#161A20] px-5 py-4 outline-none transition hover:bg-white/[0.035] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#76B900]">
              <div className="min-w-0">
                <p className="text-xs font-medium text-white">{source.label}</p>
                <p className="mt-1 truncate text-[10px] text-[#78838E]" title={source.message}>{source.message}</p>
              </div>
              <div className={`flex shrink-0 items-center gap-1.5 text-[10px] font-semibold ${meta.tone}`}><span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden /><Icon className="size-3" aria-hidden />{meta.label}</div>
            </Link>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
