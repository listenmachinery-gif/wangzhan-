import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { leadWhereForScope, resolveCrmAccessScope } from "@/lib/services/crm-access-service";
import { seedRbac } from "@/prisma/seed-rbac";

const now = new Date("2026-11-16T12:00:00.000Z");
const earlier = new Date("2026-11-15T12:00:00.000Z");
const later = new Date("2026-11-17T12:00:00.000Z");

function principal(id: string, ...roles: Principal["roles"]): Principal {
  return { id, email: `${id}@example.com`, name: id, roles };
}

beforeEach(resetTestDatabase);
afterAll(() => db.$disconnect());

describe("CRM team scope applied to PostgreSQL leads", () => {
  beforeEach(async () => {
    await db.user.createMany({
      data: ["manager", "viewer", "sales-a", "sales-b", "expired-viewer", "future-viewer", "member-manager"]
        .map((id) => ({ id, email: `${id}@example.com`, name: id, passwordHash: "test" })),
    });
    await db.crmTeam.createMany({
      data: [{ id: "north", name: "North" }, { id: "south", name: "South" }],
    });
    await db.crmTeamMembership.createMany({
      data: [
        { teamId: "north", userId: "manager", role: "MANAGER", startsAt: now },
        { teamId: "south", userId: "manager", role: "VIEWER", startsAt: earlier },
        { teamId: "north", userId: "viewer", role: "VIEWER", startsAt: earlier, endsAt: later },
        { teamId: "south", userId: "viewer", role: "MANAGER", startsAt: earlier },
        { teamId: "north", userId: "sales-a", startsAt: now },
        { teamId: "south", userId: "sales-b", startsAt: earlier },
        { teamId: "north", userId: "sales-b", startsAt: earlier, endsAt: now },
        { teamId: "north", userId: "sales-b", startsAt: later },
        { teamId: "north", userId: "expired-viewer", role: "VIEWER", startsAt: earlier, endsAt: now },
        { teamId: "north", userId: "future-viewer", role: "VIEWER", startsAt: later },
        { teamId: "north", userId: "member-manager", role: "MEMBER", startsAt: earlier },
      ],
    });
    await db.lead.createMany({
      data: ["north-lead", "south-lead", "historical-lead", "dated-assignment-lead", "unassigned-lead"]
        .map((id) => ({ id, email: `${id}@example.com`, message: id })),
    });
    await db.leadAssignment.createMany({
      data: [
        { leadId: "north-lead", assigneeId: "sales-a" },
        { leadId: "south-lead", assigneeId: "sales-a", endedAt: earlier },
        { leadId: "south-lead", assigneeId: "sales-b" },
        { leadId: "historical-lead", assigneeId: "sales-a", endedAt: now },
        { leadId: "dated-assignment-lead", assigneeId: "sales-a", endedAt: later },
      ].map((assignment) => ({ ...assignment, assignedById: "manager", assignedAt: earlier })),
    });
  });

  it("collects active members of authorized teams without repeating assignee IDs", async () => {
    const scope = await resolveCrmAccessScope(db, principal("manager", "SALES", "SALES_MANAGER"), now);

    expect(scope).toEqual({
      kind: "ASSIGNEES",
      assigneeIds: expect.arrayContaining(["manager", "viewer", "sales-a", "member-manager"]),
    });
    expect(scope.kind === "ASSIGNEES" && scope.assigneeIds).toHaveLength(4);
  });

  it.each([
    { label: "an authorized manager", actor: principal("manager", "SALES_MANAGER"), expected: ["north-lead"] },
    { label: "an authorized viewer", actor: principal("viewer", "CRM_VIEWER"), expected: ["north-lead"] },
    { label: "a Sales user", actor: principal("sales-a", "SALES"), expected: ["north-lead"] },
    { label: "a Sales user on another team", actor: principal("sales-b", "SALES"), expected: ["south-lead"] },
    { label: "a viewer with expired membership", actor: principal("expired-viewer", "CRM_VIEWER"), expected: [] },
    { label: "a viewer with future membership", actor: principal("future-viewer", "CRM_VIEWER"), expected: [] },
    { label: "a manager with member-only access", actor: principal("member-manager", "SALES_MANAGER"), expected: [] },
    { label: "a manager and viewer with both matching memberships", actor: principal("manager", "SALES_MANAGER", "CRM_VIEWER"), expected: ["north-lead", "south-lead"] },
    { label: "an editor with an active membership", actor: principal("manager", "PRODUCT_EDITOR"), expected: [] },
    {
      label: "an administrator",
      actor: principal("manager", "ADMIN"),
      expected: ["dated-assignment-lead", "historical-lead", "north-lead", "south-lead", "unassigned-lead"],
    },
  ])("returns only visible Leads for $label", async ({ actor, expected }) => {
    const scope = await resolveCrmAccessScope(db, actor, now);
    const leads = await db.lead.findMany({
      where: leadWhereForScope(scope),
      select: { id: true },
      orderBy: { id: "asc" },
    });

    expect(leads.map(({ id }) => id)).toEqual(expected);
  });
});

it("seeds CRM roles with their grants idempotently and preserves existing grants", async () => {
  await seedRbac(db);
  const rolesWithGrants = () => db.role.findMany({
    where: { key: { in: ["SALES_MANAGER", "CRM_VIEWER"] } },
    orderBy: { key: "asc" },
    select: {
      id: true,
      key: true,
      permissions: {
        orderBy: { permission: { key: "asc" } },
        select: { permission: { select: { key: true } } },
      },
    },
  });
  const roles = await rolesWithGrants();
  expect(roles.map(({ key, permissions }) => [key, permissions.map(({ permission }) => permission.key)])).toEqual([
    ["CRM_VIEWER", ["customer.read", "lead.read.team"]],
    ["SALES_MANAGER", [
      "customer.create",
      "customer.read",
      "customer.update",
      "inquiry.assign",
      "inquiry.create",
      "inquiry.update",
      "lead.assign.team",
      "lead.export.team",
      "lead.read.team",
      "lead.update.team",
    ]],
  ]);

  const customPermission = await db.permission.create({
    data: { key: "custom.manager.permission", description: "A grant configured separately" },
  });
  const managerRole = await db.role.findUniqueOrThrow({ where: { key: "SALES_MANAGER" } });
  await db.rolePermission.create({ data: { roleId: managerRole.id, permissionId: customPermission.id } });
  const rolesWithCustomGrant = await rolesWithGrants();

  await seedRbac(db);

  expect(await rolesWithGrants()).toEqual(rolesWithCustomGrant);
});
