import "server-only";

import { Prisma, type AnalyticsEnvironment, type PrismaClient } from "@prisma/client";

import { isActive, isOnline } from "@/lib/analytics/first-party/rules";
import { can, type Permission, type Principal } from "@/lib/auth/permissions";
import { db } from "@/lib/db/client";

export class VisitorAnalyticsPermissionError extends Error {
  constructor(permission: Permission) {
    super(`Missing required permission: ${permission}`);
    this.name = "VisitorAnalyticsPermissionError";
  }
}

export class VisitorAnalyticsNotFoundError extends Error {
  constructor() {
    super("Analytics visitor was not found.");
    this.name = "VisitorAnalyticsNotFoundError";
  }
}

export type VisitorStatusFilter = "online" | "active" | "offline";

export type VisitorListQuery = {
  environment: AnalyticsEnvironment;
  page: number;
  pageSize: number;
  source?: string;
  countryCode?: string;
  deviceType?: string;
  status?: VisitorStatusFilter;
  productId?: string;
};

function assertPermission(principal: Principal, permission: Permission) {
  if (!can(principal, permission)) throw new VisitorAnalyticsPermissionError(permission);
}

function utcDayStart(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function onlineCutoff(now: Date) {
  const boundary = new Date(now.getTime() - 120_000);
  return isOnline(boundary, now) ? boundary : new Date(boundary.getTime() + 1);
}

function activeCutoff(now: Date) {
  const boundary = new Date(now.getTime() - 5 * 60_000);
  return isActive(boundary, now) ? boundary : new Date(boundary.getTime() + 1);
}

function visitorWhere(query: VisitorListQuery, now: Date): Prisma.AnalyticsVisitorWhereInput {
  const statusWhere: Prisma.AnalyticsVisitorWhereInput = query.status === "online"
    ? { lastSeenAt: { gte: onlineCutoff(now) } }
    : query.status === "active"
      ? { lastActiveAt: { gte: activeCutoff(now) } }
      : query.status === "offline"
        ? { lastSeenAt: { lt: onlineCutoff(now) } }
        : {};
  return {
    environment: query.environment,
    isBot: false,
    ...statusWhere,
    countryCode: query.countryCode,
    deviceType: query.deviceType,
    firstSource: query.source ? { path: ["source"], equals: query.source } : undefined,
    pageViews: query.productId ? { some: { productId: query.productId } } : undefined,
  };
}

export class VisitorAnalyticsQueryService {
  constructor(private readonly database: PrismaClient = db) {}

  async getRealtimeSummary(
    principal: Principal,
    now: Date,
    environment: AnalyticsEnvironment,
  ) {
    assertPermission(principal, "analytics.read.summary");
    const dayStart = utcDayStart(now);
    const [onlineVisitors, activeVisitors, visitorsToday, sessionsToday, pageViewsToday] = await this.database.$transaction([
      this.database.analyticsVisitor.count({
        where: { environment, isBot: false, lastSeenAt: { gte: onlineCutoff(now) } },
      }),
      this.database.analyticsVisitor.count({
        where: { environment, isBot: false, lastActiveAt: { gte: activeCutoff(now) } },
      }),
      this.database.analyticsVisitor.count({
        where: { environment, isBot: false, firstSeenAt: { gte: dayStart, lte: now } },
      }),
      this.database.analyticsSession.count({
        where: { environment, isBot: false, startedAt: { gte: dayStart, lte: now } },
      }),
      this.database.analyticsPageView.count({
        where: {
          environment,
          startedAt: { gte: dayStart, lte: now },
          session: { isBot: false },
        },
      }),
    ]);
    return { onlineVisitors, activeVisitors, visitorsToday, sessionsToday, pageViewsToday };
  }

  async listVisitors(principal: Principal, query: VisitorListQuery, now = new Date()) {
    assertPermission(principal, "analytics.read.visitors");
    const page = Math.max(1, Math.trunc(query.page));
    const pageSize = Math.min(100, Math.max(1, Math.trunc(query.pageSize)));
    const where = visitorWhere({ ...query, page, pageSize }, now);
    const [items, total] = await this.database.$transaction([
      this.database.analyticsVisitor.findMany({
        where,
        select: {
          id: true,
          environment: true,
          firstSeenAt: true,
          lastSeenAt: true,
          lastActiveAt: true,
          firstSource: true,
          lastSource: true,
          countryCode: true,
          region: true,
          city: true,
          deviceType: true,
          browser: true,
          operatingSystem: true,
          linkedLead: { select: { id: true, name: true, email: true, company: true, status: true } },
          _count: { select: { sessions: true, pageViews: true, events: true } },
        },
        orderBy: [{ lastSeenAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.database.analyticsVisitor.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getVisitorTimeline(principal: Principal, visitorId: string) {
    assertPermission(principal, "analytics.read.visitors");
    const visitor = await this.database.analyticsVisitor.findFirst({
      where: { id: visitorId, isBot: false },
      select: {
        id: true,
        environment: true,
        firstSeenAt: true,
        lastSeenAt: true,
        lastActiveAt: true,
        firstSource: true,
        lastSource: true,
        countryCode: true,
        region: true,
        city: true,
        deviceType: true,
        browser: true,
        operatingSystem: true,
        linkedLead: { select: { id: true, name: true, email: true, company: true, status: true } },
        sessions: {
          orderBy: [{ startedAt: "desc" }, { id: "desc" }],
          select: {
            id: true,
            startedAt: true,
            lastSeenAt: true,
            lastActiveAt: true,
            endedAt: true,
            landingPath: true,
            exitPath: true,
            referrer: true,
            source: true,
            medium: true,
            campaign: true,
            countryCode: true,
            deviceType: true,
            browser: true,
            operatingSystem: true,
            pageViews: {
              orderBy: [{ startedAt: "asc" }, { id: "asc" }],
              select: {
                id: true,
                path: true,
                title: true,
                referrer: true,
                startedAt: true,
                lastHeartbeatAt: true,
                exitedAt: true,
                activeSeconds: true,
                product: { select: { id: true, name: true, slug: true } },
              },
            },
            events: {
              orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
              select: {
                id: true,
                type: true,
                path: true,
                properties: true,
                occurredAt: true,
                product: { select: { id: true, name: true, slug: true } },
              },
            },
            siteSearches: {
              orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
              select: { id: true, query: true, resultCount: true, path: true, occurredAt: true },
            },
          },
        },
      },
    });
    if (!visitor) throw new VisitorAnalyticsNotFoundError();
    return visitor;
  }
}
