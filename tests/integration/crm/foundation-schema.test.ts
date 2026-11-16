import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";

describe("CRM PostgreSQL foundation", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("creates_all_default_stages_idempotently", async () => {
    const { seedCrmStages } = await import("@/prisma/seed-crm");

    await seedCrmStages(db);
    const stages = await db.crmStage.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: { id: true, code: true },
    });

    expect(stages.map(({ code }) => code)).toEqual([
      "NEW_INQUIRY",
      "TO_CONTACT",
      "CONTACTED",
      "REQUIREMENT_CONFIRMED",
      "SOLUTION_PREPARATION",
      "QUOTATION_SENT",
      "NEGOTIATION",
      "AWAITING_DECISION",
      "ORDER_CONFIRMED",
      "WON",
      "LOST",
      "ON_HOLD",
    ]);
    for (const { id, code } of stages) {
      expect(id).toBe(`crm_stage_${code.toLowerCase()}`);
    }

    await seedCrmStages(db);

    expect(await db.crmStage.findMany({
      orderBy: { position: "asc" },
      select: { id: true, code: true },
    })).toEqual(stages);
  });

  it("keeps_legacy_lead_fields_unchanged", async () => {
    const legacyFields = { email: "legacy-buyer@example.com", message: "Please send a quote." };
    const { id } = await db.lead.create({ data: legacyFields });

    expect(await db.lead.findUniqueOrThrow({ where: { id } })).toMatchObject({
      ...legacyFields,
      status: "NEW",
      version: 1,
    });
  });

  it("allows_crm_relations_to_remain_null", async () => {
    const lead = await db.lead.create({
      data: { email: "unlinked-buyer@example.com", message: "A legacy inquiry without CRM links." },
    });

    expect(lead).toMatchObject({
      companyId: null,
      contactId: null,
      stageId: null,
      preSpamStageId: null,
      createdById: null,
      updatedById: null,
    });
  });
});
