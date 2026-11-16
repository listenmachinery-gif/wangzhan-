# Live Visitor Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ZYRON CMS online visitor metrics refresh automatically and alert administrators once when a new visitor first enters the public website.

**Architecture:** Extend the authenticated first-party overview endpoint with bounded cursor-based arrivals, then add one global admin monitor that polls every 10 seconds and owns the sound/toast experience. The analytics dashboard consumes the same live snapshots without creating a second polling loop.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma/PostgreSQL, Vitest, Testing Library, Web Audio API.

**Spec:** `docs/superpowers/specs/2026-11-16-live-visitor-alerts-design.md`

## Global Constraints

- Use the existing first-party analytics database and API; add no schema migration or external realtime dependency.
- Only consented, non-bot anonymous visitor data may appear; never expose signed-cookie identifiers.
- Poll every 10 seconds, alert once per new visitor, and never alert for the initial baseline.
- Sound must be opt-in through a user gesture and the preference must persist locally.
- Users without `analytics.read.summary` must not fetch or see the live monitor.

## Review Focus

- Invalid, future, or stale `since` cursors must be bounded or rejected without expensive queries.
- A slow response must not overwrite a newer snapshot or create overlapping polls.
- Returning to a visible tab must refresh once without replaying old visitors.
- Browser audio restrictions or missing AudioContext must not break visual alerts.
- Multiple arrivals in one response must remain distinct and must not replay on later responses.

---

### Task 1: Cursor-based live visitor API

**Files:**
- Modify: `lib/services/visitor-analytics-query-service.ts`
- Modify: `app/api/admin/analytics/first-party/overview/route.ts`
- Modify: `lib/analytics/first-party/types.ts`
- Test: `tests/integration/analytics/visitor-query-service.test.ts`
- Test: `tests/unit/analytics/first-party-overview-route.test.ts`

**Interfaces:**
- Produces: `getRealtimeOverview(principal, now, environment, since?)` returning `{ summary, arrivals }` and `FirstPartyOverview` / `LiveVisitorArrival` response types.
- Consumes: existing analytics permission checks, environment resolution, and Prisma models.

- [ ] **Step 1: Write failing service and route tests**

Cover a valid cursor, bot/environment exclusion, anonymous display fields, 5-minute cursor clamp, 20-arrival cap, invalid cursor response, permission enforcement, and no-cursor baseline with no arrivals.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm run test:integration -- tests/integration/analytics/visitor-query-service.test.ts && npm test -- tests/unit/analytics/first-party-overview-route.test.ts`

Expected: FAIL because the overview API and cursor response do not exist.

- [ ] **Step 3: Implement the bounded overview query and route validation**

Add exact response types, clamp `since` to `[now - 5 minutes, now]`, query at most 20 first-time visitors ordered by `firstSeenAt`, include their latest page path, and keep the existing summary contract.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm run test:integration -- tests/integration/analytics/visitor-query-service.test.ts && npm test -- tests/unit/analytics/first-party-overview-route.test.ts`

Expected: both files pass.

- [ ] **Step 5: Commit**

Commit: `feat: add cursor-based live visitor overview`

### Task 2: Global online status and new visitor sound

**Files:**
- Create: `components/admin/analytics/LiveVisitorMonitor.tsx`
- Create: `lib/analytics/first-party/live-alerts.ts`
- Modify: `components/admin/AdminShell.tsx`
- Modify: `components/admin/AdminTopbar.tsx`
- Test: `tests/unit/admin/live-visitor-monitor.test.tsx`
- Test: `tests/unit/analytics/live-alerts.test.ts`

**Interfaces:**
- Consumes: `FirstPartyOverview`, `LiveVisitorArrival`, `can(principal, "analytics.read.summary")`, and `/api/admin/analytics/first-party/overview?since=...`.
- Produces: `LiveVisitorMonitor` and a `zyron-live-overview` browser event carrying fresh snapshots for dashboard reuse.

- [ ] **Step 1: Write failing alert state and component tests**

Cover initial baseline silence, 10-second polling, deduplication, multi-arrival queueing, sound opt-in persistence, AudioContext failure, hidden-tab pause, visibility refresh, error/reconnect state, and no-permission behavior.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/unit/analytics/live-alerts.test.ts tests/unit/admin/live-visitor-monitor.test.tsx`

Expected: FAIL because alert state and monitor do not exist.

- [ ] **Step 3: Implement the alert state and global monitor**

Use a non-overlapping timeout loop, monotonic server cursor, a bounded seen-ID set, an accessible topbar control/toast, and a small Web Audio double tone created only after an explicit enable action.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/unit/analytics/live-alerts.test.ts tests/unit/admin/live-visitor-monitor.test.tsx`

Expected: both files pass.

- [ ] **Step 5: Commit**

Commit: `feat: notify admins about new website visitors`

### Task 3: Live analytics dashboard integration and full verification

**Files:**
- Modify: `components/admin/analytics/AnalyticsDashboard.tsx`
- Modify: `components/admin/analytics/RealtimeVisitorPanel.tsx`
- Modify: `tests/unit/admin/first-party-analytics-dashboard.test.tsx`
- Modify: `tests/e2e/admin-analytics.spec.ts`

**Interfaces:**
- Consumes: the `zyron-live-overview` browser event emitted by Task 2.
- Produces: a live-updating realtime visitor panel with a visible last-refresh state and no duplicate API poller.

- [ ] **Step 1: Write failing dashboard tests**

Assert that emitted live snapshots update all five metrics and refresh time, while the dashboard performs no independent first-party fetch when the global monitor is active.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/unit/admin/first-party-analytics-dashboard.test.tsx`

Expected: FAIL because the dashboard does not consume live snapshots.

- [ ] **Step 3: Implement event-driven dashboard updates**

Subscribe/unsubscribe to the shared snapshot event and keep the existing independent GA4/Search Console request behavior.

- [ ] **Step 4: Run focused tests and complete quality gates**

Run: `npm test -- tests/unit/admin/first-party-analytics-dashboard.test.tsx && npm test && npm run test:integration && npm run typecheck && npm run lint && npm run build`

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

Commit: `feat: keep analytics dashboard live`

