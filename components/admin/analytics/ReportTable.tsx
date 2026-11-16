import { useId, type ReactNode } from "react";

export function ReportTable({
  title,
  columns,
  rows,
  emptyMessage = "暂无数据",
}: {
  title: string;
  columns: Array<{ key: string; label: string; align?: "left" | "right" }>;
  rows: Array<Record<string, ReactNode>>;
  emptyMessage?: string;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="overflow-hidden rounded-admin border border-admin-border bg-white shadow-admin-card">
      <h3 id={titleId} className="px-5 pt-5 text-sm font-semibold text-admin-ink">{title}</h3>
      <div data-mobile-scroll className="mt-3 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-neutral-50 text-admin-muted">
            <tr>{columns.map((column) => <th key={column.key} scope="col" className={`sticky top-0 whitespace-nowrap border-b border-admin-border bg-neutral-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] ${column.align === "right" ? "text-right" : ""}`}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)} className="transition-colors duration-admin hover:bg-neutral-50/80">
                {columns.map((column) => <td key={column.key} className={`max-w-md border-b border-admin-border px-4 py-3.5 ${column.align === "right" ? "text-right tabular-nums" : ""}`}>{row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-6 text-center text-sm text-neutral-500">{emptyMessage}</p> : null}
      </div>
    </section>
  );
}
