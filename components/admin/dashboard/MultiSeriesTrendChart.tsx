import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import type { DashboardTrendPoint } from "@/lib/dashboard/types";

const series = [
  { key: "visitors", label: "访客", color: "#76B900" },
  { key: "sessions", label: "会话", color: "#31C7E8" },
  { key: "pageViews", label: "浏览量", color: "#8B6CF6" },
  { key: "inquiries", label: "询盘", color: "#F3B63F" },
] as const;

export function MultiSeriesTrendChart({ points }: { points: DashboardTrendPoint[] }) {
  if (points.length === 0) {
    return <DashboardPanel title="核心指标趋势" description="第一方匿名访问与询盘事件"><p className="px-5 py-16 text-center text-sm text-[#89939E]">所选周期暂无数据</p></DashboardPanel>;
  }

  const width = 920;
  const height = 300;
  const paddingX = 44;
  const paddingY = 28;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const maximum = Math.max(1, ...points.flatMap((point) => series.map(({ key }) => point[key])));
  const coordinate = (value: number, index: number) => ({
    x: points.length === 1 ? width / 2 : paddingX + (index / (points.length - 1)) * plotWidth,
    y: paddingY + plotHeight - (value / maximum) * plotHeight,
  });

  return (
    <DashboardPanel
      title="核心指标趋势"
      description="第一方匿名访客、会话、页面浏览与询盘提交"
      action={<div className="hidden flex-wrap items-center gap-3 sm:flex">{series.map((item) => <span key={item.key} className="inline-flex items-center gap-1.5 text-[10px] text-[#A5AEB7]"><span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}</div>}
    >
      <div className="px-3 pb-3 pt-4 sm:px-5">
        <svg role="img" aria-label="第一方访问趋势" viewBox={`0 0 ${width} ${height}`} className="h-[17rem] w-full overflow-visible">
          <title>第一方访问趋势</title>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + plotHeight - ratio * plotHeight;
            return <g key={ratio}><line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,.07)" /><text x={paddingX - 8} y={y + 4} textAnchor="end" fill="#66717C" fontSize="10">{Math.round(maximum * ratio)}</text></g>;
          })}
          {series.map((item) => {
            const coordinates = points.map((point, index) => coordinate(point[item.key], index));
            return <g key={item.key}>
              <polyline points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {coordinates.map(({ x, y }, index) => <circle key={`${item.key}-${points[index].date}`} cx={x} cy={y} r="3.5" fill="#161A20" stroke={item.color} strokeWidth="2" tabIndex={0}><title>{points[index].date} · {item.label} {points[index][item.key]}</title></circle>)}
            </g>;
          })}
          {points.map((point, index) => {
            if (points.length > 10 && index % Math.ceil(points.length / 7) !== 0 && index !== points.length - 1) return null;
            const { x } = coordinate(0, index);
            return <text key={point.date} x={x} y={height - 5} textAnchor="middle" fill="#66717C" fontSize="10">{point.date.slice(5)}</text>;
          })}
        </svg>
        <ul aria-label="第一方访问趋势数据" className="sr-only">
          {points.map((point) => <li key={point.date}>{point.date}：访客 {point.visitors}，会话 {point.sessions}，浏览 {point.pageViews}，询盘 {point.inquiries}</li>)}
        </ul>
      </div>
    </DashboardPanel>
  );
}
