import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  LeadConflictError,
  LeadPermissionError,
  LeadService,
} from "@/lib/services/lead-service";
import { seedCrmStages } from "@/prisma/seed-crm";

describe("LeadService CRM permissions and workflow", () => {
  let admin: Principal;
  let salesOne: Principal;
  let salesTwo: Principal;
  let productEditor: Principal;
  let leadId: string;
  let service: LeadService;

  beforeEach(async () => {
    await resetTestDatabase();
    await seedCrmStages(db);
    const [adminUser, firstSalesUser, secondSalesUser, editorUser] = await Promise.all([
      db.user.create({ data: { email: "crm-admin@zyron.test", name: "CRM Admin", passwordHash: "test" } }),
      db.user.create({ data: { email: "sales-one@zyron.test", name: "Sales One", passwordHash: "test" } }),
      db.user.create({ data: { email: "sales-two@zyron.test", name: "Sales Two", passwordHash: "test" } }),
      db.user.create({ data: { email: "product-editor-crm@zyron.test", name: "Product Editor", passwordHash: "test" } }),
    ]);
    admin = { id: adminUser.id, email: adminUser.email, name: adminUser.name, roles: ["ADMIN"] };
    salesOne = { id: firstSalesUser.id, email: firstSalesUser.email, name: firstSalesUser.name, roles: ["SALES"] };
    salesTwo = { id: secondSalesUser.id, email: secondSalesUser.email, name: secondSalesUser.name, roles: ["SALES"] };
    productEditor = { id: editorUser.id, email: editorUser.email, name: editorUser.name, roles: ["PRODUCT_EDITOR"] };
    const salesRole = await db.role.create({ data: { key: "SALES", name: "Sales" } });
    await db.userRole.createMany({
      data: [
        { userId: firstSalesUser.id, roleId: salesRole.id },
        { userId: secondSalesUser.id, roleId: salesRole.id },
      ],
    });
    const lead = await db.lead.create({
      data: {
        name: "Buyer One",
        company: "=HYPERLINK(\"https://evil.example\")",
        email: "buyer-one@example.com",
        message: "+SUM(1,1)",
      },
    });
    leadId = lead.id;
    service = new LeadService(db);
  });

  afterAll(() => db.$disconnect());

  it("keeps one current assignee and enforces assigned-only visibility after reassignment", async () => {
    const first = await service.assign(admin, leadId, { version: 1, assigneeId: salesOne.id });
    expect(first.version).toBe(2);
    await expect(service.get(salesOne, leadId)).resolves.toMatchObject({ id: leadId });
    await expect(service.get(salesTwo, leadId)).rejects.toBeInstanceOf(LeadPermissionError);

    const second = await service.assign(admin, leadId, { version: first.version, assigneeId: salesTwo.id });
    expect(second.version).toBe(3);
    await expect(service.get(salesOne, leadId)).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.addActivity(salesOne, leadId, { type: "NOTE", content: "Former assignee must be denied." })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.get(salesTwo, leadId)).resolves.toMatchObject({ id: leadId });
    await expect(service.get(productEditor, leadId)).rejects.toBeInstanceOf(LeadPermissionError);

    const assignments = await db.leadAssignment.findMany({ where: { leadId }, orderBy: { assignedAt: "asc" } });
    expect(assignments).toHaveLength(2);
    expect(assignments[0]).toMatchObject({ assigneeId: salesOne.id, endedAt: expect.any(Date) });
    expect(assignments[1]).toMatchObject({ assigneeId: salesTwo.id, endedAt: null });
    await expect(db.auditLog.count({ where: { entityId: leadId, action: "lead.assign" } })).resolves.toBe(2);
  });

  it("supports every lead status, follow-up dates, admin reopen, and stale-write rejection", async () => {
    let version = 1;
    for (const status of ["CONTACTED", "IN_DISCUSSION", "QUOTED", "WON", "LOST", "SPAM"] as const) {
      const updated = await service.update(admin, leadId, {
        version,
        status,
        nextFollowUpAt: status === "CONTACTED" ? "2026-12-01T09:00:00.000Z" : undefined,
      });
      expect(updated.status).toBe(status);
      version = updated.version;
    }

    const reopened = await service.update(admin, leadId, { version, status: "NEW" });
    expect(reopened).toMatchObject({
      status: "NEW",
      stageId: "crm_stage_new_inquiry",
      preSpamStageId: null,
      version: 8,
    });
    expect(reopened.nextFollowUpAt).toEqual(new Date("2026-12-01T09:00:00.000Z"));
    await expect(service.update(admin, leadId, { version, status: "QUOTED" })).rejects.toBeInstanceOf(LeadConflictError);
    await expect(db.auditLog.count({ where: { entityId: leadId, action: "lead.update" } })).resolves.toBe(7);
  });

  it("lets assigned Sales append activities and update active leads, but not reopen closed leads", async () => {
    const assigned = await service.assign(admin, leadId, { version: 1, assigneeId: salesOne.id });
    const contacted = await service.update(salesOne, leadId, { version: assigned.version, status: "CONTACTED" });
    const activity = await service.addActivity(salesOne, leadId, {
      type: "NOTE",
      content: "Customer confirmed three-phase voltage.",
    });
    expect(activity).toMatchObject({ actorId: salesOne.id, content: "Customer confirmed three-phase voltage." });

    const won = await service.update(admin, leadId, { version: contacted.version, status: "WON" });
    await expect(service.update(salesOne, leadId, { version: won.version, status: "IN_DISCUSSION" })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.addActivity(salesTwo, leadId, { type: "NOTE", content: "Not assigned." })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(db.leadActivity.findUniqueOrThrow({ where: { id: activity.id } })).resolves.toMatchObject({
      content: "Customer confirmed three-phase voltage.",
    });
  });

  it("keeps legacy follow-up changes separate from stage transitions", async () => {
    const status = await service.update(admin, leadId, {
      version: 1,
      status: "CONTACTED",
      nextFollowUpAt: "2026-12-01T09:00:00.000Z",
    });
    const cleared = await service.update(admin, leadId, { version: status.version, nextFollowUpAt: "" });

    expect(cleared).toMatchObject({
      status: "CONTACTED",
      stageId: "crm_stage_contacted",
      nextFollowUpAt: null,
      version: 3,
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(1);
    await expect(db.auditLog.count({ where: { entityId: leadId, action: "lead.update" } })).resolves.toBe(2);
    await expect(db.auditLog.findFirst({
      where: { entityId: leadId, action: "lead.update", after: { path: ["version"], equals: 2 } },
    })).resolves.toMatchObject({
      before: { nextFollowUpAt: null },
      after: { nextFollowUpAt: "2026-12-01T09:00:00.000Z" },
    });
  });

  it("keeps the legacy update payload strict", async () => {
    await expect(service.update(admin, leadId, { version: 1, status: "CONTACTED", stageCode: "REQUIREMENT_CONFIRMED" }))
      .rejects.toMatchObject({ issues: [expect.objectContaining({ code: "unrecognized_keys" })] });
    await expect(db.lead.findUniqueOrThrow({ where: { id: leadId } })).resolves.toMatchObject({ version: 1 });
  });

  it("allows assigned Sales to advance stages and restricts them from rolling back", async () => {
    const assigned = await service.assign(admin, leadId, { version: 1, assigneeId: salesOne.id });
    const advanced = await service.updateStage(salesOne, leadId, {
      version: assigned.version,
      stageCode: "AWAITING_DECISION",
    });

    await expect(service.updateStage(salesTwo, leadId, { version: advanced.version, stageCode: "ORDER_CONFIRMED" }))
      .rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.updateStage(salesOne, leadId, { version: advanced.version, stageCode: "NEGOTIATION" }))
      .rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.update(salesOne, leadId, { version: advanced.version, status: "CONTACTED" }))
      .rejects.toBeInstanceOf(LeadPermissionError);
    await expect(db.lead.findUniqueOrThrow({ where: { id: leadId } })).resolves.toMatchObject({
      stageId: "crm_stage_awaiting_decision",
      version: advanced.version,
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(1);
  });

  it("allows managers to roll back only within a currently managed team", async () => {
    const manager: Principal = { ...productEditor, roles: ["SALES_MANAGER", "CRM_VIEWER"] };
    const assigned = await service.assign(admin, leadId, { version: 1, assigneeId: salesOne.id });
    const advanced = await service.update(admin, leadId, { version: assigned.version, status: "QUOTED" });
    const team = await db.crmTeam.create({ data: { name: "Stage permissions team" } });
    await db.crmTeamMembership.createMany({ data: [
      { teamId: team.id, userId: manager.id, role: "VIEWER" },
      { teamId: team.id, userId: salesOne.id },
    ] });

    await expect(service.updateStage(manager, leadId, { version: advanced.version, stageCode: "CONTACTED" }))
      .rejects.toBeInstanceOf(LeadPermissionError);
    await db.crmTeamMembership.create({
      data: { teamId: team.id, userId: manager.id, role: "MANAGER" },
    });

    await expect(service.updateStage(manager, leadId, {
      version: advanced.version,
      stageCode: "REQUIREMENT_CONFIRMED",
    })).resolves.toMatchObject({
      status: "CONTACTED",
      stageId: "crm_stage_requirement_confirmed",
      version: advanced.version + 1,
    });
    await expect(service.update(manager, leadId, { version: advanced.version + 1, status: "NEW" }))
      .resolves.toMatchObject({ status: "NEW", stageId: "crm_stage_new_inquiry" });
  });

  it("filters assigned leads and exports only authorized rows with formula-safe CSV cells", async () => {
    const other = await db.lead.create({
      data: { name: "Buyer Two", email: "buyer-two@example.com", message: "Normal requirement", status: "QUOTED" },
    });
    await service.assign(admin, leadId, { version: 1, assigneeId: salesOne.id });
    await service.assign(admin, other.id, { version: 1, assigneeId: salesTwo.id });

    const own = await service.list(salesOne, { page: "1", pageSize: "20", status: "NEW", query: "buyer-one" });
    expect(own.items.map(({ id }) => id)).toEqual([leadId]);
    expect(own.total).toBe(1);

    const csv = await service.exportCsv(salesOne, {});
    expect(csv).toContain("buyer-one@example.com");
    expect(csv).not.toContain("buyer-two@example.com");
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+SUM(1,1)");
    await expect(service.exportCsv(salesOne, { assigneeId: salesTwo.id })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.exportCsv(productEditor, {})).rejects.toBeInstanceOf(LeadPermissionError);
  });
});
