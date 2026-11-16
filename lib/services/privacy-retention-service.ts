import "server-only";

import { createHash } from "node:crypto";

import { Prisma, type AnalyticsEnvironment, type PrismaClient } from "@prisma/client";

import { can, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";

type RetentionOptions = { rawDays: number; summaryDays: number; chatDays: number; batchSize: number };

export class PrivacyPermissionError extends Error {
  constructor() { super("Analytics deletion permission is required."); this.name = "PrivacyPermissionError"; }
}

export class PrivacyVisitorNotFoundError extends Error {
  constructor() { super("Analytics visitor was not found."); this.name = "PrivacyVisitorNotFoundError"; }
}

function positiveInteger(value: string | undefined, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
}

function defaultOptions(): RetentionOptions {
  return {
    rawDays: positiveInteger(process.env.ANALYTICS_RAW_RETENTION_DAYS, 180, 3_650),
    summaryDays: positiveInteger(process.env.ANALYTICS_SUMMARY_RETENTION_DAYS, 730, 7_300),
    chatDays: positiveInteger(process.env.CHAT_RETENTION_DAYS, 730, 3_650),
    batchSize: positiveInteger(process.env.PRIVACY_RETENTION_BATCH_SIZE, 250, 1_000),
  };
}

function cutoff(now: Date, days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1_000);
}

function deletionReference(visitorId: string) {
  return createHash("sha256").update(`zyron-visitor-delete:${visitorId}`).digest("hex").slice(0, 24);
}

export class PrivacyRetentionService {
  private readonly options: RetentionOptions;

  constructor(private readonly database: PrismaClient = db, options?: Partial<RetentionOptions>) {
    this.options = { ...defaultOptions(), ...options };
  }

  async applyRetention(now: Date, environment: AnalyticsEnvironment) {
    if (Number.isNaN(now.getTime())) throw new TypeError("A valid retention timestamp is required.");
    const rawCutoff = cutoff(now, this.options.rawDays);
    const summaryCutoff = cutoff(now, this.options.summaryDays);
    const chatCutoff = cutoff(now, this.options.chatDays);
    let chatsDeleted = 0;
    let visitorsDeleted = 0;
    let summariesDeleted = 0;

    for (;;) {
      const staleChats = await this.database.chatConversation.findMany({
        where: {
          environment,
          OR: [
            { lastMessageAt: { lt: chatCutoff } },
            { lastMessageAt: null, createdAt: { lt: chatCutoff } },
          ],
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: this.options.batchSize,
        select: { id: true },
      });
      if (staleChats.length === 0) break;
      const result = await this.database.chatConversation.deleteMany({ where: { id: { in: staleChats.map(({ id }) => id) }, environment } });
      chatsDeleted += result.count;
      if (staleChats.length < this.options.batchSize) break;
    }

    for (;;) {
      const staleVisitors = await this.database.analyticsVisitor.findMany({
        where: {
          environment,
          lastSeenAt: { lt: rawCutoff },
          OR: [{ sessions: { some: {} } }, { chatConversations: { none: {} } }],
        },
        orderBy: [{ lastSeenAt: "asc" }, { id: "asc" }],
        take: this.options.batchSize,
        select: { id: true },
      });
      if (staleVisitors.length === 0) break;
      const ids = staleVisitors.map(({ id }) => id);
      const deleted = await this.database.$transaction(async (transaction) => {
        await transaction.analyticsSession.deleteMany({ where: { visitorId: { in: ids }, environment } });
        return transaction.analyticsVisitor.deleteMany({
          where: { id: { in: ids }, environment, chatConversations: { none: {} } },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      visitorsDeleted += deleted.count;
      if (staleVisitors.length < this.options.batchSize) break;
    }

    for (;;) {
      const staleSummaries = await this.database.analyticsDailySummary.findMany({
        where: { environment, date: { lt: summaryCutoff } },
        orderBy: [{ date: "asc" }, { id: "asc" }],
        take: this.options.batchSize,
        select: { id: true },
      });
      if (staleSummaries.length === 0) break;
      const result = await this.database.analyticsDailySummary.deleteMany({
        where: { id: { in: staleSummaries.map(({ id }) => id) }, environment },
      });
      summariesDeleted += result.count;
      if (staleSummaries.length < this.options.batchSize) break;
    }

    await this.database.auditLog.create({
      data: {
        action: "privacy.retention.apply",
        entityType: "AnalyticsEnvironment",
        entityId: environment,
        after: { visitorsDeleted, chatsDeleted, summariesDeleted, rawDays: this.options.rawDays, summaryDays: this.options.summaryDays, chatDays: this.options.chatDays },
      },
    });
    return { environment, visitorsDeleted, chatsDeleted, summariesDeleted };
  }

  async deleteVisitorData(visitorId: string, environment: AnalyticsEnvironment, principal: Principal) {
    if (!can(principal, "analytics.delete")) throw new PrivacyPermissionError();
    return this.database.$transaction(async (transaction) => {
      const visitor = await transaction.analyticsVisitor.findFirst({
        where: { id: visitorId, environment },
        select: { id: true, linkedLeadId: true, _count: { select: { sessions: true, pageViews: true, events: true, chatConversations: true } } },
      });
      if (!visitor) throw new PrivacyVisitorNotFoundError();
      await transaction.analyticsVisitor.delete({ where: { id: visitor.id } });
      await transaction.auditLog.create({
        data: {
          actorId: principal.id,
          action: "analytics.visitor.delete",
          entityType: "AnalyticsVisitorDeletion",
          entityId: deletionReference(visitor.id),
          after: {
            sessionsDeleted: visitor._count.sessions,
            pageViewsDeleted: visitor._count.pageViews,
            eventsDeleted: visitor._count.events,
            chatsDeleted: visitor._count.chatConversations,
            leadPreserved: Boolean(visitor.linkedLeadId),
          },
        },
      });
      return { deleted: true as const, chatsDeleted: visitor._count.chatConversations, leadPreserved: Boolean(visitor.linkedLeadId) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}
