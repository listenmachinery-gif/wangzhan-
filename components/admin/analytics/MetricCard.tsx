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
    <article data-testid={`metric-${id}`} className="rounded-admin border border-admin-border bg-white p-5 shadow-admin-card transition duration-admin hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
      <p className="text-xs font-medium text-admin-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] text-admin-ink">{formatValue(metric.value, format)}</p>
      {change === null ? (
        <p className="mt-2 text-xs text-admin-muted">暂无可比数据</p>
      ) : (
        <p className={`mt-2 text-xs font-medium ${positive ? "text-emerald-700" : "text-red-700"}`}>
          较上一周期 {change >= 0 ? "+" : ""}{new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(change)}%
        </p>
      )}
    </article>
  );
}
