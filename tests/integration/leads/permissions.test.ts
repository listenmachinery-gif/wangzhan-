import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  LeadConflictError,
  LeadPermissionError,
  LeadService,
} from "@/lib/services/lead-service";

describe("LeadService CRM permissions and workflow", () => {
  let admin: Principal;
  let salesOne: Principal;
  let salesTwo: Principal;
  let productEditor: Principal;
  let leadId: string;
  let service: LeadService;

  beforeEach(async () => {
    await resetTestDatabase();
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
    expect(reopened.status).toBe("NEW");
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
