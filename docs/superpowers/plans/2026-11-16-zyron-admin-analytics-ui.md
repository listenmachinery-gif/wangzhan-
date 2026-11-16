# ZYRON Admin Analytics and Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the CMS to a coherent high-end industrial B2B SaaS interface and expose real first-party visitor analytics through overview, visitor list, timeline, and export workflows.

**Architecture:** A small admin design-system layer supplies tokens and reusable page/table/status primitives; the existing shell and pages migrate incrementally without changing URLs. Server components authorize and load initial data, while focused client components handle filters, drawers, charts, and recoverable states.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, Lucide React, Prisma query service from Phase 1, Vitest/Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-zyron-analytics-crm-realtime-design.md`

## Global Constraints

- Preserve existing admin and public URLs, data, brand, and functionality.
- Use `#F5F6F8` canvas, `#FFFFFF` cards, `#1A1D21` primary text, and `#76B900` sparingly as the ZYRON accent.
- Do not display fake metrics, placeholder customers, or fabricated search queries.
- Every data region has loading, empty, missing-configuration, permission, and error states.
- Desktop is data-dense; tablet/mobile remain operable with 44px touch targets and keyboard-visible focus.

## Review Focus

- Permission-filtered navigation must not reveal inaccessible analytics/chat links (Task 2 unit tests).
- Zero data and missing GA4/GSC configuration must be visually distinct (Task 3 component tests).
- Filter/export parity must return the same population and preserve stable ordering (Task 4 integration/E2E tests).
- Long visitor timelines and long source URLs must not break the drawer or leak raw identifiers (Task 5 component tests).
- Collapsed sidebar, mobile drawer, and reduced motion must remain keyboard accessible (Task 2 E2E tests).

---

### Task 1: Admin Design Tokens and Reusable Primitives

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `components/admin/ui/AdminCard.tsx`
- Create: `components/admin/ui/AdminPageHeader.tsx`
- Create: `components/admin/ui/DataState.tsx`
- Create: `components/admin/ui/StatusBadge.tsx`
- Create: `components/admin/ui/TableShell.tsx`
- Create: `tests/unit/admin/ui-primitives.test.tsx`

**Interfaces:**
- Consumes: Existing Tailwind and brand palette.
- Produces: reusable card, page header, data state, badge, and sticky table primitives with accessible semantics.

- [ ] **Step 1: Write failing rendering/accessibility tests**

Assert headings, landmark/ARIA semantics, keyboard focus classes, empty/error actions, semantic status labels, and sticky table header structure.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/unit/admin/ui-primitives.test.tsx`  
Expected: FAIL because primitives do not exist.

- [ ] **Step 3: Add tokens and implement primitives**

Use 8pt spacing, 10–12px radii, restrained shadows, 160–220ms feedback transitions, and reduced-motion overrides.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- tests/unit/admin/ui-primitives.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tailwind.config.ts components/admin/ui tests/unit/admin/ui-primitives.test.tsx
git commit -m "feat: add zyron admin visual system"
```

### Task 2: Grouped Sidebar and Executive Topbar

**Files:**
- Modify: `components/admin/AdminShell.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Modify: `components/admin/AdminTopbar.tsx`
- Create: `components/admin/AdminBreadcrumbs.tsx`
- Modify: `tests/unit/admin/navigation.test.tsx`
- Modify: `tests/e2e/admin-auth.spec.ts`

**Interfaces:**
- Consumes: Task 1 primitives and RBAC permissions from Phase 1.
- Produces: grouped navigation (`经营概览`, `客户增长`, `内容运营`, `系统管理`), breadcrumbs, live status slot, notification entry, and accessible user menu.

- [ ] **Step 1: Write failing navigation and responsive interaction tests**

Assert group order, active route, permission filtering, collapsed labels, mobile close/focus behavior, breadcrumb labels, and user-menu keyboard operation.

- [ ] **Step 2: Run unit tests and verify RED**

Run: `npm test -- tests/unit/admin/navigation.test.tsx`  
Expected: FAIL because grouped shell behavior is missing.

- [ ] **Step 3: Implement the shell upgrade**

Keep links and route matching unchanged; do not add nonfunctional global search or notifications—render them disabled/omitted until backed by real behavior.

- [ ] **Step 4: Run unit and auth E2E tests and verify GREEN**

Run: `npm test -- tests/unit/admin/navigation.test.tsx && npm run test:e2e -- tests/e2e/admin-auth.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/admin/AdminShell.tsx components/admin/AdminSidebar.tsx components/admin/AdminTopbar.tsx components/admin/AdminBreadcrumbs.tsx tests/unit/admin/navigation.test.tsx tests/e2e/admin-auth.spec.ts
git commit -m "feat: redesign cms navigation shell"
```

### Task 3: Unified Analytics Command Center

**Files:**
- Modify: `app/admin/analytics/page.tsx`
- Modify: `components/admin/analytics/AnalyticsDashboard.tsx`
- Modify: `components/admin/analytics/MetricCard.tsx`
- Modify: `components/admin/analytics/ReportTable.tsx`
- Modify: `components/admin/analytics/TrendChart.tsx`
- Create: `components/admin/analytics/RealtimeVisitorPanel.tsx`
- Create: `app/api/admin/analytics/first-party/overview/route.ts`
- Create: `tests/unit/admin/first-party-analytics-dashboard.test.tsx`
- Modify: `tests/unit/analytics/routes.test.ts`
- Modify: `tests/e2e/admin-analytics.spec.ts`

**Interfaces:**
- Consumes: `VisitorAnalyticsQueryService.getRealtimeSummary`, existing `AnalyticsOverviewService`, and Task 1 UI primitives.
- Produces: one dashboard with separate first-party, GA4, and GSC sections plus independent health/configuration states.

- [ ] **Step 1: Write failing route and dashboard-state tests**

Assert real first-party metrics, independent source status, no GA/GSC-to-person joins, zero-vs-unconfigured copy, and responsive layout landmarks.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- tests/unit/admin/first-party-analytics-dashboard.test.tsx tests/unit/analytics/routes.test.ts`  
Expected: FAIL because first-party route/panel do not exist.

- [ ] **Step 3: Implement overview route and dashboard composition**

Use a 12-column desktop grid with KPI strip, 8-column trend, 4-column realtime panel, and source/country/product tables. Preserve existing GA4/GSC range behavior.

- [ ] **Step 4: Run unit and analytics E2E tests and verify GREEN**

Run: `npm test -- tests/unit/admin/first-party-analytics-dashboard.test.tsx tests/unit/analytics/routes.test.ts && npm run test:e2e -- tests/e2e/admin-analytics.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/analytics app/api/admin/analytics/first-party components/admin/analytics tests/unit/admin tests/unit/analytics/routes.test.ts tests/e2e/admin-analytics.spec.ts
git commit -m "feat: add first-party analytics command center"
```

### Task 4: Visitor List, Filters, Pagination, and Export

**Files:**
- Create: `app/admin/analytics/visitors/page.tsx`
- Create: `components/admin/analytics/visitors/VisitorTable.tsx`
- Create: `components/admin/analytics/visitors/VisitorFilters.tsx`
- Create: `app/api/admin/analytics/visitors/route.ts`
- Create: `app/api/admin/analytics/visitors/export/route.ts`
- Create: `lib/validation/visitor-analytics.ts`
- Create: `tests/unit/analytics/visitor-routes.test.ts`
- Create: `tests/integration/analytics/visitor-export.test.ts`
- Create: `tests/e2e/admin-visitors.spec.ts`

**Interfaces:**
- Consumes: Phase 1 visitor query service and `analytics.read.visitors`/`analytics.export` permissions.
- Produces: `/admin/analytics/visitors`, JSON list API, CSV export using the same validated filter object.

- [ ] **Step 1: Write failing validation, permission, parity, and browser tests**

Cover date/source/country/device/status/product filters, stable sort/page boundaries, CSV injection escaping, permission denial, empty result, and URL-backed filter persistence.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/unit/analytics/visitor-routes.test.ts && npm run test:integration -- tests/integration/analytics/visitor-export.test.ts`  
Expected: FAIL because visitor routes and UI do not exist.

- [ ] **Step 3: Implement validated routes and table workflow**

Use a sticky header, compact rows, human-readable anonymous labels, no raw cookie/session IDs, and export based on the exact current filters.

- [ ] **Step 4: Run focused and E2E tests and verify GREEN**

Run: `npm test -- tests/unit/analytics/visitor-routes.test.ts && npm run test:integration -- tests/integration/analytics/visitor-export.test.ts && npm run test:e2e -- tests/e2e/admin-visitors.spec.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/analytics/visitors app/api/admin/analytics/visitors components/admin/analytics/visitors lib/validation/visitor-analytics.ts tests/unit/analytics/visitor-routes.test.ts tests/integration/analytics/visitor-export.test.ts tests/e2e/admin-visitors.spec.ts
git commit -m "feat: add visitor analytics workspace"
```

### Task 5: Visitor Timeline Drawer and Phase Verification

**Files:**
- Create: `components/admin/analytics/visitors/VisitorTimelineDrawer.tsx`
- Create: `app/api/admin/analytics/visitors/[id]/route.ts`
- Create: `tests/unit/admin/visitor-timeline-drawer.test.tsx`
- Modify: `tests/e2e/admin-visitors.spec.ts`

**Interfaces:**
- Consumes: `VisitorAnalyticsQueryService.getVisitorTimeline` and Task 4 table selection.
- Produces: authorized visitor detail API and responsive right-side timeline drawer.

- [ ] **Step 1: Write failing API/component tests**

Assert chronological sessions/page views/events, product and Lead links, redacted identifiers, long URL wrapping, focus trap/return, escape close, mobile full-screen mode, and not-found/permission states.

- [ ] **Step 2: Run unit tests and verify RED**

Run: `npm test -- tests/unit/admin/visitor-timeline-drawer.test.tsx`  
Expected: FAIL because detail route/drawer do not exist.

- [ ] **Step 3: Implement detail route and drawer**

Fetch details on selection, cancel stale requests, and never show event metadata outside the validated allowlist.

- [ ] **Step 4: Run complete phase verification**

Run: `npm run typecheck && npm run lint && npm test && npm run test:integration && npm run build && npm run test:e2e -- tests/e2e/admin-analytics.spec.ts tests/e2e/admin-visitors.spec.ts`  
Expected: all commands PASS.

- [ ] **Step 5: Commit**

```bash
git add components/admin/analytics/visitors/VisitorTimelineDrawer.tsx app/api/admin/analytics/visitors/'[id]'/route.ts tests/unit/admin/visitor-timeline-drawer.test.tsx tests/e2e/admin-visitors.spec.ts
git commit -m "feat: add visitor journey timeline"
```

