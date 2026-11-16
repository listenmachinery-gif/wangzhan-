import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerList } from "@/components/admin/crm/CustomerList";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { CustomerService } from "@/lib/services/customer-service";
import { customerListQuerySchema } from "@/lib/validation/crm";
export const dynamic = "force-dynamic";
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [principal, raw] = await Promise.all([
    getCurrentPrincipal(),
    searchParams,
  ]);
  if (!principal) redirect("/admin/login");
  if (!can(principal, "customer.read"))
    return <DataState kind="error" title="无权查看客户" />;
  const query: Record<string, string> = {};
  for (const key of [
    "query",
    "page",
    "pageSize",
    "countryCode",
    "customerLevel",
    "ownerId",
  ]) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) query[key] = value.trim();
  }
  if (!customerListQuerySchema.safeParse(query).success)
    return (
      <div>
        <DataState
          kind="error"
          title="客户筛选条件无效"
          description="请清除筛选后重试。"
        />
        <Link
          className="admin-focus inline-flex min-h-11 items-center"
          href="/admin/customers"
        >
          清除筛选
        </Link>
      </div>
    );
  const result = await new CustomerService().list(principal, query);
  return (
    <div className="min-w-0 space-y-5">
      <AdminPageHeader
        title="客户管理"
        description="查看授权范围内的客户与关联询盘。"
        actions={
          can(principal, "customer.create") ? (
            <Link
              href="/admin/customers/new"
              className="inline-flex min-h-11 items-center rounded-admin-sm bg-admin-ink px-4 text-sm font-semibold text-white"
            >
              新增客户
            </Link>
          ) : undefined
        }
      />
      <CustomerList {...result} query={query} />
    </div>
  );
}
