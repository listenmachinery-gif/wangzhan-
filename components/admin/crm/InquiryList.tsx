import Link from "next/link";

import { InquiryStageFilters } from "@/components/admin/crm/InquiryStageFilters";
import { inquiryFilterControl, InquirySelectFilter } from "@/components/admin/crm/InquirySelectFilter";
import { DataState } from "@/components/admin/ui/DataState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { TableShell } from "@/components/admin/ui/TableShell";
import { inquiryCustomerLevels, inquirySourceLabels, type InquiryAssignee } from "@/components/admin/crm/inquiry-options";
import { formatAdminEnum, formatCountryName } from "@/lib/admin/localization";

export type InquiryListPath = "/admin/leads" | "/admin/inquiries";

export type InquiryListRow = {
  id: string;
  reference: string;
  customer: string | null;
  company: string | null;
  country: string | null;
  contacts: string[];
  product: string | null;
  source: string | null;
  stage: string;
  stageTone: "neutral" | "info" | "success" | "warning" | "danger";
  level: string | null;
  assignee: string | null;
  lastFollowUpAt: string | null;
  nextFollowUpAt: string | null;
  overdue: boolean;
  estimatedAmount: string | null;
  createdAt: string;
};

const columns = [
  "询盘编号", "客户", "公司", "国家", "联系方式", "产品", "来源", "阶段", "等级", "负责人",
  "最近跟进", "下次跟进", "逾期状态", "预计金额", "创建时间",
];

const dateFormat = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  hourCycle: "h23",
});
const neutralButton = "admin-focus inline-flex min-h-11 items-center justify-center rounded-admin-sm border border-admin-border bg-white px-3 text-sm font-semibold text-admin-ink hover:bg-neutral-50";

function InquiryTime({ value }: { value: string | null }) {
  return value ? <time dateTime={value}>{dateFormat.format(new Date(value))}</time> : "—";
}

export function InquiryList({ path, rows, stages, assignees, query, total, page, pageSize, error }: {
  path: InquiryListPath;
  rows: InquiryListRow[];
  stages: { code: string; name: string }[];
  assignees: InquiryAssignee[];
  query: Record<string, string>;
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    return `${path}?${params.toString()}`;
  }

  return (
    <>
      <form action={path} method="get" role="search" aria-label="询盘筛选" className="grid min-w-0 grid-cols-1 gap-3 rounded-admin border border-admin-border bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="block text-xs font-semibold text-admin-ink xl:col-span-2">
          <span className="mb-1.5 block">搜索询盘</span>
          <input type="search" name="query" maxLength={200} defaultValue={query.query} placeholder="编号、姓名、公司或邮箱" className={inquiryFilterControl} />
        </label>
        <InquiryStageFilters
          key={`${query.stageCode ?? ""}:${query.status ?? ""}`}
          stages={stages}
          stageCode={query.stageCode}
          status={query.status}
        />
        <InquirySelectFilter name="customerLevel" label="客户等级" placeholder="全部等级" value={query.customerLevel} options={inquiryCustomerLevels.map((level) => ({ value: level, label: formatAdminEnum(level) }))} />
        <InquirySelectFilter name="sourceChannel" label="来源渠道" placeholder="全部来源" value={query.sourceChannel} options={Object.entries(inquirySourceLabels).map(([value, label]) => ({ value, label }))} />
        <label className="block text-xs font-semibold text-admin-ink">
          <span className="mb-1.5 block">国家或地区</span>
          <input name="country" maxLength={100} defaultValue={query.country} placeholder="按记录中的国家或地区筛选" className={inquiryFilterControl} />
        </label>
        <InquirySelectFilter name="ownerId" label="负责人" placeholder="全部负责人" value={query.ownerId ?? query.assigneeId} options={assignees.map(({ id, name }) => ({ value: id, label: name }))} />
        <InquirySelectFilter name="overdue" label="逾期状态" placeholder="全部状态" value={query.overdue} options={[{ value: "true", label: "已逾期" }, { value: "false", label: "未逾期" }]} />
        {(["pageSize", "createdFrom", "createdTo", "nextFollowUpFrom", "nextFollowUpTo"] as const).map((name) => (
          query[name] ? <input key={name} type="hidden" name={name} value={query[name]} /> : null
        ))}
        <div className="flex flex-wrap items-end gap-2">
          <button type="submit" className="admin-focus inline-flex min-h-11 items-center rounded-admin-sm bg-admin-ink px-4 text-sm font-semibold text-white hover:bg-graphite-700">筛选</button>
          {Object.keys(query).some((key) => key !== "page" && key !== "pageSize") ? <Link className={neutralButton} href={path}>清除筛选</Link> : null}
        </div>
      </form>

      {error || rows.length === 0 ? (
        <div className="rounded-admin border border-admin-border bg-white">
          {error ? <DataState kind="error" title="无法显示询盘" description={error} /> : (
            <DataState kind="empty" title="没有符合条件的询盘" description="可调整筛选条件后重试。" />
          )}
        </div>
      ) : (
        <TableShell caption="询盘列表" className="max-h-[66dvh] [&_thead_th]:whitespace-nowrap">
          <thead>
            <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/admin/leads/${encodeURIComponent(row.id)}`} prefetch={false} className="admin-focus -my-2 inline-flex min-h-11 min-w-36 items-center rounded-sm px-1 text-xs font-semibold text-admin-ink underline decoration-neutral-400 underline-offset-4 [overflow-wrap:anywhere] hover:decoration-admin-ink">
                    {row.reference}
                  </Link>
                </td>
                <td className="min-w-32 font-medium text-admin-ink [overflow-wrap:anywhere]">{row.customer ?? "—"}</td>
                <td className="min-w-32 [overflow-wrap:anywhere]">{row.company ?? "—"}</td>
                <td className="min-w-24 [overflow-wrap:anywhere]">{formatCountryName(row.country, "—")}</td>
                <td className="min-w-44 [overflow-wrap:anywhere]">{row.contacts.length ? row.contacts.map((contact) => <div key={contact}>{contact}</div>) : "—"}</td>
                <td className="min-w-32 [overflow-wrap:anywhere]">{row.product ?? "—"}</td>
                <td className="whitespace-nowrap">{row.source ? <StatusBadge>{row.source}</StatusBadge> : "—"}</td>
                <td className="whitespace-nowrap"><StatusBadge tone={row.stageTone}>{row.stage}</StatusBadge></td>
                <td>{row.level ? <StatusBadge>{formatAdminEnum(row.level)}</StatusBadge> : "—"}</td>
                <td className="min-w-24 [overflow-wrap:anywhere]">{row.assignee ?? "待分配"}</td>
                <td className="whitespace-nowrap text-admin-muted"><InquiryTime value={row.lastFollowUpAt} /></td>
                <td className="whitespace-nowrap text-admin-muted"><InquiryTime value={row.nextFollowUpAt} /></td>
                <td className="whitespace-nowrap">{row.overdue ? <StatusBadge tone="warning">已逾期</StatusBadge> : "—"}</td>
                <td className="whitespace-nowrap tabular-nums">{row.estimatedAmount ?? "—"}</td>
                <td className="whitespace-nowrap text-admin-muted"><InquiryTime value={row.createdAt} /></td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
      {!error ? (
        <nav aria-label="询盘分页" className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm tabular-nums text-admin-muted">共 {total} 条 · 第 {page} / {pageCount} 页</p>
          <div className="flex flex-wrap gap-2">
            {page > 1 ? <Link className={neutralButton} href={pageHref(Math.min(page - 1, pageCount))}>上一页</Link> : null}
            {page < pageCount ? <Link className={neutralButton} href={pageHref(page + 1)}>下一页</Link> : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
