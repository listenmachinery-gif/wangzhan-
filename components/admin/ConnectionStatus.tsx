import Link from "next/link";

import type { IntegrationSourceState } from "@/lib/analytics/types";

const statePresentation: Record<IntegrationSourceState["code"], { label: string; color: string }> = {
  CONNECTED: { label: "已连接", color: "text-emerald-700" },
  NO_DATA: { label: "已连接", color: "text-emerald-700" },
  NOT_CONFIGURED: { label: "未配置", color: "text-amber-700" },
  INVALID_CONFIG: { label: "配置不完整", color: "text-amber-700" },
  UNAUTHORIZED: { label: "无访问权限", color: "text-red-700" },
  FORBIDDEN: { label: "无访问权限", color: "text-red-700" },
  RATE_LIMITED: { label: "暂时不可用", color: "text-amber-700" },
  TIMEOUT: { label: "暂时不可用", color: "text-amber-700" },
  UPSTREAM_UNAVAILABLE: { label: "暂时不可用", color: "text-amber-700" },
};

export function ConnectionStatus({
  service,
  state,
  message,
  checkedAt,
  href,
}: {
  service: string;
  state: IntegrationSourceState["code"];
  message: string;
  checkedAt?: string;
  href: string;
}) {
  const presentation = statePresentation[state];
  return (
    <Link
      href={href}
      aria-label={`${service}：${presentation.label}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-neutral-900">{service}</p>
        <span className={`text-sm font-semibold ${presentation.color}`}>{presentation.label}</span>
      </div>
      <p className="mt-2 text-xs text-neutral-500">{message}</p>
      {checkedAt ? (
        <p className="mt-3 text-xs text-neutral-400">
          检查于 {new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(new Date(checkedAt))}
        </p>
      ) : null}
    </Link>
  );
}
