import Link from "next/link";
import { TableShell } from "@/components/admin/ui/TableShell";
import { DataState } from "@/components/admin/ui/DataState";
import type { CustomerListItem } from "@/lib/services/customer-service";
import { formatCountryName } from "@/lib/admin/localization";

const link =
  "admin-focus inline-flex min-h-11 items-center rounded-admin-sm px-2 font-medium";
export function CustomerList({
  items,
  page,
  pageSize,
  total,
  query,
}: {
  items: CustomerListItem[];
  page: number;
  pageSize: number;
  total: number;
  query: Record<string, string>;
}) {
  function pageLink(next: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(next));
    return `/admin/customers?${params.toString()}`;
  }
  return (
    <div className="space-y-5">
      <form
        action="/admin/customers"
        role="search"
        aria-label="客户筛选"
        className="flex flex-wrap items-end gap-3 rounded-admin border border-admin-border bg-white p-4"
      >
        <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium">
          搜索客户
          <input
            name="query"
            type="search"
            maxLength={200}
            defaultValue={query.query}
            placeholder="姓名、公司、邮箱或电话"
            className="admin-focus min-h-11 min-w-0 rounded-admin-sm border border-admin-border px-3"
          />
        </label>
        {Object.entries(query)
          .filter(([key]) => key !== "query" && key !== "page")
          .map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        <button className="admin-focus min-h-11 rounded-admin-sm bg-admin-ink px-5 text-sm font-semibold text-white">
          搜索
        </button>
        <Link className={link} href="/admin/customers">
          清除筛选
        </Link>
      </form>
      {items.length ? (
        <TableShell caption="客户列表">
          <thead>
            <tr>
              {["客户", "公司", "国家", "联系方式", "授权询盘", "编辑权限"].map(
                (title) => (
                  <th key={title} scope="col">
                    {title}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <Link
                    className={link}
                    href={`/admin/customers/${encodeURIComponent(customer.id)}`}
                  >
                    {customer.fullName}
                  </Link>
                  <p className="text-xs text-admin-muted">
                    {customer.customerCode}
                  </p>
                </td>
                <td>{customer.company?.name || "—"}</td>
                <td>{formatCountryName(customer.countryCode, "—")}</td>
                <td className="break-words">
                  {[customer.email, customer.phone, customer.whatsapp]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td>{customer.inquiryCount}</td>
                <td>{customer.canEdit ? "可编辑" : "只读"}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      ) : (
        <DataState kind="empty" title="没有符合条件的客户" />
      )}
      <nav
        aria-label="客户分页"
        className="flex flex-wrap items-center justify-between gap-3 text-sm"
      >
        <p className="text-admin-muted">
          共 {total} 位客户 · 第 {page} 页
        </p>
        <div className="flex gap-3">
          {page > 1 ? (
            <Link className={link} href={pageLink(page - 1)}>
              上一页
            </Link>
          ) : null}
          {page * pageSize < total ? (
            <Link className={link} href={pageLink(page + 1)}>
              下一页
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
