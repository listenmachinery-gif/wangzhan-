import type { ReactNode } from "react";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: StatusTone }) {
  const label = typeof children === "string" || typeof children === "number" ? String(children) : "状态";

  return (
    <span
      aria-label={`状态：${label}`}
      data-tone={tone}
      className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
