# ZYRON Analytics CRM Production Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete visitor CRM reporting, daily aggregation, retention/deletion controls, performance validation, Preview acceptance, and an explicitly approved safe production rollout.

**Architecture:** Daily summary rows serve long-range reporting while recent visitor journeys remain queryable from detail tables; retention jobs are authenticated and idempotent; release verification uses a separate Preview database/Redis namespace before any production migration. Deployment never replaces the healthy production version until Preview and migration preflight pass.

**Tech Stack:** Next.js 15, Prisma/PostgreSQL, Vercel Cron/Functions, Upstash Redis, Vitest, Playwright, Vercel CLI/API.

**Spec:** `docs/superpowers/specs/2026-11-16-zyron-analytics-crm-realtime-design.md`

## Global Constraints

- Raw analytics retention defaults to 180 days, summaries to 730 days, and chats to 24 months.
- Deletion is explicit, permission-checked, transactional where possible, and audited without copying deleted PII into the audit record.
- Preview and Production databases/Redis namespaces are isolated.
- Production migrations are `prisma migrate deploy`; never use reset, force reset, or unapproved destructive SQL.
- No production deployment until the user approves the deployment window after Preview acceptance.

## Review Focus

- Timezone/day boundaries: daily summaries use UTC storage and deterministic reporting-day conversion (Task 1 tests).
- Retention reruns: repeated or interrupted jobs must not over-delete, fail on missing rows, or touch Leads (Task 3 tests).
- Large exports: bounded memory, CSV injection safety, and permission-scoped rows (Task 2 tests).
- Preview isolation: test data, cookies, Redis keys, and environment variables must not touch Production (Task 4 checks).
- Rollback safety: a failed migration/deploy must leave the current production alias and data intact (Task 5 checklist).

---

### Task 1: Daily Summary and Reporting Service

**Files:**
- Create: `lib/services/analytics-summary-service.ts`
- Create: `app/api/internal/analytics/summarize/route.ts`
- Create: `tests/unit/analytics/summary-route.test.ts`
- Create: `tests/integration/analytics/summary-service.test.ts`

**Interfaces:**
- Consumes: analytics detail models and `AnalyticsDailySummary`.
- Produces: `summarizeDay(day, environment): Promise<SummaryResult>` and authenticated idempotent internal route.

- [ ] **Step 1: Write failing aggregation/idempotency tests**

Assert UTC boundaries, source/country/device/product dimensions, bot exclusion, unique visitor/session counts, rerun replacement/upsert behavior, and invalid internal authorization.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/unit/analytics/summary-route.test.ts && npm run test:integration -- tests/integration/analytics/summary-service.test.ts`  
Expected: FAIL because summary service/route do not exist.

- [ ] **Step 3: Implement bounded aggregation and route**

Aggregate one day/environment per transaction and store versioned metric JSON; never scan unbounded history.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- tests/unit/analytics/summary-route.test.ts && npm run test:integration -- tests/integration/analytics/summary-service.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/analytics-summary-service.ts app/api/internal/analytics/summarize/route.ts tests/unit/analytics/summary-route.test.ts tests/integration/analytics/summary-service.test.ts
git commit -m "feat: add daily analytics summaries"
```

### Task 2: Visitor CRM Reports and Exports

**Files:**
- Create: `app/admin/analytics/reports/page.tsx`
- Create: `components/admin/analytics/reports/AnalyticsReports.tsx`
- Create: `app/api/admin/analytics/reports/route.ts`
- Create: `app/api/admin/analytics/reports/export/route.ts`
- Create: `lib/services/analytics-report-service.ts`
- Create: `tests/integration/analytics/report-service.test.ts`
- Create: `tests/e2e/admin-analytics-reports.spec.ts`

**Interfaces:**
- Consumes: daily summaries, visitor/Lead/chat relations, and analytics permissions.
- Produces: date-range trend, source/country/product funnel, chat-to-Lead and inquiry conversion, and permission-scoped CSV export.

- [ ] **Step 1: Write failing report and export tests**

Assert real-data-only metrics, distinct funnel stages, no GA4/GSC person attribution, stable timezone ranges, large streaming export, spreadsheet escaping, and permission scope.

- [ ] **Step 2: Run integration test and verify RED**

Run: `npm run test:integration -- tests/integration/analytics/report-service.test.ts`  
Expected: FAIL because report service/routes do not exist.

- [ ] **Step 3: Implement report service, routes, and responsive page**

Label first-party, GA4, and GSC sections explicitly; show unavailable sources instead of substituting zeros.

- [ ] **Step 4: Run integration and E2E tests and verify GREEN**

Run: `npm run test:integration -- tests/integration/analytics/report-service.test.ts && npm run test:e2e -- tests/e2e/admin-analytics-reports.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/analytics/reports app/api/admin/analytics/reports components/admin/analytics/reports lib/services/analytics-report-service.ts tests/integration/analytics/report-service.test.ts tests/e2e/admin-analytics-reports.spec.ts
git commit -m "feat: add visitor crm reports"
```

### Task 3: Retention, Visitor Deletion, and Cron Configuration

**Files:**
- Create: `lib/services/privacy-retention-service.ts`
- Create: `app/api/internal/privacy/retention/route.ts`
- Create: `app/api/admin/analytics/visitors/[id]/delete/route.ts`
- Modify: `components/admin/analytics/visitors/VisitorTimelineDrawer.tsx`
- Modify: `vercel.json`
- Modify: `.env.example`
- Create: `tests/unit/privacy/retention-route.test.ts`
- Create: `tests/integration/privacy/retention-service.test.ts`
- Create: `tests/integration/privacy/visitor-delete.test.ts`

**Interfaces:**
- Consumes: analytics/chat models, audit log, `CRON_SECRET`, configurable retention days.
- Produces: `applyRetention(now, environment)`, `deleteVisitorData(visitorId, principal)`, authenticated daily cron routes.

- [ ] **Step 1: Write failing retention/deletion tests**

Assert exact cutoffs, idempotent reruns, batches, environment isolation, Lead preservation, chat unlink/delete rules, audit metadata without PII, permission checks, and interrupted-job recovery.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/unit/privacy/retention-route.test.ts && npm run test:integration -- tests/integration/privacy/retention-service.test.ts tests/integration/privacy/visitor-delete.test.ts`  
Expected: FAIL because retention/deletion services do not exist.

- [ ] **Step 3: Implement bounded jobs, delete action, and schedules**

Use explicit IDs and small batches; never cascade into `Lead`. Keep cron routes build-safe and fail closed without `CRON_SECRET`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- tests/unit/privacy/retention-route.test.ts && npm run test:integration -- tests/integration/privacy/retention-service.test.ts tests/integration/privacy/visitor-delete.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/privacy-retention-service.ts app/api/internal/privacy app/api/admin/analytics/visitors/'[id]'/delete/route.ts components/admin/analytics/visitors/VisitorTimelineDrawer.tsx vercel.json .env.example tests/unit/privacy tests/integration/privacy
git commit -m "feat: add analytics privacy retention controls"
```

### Task 4: Performance, Failure, and Preview Acceptance

**Files:**
- Create: `tests/integration/analytics/query-performance.test.ts`
- Create: `tests/e2e/realtime-resilience.spec.ts`
- Create: `docs/runbooks/analytics-chat-operations.md`

**Interfaces:**
- Consumes: completed analytics/chat system and isolated Preview resources.
- Produces: measured query/reconnect evidence and an operations runbook covering degraded modes, secrets, migration, rollback, and cost monitoring.

- [ ] **Step 1: Write representative performance/resilience tests**

Seed only the test database with documented volumes; assert indexed visitor queries, bounded export memory, reconnect/resync after forced close, Redis outage behavior, and mobile usability.

- [ ] **Step 2: Run local complete verification**

Run: `npm ci && npm run typecheck && npm run lint && npm test && npm run test:integration && npm run build && npm run test:e2e`  
Expected: all commands PASS with test-only database/Redis; no production resources used.

- [ ] **Step 3: Document operations and environment matrix**

List variable names only, never values; include Redis budget/alerts, WebSocket beta limits, retention, incident degradation, and rollback steps.

- [ ] **Step 4: Deploy and verify an isolated Preview**

Run the repository's existing Vercel Preview flow, apply migrations only to the Preview database, then test homepage, products, representative product detail, admin login, analytics, visitors, public chat, admin chat, unauthorized APIs, reconnect, and mobile layout.  
Expected: Preview deployment is Ready and all checks PASS.

- [ ] **Step 5: Commit evidence/runbook changes**

```bash
git add tests/integration/analytics/query-performance.test.ts tests/e2e/realtime-resilience.spec.ts docs/runbooks/analytics-chat-operations.md
git commit -m "test: verify analytics and chat production readiness"
```

### Task 5: Approved Production Migration and Release

**Files:**
- No planned source changes; create deployment evidence in the task ledger/report only.

**Interfaces:**
- Consumes: Ready Preview, green full suite, approved production window, production database backup/restore readiness, and configured Production Redis.
- Produces: one production deployment, migration record, smoke-test report, commit SHA, deployment ID, and rollback decision.

- [ ] **Step 1: Present the Preview report and request the production deployment window**

Expected: explicit approval naming Production deployment/migration; without it, stop with Preview Ready.

- [ ] **Step 2: Run read-only production preflight**

Confirm current deployment is healthy, required variable names exist, database target is Production, migrations are pending as expected, Redis Production namespace is separate, and no secrets/build artifacts are staged.

- [ ] **Step 3: Apply safe migrations and seed RBAC**

Run `prisma migrate deploy` and the idempotent RBAC seed against Production only after approval. Do not run reset, `db push --force-reset`, catalogue seed, or test fixtures.

- [ ] **Step 4: Deploy using the repository's existing production flow**

Prefer the existing GitHub/Vercel automatic deployment path; avoid a duplicate CLI production deployment. Keep the prior Ready deployment available until the new one is Ready.

- [ ] **Step 5: Perform production acceptance and record results**

Check `/`, `/products`, a real product detail route, `/admin/login`, `/admin/analytics`, `/admin/analytics/visitors`, `/admin/chat`, public chat, authenticated/unauthenticated management APIs, static resources, database logs, Redis realtime, reconnect, and mobile. Confirm no fake data and no unexpected database mutation.

