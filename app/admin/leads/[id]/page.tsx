import { notFound, redirect } from "next/navigation";

import { LeadDetail } from "@/components/admin/leads/LeadDetail";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { LeadNotFoundError, LeadService } from "@/lib/services/lead-service";

export const dynamic = "force-dynamic";

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  const { id } = await params;
  try {
    const lead = await new LeadService().get(principal, id);
    const assignableSales = can(principal, "lead.assign") ? await db.user.findMany({ where: { isActive: true, roles: { some: { role: { key: "SALES" } } } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }) : [];
    return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">询盘详情</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{lead.name || lead.email}</h1><p className="mt-2 text-sm text-neutral-500">编号 {lead.id}</p></div><LeadDetail lead={lead} assignableSales={assignableSales}/></div>;
  } catch (error) {
    if (error instanceof LeadNotFoundError) notFound();
    throw error;
  }
}
