"use client";

import Link from "next/link";
import { Download, Expand, Minimize2, RefreshCw } from "lucide-react";

import { formatCountryName, formatDeviceType } from "@/lib/admin/localization";
import type { DashboardBreakdown, DashboardRange } from "@/lib/dashboard/types";

const ranges: Array<{ value: DashboardRange; label: string }> = [
  { value: "7d", label: "近 7 天" },
  { value: "28d", label: "近 28 天" },
  { value: "90d", label: "近 90 天" },
];

export function DashboardToolbar({
  range,
  countries,
  devices,
  selectedCountry,
  selectedDevice,
  canExport,
  exportHref,
  autoRefresh,
  refreshing,
  isFullscreen,
  onRange,
  onCountry,
  onDevice,
  onRefresh,
  onAutoRefresh,
  onFullscreen,
}: {
  range: DashboardRange;
  countries: DashboardBreakdown[];
  devices: DashboardBreakdown[];
  selectedCountry: string;
  selectedDevice: string;
  canExport: boolean;
  exportHref: string;
  autoRefresh: boolean;
  refreshing: boolean;
  isFullscreen: boolean;
  onRange: (value: DashboardRange) => void;
  onCountry: (value: string) => void;
  onDevice: (value: string) => void;
  onRefresh: () => void;
  onAutoRefresh: (value: boolean) => void;
  onFullscreen: () => void;
}) {
  const controlClass = "min-h-10 rounded-lg border border-white/[0.1] bg-white/[0.035] px-3 text-xs font-medium text-[#D3D8DE] outline-none transition hover:border-white/20 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#76B900]";

  return (
    <div className="sticky top-0 z-20 -mx-3 border-y border-white/[0.08] bg-[#0B0D10]/95 px-3 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-xl sm:border sm:px-4">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div role="group" aria-label="统计日期范围" className="flex gap-1.5 overflow-x-auto pb-1 2xl:pb-0">
          {ranges.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={range === option.value}
              onClick={() => onRange(option.value)}
              className={`min-h-10 shrink-0 rounded-lg px-3.5 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#76B900] ${range === option.value ? "bg-[#76B900] text-[#0B0D10]" : "border border-white/[0.1] bg-white/[0.035] text-[#AEB6BE] hover:bg-white/[0.07]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="dashboard-country">国家筛选</label>
          <select id="dashboard-country" aria-label="国家筛选" value={selectedCountry} onChange={(event) => onCountry(event.target.value)} className={controlClass} title="仅影响具有国家维度的模块">
            <option value="">全部国家 / 地区</option>
            {countries.map((row) => <option key={row.value} value={row.value}>{formatCountryName(row.value)}</option>)}
          </select>

          <label className="sr-only" htmlFor="dashboard-device">设备筛选</label>
          <select id="dashboard-device" aria-label="设备筛选" value={selectedDevice} onChange={(event) => onDevice(event.target.value)} className={controlClass} title="仅影响具有设备维度的模块">
            <option value="">全部设备</option>
            {devices.map((row) => <option key={row.value} value={row.value}>{formatDeviceType(row.value)}</option>)}
          </select>

          <button type="button" onClick={onRefresh} className={`${controlClass} inline-flex items-center gap-2`} aria-label="立即刷新">
            <RefreshCw aria-hidden className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />刷新
          </button>

          <button type="button" role="switch" aria-label="自动刷新" aria-checked={autoRefresh} onClick={() => onAutoRefresh(!autoRefresh)} className={`${controlClass} inline-flex items-center gap-2`}>
            <span aria-hidden className={`relative h-4 w-7 rounded-full transition ${autoRefresh ? "bg-[#76B900]" : "bg-white/15"}`}><span className={`absolute top-0.5 size-3 rounded-full bg-white transition ${autoRefresh ? "left-3.5" : "left-0.5"}`} /></span>
            60 秒
          </button>

          {canExport ? <Link href={exportHref} className={`${controlClass} inline-flex items-center gap-2`}><Download aria-hidden className="size-3.5" />导出 CSV</Link> : null}

          <button type="button" onClick={onFullscreen} className={`${controlClass} inline-flex items-center gap-2`} aria-label={isFullscreen ? "退出全屏" : "进入全屏"}>
            {isFullscreen ? <Minimize2 aria-hidden className="size-3.5" /> : <Expand aria-hidden className="size-3.5" />}
            {isFullscreen ? "退出" : "全屏"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-[#69747E]">国家与设备筛选只作用于对应维度模块，不改变全局 KPI 或跨平台归因。</p>
    </div>
  );
}
