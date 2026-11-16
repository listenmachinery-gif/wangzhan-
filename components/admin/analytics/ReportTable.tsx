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
    <section aria-labelledby={titleId} className="rounded-xl border border-neutral-200 bg-white">
      <h3 id={titleId} className="px-5 pt-5 font-semibold">{title}</h3>
      <div data-mobile-scroll className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>{columns.map((column) => <th key={column.key} className={`whitespace-nowrap px-4 py-3 ${column.align === "right" ? "text-right" : ""}`}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)} className="border-t border-neutral-100">
                {columns.map((column) => <td key={column.key} className={`max-w-md px-4 py-3 ${column.align === "right" ? "text-right tabular-nums" : ""}`}>{row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="p-6 text-center text-sm text-neutral-500">{emptyMessage}</p> : null}
      </div>
    </section>
  );
}
