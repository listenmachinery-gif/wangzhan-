export function TrendChart({
  title,
  accessibleName,
  points,
}: {
  title: string;
  accessibleName: string;
  points: Array<{ label: string; value: number }>;
}) {
  if (points.length === 0) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-8 text-center text-sm text-neutral-500">所选日期暂无趋势数据</p>
      </section>
    );
  }

  const values = points.map(({ value }) => Number.isFinite(value) ? value : 0);
  const max = Math.max(...values, 1);
  const width = 640;
  const height = 220;
  const padding = 24;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const coordinates = values.map((value, index) => {
    const x = points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * plotWidth;
    const y = padding + plotHeight - (value / max) * plotHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <svg role="img" aria-label={accessibleName} viewBox={`0 0 ${width} ${height}`} className="mt-4 h-52 w-full">
        <title>{accessibleName}</title>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d4d4d4" />
        <polyline points={coordinates} fill="none" stroke="#5F9500" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        {coordinates.split(" ").map((coordinate, index) => {
          const [cx, cy] = coordinate.split(",");
          return <circle key={`${points[index].label}-${index}`} cx={cx} cy={cy} r="4" fill="#0B0D10"><title>{points[index].label}: {values[index]}</title></circle>;
        })}
      </svg>
    </section>
  );
}
