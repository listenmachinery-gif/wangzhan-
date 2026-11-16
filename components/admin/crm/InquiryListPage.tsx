import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Plus } from "lucide-react";

import { InquiryList, type InquiryListPath, type InquiryListRow } from "@/components/admin/crm/InquiryList";
import { inquiryLegacyStatusLabels, inquirySourceLabels } from "@/components/admin/crm/inquiry-options";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DataState } from "@/components/admin/ui/DataState";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { LeadPermissionError, LeadService } from "@/lib/services/lead-service";
import { inquiryListQuerySchema } from "@/lib/validation/crm";

export type InquiryListSearchParams = Promise<Record<string, string | string[] | undefined>>;

const filterKeys = Object.keys(inquiryListQuerySchema.shape);

type LeadRow = Awaited<ReturnType<LeadService["list"]>>["items"][number];

function projectRow(lead: LeadRow, now: number): InquiryListRow {
  const isSpam = lead.status === "SPAM";
  const stage = isSpam ? inquiryLegacyStatusLabels.SPAM : lead.stage?.name ?? inquiryLegacyStatusLabels[lead.status];
  const stageTone = isSpam || lead.status === "LOST" ? "danger"
    : lead.status === "WON" ? "success"
    : lead.stage?.code === "ON_HOLD" ? "neutral"
    : "info";
  // The public form stores its free-text product interest before the original requirement.
  const legacyProduct = lead.recordOrigin !== "MANUAL" && lead.message.match(/^Product interest: ([^\r\n]+)\r?\n\r?\n/)?.[1];
  const estimatedAmount = lead.estimatedDealAmount?.toString();
  return {
    id: lead.id,
    reference: lead.inquiryNumber ?? lead.id,
    customer: lead.name,
    company: lead.company,
    country: lead.country,
    contacts: [...new Set([lead.email, lead.phone, lead.whatsapp].filter((value): value is string => Boolean(value)))],
    product: lead.interestedProduct?.name ?? (legacyProduct || null),
    source: lead.sourceChannel ? inquirySourceLabels[lead.sourceChannel] : null,
    stage,
    stageTone,
    level: lead.customerLevel,
    assignee: lead.assignments[0]?.assignee.name ?? null,
    lastFollowUpAt: lead.lastFollowUpAt?.toISOString() ?? null,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    overdue: Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt.getTime() < now && !["WON", "LOST", "SPAM"].includes(lead.status)),
    estimatedAmount: estimatedAmount ? [lead.estimatedCurrency, estimatedAmount].filter(Boolean).join(" ") : null,
    createdAt: lead.createdAt.toISOString(),
  };
}

export async function InquiryListPage({ path, searchParams }: { path: InquiryListPath; searchParams: InquiryListSearchParams }) {
  const [principal, raw] = await Promise.all([getCurrentPrincipal(), searchParams]);
  if (!principal) redirect("/admin/login");
  const assignedScope = { assigneeId: principal.id, assignmentActive: true };
  if (!can(principal, "lead.read.all") && !can(principal, "lead.read.team") && !can(principal, "lead.read.assigned", assignedScope)) {
    return <DataState kind="error" title="无权查看询盘" />;
  }

  const query: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) query[key] = value.trim();
  }
  const parsed = inquiryListQuerySchema.safeParse(query);

  const service = new LeadService();
  const [stages, assignees, loaded] = await Promise.all([
    service.listStages(principal),
    service.listAssignees(principal, "read"),
    parsed.success ? service.list(principal, query).catch((error: unknown) => {
      if (error instanceof LeadPermissionError) return { error: "所选负责人不在可查看的范围内。" };
      throw error;
    }) : { error: "筛选条件无效，请清除筛选后重试。" },
  ]);
  const now = Date.now();
  const result = "error" in loaded ? { items: [], page: 1, pageSize: 20, total: 0, error: loaded.error } : loaded;
  const canExport = can(principal, "lead.export.all") || can(principal, "lead.export.team") || can(principal, "lead.export.assigned", assignedScope);
  const canCreate = can(principal, "inquiry.create");

  return (
    <div className="min-w-0 space-y-5">
      <AdminPageHeader title="询盘 CRM" actions={canExport || canCreate ? (
        <>
          {canExport ? (
            <a href="/api/admin/leads/export" download className="inline-flex min-h-11 items-center gap-2 rounded-admin-sm border border-admin-border bg-white px-4 text-sm font-semibold text-admin-ink hover:bg-neutral-50">
              <Download aria-hidden="true" className="size-4" />导出授权范围 CSV
            </a>
          ) : null}
          {canCreate ? (
            <Link href="/admin/inquiries/new" className="inline-flex min-h-11 items-center gap-2 rounded-admin-sm bg-admin-ink px-4 text-sm font-semibold text-white hover:bg-graphite-700">
              <Plus aria-hidden="true" className="size-4" />新增询盘
            </Link>
          ) : null}
        </>
      ) : undefined} />
      <InquiryList path={path} query={query} stages={stages} assignees={assignees} rows={result.items.map((lead) => projectRow(lead, now))}
        page={result.page} pageSize={result.pageSize} total={result.total} error={"error" in result ? result.error : undefined} />
    </div>
  );
}
