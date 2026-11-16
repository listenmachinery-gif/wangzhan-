import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { PrivacyPermissionError, PrivacyRetentionService } from "@/lib/services/privacy-retention-service";

const admin: Principal = { id: "admin", email: "admin@example.com", name: "Admin", roles: ["ADMIN"] };
const editor: Principal = { id: "editor", email: "editor@example.com", name: "Editor", roles: ["CONTENT_EDITOR"] };

describe("explicit visitor data deletion", () => {
  beforeEach(resetTestDatabase);
  afterAll(() => db.$disconnect());

  it("preserves the Lead while deleting analytics and chats, and audits only non-PII counts", async () => {
    const actor = await db.user.create({ data: { id: admin.id, email: admin.email, name: admin.name, passwordHash: "hash" } });
    const lead = await db.lead.create({ data: { email: "buyer@example.com", message: "Real inquiry" } });
    const visitor = await db.analyticsVisitor.create({ data: { anonymousId: "delete-me", environment: "TEST", firstSeenAt: new Date(), lastSeenAt: new Date(), linkedLeadId: lead.id, city: "Sensitive City" } });
    const chat = await db.chatConversation.create({ data: { visitorId: visitor.id, leadId: lead.id, environment: "TEST", contactEmail: "buyer@example.com" } });
    await db.chatMessage.create({ data: { conversationId: chat.id, senderType: "VISITOR", clientMessageId: "delete-message", body: "Private details" } });

    const result = await new PrivacyRetentionService(db).deleteVisitorData(visitor.id, "TEST", { ...admin, id: actor.id });

    expect(result).toMatchObject({ deleted: true, chatsDeleted: 1, leadPreserved: true });
    expect(await db.analyticsVisitor.count()).toBe(0);
    expect(await db.chatConversation.count()).toBe(0);
    expect(await db.lead.count({ where: { id: lead.id } })).toBe(1);
    const audit = await db.auditLog.findFirstOrThrow({ where: { action: "analytics.visitor.delete" } });
    expect(JSON.stringify(audit)).not.toContain("buyer@example.com");
    expect(JSON.stringify(audit)).not.toContain("Private details");
    expect(JSON.stringify(audit)).not.toContain("Sensitive City");
  });

  it("denies principals without analytics deletion permission", async () => {
    const visitor = await db.analyticsVisitor.create({ data: { anonymousId: "keep-me", environment: "TEST", firstSeenAt: new Date(), lastSeenAt: new Date() } });
    await expect(new PrivacyRetentionService(db).deleteVisitorData(visitor.id, "TEST", editor)).rejects.toBeInstanceOf(PrivacyPermissionError);
    expect(await db.analyticsVisitor.count()).toBe(1);
  });
});
