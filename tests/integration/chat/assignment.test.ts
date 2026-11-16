import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { ChatAssignmentConflictError, ChatPermissionError, ChatService } from "@/lib/services/chat-service";

function principal(id: string, roles: Principal["roles"]): Principal {
  return { id, email: `${id}@example.com`, name: id, roles };
}

describe("chat assignment workflow", () => {
  beforeEach(async () => resetTestDatabase());
  afterAll(async () => db.$disconnect());

  async function fixture() {
    const [supervisorUser, agentOne, agentTwo] = await Promise.all([
      db.user.create({ data: { email: "supervisor@example.com", name: "Supervisor", passwordHash: "hash" } }),
      db.user.create({ data: { email: "agent-one@example.com", name: "Agent One", passwordHash: "hash" } }),
      db.user.create({ data: { email: "agent-two@example.com", name: "Agent Two", passwordHash: "hash" } }),
    ]);
    const supportRole = await db.role.create({ data: { key: "SUPPORT_AGENT", name: "Support Agent" } });
    await db.userRole.createMany({ data: [
      { userId: agentOne.id, roleId: supportRole.id },
      { userId: agentTwo.id, roleId: supportRole.id },
    ] });
    const visitor = await db.analyticsVisitor.create({
      data: { anonymousId: "assignment_visitor", environment: "TEST", firstSeenAt: new Date(), lastSeenAt: new Date() },
    });
    const conversation = await db.chatConversation.create({ data: { visitorId: visitor.id, environment: "TEST" } });
    return { supervisor: principal(supervisorUser.id, ["SUPPORT_SUPERVISOR"]), agentOne, agentTwo, conversation };
  }

  it("allows one winner in a concurrent assignment race and audits the change", async () => {
    const { supervisor, agentOne, agentTwo, conversation } = await fixture();
    const service = new ChatService(db);
    const outcomes = await Promise.allSettled([
      service.assignConversation(supervisor, conversation.id, { assigneeId: agentOne.id, currentAssignmentId: null }, "TEST"),
      service.assignConversation(supervisor, conversation.id, { assigneeId: agentTwo.id, currentAssignmentId: null }, "TEST"),
    ]);

    expect(outcomes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    const rejected = outcomes.find(({ status }) => status === "rejected");
    expect(rejected && rejected.status === "rejected" ? rejected.reason : null).toBeInstanceOf(ChatAssignmentConflictError);
    expect(await db.chatAssignment.count({ where: { conversationId: conversation.id, endedAt: null } })).toBe(1);
    expect(await db.auditLog.count({ where: { action: "chat.assignment.change", entityId: conversation.id } })).toBe(1);
  });

  it("records transfers and enforces supervisor-only status management", async () => {
    const { supervisor, agentOne, agentTwo, conversation } = await fixture();
    const service = new ChatService(db);
    const first = await service.assignConversation(supervisor, conversation.id, { assigneeId: agentOne.id, currentAssignmentId: null }, "TEST");
    const transferred = await service.assignConversation(supervisor, conversation.id, {
      assigneeId: agentTwo.id,
      currentAssignmentId: first.id,
    }, "TEST");

    expect(transferred.assigneeId).toBe(agentTwo.id);
    expect(await db.chatAssignment.count({ where: { conversationId: conversation.id } })).toBe(2);
    await expect(service.updateConversationStatus(principal(agentOne.id, ["SUPPORT_AGENT"]), conversation.id, { status: "CLOSED" }, "TEST"))
      .rejects.toBeInstanceOf(ChatPermissionError);
    await expect(service.updateConversationStatus(supervisor, conversation.id, { status: "CLOSED" }, "TEST"))
      .resolves.toMatchObject({ status: "CLOSED" });
  });
});
