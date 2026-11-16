import { notFound, redirect } from "next/navigation";

import { ManualInquiryForm } from "@/components/admin/crm/ManualInquiryForm";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { CustomerNotFoundError, CustomerPermissionError, CustomerService } from "@/lib/services/customer-service";
import { inquiryCustomerOptionsQuerySchema } from "@/lib/validation/crm";
import { LeadService } from "@/lib/services/lead-service";

export const dynamic = "force-dynamic";

export default async function AdminNewInquiryPage({ searchParams }: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "inquiry.create")) return <DataState kind="error" title="无权新增询盘" />;

  const query = inquiryCustomerOptionsQuerySchema.safeParse(await searchParams ?? {});
  if (!query.success) return <DataState kind="error" title="客户选择无效，请从客户列表重新选择" />;
  try {
    const [assignees, customerOptions] = await Promise.all([
      new LeadService().listAssignees(principal, "assign"),
      new CustomerService().inquiryOptions(principal, query.data),
    ]);
    return (
      <div className="max-w-4xl space-y-5">
        <AdminPageHeader title="新增询盘" />
        <ManualInquiryForm assignees={assignees} assigneeRequired={!can(principal, "lead.read.all")}
          customerOptions={customerOptions} initialContactId={query.data.contactId} initialCompanyId={query.data.companyId} />
      </div>
    );
  } catch (error) {
    if (error instanceof CustomerNotFoundError) notFound();
    if (error instanceof CustomerPermissionError) return <DataState kind="error" title="无权选择此客户" />;
    throw error;
  }
}
