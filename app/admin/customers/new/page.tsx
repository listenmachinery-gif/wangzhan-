import { redirect } from "next/navigation";
import { CustomerForm } from "@/components/admin/crm/CustomerForm";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
export const dynamic = "force-dynamic";
export default async function NewCustomerPage() {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  if (!can(principal, "customer.create"))
    return <DataState kind="error" title="无权新增客户" />;
  return (
    <div className="max-w-4xl space-y-5">
      <AdminPageHeader
        title="新增客户"
        description="填写联系人信息；发现重复记录时需要再次确认。"
      />
      <CustomerForm />
    </div>
  );
}
