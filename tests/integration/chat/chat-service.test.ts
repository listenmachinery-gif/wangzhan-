import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import {
  ChatConflictError,
  ChatPermissionError,
  ChatRateLimitError,
  ChatService,
} from "@/lib/services/chat-service";

const now = new Date("2026-11-16T10:00:00.000Z");
const owner = { anonymousId: "anonymous_chat_1", sessionKey: "session_chat_1", environment: "TEST" as const };
const otherOwner = { anonymousId: "anonymous_chat_2", sessionKey: "session_chat_2", environment: "TEST" as const };

function principal(id: string, roles: Principal["roles"]): Principal {
  return { id, email: `${id}@example.com`, name: id, roles };
}

describe("persistent chat service", () => {
  const publish = vi.fn(async () => ({ published: true as const }));

  beforeEach(async () => {
    await resetTestDatabase();
    publish.mockClear();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("creates or resumes an anonymous conversation without creating a Lead", async () => {
    const service = new ChatService(db, publish, () => now);
    const first = await service.createOrResumeConversation(owner, {
      landingPath: "/products/example",
      name: "Buyer",
      email: "buyer@example.com",
    });
    const resumed = await service.createOrResumeConversation(owner, { landingPath: "/contact" });

    expect(resumed.id).toBe(first.id);
    expect(first.leadId).toBeNull();
    expect(await db.lead.count()).toBe(0);
    expect(await db.analyticsVisitor.count()).toBe(1);
    expect(await db.analyticsSession.count()).toBe(1);
  });

  it("persists visitor messages idempotently before publishing and syncs after a cursor", async () => {
    const service = new ChatService(db, publish, () => now);
    const conversation = await service.createOrResumeConversation(owner, { landingPath: "/products/example" });
    const first = await service.sendVisitorMessage(owner, conversation.id, {
      clientMessageId: "client_1",
      body: "<b>Stored as plain text</b>",
    });
    const duplicate = await service.sendVisitorMessage(owner, conversation.id, {
      clientMessageId: "client_1",
      body: "A retry must not overwrite the first body",
    });
    const second = await service.sendVisitorMessage(owner, conversation.id, {
      clientMessageId: "client_2",
      body: "Second message",
    });

    expect(first.message.body).toBe("<b>Stored as plain text</b>");
    expect(duplicate.message.id).toBe(first.message.id);
    expect(await db.chatMessage.count()).toBe(2);
    expect(publish).toHaveBeenCalledTimes(2);
    const synced = await service.listMessages(owner, conversation.id, { cursor: first.message.id });
    expect(synced.items.map(({ id }) => id)).toEqual([second.message.id]);
    expect(await db.auditLog.count({ where: { entityType: "ChatMessage" } })).toBe(2);
  });

  it("resolves concurrent retries to one durable message", async () => {
    const service = new ChatService(db, publish, () => now);
    const conversation = await service.createOrResumeConversation(owner, { landingPath: "/" });
    const [first, retry] = await Promise.all([
      service.sendVisitorMessage(owner, conversation.id, { clientMessageId: "concurrent_1", body: "First" }),
      service.sendVisitorMessage(owner, conversation.id, { clientMessageId: "concurrent_1", body: "First" }),
    ]);

    expect(retry.message.id).toBe(first.message.id);
    expect(await db.chatMessage.count()).toBe(1);
    expect(await db.auditLog.count({ where: { entityType: "ChatMessage" } })).toBe(1);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it("keeps the committed message when realtime publication is unavailable", async () => {
    const unavailablePublisher = vi.fn(async () => { throw new Error("Redis unavailable"); });
    const service = new ChatService(db, unavailablePublisher, () => now);
    const conversation = await service.createOrResumeConversation(owner, { landingPath: "/" });

    const result = await service.sendVisitorMessage(owner, conversation.id, {
      clientMessageId: "durable_1",
      body: "Persist this first",
    });

    expect(result.realtime).toEqual({ published: false, degraded: true });
    expect(await db.chatMessage.count({ where: { id: result.message.id } })).toBe(1);
  });

  it("denies cross-visitor access and blocks closed or spam conversations", async () => {
    const service = new ChatService(db, publish, () => now);
    const conversation = await service.createOrResumeConversation(owner, { landingPath: "/" });

    await expect(service.listMessages(otherOwner, conversation.id, {})).rejects.toBeInstanceOf(ChatPermissionError);
    await db.chatConversation.update({ where: { id: conversation.id }, data: { status: "CLOSED" } });
    await expect(service.sendVisitorMessage(owner, conversation.id, {
      clientMessageId: "closed_1",
      body: "Should fail",
    })).rejects.toBeInstanceOf(ChatConflictError);
  });

  it("enforces a bounded visitor message rate", async () => {
    const service = new ChatService(db, publish, () => now);
    const conversation = await service.createOrResumeConversation(owner, { landingPath: "/" });
    for (let index = 0; index < 10; index += 1) {
      await service.sendVisitorMessage(owner, conversation.id, {
        clientMessageId: `rate_${index}`,
        body: `Message ${index}`,
      });
    }
    await expect(service.sendVisitorMessage(owner, conversation.id, {
      clientMessageId: "rate_11",
      body: "One too many",
    })).rejects.toBeInstanceOf(ChatRateLimitError);
  });

  it("enforces assigned-agent scope while supervisors can read and reply to all", async () => {
    const service = new ChatService(db, publish, () => now);
    const [agentUser, otherAgentUser, supervisorUser] = await Promise.all([
      db.user.create({ data: { email: "agent@example.com", name: "Agent", passwordHash: "hash" } }),
      db.user.create({ data: { email: "other-agent@example.com", name: "Other Agent", passwordHash: "hash" } }),
      db.user.create({ data: { email: "supervisor@example.com", name: "Supervisor", passwordHash: "hash" } }),
    ]);
    const conversation = await service.createOrResumeConversation(owner, { landingPath: "/" });
    await db.chatAssignment.create({
      data: { conversationId: conversation.id, assigneeId: agentUser.id, assignedById: supervisorUser.id },
    });
    const agent = principal(agentUser.id, ["SUPPORT_AGENT"]);
    const otherAgent = principal(otherAgentUser.id, ["SUPPORT_AGENT"]);
    const supervisor = principal(supervisorUser.id, ["SUPPORT_SUPERVISOR"]);

    expect((await service.listAdminConversations(agent, { environment: "TEST" })).items).toHaveLength(1);
    expect((await service.listAdminConversations(otherAgent, { environment: "TEST" })).items).toHaveLength(0);
    await expect(service.sendAgentMessage(otherAgent, conversation.id, {
      clientMessageId: "agent_denied",
      body: "Denied",
    })).rejects.toBeInstanceOf(ChatPermissionError);
    await expect(service.sendAgentMessage(supervisor, conversation.id, {
      clientMessageId: "supervisor_reply",
      body: "How can we help?",
    })).resolves.toMatchObject({ message: { senderType: "AGENT" } });
  });
});
