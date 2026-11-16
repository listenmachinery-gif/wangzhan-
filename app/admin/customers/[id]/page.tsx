import { notFound, redirect } from "next/navigation";
import { CustomerDetail } from "@/components/admin/crm/CustomerDetail";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { getCurrentPrincipal } from "@/lib/auth/session";
import {
  CustomerService,
  CustomerNotFoundError,
  CustomerPermissionError,
} from "@/lib/services/customer-service";
export const dynamic = "force-dynamic";
export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [principal, { id }] = await Promise.all([
    getCurrentPrincipal(),
    params,
  ]);
  if (!principal) redirect("/admin/login");
  try {
    const customer = await new CustomerService().get(principal, id);
    return (
      <div className="min-w-0 space-y-5">
        <AdminPageHeader
          title={customer.fullName}
          eyebrow="客户详情"
          description={customer.customerCode}
        />
        <CustomerDetail customer={customer} />
      </div>
    );
  } catch (error) {
    if (error instanceof CustomerNotFoundError) notFound();
    if (error instanceof CustomerPermissionError)
      return <DataState kind="error" title="无权查看此客户" />;
    throw error;
  }
}
