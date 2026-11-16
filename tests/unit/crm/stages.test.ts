import { describe, expect, it } from "vitest";

import {
  DEFAULT_CRM_STAGES,
  legacyStatusToDefaultStage,
  sameLegacyCompatibilityGroup,
  stageToLegacyStatus,
} from "@/lib/crm/stages";

describe("CRM stage compatibility", () => {
  const stageMappings = [
    ["NEW_INQUIRY", "NEW"],
    ["TO_CONTACT", "NEW"],
    ["CONTACTED", "CONTACTED"],
    ["REQUIREMENT_CONFIRMED", "CONTACTED"],
    ["SOLUTION_PREPARATION", "CONTACTED"],
    ["QUOTATION_SENT", "QUOTED"],
    ["NEGOTIATION", "IN_DISCUSSION"],
    ["AWAITING_DECISION", "IN_DISCUSSION"],
    ["ORDER_CONFIRMED", "WON"],
    ["WON", "WON"],
    ["LOST", "LOST"],
    ["ON_HOLD", "IN_DISCUSSION"],
  ] as const;

  it("defines the default stages in sales workflow order", () => {
    expect(DEFAULT_CRM_STAGES).toEqual(stageMappings.map(([code]) => code));
  });

  it.each(stageMappings)("projects %s to legacy status %s", (code, status) => {
    expect(stageToLegacyStatus(code)).toBe(status);
  });

  it.each([
    ["NEW", "NEW_INQUIRY"],
    ["CONTACTED", "CONTACTED"],
    ["IN_DISCUSSION", "NEGOTIATION"],
    ["QUOTED", "QUOTATION_SENT"],
    ["WON", "WON"],
    ["LOST", "LOST"],
    ["SPAM", null],
  ] as const)("maps legacy status %s to default stage %s", (status, code) => {
    expect(legacyStatusToDefaultStage(status)).toBe(code);
  });

  it("keeps a detailed stage only when the requested status represents its compatibility group", () => {
    expect(sameLegacyCompatibilityGroup("CONTACTED", "CONTACTED")).toBe(true);
    expect(sameLegacyCompatibilityGroup("REQUIREMENT_CONFIRMED", "CONTACTED")).toBe(true);
    expect(sameLegacyCompatibilityGroup("REQUIREMENT_CONFIRMED", "QUOTED")).toBe(false);
    expect(sameLegacyCompatibilityGroup("REQUIREMENT_CONFIRMED", "SPAM")).toBe(false);
    expect(sameLegacyCompatibilityGroup(null, "CONTACTED")).toBe(false);
  });
});
