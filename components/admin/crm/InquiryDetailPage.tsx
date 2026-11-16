import { notFound, redirect } from "next/navigation";
import {
  InquiryDetail,
  type InquiryDetailValue,
} from "@/components/admin/crm/InquiryDetail";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import {
  LeadNotFoundError,
  LeadPermissionError,
  LeadService,
} from "@/lib/services/lead-service";
import { inquiryLegacyStatusLabels } from "@/components/admin/crm/inquiry-options";

export async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [principal, { id }] = await Promise.all([
    getCurrentPrincipal(),
    params,
  ]);
  if (!principal) redirect("/admin/login");
  const service = new LeadService();
  try {
    const assignPermission =
      can(principal, "lead.assign") || can(principal, "lead.assign.team");
    const [lead, stages, assignees] = await Promise.all([
      service.get(principal, id),
      service.listStages(principal),
      assignPermission ? service.listAssignees(principal, "assign") : [],
    ]);
    const assignment = lead.assignments.find(({ endedAt }) => endedAt === null);
    const { canEditStage, canAssign, canAddNote } = lead.capabilities;
    // Explicit projection keeps database metadata and delivery logs out of client props.
    const inquiry: InquiryDetailValue = {
      id: lead.id,
      version: lead.version,
      inquiryNumber: lead.inquiryNumber,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      country: lead.country,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      message: lead.message,
      product: lead.interestedProduct?.name ?? null,
      material: lead.material,
      thickness: lead.thickness,
      workingLength: lead.workingLength,
      quantity: lead.quantity,
      voltage: lead.voltage,
      budget: lead.budget,
      stageCode: lead.stage?.code ?? "",
      stageName: lead.stage?.name ?? inquiryLegacyStatusLabels[lead.status],
      ownerId: assignment?.assignee.id ?? "",
      ownerName: assignment?.assignee.name ?? "待分配",
      nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
      activities: lead.activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        content: activity.content,
        createdAt: new Date(activity.createdAt).toISOString(),
        actorName: activity.actor?.name ?? "系统",
      })),
    };
    return (
      <div className="min-w-0 space-y-5">
        <AdminPageHeader
          title={lead.name || lead.email}
          eyebrow="询盘详情"
          description={`编号 ${lead.inquiryNumber || lead.id}`}
        />
        <InquiryDetail
          key={`${lead.id}-${lead.version}-${lead.activities.length}`}
          inquiry={inquiry}
          stages={stages.map(({ code, name, requiresReason }) => ({
            code,
            name,
            requiresReason,
          }))}
          assignees={canAssign ? assignees : []}
          canEditStage={canEditStage}
          canAssign={canAssign}
          canAddNote={canAddNote}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof LeadNotFoundError) notFound();
    if (error instanceof LeadPermissionError)
      return <DataState kind="error" title="无权查看此询盘" />;
    throw error;
  }
}
