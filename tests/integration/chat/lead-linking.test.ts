import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { ChatPermissionError, ChatService } from "@/lib/services/chat-service";

function principal(id: string, roles: Principal["roles"]): Principal {
  return { id, email: `${id}@example.com`, name: id, roles };
}

describe("chat Lead linking", () => {
  beforeEach(async () => resetTestDatabase());
  afterAll(async () => db.$disconnect());

  async function fixture(contactEmail: string | null = " Buyer@Example.COM ") {
    const [supervisorUser, agentUser] = await Promise.all([
      db.user.create({ data: { email: "lead-supervisor@example.com", name: "Supervisor", passwordHash: "hash" } }),
      db.user.create({ data: { email: "lead-agent@example.com", name: "Agent", passwordHash: "hash" } }),
    ]);
    const visitor = await db.analyticsVisitor.create({
      data: { anonymousId: "lead_link_visitor", environment: "TEST", firstSeenAt: new Date(), lastSeenAt: new Date() },
    });
    const conversation = await db.chatConversation.create({
      data: { visitorId: visitor.id, environment: "TEST", contactName: "Chat Buyer", contactEmail, contactWhatsapp: "+86 138 0000 0000" },
    });
    await db.chatMessage.create({
      data: { conversationId: conversation.id, senderType: "VISITOR", type: "TEXT", clientMessageId: "lead_message", body: "Please quote this machine." },
    });
    return {
      supervisor: principal(supervisorUser.id, ["SUPPORT_SUPERVISOR"]),
      agent: principal(agentUser.id, ["SUPPORT_AGENT"]),
      conversation,
      visitor,
    };
  }

  it("refuses to create a Lead without a valid email", async () => {
    const { supervisor, conversation } = await fixture(null);
    await expect(new ChatService(db).linkConversationLead(supervisor, conversation.id, {
      action: "create_or_link",
      email: "not-an-email",
    }, "TEST")).rejects.toBeInstanceOf(ZodError);
    expect(await db.lead.count()).toBe(0);
  });

  it("normalizes email, links the existing Lead, and preserves its business data", async () => {
    const { supervisor, conversation, visitor } = await fixture();
    const existing = await db.lead.create({
      data: { email: "buyer@example.com", name: "Existing Name", company: "Existing Company", message: "Original inquiry" },
    });

    const linked = await new ChatService(db).linkConversationLead(supervisor, conversation.id, {
      action: "create_or_link",
      email: " Buyer@Example.COM ",
      name: "Do not overwrite",
    }, "TEST");

    expect(linked.id).toBe(existing.id);
    expect(await db.lead.findUniqueOrThrow({ where: { id: existing.id } })).toMatchObject({ name: "Existing Name", company: "Existing Company", message: "Original inquiry" });
    expect((await db.chatConversation.findUniqueOrThrow({ where: { id: conversation.id } })).leadId).toBe(existing.id);
    expect((await db.analyticsVisitor.findUniqueOrThrow({ where: { id: visitor.id } })).linkedLeadId).toBe(existing.id);
  });

  it("creates one Lead on retry and writes one activity plus one audit entry", async () => {
    const { supervisor, conversation } = await fixture();
    const service = new ChatService(db);
    const first = await service.linkConversationLead(supervisor, conversation.id, {
      action: "create_or_link",
      email: "buyer@example.com",
      name: "Chat Buyer",
    }, "TEST");
    const retry = await service.linkConversationLead(supervisor, conversation.id, {
      action: "create_or_link",
      email: "buyer@example.com",
      name: "Chat Buyer",
    }, "TEST");

    expect(retry.id).toBe(first.id);
    expect(await db.lead.count()).toBe(1);
    expect(await db.leadActivity.count({ where: { leadId: first.id } })).toBe(1);
    expect(await db.auditLog.count({ where: { action: "chat.lead.link", entityId: conversation.id } })).toBe(1);
  });

  it("explicitly links an existing Lead and enforces management permission", async () => {
    const { supervisor, agent, conversation } = await fixture();
    const lead = await db.lead.create({ data: { email: "other@example.com", message: "Existing inquiry" } });
    const service = new ChatService(db);

    await expect(service.linkConversationLead(agent, conversation.id, { action: "link_existing", leadId: lead.id }, "TEST"))
      .rejects.toBeInstanceOf(ChatPermissionError);
    await expect(service.linkConversationLead(supervisor, conversation.id, { action: "link_existing", leadId: lead.id }, "TEST"))
      .resolves.toMatchObject({ id: lead.id });
  });
});
