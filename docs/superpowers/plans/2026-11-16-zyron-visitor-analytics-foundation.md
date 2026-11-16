# ZYRON Visitor Analytics Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the privacy-aware first-party visitor, session, page-view, event, online-presence, and daily-summary foundation without changing existing public URLs.

**Architecture:** PostgreSQL is the source of truth; signed first-party cookies identify anonymous visitors and sessions; the browser sends consent-gated idempotent event batches; Redis is optional in this phase and the database remains sufficient for persisted analytics. Services and route handlers follow the existing validation/RBAC/error-response patterns.

**Tech Stack:** Next.js 15 Route Handlers, React 19, TypeScript, Prisma 7/PostgreSQL, Zod 4, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-zyron-analytics-crm-realtime-design.md`

## Global Constraints

- Do not attribute GA4/GSC aggregate data to individuals.
- Collect first-party analytics only after Analytics consent; chat remains independent.
- Never persist raw IP addresses or PII in analytics event properties.
- Online means seen within 120 seconds; active means active within 5 minutes; heartbeat cadence is 30 seconds while visible and active.
- Builds run `prisma generate` only; migrations run separately with `prisma migrate deploy`.
- No fake visitors, events, customers, or production seeds.

## Review Focus

- Duplicate retries: identical event IDs must produce one persisted record and one count (Task 3 integration test).
- Multi-tab activity: two tabs must not create two visitor identities or inflate online visitors (Task 4 unit/E2E tests).
- Consent transitions: no event before acceptance; acceptance starts collection once; revocation stops future collection (Task 4 unit/E2E tests).
- Bot and preview traffic: bot traffic is stored as excluded and Preview never mixes with Production (Task 3 integration tests).
- Clock and inactivity boundaries: exactly 120 seconds online, 5 minutes active, and 30-minute session rotation are deterministic (Task 2 unit tests).

---

### Task 1: Analytics Schema and Safe Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261116100000_visitor_analytics_foundation/migration.sql`
- Modify: `lib/auth/permissions.ts`
- Modify: `prisma/seed-rbac.ts`
- Modify: `tests/unit/auth/permissions.test.ts`
- Modify: `tests/unit/prisma/seed-rbac-entrypoint.test.ts`
- Modify: `tests/integration/db/foundation.test.ts`

**Interfaces:**
- Consumes: Existing `Lead`, `Product`, and Prisma client conventions.
- Produces: Prisma models `AnalyticsVisitor`, `AnalyticsSession`, `AnalyticsPageView`, `AnalyticsEvent`, `SiteSearchEvent`, `AnalyticsDailySummary`; enums `AnalyticsEventType` and `AnalyticsEnvironment`; permissions `analytics.read.summary`, `analytics.read.visitors`, and `analytics.export`.

- [ ] **Step 1: Add failing schema integration assertions**

Assert required tables, foreign keys, unique idempotency keys, nullable Lead/Product links, indexes on last-seen/timeline queries, permission scope, and idempotent RBAC seeding.

- [ ] **Step 2: Run the database foundation test and verify RED**

Run: `npm test -- tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts && npm run test:integration -- tests/integration/db/foundation.test.ts`  
Expected: FAIL because analytics tables and permissions do not exist.

- [ ] **Step 3: Add the Prisma models and generated migration**

Use append-only event/page-view rows, mutable visitor/session aggregates, and JSON only for allowlisted source/event metadata. Add the three permissions to SUPER_ADMIN/ADMIN without expanding editor or sales roles. Do not edit an already-applied migration.

- [ ] **Step 4: Apply migration to the test database and verify GREEN**

Run: `npm run db:migrate:test && npm test -- tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts && npm run test:integration -- tests/integration/db/foundation.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/auth/permissions.ts prisma/seed-rbac.ts tests/unit/auth/permissions.test.ts tests/unit/prisma/seed-rbac-entrypoint.test.ts tests/integration/db/foundation.test.ts
git commit -m "feat: add visitor analytics data foundation"
```

### Task 2: Anonymous Identity and Analytics Rules

**Files:**
- Create: `lib/analytics/first-party/identity.ts`
- Create: `lib/analytics/first-party/rules.ts`
- Create: `lib/analytics/first-party/types.ts`
- Create: `tests/unit/analytics/first-party-identity.test.ts`
- Create: `tests/unit/analytics/first-party-rules.test.ts`

**Interfaces:**
- Consumes: `SESSION_SECRET`, request cookies, and normalized request metadata.
- Produces: `readOrCreateAnalyticsIdentity(request, now): AnalyticsIdentityResult`, `isOnline(lastSeenAt, now): boolean`, `isActive(lastActiveAt, now): boolean`, `shouldRotateSession(lastSeenAt, now): boolean`, `hashNetworkKey(value, month): string`.

- [ ] **Step 1: Write failing tests for signed IDs and exact time boundaries**

Cover tampered cookies, secure cookie attributes, 120-second/5-minute inclusivity, 30-minute rotation, and monthly hash rotation without exposing the input.

- [ ] **Step 2: Run identity/rules tests and verify RED**

Run: `npm test -- tests/unit/analytics/first-party-identity.test.ts tests/unit/analytics/first-party-rules.test.ts`  
Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement the smallest identity and rule modules**

Cookies contain random opaque IDs plus an HMAC signature. Raw IP and complete user-agent strings never appear in return types intended for persistence.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- tests/unit/analytics/first-party-identity.test.ts tests/unit/analytics/first-party-rules.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/analytics/first-party tests/unit/analytics/first-party-identity.test.ts tests/unit/analytics/first-party-rules.test.ts
git commit -m "feat: add signed anonymous analytics identity"
```

### Task 3: Idempotent Collection Service and API

**Files:**
- Create: `lib/validation/first-party-analytics.ts`
- Create: `lib/services/first-party-analytics-service.ts`
- Create: `lib/http/first-party-analytics-response.ts`
- Create: `app/api/analytics/collect/route.ts`
- Create: `tests/unit/analytics/first-party-validation.test.ts`
- Create: `tests/unit/analytics/first-party-route.test.ts`
- Create: `tests/integration/analytics/first-party-ingest.test.ts`

**Interfaces:**
- Consumes: Task 1 models and Task 2 identity/rules.
- Produces: `collectAnalyticsBatch(identity, batch, context): Promise<CollectResult>` and `POST /api/analytics/collect` accepting at most 20 events and 16KB.

- [ ] **Step 1: Write failing validation, route, and integration tests**

Assert event-property whitelist, no PII keys, invalid origin rejection, idempotent retries, bot/environment separation, product linking, and no database writes without consent proof.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/unit/analytics/first-party-validation.test.ts tests/unit/analytics/first-party-route.test.ts && npm run test:integration -- tests/integration/analytics/first-party-ingest.test.ts`  
Expected: FAIL because collector modules and route do not exist.

- [ ] **Step 3: Implement validation, service, response mapping, and route**

Use a transaction for visitor/session upsert and events, unique keys for retry safety, trusted Vercel headers for geography, normalized device fields, and `AnalyticsEnvironment` from the deployment environment.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/unit/analytics/first-party-validation.test.ts tests/unit/analytics/first-party-route.test.ts && npm run test:integration -- tests/integration/analytics/first-party-ingest.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/analytics lib/http/first-party-analytics-response.ts lib/services/first-party-analytics-service.ts lib/validation/first-party-analytics.ts tests/unit/analytics tests/integration/analytics
git commit -m "feat: ingest first-party analytics events"
```

### Task 4: Consent-Gated Browser Tracker

**Files:**
- Create: `lib/analytics/first-party/client.ts`
- Create: `components/analytics/FirstPartyAnalyticsTracker.tsx`
- Modify: `components/analytics/AnalyticsConsentProvider.tsx`
- Modify: `app/(site)/layout.tsx`
- Create: `tests/unit/analytics/first-party-client.test.ts`
- Create: `tests/unit/analytics/first-party-tracker.test.tsx`
- Modify: `tests/e2e/public-analytics-consent.spec.ts`

**Interfaces:**
- Consumes: `POST /api/analytics/collect` and existing consent events.
- Produces: `enqueueFirstPartyEvent(event): boolean`, batched flush, visible/active 30-second heartbeat, pagehide beacon, and BroadcastChannel tab coordination.

- [ ] **Step 1: Write failing client, component, and browser tests**

Assert no requests before consent, exactly one page view after acceptance, stop after revocation, hidden-tab pause, route-change page view, multi-tab shared identity, and retry with stable event IDs.

- [ ] **Step 2: Run unit tests and verify RED**

Run: `npm test -- tests/unit/analytics/first-party-client.test.ts tests/unit/analytics/first-party-tracker.test.tsx`  
Expected: FAIL because tracker code does not exist.

- [ ] **Step 3: Implement the client queue and tracker component**

Keep analytics payloads PII-free. Do not block navigation; use `sendBeacon` only for final flush and cap client buffering.

- [ ] **Step 4: Run unit and consent E2E tests and verify GREEN**

Run: `npm test -- tests/unit/analytics/first-party-client.test.ts tests/unit/analytics/first-party-tracker.test.tsx && npm run test:e2e -- tests/e2e/public-analytics-consent.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/analytics/first-party/client.ts components/analytics/FirstPartyAnalyticsTracker.tsx components/analytics/AnalyticsConsentProvider.tsx app/'(site)'/layout.tsx tests/unit/analytics tests/e2e/public-analytics-consent.spec.ts
git commit -m "feat: track consented visitor activity"
```

### Task 5: Analytics Query Service and Phase Verification

**Files:**
- Create: `lib/services/visitor-analytics-query-service.ts`
- Create: `tests/integration/analytics/visitor-query-service.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Task 1 analytics models and Task 2 time rules.
- Produces: `getRealtimeSummary(now, environment)`, `listVisitors(query, principal)`, `getVisitorTimeline(visitorId, principal)`, and documented environment names.

- [ ] **Step 1: Write failing query-service tests**

Assert bot exclusion, environment isolation, online/active thresholds, stable pagination, source filters, and permission denial.

- [ ] **Step 2: Run integration test and verify RED**

Run: `npm run test:integration -- tests/integration/analytics/visitor-query-service.test.ts`  
Expected: FAIL because query service does not exist.

- [ ] **Step 3: Implement indexed query service and environment documentation**

Keep GA4/GSC types separate from first-party visitor types.

- [ ] **Step 4: Run complete phase verification**

Run: `npm run typecheck && npm run lint && npm test && npm run test:integration && npm run build`  
Expected: all commands PASS; build performs no migration or seed.

- [ ] **Step 5: Commit**

```bash
git add lib/services/visitor-analytics-query-service.ts tests/integration/analytics/visitor-query-service.test.ts .env.example
git commit -m "feat: query realtime visitor analytics"
```

