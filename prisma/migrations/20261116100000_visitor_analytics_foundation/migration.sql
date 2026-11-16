-- CreateEnum
CREATE TYPE "AnalyticsEnvironment" AS ENUM ('DEVELOPMENT', 'TEST', 'PREVIEW', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PRODUCT_VIEW', 'INQUIRY_START', 'INQUIRY_SUBMIT', 'WHATSAPP_CLICK', 'EMAIL_CLICK', 'CATALOG_DOWNLOAD', 'CHAT_STARTED', 'CHAT_MESSAGE_SENT');

-- CreateTable
CREATE TABLE "AnalyticsVisitor" (
    "id" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3),
    "firstSource" JSONB,
    "lastSource" JSONB,
    "countryCode" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "operatingSystem" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "linkedLeadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "landingPath" TEXT NOT NULL,
    "exitPath" TEXT,
    "referrer" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "term" TEXT,
    "content" TEXT,
    "countryCode" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "operatingSystem" TEXT,
    "ipHash" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "pageViewCount" INTEGER NOT NULL DEFAULT 0,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsPageView" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "pageViewKey" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "referrer" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastHeartbeatAt" TIMESTAMP(3),
    "exitedAt" TIMESTAMP(3),
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsPageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pageViewId" TEXT,
    "productId" TEXT,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "eventKey" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "path" TEXT,
    "properties" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSearchEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pageViewId" TEXT,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "eventKey" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER,
    "path" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteSearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsDailySummary" (
    "id" TEXT NOT NULL,
    "environment" "AnalyticsEnvironment" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dimension" TEXT NOT NULL,
    "dimensionValue" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsDailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsVisitor_environment_lastSeenAt_id_idx" ON "AnalyticsVisitor"("environment", "lastSeenAt", "id");

-- CreateIndex
CREATE INDEX "AnalyticsVisitor_linkedLeadId_lastSeenAt_idx" ON "AnalyticsVisitor"("linkedLeadId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsVisitor_environment_anonymousId_key" ON "AnalyticsVisitor"("environment", "anonymousId");

-- CreateIndex
CREATE INDEX "AnalyticsSession_visitorId_startedAt_idx" ON "AnalyticsSession"("visitorId", "startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsSession_environment_lastSeenAt_id_idx" ON "AnalyticsSession"("environment", "lastSeenAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSession_environment_sessionKey_key" ON "AnalyticsSession"("environment", "sessionKey");

-- CreateIndex
CREATE INDEX "AnalyticsPageView_sessionId_startedAt_idx" ON "AnalyticsPageView"("sessionId", "startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsPageView_visitorId_startedAt_idx" ON "AnalyticsPageView"("visitorId", "startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsPageView_productId_startedAt_idx" ON "AnalyticsPageView"("productId", "startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsPageView_environment_startedAt_idx" ON "AnalyticsPageView"("environment", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsPageView_environment_pageViewKey_key" ON "AnalyticsPageView"("environment", "pageViewKey");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_occurredAt_idx" ON "AnalyticsEvent"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_occurredAt_idx" ON "AnalyticsEvent"("visitorId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_occurredAt_idx" ON "AnalyticsEvent"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_occurredAt_idx" ON "AnalyticsEvent"("productId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsEvent_environment_eventKey_key" ON "AnalyticsEvent"("environment", "eventKey");

-- CreateIndex
CREATE INDEX "SiteSearchEvent_sessionId_occurredAt_idx" ON "SiteSearchEvent"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "SiteSearchEvent_visitorId_occurredAt_idx" ON "SiteSearchEvent"("visitorId", "occurredAt");

-- CreateIndex
CREATE INDEX "SiteSearchEvent_query_occurredAt_idx" ON "SiteSearchEvent"("query", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSearchEvent_environment_eventKey_key" ON "SiteSearchEvent"("environment", "eventKey");

-- CreateIndex
CREATE INDEX "AnalyticsDailySummary_environment_date_idx" ON "AnalyticsDailySummary"("environment", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsDailySummary_environment_date_dimension_dimensionV_key" ON "AnalyticsDailySummary"("environment", "date", "dimension", "dimensionValue");

-- AddForeignKey
ALTER TABLE "AnalyticsVisitor" ADD CONSTRAINT "AnalyticsVisitor_linkedLeadId_fkey" FOREIGN KEY ("linkedLeadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_pageViewId_fkey" FOREIGN KEY ("pageViewId") REFERENCES "AnalyticsPageView"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSearchEvent" ADD CONSTRAINT "SiteSearchEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSearchEvent" ADD CONSTRAINT "SiteSearchEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSearchEvent" ADD CONSTRAINT "SiteSearchEvent_pageViewId_fkey" FOREIGN KEY ("pageViewId") REFERENCES "AnalyticsPageView"("id") ON DELETE SET NULL ON UPDATE CASCADE;
