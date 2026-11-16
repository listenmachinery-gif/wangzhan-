import type { MetricComparison } from "@/lib/analytics/types";

type MetricFormat = "number" | "percent" | "decimal";

function formatValue(value: number, format: MetricFormat) {
  if (format === "percent") {
    return new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 }).format(value);
  }
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: format === "decimal" ? 1 : 0,
  }).format(value);
}

export function MetricCard({
  id,
  label,
  metric,
  format = "number",
  inverse = false,
}: {
  id: string;
  label: string;
  metric: MetricComparison;
  format?: MetricFormat;
  inverse?: boolean;
}) {
  const change = metric.changePercent;
  const positive = change !== null && (inverse ? change <= 0 : change >= 0);

  return (
    <article data-testid={`metric-${id}`} className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{formatValue(metric.value, format)}</p>
      {change === null ? (
        <p className="mt-2 text-xs text-neutral-500">暂无可比数据</p>
      ) : (
        <p className={`mt-2 text-xs font-medium ${positive ? "text-emerald-700" : "text-red-700"}`}>
          较上一周期 {change >= 0 ? "+" : ""}{new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(change)}%
        </p>
      )}
    </article>
  );
}
