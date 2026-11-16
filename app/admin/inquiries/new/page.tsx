import { redirect } from "next/navigation";

import { ManualInquiryForm } from "@/components/admin/crm/ManualInquiryForm";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { LeadService } from "@/lib/services/lead-service";

export const dynamic = "force-dynamic";

export default async function AdminNewInquiryPage() {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "inquiry.create")) return <DataState kind="error" title="无权新增询盘" />;

  const assignees = await new LeadService().listAssignees(principal, "assign");
  return (
    <div className="max-w-4xl space-y-5">
      <AdminPageHeader title="新增询盘" />
      <ManualInquiryForm assignees={assignees} assigneeRequired={!can(principal, "lead.read.all")} />
    </div>
  );
}
