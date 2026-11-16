import "server-only";

import { Prisma, type AnalyticsEnvironment, type PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";
import type { AnalyticsBatch, FirstPartyAnalyticsEvent } from "@/lib/validation/first-party-analytics";

export type AnalyticsCollectionIdentity = {
  visitorId: string;
  sessionId: string;
};

export type AnalyticsCollectionContext = {
  environment: AnalyticsEnvironment;
  now: Date;
  countryCode?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  ipHash?: string;
  isBot: boolean;
};

export class AnalyticsEventTimeError extends Error {
  constructor() {
    super("Analytics event time is outside the accepted retry window.");
    this.name = "AnalyticsEventTimeError";
  }
}

type Source = {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
};

function extractSource(path: string, referrer?: string): Source {
  const url = new URL(path, "https://www.zyroncnc.com");
  const campaignSource = url.searchParams.get("utm_source")?.trim();
  if (campaignSource) {
    return {
      source: campaignSource.slice(0, 200),
      medium: (url.searchParams.get("utm_medium")?.trim() || "campaign").slice(0, 200),
      ...(url.searchParams.get("utm_campaign")?.trim()
        ? { campaign: url.searchParams.get("utm_campaign")!.trim().slice(0, 200) }
        : {}),
      ...(url.searchParams.get("utm_term")?.trim()
        ? { term: url.searchParams.get("utm_term")!.trim().slice(0, 200) }
        : {}),
      ...(url.searchParams.get("utm_content")?.trim()
        ? { content: url.searchParams.get("utm_content")!.trim().slice(0, 200) }
        : {}),
    };
  }
  if (referrer) {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.hostname !== "www.zyroncnc.com" && referrerUrl.hostname !== "zyroncnc.com") {
      return { source: referrerUrl.hostname.slice(0, 200), medium: "referral" };
    }
  }
  return { source: "direct", medium: "none" };
}

function firstPageView(batch: AnalyticsBatch) {
  return batch.events.find((event): event is Extract<FirstPartyAnalyticsEvent, { kind: "page_view" }> => (
    event.kind === "page_view"
  ));
}

function prismaJson(value: Record<string, string> | undefined) {
  return value as Prisma.InputJsonValue | undefined;
}

async function serializable<T>(database: PrismaClient, work: (transaction: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await database.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const retryable = (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
        || (error instanceof Error && error.message.includes("TransactionWriteConflict"));
      if (!retryable || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 5));
    }
  }
  throw new Error("Analytics transaction exhausted retries.");
}

export class FirstPartyAnalyticsService {
  constructor(private readonly database: PrismaClient = db) {}

  async collectAnalyticsBatch(
    identity: AnalyticsCollectionIdentity,
    batch: AnalyticsBatch,
    context: AnalyticsCollectionContext,
  ) {
    const earliest = context.now.getTime() - 24 * 60 * 60 * 1_000;
    const latest = context.now.getTime() + 5 * 60 * 1_000;
    if (batch.events.some(({ occurredAt }) => occurredAt.getTime() < earliest || occurredAt.getTime() > latest)) {
      throw new AnalyticsEventTimeError();
    }
    return serializable(this.database, async (transaction) => {
      const landingEvent = firstPageView(batch);
      const source = extractSource(landingEvent?.path ?? "/", landingEvent?.referrer);
      const visitor = await transaction.analyticsVisitor.upsert({
        where: {
          environment_anonymousId: {
            environment: context.environment,
            anonymousId: identity.visitorId,
          },
        },
        create: {
          anonymousId: identity.visitorId,
          environment: context.environment,
          firstSeenAt: context.now,
          lastSeenAt: context.now,
          lastActiveAt: context.now,
          firstSource: prismaJson(source),
          lastSource: prismaJson(source),
          countryCode: context.countryCode,
          region: context.region,
          city: context.city,
          deviceType: context.deviceType,
          browser: context.browser,
          operatingSystem: context.operatingSystem,
          isBot: context.isBot,
        },
        update: {
          lastSeenAt: context.now,
          lastActiveAt: context.now,
          lastSource: landingEvent ? prismaJson(source) : undefined,
          countryCode: context.countryCode,
          region: context.region,
          city: context.city,
          deviceType: context.deviceType,
          browser: context.browser,
          operatingSystem: context.operatingSystem,
          isBot: context.isBot,
        },
      });
      const existingSession = await transaction.analyticsSession.findUnique({
        where: {
          environment_sessionKey: {
            environment: context.environment,
            sessionKey: identity.sessionId,
          },
        },
      });
      if (existingSession && existingSession.visitorId !== visitor.id) {
        throw new Error("Analytics session does not belong to the current visitor.");
      }
      const session = existingSession
        ? await transaction.analyticsSession.update({
          where: { id: existingSession.id },
          data: {
            lastSeenAt: context.now,
            lastActiveAt: context.now,
            exitPath: batch.events.at(-1)?.path,
          },
        })
        : await transaction.analyticsSession.create({
          data: {
            visitorId: visitor.id,
            sessionKey: identity.sessionId,
            environment: context.environment,
            startedAt: context.now,
            lastSeenAt: context.now,
            lastActiveAt: context.now,
            landingPath: landingEvent?.path ?? batch.events[0]?.path ?? "/",
            exitPath: batch.events.at(-1)?.path,
            referrer: landingEvent?.referrer,
            ...source,
            countryCode: context.countryCode,
            region: context.region,
            city: context.city,
            deviceType: context.deviceType,
            browser: context.browser,
            operatingSystem: context.operatingSystem,
            ipHash: context.ipHash,
            isBot: context.isBot,
          },
        });

      let accepted = 0;
      let duplicates = 0;
      const productIds = new Map<string, string | null>();
      const productId = async (slug: string | undefined) => {
        if (!slug) return null;
        if (!productIds.has(slug)) {
          const product = await transaction.product.findUnique({ where: { slug }, select: { id: true } });
          productIds.set(slug, product?.id ?? null);
        }
        return productIds.get(slug) ?? null;
      };

      for (const event of batch.events) {
        if (event.kind === "page_view") {
          const existing = await transaction.analyticsPageView.findUnique({
            where: {
              environment_pageViewKey: {
                environment: context.environment,
                pageViewKey: event.pageViewId,
              },
            },
          });
          if (existing) {
            duplicates += 1;
            continue;
          }
          await transaction.analyticsPageView.create({
            data: {
              visitorId: visitor.id,
              sessionId: session.id,
              productId: await productId(event.productSlug),
              environment: context.environment,
              pageViewKey: event.pageViewId,
              path: event.path,
              title: event.title,
              referrer: event.referrer,
              startedAt: event.occurredAt,
            },
          });
          await transaction.analyticsSession.update({
            where: { id: session.id },
            data: { pageViewCount: { increment: 1 } },
          });
          accepted += 1;
          continue;
        }

        if (event.kind === "event") {
          const existing = await transaction.analyticsEvent.findUnique({
            where: {
              environment_eventKey: {
                environment: context.environment,
                eventKey: event.eventId,
              },
            },
          });
          if (existing) {
            duplicates += 1;
            continue;
          }
          const pageView = event.pageViewId ? await transaction.analyticsPageView.findUnique({
            where: {
              environment_pageViewKey: {
                environment: context.environment,
                pageViewKey: event.pageViewId,
              },
            },
            select: { id: true, visitorId: true, sessionId: true },
          }) : null;
          if (pageView && (pageView.visitorId !== visitor.id || pageView.sessionId !== session.id)) {
            throw new Error("Analytics page view does not belong to the current session.");
          }
          await transaction.analyticsEvent.create({
            data: {
              visitorId: visitor.id,
              sessionId: session.id,
              pageViewId: pageView?.id,
              productId: await productId(event.productSlug),
              environment: context.environment,
              eventKey: event.eventId,
              type: event.eventType,
              path: event.path,
              properties: event.properties as Prisma.InputJsonValue | undefined,
              occurredAt: event.occurredAt,
            },
          });
          await transaction.analyticsSession.update({
            where: { id: session.id },
            data: { eventCount: { increment: 1 } },
          });
          accepted += 1;
          continue;
        }

        const pageView = await transaction.analyticsPageView.findUnique({
          where: {
            environment_pageViewKey: {
              environment: context.environment,
              pageViewKey: event.pageViewId,
            },
          },
        });
        if (!pageView || pageView.visitorId !== visitor.id || pageView.sessionId !== session.id) {
          throw new Error("Analytics activity references an unknown page view.");
        }
        const alreadyApplied = event.activeSeconds <= pageView.activeSeconds
          && event.occurredAt <= (pageView.lastHeartbeatAt ?? pageView.startedAt);
        if (alreadyApplied) {
          duplicates += 1;
          continue;
        }
        await transaction.analyticsPageView.update({
          where: { id: pageView.id },
          data: {
            activeSeconds: Math.max(pageView.activeSeconds, event.activeSeconds),
            lastHeartbeatAt: event.occurredAt > (pageView.lastHeartbeatAt ?? pageView.startedAt)
              ? event.occurredAt
              : pageView.lastHeartbeatAt,
            exitedAt: event.kind === "page_exit" ? event.occurredAt : undefined,
          },
        });
        accepted += 1;
      }

      return { accepted, duplicates };
    });
  }
}

export function collectAnalyticsBatch(
  identity: AnalyticsCollectionIdentity,
  batch: AnalyticsBatch,
  context: AnalyticsCollectionContext,
) {
  return new FirstPartyAnalyticsService().collectAnalyticsBatch(identity, batch, context);
}
