import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { resolveCrmAccessScope } from "@/lib/services/crm-access-service";

function principal(...roles: Principal["roles"]): Principal {
  return { id: "user", email: "user@example.com", name: "User", roles };
}

const noDatabase = {} as PrismaClient;
const databaseWithoutMemberships = {
  crmTeamMembership: { findMany: async () => [] },
} as unknown as PrismaClient;

describe("CRM access scope", () => {
  it.each(["SUPER_ADMIN", "ADMIN"] as const)("gives %s unrestricted scope", async (role) => {
    await expect(resolveCrmAccessScope(noDatabase, principal(role, "CRM_VIEWER")))
      .resolves.toEqual({ kind: "ALL" });
  });

  it("limits Sales to its own assignments", async () => {
    await expect(resolveCrmAccessScope(noDatabase, principal("SALES")))
      .resolves.toEqual({ kind: "ASSIGNEES", assigneeIds: ["user"] });
  });

  it.each(["PRODUCT_EDITOR", "CONTENT_EDITOR", "SUPPORT_SUPERVISOR"] as const)(
    "denies CRM scope to %s",
    async (role) => {
      await expect(resolveCrmAccessScope(noDatabase, principal(role))).resolves.toEqual({ kind: "NONE" });
    },
  );

  it.each(["SALES_MANAGER", "CRM_VIEWER"] as const)(
    "denies CRM scope to %s without authorized memberships",
    async (role) => {
      await expect(resolveCrmAccessScope(databaseWithoutMemberships, principal(role)))
        .resolves.toEqual({ kind: "NONE" });
    },
  );

  it("retains Sales self scope when the team role has no authorized memberships", async () => {
    await expect(resolveCrmAccessScope(databaseWithoutMemberships, principal("SALES", "SALES_MANAGER")))
      .resolves.toEqual({ kind: "ASSIGNEES", assigneeIds: ["user"] });
  });
});
