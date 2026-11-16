import type { CrmTeamMembershipRole } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { LeadService } from "@/lib/services/lead-service";
import {
  CustomerConflictError,
  CustomerDuplicateConfirmationError,
  CustomerNotFoundError,
  CustomerPermissionError,
  CustomerService,
} from "@/lib/services/customer-service";

const service = new CustomerService(db);
const northInquiry = new Date("2026-01-02T08:00:00.000Z");
const southInquiry = new Date("2026-01-09T08:00:00.000Z");
const expired = new Date("2020-01-02T08:00:00.000Z");
const startsAt = new Date("2000-01-01T00:00:00.000Z");

function principal(id: string, ...roles: Principal["roles"]): Principal {
  return { id, email: `${id}@example.com`, name: id, roles };
}

const admin = principal("admin", "ADMIN");
const manager = principal("manager", "SALES_MANAGER", "CRM_VIEWER");
const salesNorth = principal("sales-north", "SALES");
const salesSouth = principal("sales-south", "SALES");
const viewer = principal("viewer", "CRM_VIEWER");

beforeEach(async () => {
  await resetTestDatabase();
  await db.user.createMany({
    data: ["admin", "manager", "sales-north", "sales-south", "viewer", "expired-viewer", "outsider"]
      .map((id) => ({ id, email: `${id}@example.com`, name: id, passwordHash: "test" })),
  });
  await db.crmTeam.createMany({
    data: [{ id: "north", name: "North" }, { id: "south", name: "South" }],
  });
  await db.crmTeamMembership.createMany({
    data: [
      { teamId: "north", userId: "manager", role: "MANAGER" },
      { teamId: "south", userId: "manager", role: "VIEWER" },
      { teamId: "north", userId: "sales-north", role: "MEMBER" },
      { teamId: "south", userId: "sales-south", role: "MEMBER" },
      { teamId: "north", userId: "sales-south", role: "MEMBER", endsAt: expired },
      { teamId: "north", userId: "viewer", role: "VIEWER" },
      { teamId: "north", userId: "expired-viewer", role: "VIEWER", endsAt: expired },
    ].map(({ role, ...membership }) => ({ ...membership, role: role as CrmTeamMembershipRole, startsAt })),
  });
});

afterAll(() => db.$disconnect());

async function seedSharedCustomer() {
  await db.company.create({
    data: {
      id: "shared-company", companyCode: "CO-SHARED", name: "Acme Tools", normalizedName: "acme tools",
      ownerId: salesNorth.id, createdById: admin.id,
    },
  });
  await db.contact.create({
    data: {
      id: "shared-contact", customerCode: "CU-SHARED", fullName: "Jane Doe", email: "jane@example.com",
      normalizedEmail: "jane@example.com", companyId: "shared-company", ownerId: salesNorth.id,
      internalNotes: "Private contact history", createdById: admin.id,
      firstInquiryAt: new Date("2005-01-01T00:00:00Z"), lastInquiryAt: new Date("2099-01-01T00:00:00Z"),
    },
  });
  await db.lead.createMany({
    data: [
      { id: "north-lead", createdAt: northInquiry },
      { id: "south-lead", createdAt: southInquiry },
      { id: "unassigned-lead", createdAt: southInquiry },
    ].map((lead) => ({
      ...lead,
      contactId: "shared-contact",
      companyId: "shared-company",
      email: `${lead.id}@example.com`,
      message: `Private lead payload for ${lead.id}`,
      attributionSnapshot: { internal: lead.id },
    })),
  });
  await db.leadAssignment.createMany({
    data: [
      { leadId: "north-lead", assigneeId: salesNorth.id },
      { leadId: "south-lead", assigneeId: salesNorth.id, endedAt: expired },
      { leadId: "south-lead", assigneeId: salesSouth.id },
      { leadId: "unassigned-lead", assigneeId: "expired-viewer", endedAt: expired },
      { leadId: "unassigned-lead", assigneeId: "outsider", endedAt: expired },
    ].map((assignment) => ({ ...assignment, assignedById: admin.id, assignedAt: startsAt })),
  });
  await db.leadActivity.createMany({
    data: [
      { leadId: "north-lead", type: "NOTE", content: "North activity", metadata: { private: "north" } },
      { leadId: "south-lead", type: "NOTE", content: "South activity", metadata: { private: "south" } },
      { leadId: "unassigned-lead", type: "NOTE", content: "Unassigned activity" },
    ],
  });
}

describe("CustomerService mutations on PostgreSQL", () => {
  it("creates and edits a contact and company with separate versioned audit records", async () => {
    const { customer, duplicateCandidates } = await service.create(admin, {
      fullName: " Jane Doe ",
      email: " JANE@EXAMPLE.COM ",
      phone: "+44 (20) 7123-4567",
      internalNotes: "Initial private notes",
      company: { name: "  Acme   Tools ", countryCode: "gb" },
    });

    expect(duplicateCandidates).toEqual({ contacts: [], companies: [] });
    expect(customer).toMatchObject({
      fullName: "Jane Doe", email: "jane@example.com", ownerId: admin.id, version: 1, canEdit: true,
      company: { name: "Acme   Tools", countryCode: "GB", canEdit: true, version: 1 },
      internalNotes: "Initial private notes", inquiryCount: 0, inquiries: [], timeline: [],
    });
    expect(await db.contact.findUniqueOrThrow({ where: { id: customer.id } })).toMatchObject({
      normalizedEmail: "jane@example.com", phoneE164: "+442071234567",
      createdById: admin.id, updatedById: admin.id,
    });
    const updated = await service.update(admin, customer.id, {
      version: 1,
      email: " NEW@EXAMPLE.COM ",
      internalNotes: "Updated private notes",
      company: { version: 1, name: "ACME Supply" },
    });
    expect(updated).toMatchObject({
      version: 2, email: "new@example.com", internalNotes: "Updated private notes",
      company: { version: 2, name: "ACME Supply" },
    });
    expect(await db.company.findUniqueOrThrow({ where: { id: customer.company!.id } }))
      .toMatchObject({ normalizedName: "acme supply", version: 2 });
    const audit = await db.auditLog.findMany({ orderBy: [{ entityType: "asc" }, { action: "asc" }] });
    expect(audit.map(({ actorId, action, entityType, entityId, after }) => ({
      actorId, action, entityType, entityId, after,
    }))).toEqual([
      {
        actorId: admin.id, action: "company.create", entityType: "Company", entityId: customer.company!.id,
        after: expect.objectContaining({ version: 1 }),
      },
      {
        actorId: admin.id, action: "company.update", entityType: "Company", entityId: customer.company!.id,
        after: expect.objectContaining({ version: 2, changedFields: ["name"] }),
      },
      {
        actorId: admin.id, action: "customer.create", entityType: "Contact", entityId: customer.id,
        after: expect.objectContaining({ version: 1 }),
      },
      {
        actorId: admin.id, action: "customer.update", entityType: "Contact", entityId: customer.id,
        after: expect.objectContaining({ version: 2, changedFields: expect.arrayContaining(["email", "internalNotes"]) }),
      },
    ]);
    expect(audit.filter(({ action }) => action.endsWith(".update")).map(({ before }) => before))
      .toEqual([expect.objectContaining({ version: 1 }), expect.objectContaining({ version: 1 })]);
    expect(JSON.stringify(audit)).not.toMatch(/@example\.com|private notes|7123-4567/);
  });

  it("rejects stale versions and rolls back nested writes", async () => {
    const { customer } = await service.create(admin, {
      fullName: "Initial", email: "jane@example.com", company: { name: "Initial company" },
    });
    await service.update(admin, customer.id, { version: 1, fullName: "Committed" });

    await expect(service.update(admin, customer.id, {
      version: 1, company: { version: 1, name: "Stale contact company update" },
    })).rejects.toBeInstanceOf(CustomerConflictError);
    await expect(service.update(admin, customer.id, {
      version: 2, fullName: "Stale company contact update", company: { version: 2, name: "Stale company" },
    })).rejects.toBeInstanceOf(CustomerConflictError);
    expect(await service.get(admin, customer.id)).toMatchObject({
      version: 2, fullName: "Committed", company: { version: 1, name: "Initial company" },
    });
    expect(await db.auditLog.count()).toBe(3);
  });

  it("commits one update when two callers use the same version", async () => {
    const { customer } = await service.create(admin, { fullName: "Jane", email: "jane@example.com" });

    const results = await Promise.allSettled([
      service.update(admin, customer.id, { version: 1, fullName: "Jane A" }),
      service.update(admin, customer.id, { version: 1, fullName: "Jane B" }),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(results.find(({ status }) => status === "rejected")).toMatchObject({
      reason: expect.any(CustomerConflictError),
    });
    expect(await service.get(admin, customer.id)).toMatchObject({ version: 2 });
    expect(await db.auditLog.count({ where: { action: "customer.update" } })).toBe(1);
  });

  it("prevents clearing the last contact method while allowing unrelated legacy updates", async () => {
    const { customer } = await service.create(admin, { fullName: "Jane", email: "jane@example.com" });

    await expect(service.update(admin, customer.id, { version: 1, email: " " }))
      .rejects.toMatchObject({ name: "CustomerValidationError" });
    expect(await service.update(admin, customer.id, { version: 1, email: null, whatsapp: "020 7123 4567" }))
      .toMatchObject({ email: null, whatsapp: "020 7123 4567", version: 2 });
    expect(await db.contact.findUniqueOrThrow({ where: { id: customer.id } }))
      .toMatchObject({ normalizedEmail: null, whatsappE164: null });

    await db.contact.create({ data: { id: "legacy", customerCode: "CU-LEGACY", fullName: "Legacy" } });
    expect(await service.update(admin, "legacy", { version: 1, fullName: "Updated legacy" }))
      .toMatchObject({ fullName: "Updated legacy", version: 2 });
  });
});

describe("CustomerService access scope", () => {
  beforeEach(seedSharedCustomer);

  it("returns shared basics and aggregates only the viewer's current Lead assignments", async () => {
    const south = await service.get(salesSouth, "shared-contact");
    expect(south).toMatchObject({
      fullName: "Jane Doe", email: "jane@example.com", company: { name: "Acme Tools", canEdit: false },
      canEdit: false, inquiryCount: 1, firstInquiryAt: southInquiry, lastInquiryAt: southInquiry,
    });
    expect(south.inquiries.map(({ id }) => id)).toEqual(["south-lead"]);
    expect(south.timeline).toMatchObject([{ leadId: "south-lead", content: "South activity" }]);
    expect(south.inquiries[0]).not.toHaveProperty("email");
    expect(south.inquiries[0]).not.toHaveProperty("attributionSnapshot");
    expect(south.timeline[0]).not.toHaveProperty("metadata");
    expect(south).not.toHaveProperty("internalNotes");
    expect(south).not.toHaveProperty("version");
    expect(south).not.toHaveProperty("ownerId");
    expect(south.company).not.toHaveProperty("version");
    expect(south.company).not.toHaveProperty("createdById");
    expect(south).not.toHaveProperty("normalizedEmail");
    expect(JSON.stringify(south)).not.toMatch(/north-lead|unassigned-lead|Private lead payload/);

    const north = await service.get(salesNorth, "shared-contact");
    expect(north.inquiries.map(({ id }) => id)).toEqual(["north-lead"]);
    expect(north.timeline).toMatchObject([{ leadId: "north-lead", content: "North activity" }]);
    expect(north).toMatchObject({
      canEdit: true, internalNotes: "Private contact history", inquiryCount: 1,
      firstInquiryAt: northInquiry, lastInquiryAt: northInquiry,
    });

    const list = await service.list(salesSouth, { pageSize: "1" });
    expect(list).toMatchObject({
      total: 1, page: 1, pageSize: 1,
      items: [{ id: south.id, canEdit: false, inquiryCount: 1, firstInquiryAt: southInquiry, lastInquiryAt: southInquiry }],
    });
    expect(list.items[0]).not.toHaveProperty("internalNotes");
    expect(list.items[0]).not.toHaveProperty("inquiries");
    expect(await service.list(salesNorth, {})).toMatchObject({
      items: [{ id: north.id, canEdit: true, internalNotes: "Private contact history" }],
    });
    await expect(service.update(salesSouth, south.id, { version: 1, fullName: "Forbidden" }))
      .rejects.toBeInstanceOf(CustomerPermissionError);
  });

  it("does not expose contacts to expired memberships or previous Lead assignees", async () => {
    for (const actor of [principal("expired-viewer", "CRM_VIEWER"), principal("outsider", "SALES")]) {
      expect(await service.list(actor, {})).toMatchObject({ items: [], total: 0 });
      await expect(service.get(actor, "shared-contact")).rejects.toBeInstanceOf(CustomerNotFoundError);
    }
    await expect(service.list(principal("outsider", "PRODUCT_EDITOR"), {}))
      .rejects.toBeInstanceOf(CustomerPermissionError);
  });

  it("uses active manager membership to edit another owner's data", async () => {
    expect(await service.get(manager, "shared-contact")).toMatchObject({
      canEdit: true, company: { canEdit: true }, internalNotes: "Private contact history",
    });
    expect((await service.get(manager, "shared-contact")).inquiries.map(({ id }) => id).sort())
      .toEqual(["north-lead", "south-lead"]);
    expect(await service.update(manager, "shared-contact", { version: 1, internalNotes: "Manager edit" }))
      .toMatchObject({ canEdit: true, internalNotes: "Manager edit" });

    await db.contact.update({ where: { id: "shared-contact" }, data: { ownerId: salesSouth.id } });
    await db.company.update({ where: { id: "shared-company" }, data: { ownerId: salesSouth.id } });
    const after = await service.get(manager, "shared-contact");
    expect(after).toMatchObject({ canEdit: false, company: { canEdit: false } });
    expect(after).not.toHaveProperty("internalNotes");
    await expect(service.update(manager, "shared-contact", { version: 2, fullName: "Outside managed team" }))
      .rejects.toBeInstanceOf(CustomerPermissionError);
  });

  it("provides owner and active manager access to contacts with no inquiries", async () => {
    await db.contact.createMany({
      data: [
        {
          id: "owner-only", customerCode: "CU-NORTH", fullName: "North owned", ownerId: salesNorth.id,
          internalNotes: "Owner only note",
        },
        { id: "viewer-owned", customerCode: "CU-VIEW", fullName: "Viewer owned", ownerId: viewer.id },
        { id: "unowned", customerCode: "CU-NOOWNER", fullName: "Unowned" },
      ],
    });
    expect(await service.get(salesNorth, "owner-only")).toMatchObject({
      canEdit: true, inquiryCount: 0, firstInquiryAt: null, lastInquiryAt: null,
      inquiries: [], timeline: [], internalNotes: "Owner only note",
    });
    expect(await service.get(manager, "owner-only")).toMatchObject({ canEdit: true });
    expect(await service.get(admin, "unowned")).toMatchObject({ canEdit: true });
    await expect(service.get(salesSouth, "owner-only")).rejects.toBeInstanceOf(CustomerNotFoundError);
    await expect(service.get(viewer, "owner-only")).rejects.toBeInstanceOf(CustomerNotFoundError);
    await expect(service.get(viewer, "viewer-owned")).rejects.toBeInstanceOf(CustomerNotFoundError);
    expect(await service.get({ ...viewer, roles: ["CRM_VIEWER", "SALES"] }, "viewer-owned"))
      .toMatchObject({ canEdit: true });

    const shared = await service.get(viewer, "shared-contact");
    expect(shared).toMatchObject({ canEdit: false, inquiryCount: 1 });
    expect(shared).not.toHaveProperty("internalNotes");
    await expect(service.update(viewer, shared.id, { version: 1, fullName: "Viewer edit" }))
      .rejects.toBeInstanceOf(CustomerPermissionError);
    await expect(service.create(salesNorth, { fullName: "New contact", email: "new@example.com" }))
      .rejects.toBeInstanceOf(CustomerPermissionError);
  });

  it("requires independent company write scope and hides unrelated companies even in search", async () => {
    await db.company.create({
      data: {
        id: "restricted-company", companyCode: "CO-PRIVATE", name: "Secret Company", normalizedName: "secret company",
        ownerId: salesSouth.id,
      },
    });
    await expect(service.update(salesNorth, "shared-contact", { version: 1, companyId: "restricted-company" }))
      .rejects.toBeInstanceOf(CustomerNotFoundError);
    await db.contact.update({ where: { id: "shared-contact" }, data: { companyId: "restricted-company" } });

    expect(await service.get(salesNorth, "shared-contact")).toMatchObject({ company: null, companyId: null });
    expect(await service.list(salesNorth, { query: "Secret Company" })).toMatchObject({ total: 0, items: [] });
    const rename = { version: 1, company: { version: 1, name: "Unauthorised rename" } };
    await expect(service.update(salesNorth, "shared-contact", rename))
      .rejects.toBeInstanceOf(CustomerNotFoundError);
    await db.contact.update({ where: { id: "shared-contact" }, data: { companyId: null } });
    await expect(service.update(salesNorth, "shared-contact", rename))
      .rejects.toBeInstanceOf(CustomerNotFoundError);
    await db.contact.update({ where: { id: "shared-contact" }, data: { companyId: "restricted-company" } });
    await db.lead.update({ where: { id: "north-lead" }, data: { companyId: "restricted-company" } });
    expect(await service.get(salesNorth, "shared-contact")).toMatchObject({
      canEdit: true, company: { id: "restricted-company", canEdit: false },
    });
    await expect(service.update(salesNorth, "shared-contact", rename))
      .rejects.toBeInstanceOf(CustomerPermissionError);
    expect(await db.company.findUniqueOrThrow({ where: { id: "restricted-company" } }))
      .toMatchObject({ name: "Secret Company", version: 1 });

    expect(await service.update(admin, "shared-contact", { version: 1, companyId: "shared-company" }))
      .toMatchObject({ companyId: "shared-company", company: { id: "shared-company", version: 1 } });
  });
});

describe("CustomerService duplicate candidates", () => {
  beforeEach(seedSharedCustomer);

  it("only previews visible candidate IDs and display fields without writing or linking", async () => {
    await db.company.create({
      data: {
        id: "restricted-company", companyCode: "CO-PRIVATE", name: "Acme Tools", normalizedName: "acme tools",
        ownerId: salesSouth.id,
      },
    });
    await db.contact.create({
      data: {
        id: "restricted-contact", customerCode: "CU-PRIVATE", fullName: "Hidden Jane",
        email: "jane@example.com", normalizedEmail: "jane@example.com",
        companyId: "restricted-company", ownerId: salesSouth.id, internalNotes: "Private",
      },
    });
    const input = { fullName: "New Jane", email: " JANE@EXAMPLE.COM ", company: { name: " ACME   TOOLS " } };
    const expected = {
      contacts: [{ id: "shared-contact", customerCode: "CU-SHARED", fullName: "Jane Doe" }],
      companies: [{ id: "shared-company", companyCode: "CO-SHARED", name: "Acme Tools" }],
    };

    expect(await service.findDuplicateCandidates(manager, input)).toEqual(expected);
    expect(await db.contact.count()).toBe(2);
    expect(await db.company.count()).toBe(2);
    expect(await db.auditLog.count()).toBe(0);

    await expect(service.create(manager, input)).rejects.toBeInstanceOf(CustomerDuplicateConfirmationError);
    expect(await db.contact.count()).toBe(2);
    expect(await db.company.count()).toBe(2);
    expect(await db.auditLog.count()).toBe(0);
    const result = await service.create(manager, { ...input, confirmDuplicateCreation: true });
    expect(result.duplicateCandidates).toEqual(expected);
    expect(result.customer.id).not.toBe("shared-contact");
    expect(result.customer.companyId).not.toBe("shared-company");
    expect(await db.contact.count()).toBe(3);
    expect(await db.company.count()).toBe(3);

    const noCompany = await service.create(manager, { fullName: "New contact", email: "jane@example.com", confirmDuplicateCreation: true });
    expect(noCompany.customer).toMatchObject({ companyId: null, company: null });
    expect(await db.lead.count({ where: { contactId: "shared-contact" } })).toBe(3);
  });

  it.each([
    { kind: "contact", input: { fullName: "Another Jane", email: "jane@example.com" } },
    { kind: "company", input: { fullName: "Different buyer", email: "different@example.com", company: { name: " ACME   TOOLS " } } },
  ])("requires confirmation for a $kind duplicate with zero initial writes", async ({ kind, input }) => {
    const counts = async () => ({ contacts: await db.contact.count(), companies: await db.company.count(), audits: await db.auditLog.count(), inquiries: await db.lead.count() });
    const before = await counts();
    await expect(service.create(manager, input)).rejects.toMatchObject({
      name: "CustomerDuplicateConfirmationError",
      duplicateCandidates: kind === "contact"
        ? { contacts: [expect.objectContaining({ id: "shared-contact" })], companies: [] }
        : { contacts: [], companies: [expect.objectContaining({ id: "shared-company" })] },
    });
    expect(await counts()).toEqual(before);
    const confirmed = await service.create(manager, { ...input, confirmDuplicateCreation: true });
    expect(confirmed.customer.id).not.toBe("shared-contact");
    expect(confirmed.customer.companyId).toEqual(kind === "contact" ? null : expect.any(String));
    if (kind === "company") expect(confirmed.customer.companyId).not.toBe("shared-company");
    expect(await counts()).toEqual({ contacts: before.contacts + 1, companies: before.companies + (kind === "company" ? 1 : 0), audits: before.audits + (kind === "company" ? 2 : 1), inquiries: before.inquiries });
    expect(await db.contact.findUniqueOrThrow({ where: { id: "shared-contact" } })).toMatchObject({ email: "jane@example.com", companyId: "shared-company", version: 1 });
  });

  it("matches a visible international phone across phone and WhatsApp fields", async () => {
    await db.contact.update({
      where: { id: "shared-contact" },
      data: { phone: "+44 (20) 7123-4567", phoneE164: "+442071234567" },
    });

    expect(await service.findDuplicateCandidates(manager, { fullName: "New Jane", whatsapp: "0044 20 7123 4567" }))
      .toMatchObject({ contacts: [{ id: "shared-contact" }] });
  });
});


describe("resource-scoped NOTE privacy on both detail paths", () => {
  beforeEach(async () => {
    await seedSharedCustomer();
    await db.crmTeamMembership.create({ data: { teamId: "south", userId: salesNorth.id, role: "VIEWER", startsAt } });
    await db.leadActivity.createMany({ data: ["north-lead", "south-lead"].map((leadId) => ({
      leadId, type: "STATUS_CHANGE", content: `Public activity for ${leadId}`,
    })) });
  });

  it.each([
    { label: "pure viewer", actor: viewer, visible: ["north-lead"], notes: [] },
    { label: "manager plus viewer", actor: manager, visible: ["north-lead", "south-lead"], notes: ["North activity"] },
    { label: "Sales plus viewer", actor: { ...salesNorth, roles: ["SALES", "CRM_VIEWER"] as Principal["roles"] }, visible: ["north-lead", "south-lead"], notes: ["North activity"] },
    { label: "Admin", actor: admin, visible: ["north-lead", "south-lead", "unassigned-lead"], notes: ["North activity", "South activity", "Unassigned activity"] },
    { label: "Super Admin", actor: { ...admin, roles: ["SUPER_ADMIN"] as Principal["roles"] }, visible: ["north-lead", "south-lead", "unassigned-lead"], notes: ["North activity", "South activity", "Unassigned activity"] },
  ])("returns only authorized notes for $label", async ({ actor, visible, notes }) => {
    const leads = new LeadService(db);
    const leadActivities = (await Promise.all(visible.map((id) => leads.get(actor, id)))).flatMap(({ activities }) => activities);
    const customer = await service.get(actor, "shared-contact");
    for (const activities of [leadActivities, customer.timeline]) {
      expect.soft(activities.filter(({ type }) => type === "NOTE").map(({ content }) => content).sort()).toEqual(notes);
      expect(activities.filter(({ type }) => type === "STATUS_CHANGE").map(({ content }) => content).sort())
        .toEqual(visible.filter((id) => id !== "unassigned-lead").map((id) => `Public activity for ${id}`));
    }
  });
});

describe("scoped existing-customer inquiry options", () => {
  beforeEach(seedSharedCustomer);
  it("lists only visible customers/companies with an explicit minimal projection", async () => {
    await db.company.create({ data: { id: "hidden-co", companyCode: "CO-HIDDEN", name: "Hidden company", normalizedName: "hidden company", ownerId: "outsider" } });
    await db.contact.create({ data: { id: "hidden-contact", customerCode: "CU-HIDDEN", fullName: "Hidden contact", ownerId: "outsider", companyId: "hidden-co" } });
    const options = await service.inquiryOptions(manager, {});
    expect(options.contacts).toEqual([{ id: "shared-contact", customerCode: "CU-SHARED", fullName: "Jane Doe", email: "jane@example.com", phone: null, whatsapp: null, countryCode: null, companyId: "shared-company" }]);
    expect(options.companies).toEqual([{ id: "shared-company", companyCode: "CO-SHARED", name: "Acme Tools" }]);
    expect(JSON.stringify(options)).not.toMatch(/hidden|Private|internalNotes|ownerId|version|metadata/);
    await expect(service.inquiryOptions(manager, { contactId: "hidden-contact" })).rejects.toBeInstanceOf(CustomerNotFoundError);
    await expect(service.inquiryOptions(manager, { companyId: "hidden-co" })).rejects.toBeInstanceOf(CustomerNotFoundError);
    await expect(service.inquiryOptions(viewer, {})).rejects.toBeInstanceOf(CustomerPermissionError);
  });
  it("searches scoped options, keeps explicit selections and redacts independently hidden companies", async () => {
    expect(await service.inquiryOptions(manager, { query: "not found" })).toEqual({ contacts: [], companies: [] });
    expect((await service.inquiryOptions(manager, { query: "jane" })).contacts.map(({ id }) => id)).toEqual(["shared-contact"]);
    expect((await service.inquiryOptions(manager, { query: "not found", contactId: "shared-contact", companyId: "shared-company" })).contacts.map(({ id }) => id)).toEqual(["shared-contact"]);
    await db.company.create({ data: { id: "hidden-co", companyCode: "CO-HIDDEN", name: "Hidden company", normalizedName: "hidden company", ownerId: "outsider" } });
    await db.contact.update({ where: { id: "shared-contact" }, data: { companyId: "hidden-co" } });
    const options = await service.inquiryOptions(manager, { contactId: "shared-contact" });
    expect(options.contacts[0].companyId).toBeNull();
    expect(JSON.stringify(options)).not.toContain("hidden-co");
  });
});
