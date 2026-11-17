"use client";

import dynamic from "next/dynamic";

import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { formatCountryName } from "@/lib/admin/localization";
import type { DashboardBreakdown } from "@/lib/dashboard/types";

const WorldMapCanvas = dynamic(() => import("@/components/admin/dashboard/WorldMapCanvas"), {
  ssr: false,
  loading: () => <div role="status" className="grid min-h-64 place-items-center text-xs text-[#78838E]">正在加载世界地图…</div>,
});

const number = new Intl.NumberFormat("zh-CN");

export function WorldTrafficMap({ countries, selectedCountry, onSelectCountry }: {
  countries: DashboardBreakdown[];
  selectedCountry: string;
  onSelectCountry: (value: string) => void;
}) {
  const rows = countries.toSorted((left, right) => right.visitors - left.visitors).slice(0, 10);
  return (
    <DashboardPanel title="全球流量分布" description="第一方已同意匿名访客 · 可点击国家下钻">
      {rows.length === 0 ? <p className="px-5 py-16 text-center text-sm text-[#89939E]">所选周期暂无数据</p> : (
        <div className="grid min-h-[22rem] lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,.8fr)]">
          <div className="min-h-64 border-b border-white/[0.08] p-2 lg:border-b-0 lg:border-r">
            <WorldMapCanvas rows={countries} selectedCountry={selectedCountry} onSelectCountry={onSelectCountry} />
          </div>
          <ol aria-label="国家访问排名" className="divide-y divide-white/[0.07] p-3">
            {rows.map((row, index) => (
              <li key={row.value}>
                <button
                  type="button"
                  aria-pressed={selectedCountry === row.value}
                  onClick={() => onSelectCountry(row.value)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#76B900] ${selectedCountry === row.value ? "bg-[#76B900]/12" : "hover:bg-white/[0.04]"}`}
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded bg-white/[0.06] text-[10px] text-[#89939E]">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">{formatCountryName(row.value)}</span>
                  <span className="text-right text-xs font-semibold tabular-nums text-[#A5AEB7]">{number.format(row.visitors)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </DashboardPanel>
  );
}
