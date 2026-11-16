import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { seedCrmStages } from "@/prisma/seed-crm";
import { applyCrmBackfillPlan, buildCrmBackfillPlan } from "@/scripts/backfill-crm-foundation";

const run = promisify(execFile);
const apply = { apply: true };
const lead = (id: string, extra = {}) => db.lead.create({ data: {
  id, name: "Buyer", email: `${id}@example.com`, company: "Acme", message: "PRIVATE MESSAGE SECRET", ...extra,
} });
async function snapshot() {
  return Promise.all([
    db.lead.findMany({ orderBy: { id: "asc" } }), db.contact.findMany(), db.company.findMany(),
    db.auditLog.findMany(), db.leadStageHistory.findMany(), db.leadAssignment.findMany(), db.crmStage.findMany(),
  ]);
}

describe("offline CRM backfill", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    await seedCrmStages(db);
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("ZYRON_PRODUCTION_CHANGE_AUTHORIZED", "");
    vi.stubEnv("ALLOW_PRODUCTION_MIGRATIONS", "");
  });
  afterEach(() => vi.unstubAllEnvs());
  afterAll(() => db.$disconnect());

  it("plans normalized clear groups, duplicates, incomplete rows, conflicts and stages without writes or sensitive output", async () => {
    await lead("a", { email: " BUYER@Example.com ", company: " ＡＣＭＥ  " });
    await lead("b", { email: "buyer@example.com", company: "acme", status: "QUOTED" });
    await lead("c", { name: null });
    await lead("d", { email: "shared@example.com", company: "Other" });
    await lead("e", { email: "shared@example.com", status: "SPAM" });
    const before = await snapshot();
    const plan = await buildCrmBackfillPlan(db);
    expect(plan.counts).toEqual({ leads: 5, stageMappings: 4, clearContacts: 1, clearCompanies: 1, duplicates: 2, incomplete: 1, conflicts: 2 });
    expect(plan.rows).toMatchObject([
      { leadId: "a", classification: "clear", stageId: "crm_stage_new_inquiry" },
      { leadId: "b", classification: "clear", stageId: "crm_stage_quotation_sent" },
      { leadId: "c", classification: "incomplete", contactId: null, companyId: null },
      { leadId: "d", classification: "conflict", contactId: null, companyId: null },
      { leadId: "e", classification: "conflict", stageId: null, contactId: null, companyId: null },
    ]);
    expect(plan.contacts[0].sourceLeadIds).toEqual(["a", "b"]);
    expect(JSON.stringify(plan)).not.toMatch(/PRIVATE|SECRET|buyer@|shared@|Acme|ＡＣＭＥ/i);
    expect(await snapshot()).toEqual(before);
    await expect(applyCrmBackfillPlan(db, plan)).rejects.toThrow(/explicit.*apply/i);
    expect(await snapshot()).toEqual(before);
  });

  it("applies clear groups atomically with audit/history, preserves snapshots and assignments, and reruns without duplicates", async () => {
    const actor = await db.user.create({ data: { email: "owner@test.com", name: "Owner", passwordHash: "test" } });
    const original = await lead("a", { phone: "+86 123", whatsapp: "+86 456", country: "CN", status: "LOST" });
    await lead("b", { email: " A@EXAMPLE.COM ", country: "CN", duplicateOfId: "a" });
    await db.leadAssignment.create({ data: { leadId: "a", assigneeId: actor.id, assignedById: actor.id } });
    const assignment = await db.leadAssignment.findMany();
    const plan = await buildCrmBackfillPlan(db);
    expect(await applyCrmBackfillPlan(db, plan, apply)).toMatchObject({ updatedLeads: 2 });
    const saved = await db.lead.findUniqueOrThrow({ where: { id: "a" } });
    expect(saved).toMatchObject({ name: original.name, email: original.email, phone: original.phone, whatsapp: original.whatsapp, country: original.country, company: original.company, message: original.message, status: "LOST", contactId: plan.rows[0].contactId, companyId: plan.rows[0].companyId, stageId: "crm_stage_lost", version: 2 });
    expect(await db.leadAssignment.findMany()).toEqual(assignment);
    expect(await db.contact.count()).toBe(1);
    expect(await db.company.count()).toBe(1);
    expect(await db.leadStageHistory.count({ where: { source: "BACKFILL" } })).toBe(2);
    expect(await db.auditLog.count({ where: { action: "crm.backfill" } })).toBe(4);
    expect(JSON.stringify(await db.auditLog.findMany())).not.toContain("PRIVATE");
    const after = await snapshot();
    expect(await applyCrmBackfillPlan(db, plan, apply)).toMatchObject({ updatedLeads: 0 });
    await applyCrmBackfillPlan(db, await buildCrmBackfillPlan(db), apply);
    expect(await snapshot()).toEqual(after);
  });

  it("keeps stable group IDs and detects conflicts outside the selected batch and cursor", async () => {
    await lead("a", { email: "pair@example.com" });
    await lead("b", { email: "pair@example.com" });
    await lead("c", { email: "ambiguous@example.com" });
    await lead("d", { email: "ambiguous@example.com", company: "Different" });
    const full = await buildCrmBackfillPlan(db);
    const first = await buildCrmBackfillPlan(db, { batchLimit: 1 });
    expect(first).toMatchObject({ batchLimit: 1, nextCursor: "a", hasMore: true });
    expect(first.rows).toHaveLength(1);
    expect(first.rows[0].contactId).toBe(full.rows[0].contactId);
    await applyCrmBackfillPlan(db, first, apply);
    const second = await buildCrmBackfillPlan(db, { batchLimit: 1, cursor: first.nextCursor! });
    expect(second.rows[0]).toMatchObject({ leadId: "b", contactId: first.rows[0].contactId });
    await applyCrmBackfillPlan(db, second, apply);
    expect(await db.contact.count()).toBe(1);
    const third = await buildCrmBackfillPlan(db, { batchLimit: 1, cursor: "b" });
    expect(third.rows[0]).toMatchObject({ leadId: "c", classification: "conflict", contactId: null });
    const last = await buildCrmBackfillPlan(db, { batchLimit: 1, cursor: "c" });
    expect(last).toMatchObject({ nextCursor: "d", hasMore: false });
    expect((await buildCrmBackfillPlan(db, { cursor: "d" })).rows).toEqual([]);
    await expect(buildCrmBackfillPlan(db, { batchLimit: 0 })).rejects.toThrow(/batch/i);
    await expect(buildCrmBackfillPlan(db, { batchLimit: 501 })).rejects.toThrow(/batch/i);
  });

  it("reuses unique existing matching entities and preserves all existing relations and detailed stages", async () => {
    await db.company.create({ data: { id: "existing-company", companyCode: "CO-1", name: "Acme", normalizedName: "acme" } });
    await db.contact.create({ data: { id: "existing-contact", customerCode: "CU-1", fullName: "Buyer", email: "a@example.com", normalizedEmail: "a@example.com", companyId: "existing-company" } });
    await lead("a", { stageId: "crm_stage_requirement_confirmed", status: "CONTACTED" });
    await lead("b", { companyId: "existing-company", contactId: "existing-contact", email: "a@example.com" });
    await applyCrmBackfillPlan(db, await buildCrmBackfillPlan(db), apply);
    expect(await db.lead.findUnique({ where: { id: "a" } })).toMatchObject({ contactId: "existing-contact", companyId: "existing-company", stageId: "crm_stage_requirement_confirmed" });
    expect(await db.lead.findUnique({ where: { id: "b" } })).toMatchObject({ contactId: "existing-contact", companyId: "existing-company" });
    expect(await db.contact.count()).toBe(1);
    expect(await db.company.count()).toBe(1);
  });

  it("leaves duplicate existing matches, conflicting names/countries and partial identities unlinked", async () => {
    await db.company.createMany({ data: ["one", "two"].map(id => ({ id, companyCode: id, name: "Acme", normalizedName: "acme" })) });
    await lead("a");
    await lead("b", { company: "Unique", email: "same@example.com" });
    await lead("c", { company: "Unique", email: "same@example.com", name: "Someone else" });
    await lead("d", { company: "Global", country: "CN" });
    await lead("e", { company: "Global", country: "US" });
    await lead("f", { company: null });
    await lead("g", { email: "invalid-email", company: "Unique2" });
    const plan = await buildCrmBackfillPlan(db);
    expect(plan.rows.every(row => row.contactId === null && row.companyId === null)).toBe(true);
    await applyCrmBackfillPlan(db, plan, apply);
    expect(await db.contact.count()).toBe(0);
    expect(await db.company.count()).toBe(2);
    expect(await db.lead.count({ where: { contactId: { not: null } } })).toBe(0);
  });

  it("does not reuse deterministic IDs occupied by a different company or contact identity", async () => {
    await lead("a");
    const original = await buildCrmBackfillPlan(db);
    await db.company.create({ data: {
      id: original.rows[0].companyId!, companyCode: "occupied-company", name: "Unrelated", normalizedName: "unrelated",
    } });
    expect((await buildCrmBackfillPlan(db)).rows[0]).toMatchObject({ classification: "conflict", companyId: null, contactId: null });
    await db.company.update({ where: { id: original.rows[0].companyId! }, data: { name: "Acme", normalizedName: "acme" } });
    await db.contact.create({ data: {
      id: original.rows[0].contactId!, customerCode: "occupied-contact", fullName: "Buyer", email: "different@example.com",
      normalizedEmail: "different@example.com", companyId: original.rows[0].companyId,
    } });
    const plan = await buildCrmBackfillPlan(db);
    expect(plan.rows[0]).toMatchObject({ classification: "conflict", companyId: null, contactId: null });
    await applyCrmBackfillPlan(db, plan, apply);
    expect(await db.lead.findUnique({ where: { id: "a" } })).toMatchObject({ contactId: null, companyId: null });
  });

  it("checks the connected database name as well as environment labels before test apply", async () => {
    await lead("a");
    const plan = await buildCrmBackfillPlan(db);
    const wrong = new URL(process.env.DATABASE_URL!);
    wrong.pathname = "/different_database_test";
    vi.stubEnv("DATABASE_URL", wrong.href);
    vi.stubEnv("TEST_DATABASE_URL", wrong.href);
    await expect(applyCrmBackfillPlan(db, plan, apply)).rejects.toThrow(/connected.*database|database.*match/i);
    expect(await db.auditLog.count()).toBe(0);
  });

  it("rolls back entity, Lead and history writes when an entity code collision aborts the chunk", async () => {
    await lead("a");
    const plan = await buildCrmBackfillPlan(db);
    await db.contact.create({ data: { customerCode: `CU-${plan.rows[0].contactId}`, fullName: "Unrelated", email: "other@example.com" } });
    const before = await snapshot();
    await expect(applyCrmBackfillPlan(db, plan, apply)).rejects.toThrow();
    expect(await snapshot()).toEqual(before);
  });

  it("bounds write transactions and supports replay after a later chunk fails", async () => {
    for (let i = 0; i < 26; i++) await lead(`lead-${String(i).padStart(2, "0")}`);
    const plan = await buildCrmBackfillPlan(db, { batchLimit: 26 });
    const collision = await db.contact.create({ data: { customerCode: `CU-${plan.rows[25].contactId}`, fullName: "Unrelated", email: "other@example.com" } });
    await expect(applyCrmBackfillPlan(db, plan, apply)).rejects.toThrow();
    expect(await db.lead.count({ where: { contactId: { not: null } } })).toBe(25);
    expect(await db.lead.findUnique({ where: { id: "lead-25" } })).toMatchObject({ contactId: null, companyId: null, stageId: null });
    await db.contact.update({ where: { id: collision.id }, data: { customerCode: "resolved-collision" } });
    expect(await applyCrmBackfillPlan(db, plan, apply)).toMatchObject({ updatedLeads: 1, transactions: 2, nextCursor: "lead-25" });
    expect(await db.company.count()).toBe(1);
    expect(await db.contact.count()).toBe(27);
    expect(await db.leadStageHistory.count()).toBe(26);
  });

  it("rechecks changed identities and relations before writing a stale plan", async () => {
    await lead("a");
    const plan = await buildCrmBackfillPlan(db);
    await lead("b", { email: "a@example.com", company: "Conflicting" });
    await expect(applyCrmBackfillPlan(db, plan, apply)).rejects.toThrow(/changed|stale/i);
    expect(await db.contact.count()).toBe(0);
    expect(await db.auditLog.count()).toBe(0);
    expect(await db.lead.findUnique({ where: { id: "a" } })).toMatchObject({ stageId: null });
  });

  it.each([
    ["", ""], ["true", ""], ["", "approved-once"], ["false", "approved-once"],
  ])("rejects production apply before writes with authorization %s / %s", async (authorized, migrations) => {
    await lead("a");
    const plan = await buildCrmBackfillPlan(db);
    const before = await snapshot();
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ZYRON_PRODUCTION_CHANGE_AUTHORIZED", authorized);
    vi.stubEnv("ALLOW_PRODUCTION_MIGRATIONS", migrations);
    await expect(applyCrmBackfillPlan(db, plan, apply)).rejects.toThrow(/production.*authoriz/i);
    expect(await snapshot()).toEqual(before);
  });

  it("refuses non-production apply unless the environment points at the guarded test database", async () => {
    await lead("a");
    const plan = await buildCrmBackfillPlan(db);
    vi.stubEnv("TEST_DATABASE_URL", "");
    await expect(applyCrmBackfillPlan(db, plan, apply)).rejects.toThrow(/test database/i);
    expect(await db.auditLog.count()).toBe(0);
  });

  it("CLI defaults to read-only, supports explicit bounded apply, and rejects unknown arguments", async () => {
    await lead("a");
    const before = await snapshot();
    const { stdout } = await run(process.execPath, ["--import", "tsx", "scripts/backfill-crm-foundation.ts", "--batch-limit", "1"]);
    expect(JSON.parse(stdout)).toMatchObject({ mode: "dry-run", plan: { batchLimit: 1, counts: { leads: 1 } } });
    expect(await snapshot()).toEqual(before);
    await expect(run(process.execPath, ["--import", "tsx", "scripts/backfill-crm-foundation.ts", "--aply"])).rejects.toThrow();
    expect(await snapshot()).toEqual(before);
    const applied = await run(process.execPath, ["--import", "tsx", "scripts/backfill-crm-foundation.ts", "--apply", "--batch-limit", "1"]);
    expect(JSON.parse(applied.stdout)).toMatchObject({ mode: "apply", result: { updatedLeads: 1 } });
    expect(await db.contact.count()).toBe(1);
  });
});
