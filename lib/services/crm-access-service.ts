import "server-only";

import type { CrmTeamMembershipRole, Prisma, PrismaClient } from "@prisma/client";
import { can, type Principal } from "@/lib/auth/permissions";

export type CrmAccessScope =
  | { kind: "ALL" }
  | { kind: "ASSIGNEES"; assigneeIds: string[] }
  | { kind: "NONE" };

/** Resolves read scope. Mutations and exports also require their action-specific permissions and scope. */
export async function resolveCrmAccessScope(
  database: PrismaClient,
  principal: Principal,
  now = new Date(),
): Promise<CrmAccessScope> {
  if (can(principal, "lead.read.all")) return { kind: "ALL" };

  const assigneeIds = new Set<string>();
  if (can(principal, "lead.read.assigned", { assigneeId: principal.id, assignmentActive: true })) {
    assigneeIds.add(principal.id);
  }

  if (can(principal, "lead.read.team")) {
    const membershipRoles: CrmTeamMembershipRole[] = [];
    if (principal.roles.includes("SALES_MANAGER")) membershipRoles.push("MANAGER");
    if (principal.roles.includes("CRM_VIEWER")) membershipRoles.push("VIEWER");

    const activeMembership: Prisma.CrmTeamMembershipWhereInput = {
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    };
    const memberships = await database.crmTeamMembership.findMany({
      where: {
        ...activeMembership,
        team: {
          memberships: {
            some: {
              ...activeMembership,
              userId: principal.id,
              role: { in: membershipRoles },
            },
          },
        },
      },
      select: { userId: true },
    });

    for (const { userId } of memberships) assigneeIds.add(userId);
  }

  return assigneeIds.size === 0
    ? { kind: "NONE" }
    : { kind: "ASSIGNEES", assigneeIds: [...assigneeIds] };
}

export function leadWhereForScope(scope: CrmAccessScope): Prisma.LeadWhereInput {
  switch (scope.kind) {
    case "ALL":
      return {};
    case "ASSIGNEES":
      return {
        assignments: {
          some: { assigneeId: { in: scope.assigneeIds }, endedAt: null },
        },
      };
    case "NONE":
      return { id: { in: [] } };
  }
}
