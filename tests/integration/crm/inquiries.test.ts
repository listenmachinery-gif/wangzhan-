import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { LeadService, LeadPermissionError, LeadValidationError } from "@/lib/services/lead-service";
import { CustomerService } from "@/lib/services/customer-service";
import { InquiryService } from "@/lib/services/inquiry-service";
import { seedCrmStages } from "@/prisma/seed-crm";

const principal = (id: string, ...roles: Principal["roles"]): Principal => ({ id, name: id, email: `${id}@example.com`, roles });
const admin = principal("admin", "ADMIN");
const manager = principal("manager", "SALES_MANAGER", "CRM_VIEWER");
const sales = principal("sales", "SALES");
const other = principal("other", "SALES");
const viewer = principal("viewer", "CRM_VIEWER");
const service = new LeadService(db);
const customers = new CustomerService(db);
const input = { name: "Buyer", email: "buyer@example.com", message: "Need a machine", sourceChannel: "PHONE" };
beforeEach(async () => {
  await resetTestDatabase();
  await seedCrmStages(db);
  await db.user.createMany({ data: [admin, manager, sales, other, viewer].map(({ id, name, email }) => ({ id, name, email, passwordHash: "test" })) });
  const role = await db.role.create({ data: { key: "SALES", name: "Sales" } });
  await db.userRole.createMany({ data: [sales, other].map(({ id }) => ({ userId: id, roleId: role.id })) });
  await db.crmTeam.createMany({ data: [{ id: "north", name: "North" }, { id: "south", name: "South" }] });
  await db.crmTeamMembership.createMany({ data: [
    { teamId: "north", userId: manager.id, role: "MANAGER" },
    { teamId: "south", userId: manager.id, role: "VIEWER" },
    { teamId: "north", userId: sales.id, role: "MEMBER" },
    { teamId: "south", userId: other.id, role: "MEMBER" },
    { teamId: "north", userId: viewer.id, role: "VIEWER" },
  ].map((row) => ({ ...row, role: row.role as "MANAGER" | "VIEWER" | "MEMBER", startsAt: new Date("2000-01-01") })) });
});
afterAll(() => db.$disconnect());

describe("manual inquiries and CRM scope", () => {
  it("creates explicit customer/company links, initial history and audit with unique numbers", async () => {
    const first = await service.createManual(admin, { ...input, contact: { fullName: "Buyer", email: input.email }, company: { name: "Acme" } });
    const lead = await db.lead.findUniqueOrThrow({ where: { id: first.inquiry.id }, include: { contact: true, crmCompany: true, stageHistory: true } });
    expect(lead).toMatchObject({ recordOrigin: "MANUAL", sourceChannel: "PHONE", status: "NEW", stageId: "crm_stage_new_inquiry", contactId: expect.any(String), companyId: expect.any(String) });
    expect(lead.contact?.companyId).toBe(lead.companyId);
    expect(lead.stageHistory).toEqual([expect.objectContaining({ previousStageId: null, newStageId: lead.stageId, actorId: admin.id })]);
    expect(await db.auditLog.count({ where: { entityId: lead.id, action: "inquiry.create" } })).toBe(1);
    const second = await service.createManual(admin, { ...input, contactId: lead.contactId });
    expect(second.inquiry).toMatchObject({ contactId: lead.contactId, companyId: lead.companyId });
    expect(second.inquiry.inquiryNumber).not.toBe(lead.inquiryNumber);
    expect(await db.contact.count()).toBe(1);
    expect(await db.company.count()).toBe(1);
    expect(await db.lead.count({ where: { contactId: lead.contactId } })).toBe(2);
  });
  it("never creates or links a customer implicitly, and returns visible duplicate candidates", async () => {
    const existing = await customers.create(admin, { fullName: "Buyer", email: input.email });
    const result = await service.createManual(admin, input);
    expect(result.inquiry).toMatchObject({ contactId: null, companyId: null });
    expect(result.duplicateCandidates.contacts.map(({ id }) => id)).toEqual([existing.customer.id]);
    expect(await db.contact.count()).toBe(1);
  });
  it("requires duplicate confirmation before any writes, then creates distinct records", async () => {
    const existing = await customers.create(admin, { fullName: "Buyer", email: input.email, company: { name: "Acme" } });
    const payload = { ...input, contact: { fullName: "Buyer", email: input.email }, company: { name: "Acme" } };
    const before = { leads: await db.lead.count(), contacts: await db.contact.count(), companies: await db.company.count(), audits: await db.auditLog.count() };
    await expect(service.createManual(admin, payload)).rejects.toMatchObject({ name: "CustomerDuplicateConfirmationError", duplicateCandidates: { contacts: [expect.objectContaining({ id: existing.customer.id })], companies: [expect.objectContaining({ id: existing.customer.companyId })] } });
    expect({ leads: await db.lead.count(), contacts: await db.contact.count(), companies: await db.company.count(), audits: await db.auditLog.count() }).toEqual(before);
    const confirmed = await service.createManual(admin, { ...payload, confirmDuplicateCreation: true });
    expect(confirmed.inquiry.contactId).not.toBe(existing.customer.id);
    expect(confirmed.inquiry.companyId).not.toBe(existing.customer.companyId);
  });
  it.each(["phone", "whatsapp"] as const)("does not borrow inquiry email for an explicit %s-only Contact", async (method) => {
    const existing = await customers.create(admin, { fullName: "Existing customer", email: input.email });
    const created = await service.createManual(admin, { ...input, contact: { fullName: "Distinct phone customer", [method]: "+14155550123" } });
    expect(created.duplicateCandidates.contacts).toEqual([]);
    expect(created.inquiry.contactId).not.toBe(existing.customer.id);
    expect(await db.contact.findUniqueOrThrow({ where: { id: created.inquiry.contactId! } })).toMatchObject({ email: null, normalizedEmail: null, [method]: "+14155550123" });
    expect(await db.contact.count()).toBe(2);
    expect(await db.lead.count()).toBe(1);
  });
  it("enforces create roles, strict required email and atomic rollback", async () => {
    await expect(service.createManual(sales, input)).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.createManual(admin, { name: "Buyer", message: "Requirement" })).rejects.toThrow();
    await expect(service.createManual(admin, { ...input, surprise: true })).rejects.toThrow();
    await db.crmStage.deleteMany();
    await expect(service.createManual(admin, { ...input, contact: { fullName: "Buyer", email: input.email }, company: { name: "Rollback" } })).rejects.toBeInstanceOf(LeadValidationError);
    expect(await db.contact.count()).toBe(0);
    expect(await db.company.count()).toBe(0);
    expect(await db.auditLog.count()).toBe(0);
  });
  it("creates for managers while rejecting invisible existing links", async () => {
    const hidden = await customers.create(admin, { fullName: "Hidden", email: "hidden@example.com", company: { name: "Hidden" } });
    await expect(service.createManual(manager, { ...input, assigneeId: sales.id, contactId: hidden.customer.id })).rejects.toThrow();
    await expect(service.createManual(manager, { ...input, assigneeId: sales.id, companyId: hidden.customer.companyId })).rejects.toThrow();
    const created = await service.createManual(manager, { ...input, assigneeId: sales.id, contact: { fullName: "Buyer", email: input.email } });
    expect(created.inquiry.recordOrigin).toBe("MANUAL");
  });
  it("projects the linked product name only for inquiries in scope", async () => {
    const category = await db.productCategory.create({ data: { name: "Shears", slug: "shears" } });
    const product = await db.product.create({ data: { categoryId: category.id, name: "CNC Shear", slug: "cnc-shear", summary: "Sheet metal shear" } });
    await db.lead.create({ data: {
      ...input, sourceChannel: "PHONE", interestedProductId: product.id,
      assignments: { create: { assigneeId: sales.id, assignedById: admin.id } },
    } });

    expect((await service.list(sales, {})).items).toEqual([
      expect.objectContaining({ interestedProduct: { name: "CNC Shear" } }),
    ]);
    expect((await service.list(other, {})).items).toEqual([]);
  });
  it("lists all readable sales, and assignment options only for managed teams", async () => {
    expect(await service.listAssignees(manager, "read")).toEqual([{ id: other.id, name: other.name }, { id: sales.id, name: sales.name }]);
    expect(await service.listAssignees(manager, "assign")).toEqual([{ id: sales.id, name: sales.name }]);
    await expect(service.listAssignees(viewer, "assign")).rejects.toBeInstanceOf(LeadPermissionError);
  });
  it("filters scoped lists/details/exports and customer summaries after reassignment and expiry", async () => {
    const created = await service.createManual(admin, { ...input, country: "US", customerLevel: "A", contact: { fullName: "Buyer", email: input.email } });
    const id = created.inquiry.id;
    await service.assign(admin, id, { version: 1, assigneeId: sales.id });
    expect((await service.list(manager, { stageCode: "NEW_INQUIRY", customerLevel: "A", country: "US", sourceChannel: "PHONE", ownerId: sales.id })).total).toBe(1);
    expect((await service.get(viewer, id)).id).toBe(id);
    expect(await service.exportCsv(manager, {})).toContain(input.email);
    expect((await customers.get(viewer, created.inquiry.contactId!)).inquiries).toHaveLength(1);
    await service.assign(admin, id, { version: 2, assigneeId: other.id });
    expect((await service.list(sales, {})).total).toBe(0);
    await expect(service.get(sales, id)).rejects.toBeInstanceOf(LeadPermissionError);
    expect(await service.exportCsv(sales, {})).not.toContain(input.email);
    await db.crmTeamMembership.updateMany({ where: { userId: manager.id }, data: { endsAt: new Date("2020-01-01") } });
    expect((await service.list(manager, {})).total).toBe(0);
    await expect(service.get(manager, id)).rejects.toBeInstanceOf(LeadPermissionError);
    expect(await service.exportCsv(manager, {})).not.toContain(input.email);
    await expect(customers.get(viewer, created.inquiry.contactId!)).rejects.toThrow();
  });
  it("allows manager assignment only within managed active teams, not viewer teams", async () => {
    const { inquiry } = await service.createManual(admin, input);
    await service.assign(admin, inquiry.id, { version: 1, assigneeId: sales.id });
    await expect(service.assign(manager, inquiry.id, { version: 2, assigneeId: other.id })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.assign(manager, inquiry.id, { version: 2, assigneeId: sales.id })).resolves.toMatchObject({ id: inquiry.id });
    await db.crmTeamMembership.updateMany({ where: { userId: sales.id }, data: { endsAt: new Date("2020-01-01") } });
    await expect(service.assign(manager, inquiry.id, { version: 2, assigneeId: sales.id })).rejects.toBeInstanceOf(LeadPermissionError);
  });
  it("keeps manager capabilities and mutations for inactive managed owners without widening viewer-only access", async () => {
    const replacement = await db.user.create({ data: { id: "replacement", name: "Replacement", email: "replacement@example.com", passwordHash: "test" } });
    await db.userRole.create({ data: { userId: replacement.id, roleId: (await db.role.findUniqueOrThrow({ where: { key: "SALES" } })).id } });
    await db.crmTeamMembership.create({ data: { teamId: "north", userId: replacement.id, role: "MEMBER", startsAt: new Date("2000-01-01") } });
    const managed = (await service.createManual(admin, { ...input, assigneeId: sales.id })).inquiry;
    const viewed = (await service.createManual(admin, { ...input, assigneeId: other.id })).inquiry;
    await db.user.updateMany({ where: { id: { in: [sales.id, other.id] } }, data: { isActive: false } });

    expect(await service.listAssignees(manager, "assign")).toEqual([{ id: replacement.id, name: replacement.name }]);
    expect((await service.get(manager, managed.id)).capabilities).toEqual({ canEditStage: true, canUpdateFollowUp: true, canMarkSpam: true, canRestoreSpam: false, canAssign: true, canAddNote: true });
    expect((await service.get(manager, viewed.id)).capabilities).toEqual({ canEditStage: false, canUpdateFollowUp: false, canMarkSpam: false, canRestoreSpam: false, canAssign: false, canAddNote: false });
    await expect(service.updateStage(manager, managed.id, { version: 1, stageCode: "CONTACTED" })).resolves.toMatchObject({ version: 2 });
    await expect(service.assign(manager, managed.id, { version: 2, assigneeId: replacement.id })).resolves.toMatchObject({ version: 3 });
    expect(await db.leadAssignment.findMany({ where: { leadId: managed.id, endedAt: null } })).toEqual([expect.objectContaining({ assigneeId: replacement.id })]);
    await expect(service.updateStage(manager, viewed.id, { version: 1, stageCode: "CONTACTED" })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.assign(manager, viewed.id, { version: 1, assigneeId: replacement.id })).rejects.toBeInstanceOf(LeadPermissionError);
    expect((await db.lead.findUniqueOrThrow({ where: { id: viewed.id } })).version).toBe(1);
  });
  it("requires scoped manager initial assignment and makes the created inquiry readable", async () => {
    await expect(service.createManual(manager, input)).rejects.toBeInstanceOf(LeadValidationError);
    await expect(service.createManual(manager, { ...input, assigneeId: other.id })).rejects.toBeInstanceOf(LeadPermissionError);
    const { inquiry } = await service.createManual(manager, { ...input, assigneeId: sales.id });
    expect((await service.get(manager, inquiry.id)).id).toBe(inquiry.id);
    expect(await db.leadAssignment.findMany({ where: { leadId: inquiry.id } })).toEqual([expect.objectContaining({ assigneeId: sales.id, assignedById: manager.id, endedAt: null })]);
    expect(await db.lead.count()).toBe(1);
  });
  it("does not let Sales export viewer-only team records", async () => {
    const { inquiry } = await service.createManual(admin, input);
    await service.assign(admin, inquiry.id, { version: 1, assigneeId: other.id });
    await db.crmTeamMembership.create({ data: { teamId: "south", userId: sales.id, role: "VIEWER", startsAt: new Date("2000-01-01") } });
    const mixed = { ...sales, roles: ["SALES", "CRM_VIEWER"] as Principal["roles"] };
    expect((await service.get(mixed, inquiry.id)).id).toBe(inquiry.id);
    expect(await service.exportCsv(mixed, {})).not.toContain(input.email);
  });
  it("does not expose or link a contact's independently hidden company", async () => {
    const existing = await customers.create(admin, { fullName: "Buyer", email: input.email, company: { name: "Hidden Company" } });
    await db.contact.update({ where: { id: existing.customer.id }, data: { ownerId: manager.id } });
    const result = await service.createManual(manager, { ...input, assigneeId: sales.id, contactId: existing.customer.id });
    expect(result.inquiry).toMatchObject({ contactId: existing.customer.id, companyId: null });
  });
  it("keeps export/update/assignment action scope narrower than viewer read scope", async () => {
    const { inquiry } = await service.createManual(admin, input);
    await service.assign(admin, inquiry.id, { version: 1, assigneeId: other.id });
    expect((await service.get(manager, inquiry.id)).id).toBe(inquiry.id);
    expect(await service.exportCsv(manager, {})).not.toContain(input.email);
    await expect(service.update(manager, inquiry.id, { version: 2, nextFollowUpAt: "2030-01-01" })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.addActivity(manager, inquiry.id, { type: "NOTE", content: "No mutation" })).rejects.toBeInstanceOf(LeadPermissionError);
    await expect(service.assign(manager, inquiry.id, { version: 2, assigneeId: sales.id })).rejects.toBeInstanceOf(LeadPermissionError);
    expect((await db.lead.findUniqueOrThrow({ where: { id: inquiry.id } })).version).toBe(2);
  });
  it("applies overdue/date filters without widening access and rejects invalid ranges", async () => {
    const { inquiry } = await service.createManual(admin, { ...input, nextFollowUpAt: "2020-01-01T00:00:00.000Z" });
    await service.assign(admin, inquiry.id, { version: 1, assigneeId: sales.id });
    expect((await service.list(sales, { overdue: "true", createdFrom: "2000-01-01", createdTo: "2099-01-01", nextFollowUpTo: "2021-01-01" })).total).toBe(1);
    expect((await service.list(sales, { overdue: "false" })).total).toBe(0);
    expect((await service.list(other, { overdue: "true" })).total).toBe(0);
    await expect(service.list(admin, { createdFrom: "2030-01-01", createdTo: "2020-01-01" })).rejects.toThrow();
    await expect(service.list(admin, { nextFollowUpFrom: "2030-01-01", nextFollowUpTo: "2020-01-01" })).rejects.toThrow();
    await expect(service.list(admin, { overdue: "anything" })).rejects.toThrow();
  });
  it("sets public CRM defaults and preserves the pre-spam stage without creating customers", async () => {
    const publicService = new InquiryService(db, { send: async () => {} }, { consume: async () => ({ limited: false }) });
    for (const requirement of ["Normal requirement", "https://a.test https://b.test https://c.test https://d.test"]) {
      const receipt = await publicService.acceptInquiry({ name: "Buyer", email: input.email, requirement }, { networkKey: "test" });
      const row = await db.lead.findUniqueOrThrow({ where: { id: receipt.leadId! }, include: { stageHistory: true } });
      const spam = requirement.startsWith("https");
      expect(row).toMatchObject({ inquiryNumber: expect.any(String), recordOrigin: "WEBSITE_FORM", sourceChannel: "WEBSITE", status: spam ? "SPAM" : "NEW", stageId: "crm_stage_new_inquiry", preSpamStageId: spam ? "crm_stage_new_inquiry" : null, contactId: null, companyId: null });
      expect(row.stageHistory).toHaveLength(1);
    }
    expect(await db.contact.count()).toBe(0);
  });
});

describe("progressive stage filters", () => {
  beforeEach(async () => {
    await db.lead.createMany({ data: [
      { id: "legacy-new", status: "NEW", stageId: null },
      { id: "legacy-contacted", status: "CONTACTED", stageId: null },
      { id: "normalized-new", status: "NEW", stageId: "crm_stage_new_inquiry" },
      { id: "normalized-to-contact", status: "NEW", stageId: "crm_stage_to_contact" },
      { id: "normalized-contacted", status: "CONTACTED", stageId: "crm_stage_contacted" },
      { id: "normalized-requirement", status: "CONTACTED", stageId: "crm_stage_requirement_confirmed" },
      { id: "spam-new", status: "SPAM", stageId: "crm_stage_new_inquiry" },
      { id: "spam-requirement", status: "SPAM", stageId: "crm_stage_requirement_confirmed" },
    ].map((row) => ({ ...row, status: row.status as "NEW" | "CONTACTED" | "SPAM", email: `${row.id}@example.com`, message: row.id })) });
  });
  it.each([
    { stageCode: "NEW_INQUIRY", expected: ["legacy-new", "normalized-new"] },
    { stageCode: "TO_CONTACT", expected: ["legacy-new", "normalized-to-contact"] },
    { stageCode: "REQUIREMENT_CONFIRMED", expected: ["legacy-contacted", "normalized-requirement"] },
    { stageCode: "SOLUTION_PREPARATION", expected: ["legacy-contacted"] },
  ])("includes compatible legacy rows and excludes spam for $stageCode", async ({ stageCode, expected }) => {
    const result = await service.list(admin, { stageCode });
    expect(result.items.map(({ id }) => id).sort()).toEqual(expected);
    expect(result.total).toBe(expected.length);
    const csv = await service.exportCsv(admin, { stageCode });
    expect(csv).not.toContain("spam-");
    for (const id of expected) expect(csv).toContain(`${id}@example.com`);
    expect((await service.list(admin, { stageCode, status: "SPAM" })).total).toBe(0);
  });
});


describe("SPAM action capabilities preserve service authorization", () => {
  it("offers mark/recovery only where the shared legacy-status service authorizes them", async () => {
    const { inquiry } = await service.createManual(admin, { ...input, assigneeId: sales.id });
    await service.updateStage(admin, inquiry.id, { version: 1, stageCode: "REQUIREMENT_CONFIRMED" });
    for (const actor of [admin, manager, sales]) expect((await service.get(actor, inquiry.id)).capabilities).toMatchObject({ canMarkSpam: true, canRestoreSpam: false });
    expect((await service.get(viewer, inquiry.id)).capabilities).toMatchObject({ canMarkSpam: false, canRestoreSpam: false });
    await expect(service.update(viewer, inquiry.id, { version: 2, status: "SPAM" })).rejects.toBeInstanceOf(LeadPermissionError);
    await service.update(manager, inquiry.id, { version: 2, status: "SPAM" });
    for (const actor of [admin, manager]) expect((await service.get(actor, inquiry.id)).capabilities).toMatchObject({ canMarkSpam: false, canRestoreSpam: true });
    for (const actor of [sales, viewer]) {
      expect((await service.get(actor, inquiry.id)).capabilities).toMatchObject({ canMarkSpam: false, canRestoreSpam: false });
      await expect(service.update(actor, inquiry.id, { version: 3, status: "CONTACTED" })).rejects.toBeInstanceOf(LeadPermissionError);
    }
    const before = { audits: await db.auditLog.count(), history: await db.leadStageHistory.count() };
    await expect(service.update(manager, inquiry.id, { version: 2, status: "CONTACTED" })).rejects.toMatchObject({ name: "LeadConflictError" });
    expect({ audits: await db.auditLog.count(), history: await db.leadStageHistory.count() }).toEqual(before);
    await service.update(manager, inquiry.id, { version: 3, status: "CONTACTED" });
    expect(await db.lead.findUniqueOrThrow({ where: { id: inquiry.id } })).toMatchObject({ status: "CONTACTED", stageId: "crm_stage_requirement_confirmed", preSpamStageId: null, version: 4 });
    expect((await db.leadStageHistory.findMany({ where: { leadId: inquiry.id }, orderBy: { createdAt: "asc" } })).slice(-2)).toMatchObject([
      { previousStatus: "CONTACTED", newStatus: "SPAM", source: "LEGACY_API" },
      { previousStatus: "SPAM", newStatus: "CONTACTED", source: "LEGACY_API" },
    ]);
    await service.update(manager, inquiry.id, { version: 4, status: "WON" });
    expect((await service.get(sales, inquiry.id)).capabilities).toMatchObject({ canMarkSpam: false, canRestoreSpam: false });
  });
});
