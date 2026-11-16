import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { LeadConflictError, LeadService, LeadValidationError } from "@/lib/services/lead-service";
import { seedCrmStages } from "@/prisma/seed-crm";

describe("Lead stage transitions", () => {
  const service = new LeadService(db);
  let admin: Principal;
  let leadId: string;

  beforeEach(async () => {
    await resetTestDatabase();
    await seedCrmStages(db);
    const actor = await db.user.create({
      data: { email: "stages-admin@zyron.test", name: "Stage Admin", passwordHash: "test" },
    });
    admin = { id: actor.id, name: actor.name, email: actor.email, roles: ["ADMIN"] };

    const lead = await db.lead.create({
      data: { email: "stage-buyer@example.com", message: "Please send a quote." },
    });
    leadId = lead.id;
  });

  afterAll(() => db.$disconnect());

  it("rejects CRM LOST without a nonempty reason before changing the Lead", async () => {
    await expect(service.updateStage(admin, leadId, { version: 1, stageCode: "LOST", reasonCode: "  " }))
      .rejects.toBeInstanceOf(LeadValidationError);
    await expect(db.lead.findUniqueOrThrow({ where: { id: leadId } })).resolves.toMatchObject({
      status: "NEW",
      stageId: null,
      version: 1,
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(0);
    await expect(db.auditLog.count({ where: { entityId: leadId } })).resolves.toBe(0);
  });

  it("records an explicit CRM loss reason in the Lead and its history", async () => {
    await expect(service.updateStage(admin, leadId, {
      version: 1,
      stageCode: "LOST",
      reasonCode: " PRICE ",
      reasonNote: " Customer chose another offer. ",
    })).resolves.toMatchObject({
      status: "LOST",
      stageId: "crm_stage_lost",
      lostReasonCode: "PRICE",
      lostReasonNote: "Customer chose another offer.",
      version: 2,
    });
    await expect(db.leadStageHistory.findMany({ where: { leadId } })).resolves.toMatchObject([{
      leadId,
      previousStageId: null,
      newStageId: "crm_stage_lost",
      previousStatus: "NEW",
      newStatus: "LOST",
      actorId: admin.id,
      reasonCode: "PRICE",
      reasonNote: "Customer chose another offer.",
      source: "CRM_API",
    }]);
  });

  it("records the compatibility reason for legacy LOST on an inquiry with no stage", async () => {
    await expect(service.update(admin, leadId, { version: 1, status: "LOST" })).resolves.toMatchObject({
      status: "LOST",
      stageId: "crm_stage_lost",
      lostReasonCode: "LEGACY_API_NO_REASON",
      version: 2,
    });
    await expect(db.leadStageHistory.findMany({ where: { leadId } })).resolves.toMatchObject([{
      previousStageId: null,
      newStageId: "crm_stage_lost",
      previousStatus: "NEW",
      newStatus: "LOST",
      reasonCode: "LEGACY_API_NO_REASON",
      actorId: admin.id,
      source: "LEGACY_API",
    }]);
    await expect(db.auditLog.findMany({ where: { entityId: leadId, action: "lead.update" } })).resolves.toMatchObject([{
      actorId: admin.id,
      before: { status: "NEW", stageId: null, version: 1 },
      after: { status: "LOST", stageId: "crm_stage_lost", reasonCode: "LEGACY_API_NO_REASON", source: "LEGACY_API", version: 2 },
    }]);
  });

  it("preserves a recorded loss reason through repeat legacy LOST writes", async () => {
    await service.updateStage(admin, leadId, {
      version: 1,
      stageCode: "LOST",
      reasonCode: "PRICE",
      reasonNote: "Customer chose another offer.",
    });

    await expect(service.update(admin, leadId, { version: 2, status: "LOST" })).resolves.toMatchObject({
      lostReasonCode: "PRICE",
      lostReasonNote: "Customer chose another offer.",
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(1);
  });

  it("keeps the loss reason with its historical transition when the Lead is reopened", async () => {
    await service.updateStage(admin, leadId, {
      version: 1,
      stageCode: "LOST",
      reasonCode: "PRICE",
      reasonNote: "Customer chose another offer.",
    });

    await expect(service.update(admin, leadId, { version: 2, status: "CONTACTED" })).resolves.toMatchObject({
      lostReasonCode: null,
      lostReasonNote: null,
    });
    await expect(db.leadStageHistory.findMany({ where: { leadId }, orderBy: { createdAt: "asc" } })).resolves.toMatchObject([
      { newStatus: "LOST", reasonCode: "PRICE", reasonNote: "Customer chose another offer." },
      { newStatus: "CONTACTED", reasonCode: null, reasonNote: null },
    ]);
  });

  it("preserves a detailed stage under a same-group legacy status update", async () => {
    await db.lead.update({
      where: { id: leadId },
      data: { status: "CONTACTED", stageId: "crm_stage_requirement_confirmed" },
    });

    await expect(service.update(admin, leadId, { version: 1, status: "CONTACTED" })).resolves.toMatchObject({
      status: "CONTACTED",
      stageId: "crm_stage_requirement_confirmed",
      version: 2,
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(0);
  });

  it("records one stage-history row for a cross-group legacy status update", async () => {
    await db.lead.update({
      where: { id: leadId },
      data: { status: "CONTACTED", stageId: "crm_stage_requirement_confirmed" },
    });

    await expect(service.update(admin, leadId, { version: 1, status: "QUOTED" })).resolves.toMatchObject({
      status: "QUOTED",
      stageId: "crm_stage_quotation_sent",
      version: 2,
    });
    await expect(db.leadStageHistory.findMany({ where: { leadId } })).resolves.toMatchObject([{
      previousStageId: "crm_stage_requirement_confirmed",
      newStageId: "crm_stage_quotation_sent",
      previousStatus: "CONTACTED",
      newStatus: "QUOTED",
      actorId: admin.id,
      source: "LEGACY_API",
    }]);
    await expect(db.leadActivity.findMany({ where: { leadId, type: "STATUS_CHANGE" } })).resolves.toMatchObject([{
      actorId: admin.id,
      metadata: { from: "CONTACTED", to: "QUOTED" },
    }]);
  });

  it("isolates SPAM from active status views and restores the saved detailed stage", async () => {
    await db.lead.update({
      where: { id: leadId },
      data: { status: "CONTACTED", stageId: "crm_stage_requirement_confirmed" },
    });

    await expect(service.update(admin, leadId, { version: 1, status: "SPAM" })).resolves.toMatchObject({
      status: "SPAM",
      stageId: "crm_stage_requirement_confirmed",
      preSpamStageId: "crm_stage_requirement_confirmed",
      version: 2,
    });
    await expect(service.list(admin, { status: "CONTACTED" })).resolves.toMatchObject({ total: 0 });
    await expect(service.get(admin, leadId)).resolves.toMatchObject({ id: leadId, status: "SPAM" });

    await expect(service.update(admin, leadId, { version: 2, status: "SPAM" })).resolves.toMatchObject({
      preSpamStageId: "crm_stage_requirement_confirmed",
      version: 3,
    });
    await expect(service.updateStage(admin, leadId, { version: 3, stageCode: "CONTACTED" })).resolves.toMatchObject({
      status: "CONTACTED",
      stageId: "crm_stage_requirement_confirmed",
      preSpamStageId: null,
      version: 4,
    });
    await expect(db.leadStageHistory.findMany({ where: { leadId }, orderBy: { createdAt: "asc" } })).resolves.toMatchObject([
      {
        previousStageId: "crm_stage_requirement_confirmed",
        newStageId: "crm_stage_requirement_confirmed",
        previousStatus: "CONTACTED",
        newStatus: "SPAM",
        source: "LEGACY_API",
      },
      {
        previousStageId: "crm_stage_requirement_confirmed",
        newStageId: "crm_stage_requirement_confirmed",
        previousStatus: "SPAM",
        newStatus: "CONTACTED",
        source: "CRM_API",
      },
    ]);
  });

  it("uses the old status to retain a sales stage when isolating a pre-CRM Lead", async () => {
    await db.lead.update({ where: { id: leadId }, data: { status: "IN_DISCUSSION" } });
    await expect(service.update(admin, leadId, { version: 1, status: "SPAM" })).resolves.toMatchObject({
      status: "SPAM",
      stageId: "crm_stage_negotiation",
      preSpamStageId: "crm_stage_negotiation",
    });
  });

  it("reports a conflict for a stale version without a second history or audit write", async () => {
    await service.updateStage(admin, leadId, { version: 1, stageCode: "CONTACTED" });
    await expect(service.updateStage(admin, leadId, { version: 1, stageCode: "QUOTATION_SENT" }))
      .rejects.toBeInstanceOf(LeadConflictError);

    await expect(db.lead.findUniqueOrThrow({ where: { id: leadId } })).resolves.toMatchObject({
      status: "CONTACTED",
      stageId: "crm_stage_contacted",
      version: 2,
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(1);
    await expect(db.auditLog.count({ where: { entityId: leadId, action: "lead.update" } })).resolves.toBe(1);
  });

  it("commits only one transition when two writers share the same version", async () => {
    const outcomes = await Promise.allSettled([
      service.updateStage(admin, leadId, { version: 1, stageCode: "CONTACTED" }),
      service.update(admin, leadId, { version: 1, status: "QUOTED" }),
    ]);

    expect(outcomes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter(({ status }) => status === "rejected")).toMatchObject([{
      reason: expect.any(LeadConflictError),
    }]);
    const saved = await db.lead.findUniqueOrThrow({ where: { id: leadId } });
    expect(saved.version).toBe(2);
    await expect(db.leadStageHistory.findMany({ where: { leadId } })).resolves.toMatchObject([{
      newStageId: saved.stageId,
      newStatus: saved.status,
    }]);
    await expect(db.auditLog.count({ where: { entityId: leadId, action: "lead.update" } })).resolves.toBe(1);
  });

  it("rolls back the stage, history and audit when the caller aborts its transaction", async () => {
    const { transitionLeadStage } = await import("@/lib/services/crm-stage-service");
    await expect(db.$transaction(async (transaction) => {
      await transitionLeadStage(transaction, {
        leadId,
        actorId: admin.id,
        expectedVersion: 1,
        stageCode: "QUOTATION_SENT",
        source: "CRM_API",
        allowRollback: true,
      });
      throw new Error("Caller aborted the transaction.");
    }, { isolationLevel: "Serializable" })).rejects.toThrow("Caller aborted the transaction.");

    await expect(db.lead.findUniqueOrThrow({ where: { id: leadId } })).resolves.toMatchObject({
      status: "NEW",
      stageId: null,
      version: 1,
    });
    await expect(db.leadStageHistory.count({ where: { leadId } })).resolves.toBe(0);
    await expect(db.auditLog.count({ where: { entityId: leadId } })).resolves.toBe(0);
  });
});
