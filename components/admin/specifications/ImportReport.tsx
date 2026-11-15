export type ImportIssue = { row: number; column: string; message: string };

export function ImportReport({ errors }: { errors: ImportIssue[] }) {
  if (!errors.length) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4" aria-label="导入错误报告">
      <p className="font-semibold text-red-900">导入未应用，请修正以下问题</p>
      <ul className="mt-3 space-y-2 text-sm text-red-800">
        {errors.map((error, index) => (
          <li key={`${error.row}-${error.column}-${index}`}>
            <span className="font-semibold">第 {error.row} 行 · {error.column}</span>：{error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
