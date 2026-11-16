import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma, type AnalyticsEnvironment, type ChatMessage, type PrismaClient } from "@prisma/client";

import { currentAnalyticsEnvironment } from "@/lib/analytics/first-party/environment";
import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";
import { buildRealtimeChannel, getRealtimeConfig } from "@/lib/realtime/config";
import type { RealtimeEvent } from "@/lib/realtime/protocol";
import { publishRealtimeEvent } from "@/lib/realtime/redis";
import {
  adminChatListQuerySchema,
  chatConversationInputSchema,
  chatMessageInputSchema,
  chatMessageListQuerySchema,
  type AdminChatListQuery,
  type ChatConversationInput,
  type ChatMessageInput,
} from "@/lib/validation/chat";

export type ChatVisitorOwner = {
  anonymousId: string;
  sessionKey: string;
  environment: AnalyticsEnvironment;
};

type RealtimePublisher = (channel: string, event: RealtimeEvent) => Promise<{ published: boolean; reason?: string }>;

export class ChatPermissionError extends Error {
  constructor() {
    super("Permission denied for this conversation.");
    this.name = "ChatPermissionError";
  }
}

export class ChatNotFoundError extends Error {
  constructor() {
    super("Conversation was not found.");
    this.name = "ChatNotFoundError";
  }
}

export class ChatConflictError extends Error {
  constructor(message = "This conversation is not accepting messages.") {
    super(message);
    this.name = "ChatConflictError";
  }
}

export class ChatRateLimitError extends Error {
  constructor() {
    super("Too many chat messages. Please wait before retrying.");
    this.name = "ChatRateLimitError";
  }
}

const conversationAccessInclude = {
  visitor: { select: { anonymousId: true } },
  assignments: {
    where: { endedAt: null },
    orderBy: { assignedAt: "desc" as const },
    take: 1,
  },
} as const;

function isPrincipal(actor: ChatVisitorOwner | Principal): actor is Principal {
  return "roles" in actor;
}

function assertAdminRead(principal: Principal, assignment: { assigneeId: string; endedAt: Date | null } | null) {
  if (can(principal, "chat.read.all")) return;
  if (can(principal, "chat.read.assigned", {
    chatAssigneeId: assignment?.assigneeId,
    chatAssignmentActive: assignment?.endedAt === null,
  })) return;
  throw new ChatPermissionError();
}

function assertAdminReply(principal: Principal, assignment: { assigneeId: string; endedAt: Date | null } | null) {
  if (can(principal, "chat.reply.all")) return;
  if (can(principal, "chat.reply.assigned", {
    chatAssigneeId: assignment?.assigneeId,
    chatAssignmentActive: assignment?.endedAt === null,
  })) return;
  throw new ChatPermissionError();
}

function assertVisitorOwner(
  owner: ChatVisitorOwner,
  conversation: { environment: AnalyticsEnvironment; visitor: { anonymousId: string } },
) {
  if (conversation.environment !== owner.environment || conversation.visitor.anonymousId !== owner.anonymousId) {
    throw new ChatPermissionError();
  }
}

function chatMessageOutput(message: {
  id: string;
  clientMessageId: string;
  senderType: "VISITOR" | "AGENT" | "SYSTEM";
  type: "TEXT" | "SYSTEM";
  body: string;
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
}) {
  return {
    id: message.id,
    clientMessageId: message.clientMessageId,
    senderType: message.senderType,
    type: message.type,
    body: message.body,
    sentAt: message.sentAt,
    deliveredAt: message.deliveredAt,
    readAt: message.readAt,
  };
}

export class ChatService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly publisher: RealtimePublisher = publishRealtimeEvent,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async createOrResumeConversation(owner: ChatVisitorOwner, rawInput: unknown) {
    const input = chatConversationInputSchema.parse(rawInput) as ChatConversationInput;
    const now = this.clock();

    return this.database.$transaction(async (transaction) => {
      const visitor = await transaction.analyticsVisitor.upsert({
        where: { environment_anonymousId: { environment: owner.environment, anonymousId: owner.anonymousId } },
        update: { lastSeenAt: now, lastActiveAt: now },
        create: {
          anonymousId: owner.anonymousId,
          environment: owner.environment,
          firstSeenAt: now,
          lastSeenAt: now,
          lastActiveAt: now,
        },
      });
      const existingSession = await transaction.analyticsSession.findUnique({
        where: { environment_sessionKey: { environment: owner.environment, sessionKey: owner.sessionKey } },
      });
      if (existingSession && existingSession.visitorId !== visitor.id) throw new ChatPermissionError();
      const session = existingSession
        ? await transaction.analyticsSession.update({
          where: { id: existingSession.id },
          data: { lastSeenAt: now, lastActiveAt: now },
        })
        : await transaction.analyticsSession.create({
          data: {
            visitorId: visitor.id,
            sessionKey: owner.sessionKey,
            environment: owner.environment,
            startedAt: now,
            lastSeenAt: now,
            lastActiveAt: now,
            landingPath: input.landingPath,
          },
        });

      const existing = await transaction.chatConversation.findFirst({
        where: { visitorId: visitor.id, environment: owner.environment, status: { in: ["OPEN", "PENDING"] } },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      });
      if (existing) {
        return transaction.chatConversation.update({
          where: { id: existing.id },
          data: {
            sessionId: session.id,
            contactName: input.name,
            contactEmail: input.email,
            contactWhatsapp: input.whatsapp,
          },
        });
      }

      const conversation = await transaction.chatConversation.create({
        data: {
          visitorId: visitor.id,
          sessionId: session.id,
          environment: owner.environment,
          contactName: input.name,
          contactEmail: input.email,
          contactWhatsapp: input.whatsapp,
        },
      });
      await transaction.auditLog.create({
        data: {
          action: "chat.conversation.create",
          entityType: "ChatConversation",
          entityId: conversation.id,
          after: { environment: owner.environment, status: conversation.status },
        },
      });
      return conversation;
    });
  }

  async assertVisitorConversation(owner: ChatVisitorOwner, conversationId: string) {
    const conversation = await this.database.chatConversation.findUnique({
      where: { id: conversationId },
      include: { visitor: { select: { anonymousId: true } } },
    });
    if (!conversation) throw new ChatNotFoundError();
    assertVisitorOwner(owner, conversation);
    return conversation;
  }

  async listMessages(actor: ChatVisitorOwner | Principal, conversationId: string, rawQuery: unknown) {
    const query = chatMessageListQuerySchema.parse(rawQuery);
    const conversation = await this.database.chatConversation.findUnique({
      where: { id: conversationId },
      include: conversationAccessInclude,
    });
    if (!conversation) throw new ChatNotFoundError();
    if (isPrincipal(actor)) {
      if (!query.environment || conversation.environment !== query.environment) throw new ChatNotFoundError();
      assertAdminRead(actor, conversation.assignments[0] ?? null);
    } else {
      assertVisitorOwner(actor, conversation);
    }

    if (query.cursor) {
      const cursor = await this.database.chatMessage.findFirst({
        where: { id: query.cursor, conversationId },
        select: { id: true },
      });
      if (!cursor) throw new ChatNotFoundError();
    }
    const rows = await this.database.chatMessage.findMany({
      where: { conversationId },
      orderBy: [{ sentAt: "asc" }, { id: "asc" }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: 51,
      select: {
        id: true,
        clientMessageId: true,
        senderType: true,
        type: true,
        body: true,
        sentAt: true,
        deliveredAt: true,
        readAt: true,
      },
    });
    const hasMore = rows.length > 50;
    const items = rows.slice(0, 50);
    return { items, nextCursor: hasMore ? items.at(-1)?.id ?? null : null };
  }

  async sendVisitorMessage(owner: ChatVisitorOwner, conversationId: string, rawInput: unknown) {
    const input = chatMessageInputSchema.parse(rawInput) as ChatMessageInput;
    return this.persistMessage({ owner, conversationId, input, senderType: "VISITOR" });
  }

  async sendAgentMessage(
    principal: Principal,
    conversationId: string,
    rawInput: unknown,
    environment: AnalyticsEnvironment = currentAnalyticsEnvironment(),
  ) {
    const input = chatMessageInputSchema.parse(rawInput) as ChatMessageInput;
    return this.persistMessage({ principal, conversationId, input, senderType: "AGENT", environment });
  }

  private async persistMessage(input: {
    owner?: ChatVisitorOwner;
    principal?: Principal;
    conversationId: string;
    input: ChatMessageInput;
    senderType: "VISITOR" | "AGENT";
    environment?: AnalyticsEnvironment;
  }) {
    const now = this.clock();
    let persisted: { message: ChatMessage; duplicate: boolean };
    try {
      persisted = await this.database.$transaction(async (transaction) => {
        const conversation = await transaction.chatConversation.findUnique({
          where: { id: input.conversationId },
          include: conversationAccessInclude,
        });
        if (!conversation) throw new ChatNotFoundError();
        if (input.senderType === "VISITOR" && input.owner) {
          assertVisitorOwner(input.owner, conversation);
        } else if (input.principal) {
          if (conversation.environment !== input.environment) throw new ChatNotFoundError();
          assertAdminReply(input.principal, conversation.assignments[0] ?? null);
        } else {
          throw new ChatPermissionError();
        }
        if (conversation.status === "CLOSED" || conversation.status === "SPAM") throw new ChatConflictError();

        const duplicate = await transaction.chatMessage.findUnique({
          where: {
            conversationId_clientMessageId: {
              conversationId: input.conversationId,
              clientMessageId: input.input.clientMessageId,
            },
          },
        });
        if (duplicate) return { message: duplicate, duplicate: true };

        if (input.senderType === "VISITOR") {
          const recentCount = await transaction.chatMessage.count({
            where: {
              conversationId: input.conversationId,
              senderType: "VISITOR",
              sentAt: { gte: new Date(now.getTime() - 60_000) },
            },
          });
          if (recentCount >= 10) throw new ChatRateLimitError();
        }

        const message = await transaction.chatMessage.create({
          data: {
            conversationId: input.conversationId,
            senderType: input.senderType,
            senderUserId: input.principal?.id,
            type: "TEXT",
            clientMessageId: input.input.clientMessageId,
            body: input.input.body,
            sentAt: now,
          },
        });
        await Promise.all([
          transaction.chatConversation.update({
            where: { id: input.conversationId },
            data: {
              lastMessageAt: now,
              agentUnreadCount: input.senderType === "VISITOR" ? { increment: 1 } : undefined,
              visitorUnreadCount: input.senderType === "AGENT" ? { increment: 1 } : undefined,
            },
          }),
          transaction.auditLog.create({
            data: {
              actorId: input.principal?.id,
              action: input.senderType === "VISITOR" ? "chat.message.visitor" : "chat.message.agent",
              entityType: "ChatMessage",
              entityId: message.id,
              after: { conversationId: input.conversationId, senderType: input.senderType },
            },
          }),
        ]);
        return { message, duplicate: false };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const duplicate = await this.database.chatMessage.findUnique({
          where: {
            conversationId_clientMessageId: {
              conversationId: input.conversationId,
              clientMessageId: input.input.clientMessageId,
            },
          },
        });
        if (duplicate) {
          return {
            message: chatMessageOutput(duplicate),
            duplicate: true,
            realtime: { published: false, degraded: false },
          };
        }
      }
      throw error;
    }

    if (persisted.duplicate) {
      return {
        message: chatMessageOutput(persisted.message),
        duplicate: true,
        realtime: { published: false, degraded: false },
      };
    }

    const config = getRealtimeConfig();
    const channel = buildRealtimeChannel(config, "conversation", input.conversationId);
    const event: RealtimeEvent = {
      v: 1,
      id: randomUUID(),
      type: "message.created",
      serverTime: now.toISOString(),
      conversationId: input.conversationId,
      payload: {
        id: persisted.message.id,
        clientMessageId: persisted.message.clientMessageId,
        senderType: persisted.message.senderType,
        type: persisted.message.type,
        body: persisted.message.body,
        sentAt: persisted.message.sentAt.toISOString(),
      },
    };
    try {
      const result = await this.publisher(channel, event);
      return {
        message: chatMessageOutput(persisted.message),
        duplicate: false,
        realtime: { published: result.published, degraded: !result.published },
      };
    } catch {
      return {
        message: chatMessageOutput(persisted.message),
        duplicate: false,
        realtime: { published: false, degraded: true },
      };
    }
  }

  async listAdminConversations(principal: Principal, rawQuery: unknown) {
    const query = adminChatListQuerySchema.parse(rawQuery) as AdminChatListQuery;
    const readAll = can(principal, "chat.read.all");
    const readAssigned = can(principal, "chat.read.assigned", {
      chatAssigneeId: principal.id,
      chatAssignmentActive: true,
    });
    if (!readAll && !readAssigned) throw new ChatPermissionError();
    if (!readAll && query.assigneeId && query.assigneeId !== principal.id) throw new ChatPermissionError();

    const assigneeId = readAll ? query.assigneeId : principal.id;
    const rows = await this.database.chatConversation.findMany({
      where: {
        environment: query.environment,
        status: query.status,
        assignments: assigneeId ? { some: { assigneeId, endedAt: null } } : undefined,
      },
      include: {
        visitor: { select: { id: true, countryCode: true, deviceType: true, lastSeenAt: true } },
        lead: { select: { id: true, name: true, email: true, company: true, status: true } },
        assignments: {
          where: { endedAt: null },
          include: { assignee: { select: { id: true, name: true, email: true } } },
          take: 1,
        },
        messages: { orderBy: [{ sentAt: "desc" }, { id: "desc" }], take: 1 },
      },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      take: 51,
    });
    const hasMore = rows.length > 50;
    const items = rows.slice(0, 50);
    return { items, nextCursor: hasMore ? items.at(-1)?.id ?? null : null };
  }
}
