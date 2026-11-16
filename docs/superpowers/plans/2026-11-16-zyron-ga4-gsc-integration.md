# ZYRON GA4 and Search Console Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consent-aware GA4 collection and a real, read-only GA4/Search Console reporting area to ZYRON CMS, then verify it in Preview and production without exposing credentials or disturbing existing site functionality.

**Architecture:** Public analytics lives only in the `(site)` layout and loads after an explicit first-party consent choice. Server-only Google adapters use a service account, normalize GA4 and Search Console into stable internal report types, and expose protected CMS endpoints; each source fails independently and successful responses use a bounded in-process cache. The admin UI consumes those normalized endpoints and never sees Google credentials or raw upstream errors.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Vitest, Testing Library, Playwright, `@next/third-parties` 15.5.19, `google-auth-library` 10.9.1, Google Analytics Data API v1beta, Search Console API v3, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-16-zyron-ga4-gsc-integration-design.md`

## Global Constraints

- Do not change existing public URLs, product data, brand content, inquiry persistence, or admin authentication behavior.
- Never commit or log a service-account JSON file, private key, OAuth token, database URL, or Vercel secret.
- Mount GA only under `app/(site)`; `/admin`, `/admin/login`, and management APIs must never be tracked.
- Do not load Google Tag or send events until `zyron_analytics_consent=accepted`; rejection and no choice are no-op states.
- Do not send names, email addresses, phone/WhatsApp numbers, company names, inquiry bodies, Session IDs, or Lead IDs to GA4.
- Use `settings.write` for `/admin/analytics` and its APIs; do not add a Prisma migration or new RBAC row.
- Treat GA4 and Search Console as independent sources so one upstream failure does not erase the other's data.
- GA4 ranges are completed `Asia/Shanghai` calendar days through yesterday; Search Console uses Pacific Time/final data and reports its actual `dataThrough`.
- Preview collection stays disabled unless a separate test GA4 Property and stream are configured.
- Production database migrations, destructive database operations, Google login, DNS verification, and secret entry are outside automated tests and require the authorized interactive deployment step.

## Review Focus

- A malformed escaped PEM key must produce `INVALID_CONFIG` without echoing any key material; Task 1 pins this in config tests.
- Google 401/403/429/timeout/5xx responses must map to safe internal statuses and retry only retryable failures once; Task 2 pins each class in adapter tests.
- A GA success plus GSC failure, and the reverse, must return HTTP 200 with one data block and one source error; Task 3 pins both partial-success cases.
- Consent rejection, late acceptance, and App Router navigation must never double-count page views; Task 5 pins initial and subsequent navigation behavior.
- Repeated form focus/submission and honeypot/failure responses must not create duplicate or false conversion events; Task 6 pins one-shot start and success-only submit behavior.

---

### Task 1: Analytics contracts, configuration, dates, and dependencies

**Files:**
- Create: `lib/analytics/types.ts`
- Create: `lib/analytics/config.ts`
- Create: `lib/analytics/date-ranges.ts`
- Test: `tests/unit/analytics/config.test.ts`
- Test: `tests/unit/analytics/date-ranges.test.ts`
- Modify: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`
- Include in commit: `docs/superpowers/specs/2026-11-16-zyron-ga4-gsc-integration-design.md`
- Include in commit: `docs/superpowers/plans/2026-11-16-zyron-ga4-gsc-integration.md`

**Interfaces:**
- Produces: `AnalyticsRange = "7d" | "28d" | "90d"`, `DateWindow`, `IntegrationErrorCode`, `IntegrationSourceState`, `Ga4Report`, `SearchConsoleReport`, `AnalyticsOverview`, and `AnalyticsConnectionOverview` in `lib/analytics/types.ts`.
- Produces: `readGoogleIntegrationConfig(env?: NodeJS.ProcessEnv): GoogleIntegrationConfig` with independently usable `tracking`, `ga4`, `searchConsole`, and shared `credentials` sections.
- Produces: `getCompletedDateWindows(range: AnalyticsRange, now: Date, timeZone: string): { current: DateWindow; previous: DateWindow }`.

- [ ] **Step 1: Write failing configuration tests**

Cover a fully valid environment, every independently missing variable, invalid `G-...` Measurement ID, non-numeric Property ID, non-`sc-domain:zyroncnc.com` site URL, `\\n` PEM normalization, and malformed PEM returning a safe issue code whose serialized form does not contain key text.

- [ ] **Step 2: Write failing date-range tests**

Assert exact 7/28/90-day inclusive windows through yesterday in `Asia/Shanghai`, exact preceding comparison windows, and correct Pacific-Time behavior across a daylight-saving boundary.

- [ ] **Step 3: Run the focused tests and verify red**

Run: `npx vitest run tests/unit/analytics/config.test.ts tests/unit/analytics/date-ranges.test.ts`

Expected: FAIL because the analytics contracts and functions do not exist.

- [ ] **Step 4: Install only the two approved dependencies**

Run: `npm install --save-exact @next/third-parties@15.5.19 google-auth-library@10.9.1`

Expected: `package.json` and `package-lock.json` change; `google-auth-library` remains compatible with Node >=18 and `@next/third-parties` matches the current Next.js 15.5.19 line.

- [ ] **Step 5: Implement contracts, environment parsing, and date windows**

Keep `config.ts` server-only. Add the five documented environment names to `.env.example` using placeholders only. Parse GA4 and Search Console independently so a missing Property ID does not mark GSC unconfigured and vice versa.

- [ ] **Step 6: Run focused tests and dependency audit**

Run: `npx vitest run tests/unit/analytics/config.test.ts tests/unit/analytics/date-ranges.test.ts && npm ls @next/third-parties google-auth-library`

Expected: all focused tests PASS; both exact versions resolve once.

- [ ] **Step 7: Commit the approved design, plan, and foundation**

```bash
git add .env.example package.json package-lock.json lib/analytics/types.ts lib/analytics/config.ts lib/analytics/date-ranges.ts tests/unit/analytics/config.test.ts tests/unit/analytics/date-ranges.test.ts docs/superpowers/specs/2026-11-16-zyron-ga4-gsc-integration-design.md docs/superpowers/plans/2026-11-16-zyron-ga4-gsc-integration.md
git commit -m "feat: add Google analytics integration foundation"
```

### Task 2: Service-account authentication and Google report adapters

**Files:**
- Create: `lib/analytics/google-auth.ts`
- Create: `lib/analytics/google-http.ts`
- Create: `lib/analytics/ga4-reporting.ts`
- Create: `lib/analytics/search-console-reporting.ts`
- Test: `tests/unit/analytics/google-http.test.ts`
- Test: `tests/unit/analytics/ga4-reporting.test.ts`
- Test: `tests/unit/analytics/search-console-reporting.test.ts`

**Interfaces:**
- Consumes: `GoogleIntegrationConfig`, `DateWindow`, `Ga4Report`, `SearchConsoleReport`, and `IntegrationErrorCode` from Task 1.
- Produces: `AccessTokenProvider = { getAccessToken(): Promise<string> }` and `createGoogleAccessTokenProvider(credentials): AccessTokenProvider` using the two read-only scopes.
- Produces: `requestGoogleJson<T>(request: GoogleJsonRequest, dependencies?: GoogleHttpDependencies): Promise<T>` with timeout, one retry for network/429/5xx, and `GoogleIntegrationError`.
- Produces: `Ga4ReportingService.getReport(range, now): Promise<Ga4Report>` and `.probe(): Promise<void>`.
- Produces: `SearchConsoleReportingService.getReport(range, now): Promise<SearchConsoleReport>` and `.probe(): Promise<void>`.

- [ ] **Step 1: Write failing HTTP error and retry tests**

Assert bearer authorization, timeout abort, no retry for 400/401/403, exactly one retry for a network error/429/500, response bodies and tokens absent from public errors, and `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `TIMEOUT`, `UPSTREAM_UNAVAILABLE` mappings.

- [ ] **Step 2: Write failing GA4 adapter tests**

Mock `https://analyticsdata.googleapis.com/v1beta/properties/{id}:runReport`; assert totals use `activeUsers`, `sessions`, `screenPageViews`, `engagementRate`, and `keyEvents`; assert current/previous comparison, daily trend, top pages, source/medium, country, and five event counts normalize correctly. Assert an empty successful report returns zero/empty arrays, not an error.

- [ ] **Step 3: Write failing Search Console adapter tests**

Mock `https://www.googleapis.com/webmasters/v3/sites/{encodedSite}/searchAnalytics/query`; assert `dataState: "final"`, Pacific-Time date windows, aggregate metrics, daily trend, query/page/device/country tables, CTR fraction handling, average position, `rowLimit`, and actual newest returned date as `dataThrough`.

- [ ] **Step 4: Run adapter tests and verify red**

Run: `npx vitest run tests/unit/analytics/google-http.test.ts tests/unit/analytics/ga4-reporting.test.ts tests/unit/analytics/search-console-reporting.test.ts`

Expected: FAIL because adapters do not exist.

- [ ] **Step 5: Implement authentication and bounded Google HTTP transport**

Use `GoogleAuth` from `google-auth-library` with scopes `https://www.googleapis.com/auth/analytics.readonly` and `https://www.googleapis.com/auth/webmasters.readonly`. Inject `fetch`, timer/sleep, and token provider in tests; default timeout is 8 seconds and retry count is one.

- [ ] **Step 6: Implement the two reporting adapters**

Use fixed, allow-listed queries only. Never pass admin request input directly into a Google dimension, metric, property, or site name. Use the Task 1 date helper for every query and normalize numeric strings defensively.

- [ ] **Step 7: Run focused tests**

Run: `npx vitest run tests/unit/analytics/google-http.test.ts tests/unit/analytics/ga4-reporting.test.ts tests/unit/analytics/search-console-reporting.test.ts`

Expected: all adapter tests PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/analytics/google-auth.ts lib/analytics/google-http.ts lib/analytics/ga4-reporting.ts lib/analytics/search-console-reporting.ts tests/unit/analytics/google-http.test.ts tests/unit/analytics/ga4-reporting.test.ts tests/unit/analytics/search-console-reporting.test.ts
git commit -m "feat: add read-only Google reporting clients"
```

### Task 3: Partial-success aggregation, safe caching, and protected APIs

**Files:**
- Create: `lib/analytics/success-cache.ts`
- Create: `lib/analytics/overview-service.ts`
- Create: `lib/http/analytics-response.ts`
- Create: `app/api/admin/analytics/overview/route.ts`
- Create: `app/api/admin/analytics/status/route.ts`
- Test: `tests/unit/analytics/success-cache.test.ts`
- Test: `tests/unit/analytics/overview-service.test.ts`
- Test: `tests/unit/analytics/routes.test.ts`

**Interfaces:**
- Consumes: Task 1 types/config and Task 2 service methods.
- Produces: `SuccessCache.getOrLoad<T>(key, load, now?): Promise<T>` with 15-minute success TTL, no long error caching, and optional 30-second identical-failure suppression.
- Produces: `AnalyticsOverviewService.getOverview(range, now?): Promise<AnalyticsOverview>` and `.getStatus(now?): Promise<AnalyticsConnectionOverview>`.
- Produces: GET `/api/admin/analytics/overview?range=7d|28d|90d` and GET `/api/admin/analytics/status`, both protected by `settings.write`.

- [ ] **Step 1: Write failing cache tests**

Assert a successful loader is reused for 15 minutes, expires afterward, rejected loads are not stored as success, separate source/range/date keys cannot collide, and no secret-bearing error object is retained or serialized.

- [ ] **Step 2: Write failing aggregation tests**

Assert both success, GA-only success, GSC-only success, both unconfigured, one forbidden, one timeout, and empty-data success. Each source must expose a safe state plus its own `generatedAt`/`dataThrough`; the aggregate must never throw merely because one Google source failed.

- [ ] **Step 3: Write failing route tests**

Assert unauthenticated 401, a principal without `settings.write` gets 403, invalid range gets 400, a valid admin gets the normalized response, partial upstream failure remains 200, and JSON never contains email/private-key/access-token fields or raw upstream error bodies.

- [ ] **Step 4: Run focused tests and verify red**

Run: `npx vitest run tests/unit/analytics/success-cache.test.ts tests/unit/analytics/overview-service.test.ts tests/unit/analytics/routes.test.ts`

Expected: FAIL because the service, cache, and routes do not exist.

- [ ] **Step 5: Implement cache, aggregator, and safe response mapping**

Validate the `range` query against the Task 1 union before calling Google. Log only source, internal code, upstream status, and a generated request ID; do not log thrown objects from the Google library.

- [ ] **Step 6: Implement the protected GET routes**

Reuse `requirePermission("settings.write")` and existing administration error semantics. GET routes do not need mutation-origin checks.

- [ ] **Step 7: Run focused tests**

Run: `npx vitest run tests/unit/analytics/success-cache.test.ts tests/unit/analytics/overview-service.test.ts tests/unit/analytics/routes.test.ts`

Expected: all focused tests PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/analytics/success-cache.ts lib/analytics/overview-service.ts lib/http/analytics-response.ts app/api/admin/analytics tests/unit/analytics/success-cache.test.ts tests/unit/analytics/overview-service.test.ts tests/unit/analytics/routes.test.ts
git commit -m "feat: expose protected analytics reporting APIs"
```

### Task 4: CMS analytics dashboard and real connection states

**Files:**
- Create: `app/admin/analytics/page.tsx`
- Create: `components/admin/analytics/AnalyticsDashboard.tsx`
- Create: `components/admin/analytics/MetricCard.tsx`
- Create: `components/admin/analytics/TrendChart.tsx`
- Create: `components/admin/analytics/ReportTable.tsx`
- Test: `tests/unit/admin/analytics-dashboard.test.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Modify: `components/admin/ConnectionStatus.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `tests/unit/admin/navigation.test.tsx`

**Interfaces:**
- Consumes: `AnalyticsOverview`, `AnalyticsRange`, and `AnalyticsConnectionOverview` from Tasks 1 and 3; fetches only the protected normalized APIs.
- Produces: `/admin/analytics?range=7d|28d|90d`; `AnalyticsDashboard` keeps the range in the URL and renders GA4 and GSC independently.
- Produces: `ConnectionStatus` accepting `state`, `message`, `checkedAt`, and `href` instead of a fabricated boolean.

- [ ] **Step 1: Write failing navigation and connection-card tests**

Assert “数据分析” appears only for `SUPER_ADMIN`/`ADMIN`, the active path is marked, all five safe connection states render with a link and no fabricated visitor/search numbers, and principals without `settings.write` neither see the homepage connection section nor trigger a Google status probe.

- [ ] **Step 2: Write failing dashboard tests**

Assert default 28 days, URL-preserving 7/28/90 selection, loading, both-source success, each partial-success direction, unconfigured, forbidden, empty data, percentage zero-denominator handling, accessible trend summaries, table headings, and a mobile-scroll wrapper.

- [ ] **Step 3: Run UI tests and verify red**

Run: `npx vitest run tests/unit/admin/navigation.test.tsx tests/unit/admin/analytics-dashboard.test.tsx`

Expected: FAIL because the page and real states do not exist.

- [ ] **Step 4: Implement the dashboard with lightweight accessible SVG/CSS charts**

Do not add a chart dependency. Label percentages, dates, and numbers using `Intl`; show `dataThrough` and explain GA4/GSC time-zone and final-data differences. Raw Google errors must not reach the DOM.

- [ ] **Step 5: Replace homepage placeholders with cached real status**

Resolve the current principal and call/render `getStatus()` only when `can(principal, "settings.write")` is true; other logged-in roles keep only their existing database cards. For authorized admins, fetch database counts and status without allowing Google failure to reject the page. Preserve current product and inquiry cards unchanged.

- [ ] **Step 6: Run focused UI tests**

Run: `npx vitest run tests/unit/admin/navigation.test.tsx tests/unit/admin/analytics-dashboard.test.tsx`

Expected: all focused UI tests PASS.

- [ ] **Step 7: Commit**

```bash
git add app/admin/analytics app/admin/page.tsx components/admin/AdminSidebar.tsx components/admin/ConnectionStatus.tsx components/admin/analytics tests/unit/admin/navigation.test.tsx tests/unit/admin/analytics-dashboard.test.tsx
git commit -m "feat: add CMS analytics dashboard"
```

### Task 5: Consent-aware GA4 loading and exact page-view tracking

**Files:**
- Create: `lib/analytics/consent.ts`
- Create: `lib/analytics/client-events.ts`
- Create: `components/analytics/AnalyticsConsentProvider.tsx`
- Create: `components/analytics/CookiePreferencesButton.tsx`
- Create: `components/analytics/RoutePageView.tsx`
- Test: `tests/unit/analytics/consent.test.tsx`
- Test: `tests/unit/analytics/client-events.test.ts`
- Modify: `app/(site)/layout.tsx`
- Modify: `components/SiteFooter.tsx`

**Interfaces:**
- Produces: `readAnalyticsConsent(): "accepted" | "rejected" | null`, `writeAnalyticsConsent(value)`, and cookie constant `zyron_analytics_consent` with 180-day `Max-Age`, `Path=/`, `SameSite=Lax`, and production `Secure`.
- Produces: `trackAnalyticsEvent<K extends AnalyticsEventName>(name: K, params: AnalyticsEventParams[K]): boolean`; it checks consent, allow-lists keys, rejects PII-shaped unknown fields, and safely no-ops before the tag is ready.
- Produces: `AnalyticsConsentProvider` that conditionally mounts `<GoogleAnalytics gaId={...}>` plus subsequent-route tracking only under `(site)`.

- [ ] **Step 1: Write failing consent tests**

Assert no tag before a choice, no tag after Reject, tag after Accept, persisted choice on remount, “Cookie preferences” reopens the panel, and no server `cookies()` dependency is introduced. Assert keyboard focus, accessible labels, and status announcements.

- [ ] **Step 2: Write failing event/page-view tests**

Assert the initial accepted mount relies on exactly one Google config page view, subsequent pathname/search changes emit one `page_view` each, rerendering the same URL emits none, Reject emits none, and runtime input containing email/phone/message/lead/session keys is dropped or rejected.

- [ ] **Step 3: Run focused tests and verify red**

Run: `npx vitest run tests/unit/analytics/consent.test.tsx tests/unit/analytics/client-events.test.ts`

Expected: FAIL because consent and client event modules do not exist.

- [ ] **Step 4: Implement client-only consent and route tracking**

Read `NEXT_PUBLIC_GA4_MEASUREMENT_ID` only as a public identifier. Keep Google Analytics absent when the variable is missing. Use existing black/white/industrial-green tokens and do not change site layout dimensions.

- [ ] **Step 5: Add the footer preference control and site-layout provider**

The footer button only opens preferences; it must not change consent by itself. Do not add anything to `app/layout.tsx` or admin layouts.

- [ ] **Step 6: Run focused tests**

Run: `npx vitest run tests/unit/analytics/consent.test.tsx tests/unit/analytics/client-events.test.ts`

Expected: all consent/event tests PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/analytics/consent.ts lib/analytics/client-events.ts components/analytics app/'(site)'/layout.tsx components/SiteFooter.tsx tests/unit/analytics/consent.test.tsx tests/unit/analytics/client-events.test.ts
git commit -m "feat: add consent-aware GA4 collection"
```

### Task 6: Product, inquiry, and contact conversion instrumentation

**Files:**
- Create: `components/analytics/ProductViewTracker.tsx`
- Create: `components/analytics/ContactClickTracker.tsx`
- Test: `tests/unit/analytics/conversion-events.test.tsx`
- Modify: `app/(site)/products/[id]/page.tsx`
- Modify: `components/InquiryForm.tsx`
- Modify: `components/company/CompanyInquiryForm.tsx`
- Modify: `components/SmallElectricShearSelector.tsx`
- Modify: `components/analytics/AnalyticsConsentProvider.tsx`

**Interfaces:**
- Consumes: `trackAnalyticsEvent` and its PII-free parameter contracts from Task 5.
- Produces: one `product_view` per mounted product page with product ID/slug/name/category; one `inquiry_start` per form mount; one `inquiry_submit` only after a successful real API response; delegated `whatsapp_click`/`email_click`; `catalog_download` only on an explicit validated `data-analytics-download` link.

- [ ] **Step 1: Write failing conversion-event tests**

Cover database and legacy product contexts, consent accepted after an already-mounted product page, repeated form focus, successful submit, API failure/mail fallback, a locally populated honeypot field, selector submit, WhatsApp/mail clicks, fake “Download Catalog” navigation not counted, and a real explicit download counted once. Assert no form values or Lead/reference IDs enter event parameters.

- [ ] **Step 2: Run focused tests and verify red**

Run: `npx vitest run tests/unit/analytics/conversion-events.test.tsx`

Expected: FAIL because trackers and form hooks do not exist.

- [ ] **Step 3: Implement product and delegated contact trackers**

Wrap every product-page render path in `app/(site)/products/[id]/page.tsx` without changing the rendered product component or URL. `ProductViewTracker` listens for a late consent-change event and emits at most once after consent becomes accepted. Restrict delegated click handling to public-site anchors with `mailto:`, `https://wa.me/`, or explicit `data-analytics-download`.

- [ ] **Step 4: Instrument the three real inquiry forms**

Use a ref for one-shot `inquiry_start`. Emit `inquiry_submit` only after `response.ok` and only when the locally submitted honeypot is empty; the deliberately generic inquiry API response does not expose storage/rate-limit internals. Never pass the response reference or payload. Preserve current error/mail fallback behavior.

- [ ] **Step 5: Run focused and existing inquiry tests**

Run: `npm run test:integration -- tests/unit/analytics/conversion-events.test.tsx tests/unit/inquiries/routes.test.ts tests/integration/inquiries/intake.test.ts`

Expected: all conversion and existing inquiry tests PASS using the test database environment required by the repository.

- [ ] **Step 6: Commit**

```bash
git add components/analytics app/'(site)'/products/'[id]'/page.tsx components/InquiryForm.tsx components/company/CompanyInquiryForm.tsx components/SmallElectricShearSelector.tsx tests/unit/analytics/conversion-events.test.tsx
git commit -m "feat: track product and inquiry conversions"
```

### Task 7: End-to-end acceptance, runbook, and full local quality gate

**Files:**
- Create: `tests/e2e/admin-analytics.spec.ts`
- Create: `tests/e2e/public-analytics-consent.spec.ts`
- Create: `docs/zyron-cms/google-analytics-search-console-runbook.md`
- Modify: `.gitignore` only if a Google credential filename pattern is not already safely ignored.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: executable operator instructions for Google resources, DNS TXT, GA history-page-change setting, Key event marking, Vercel variable scope, Preview, rollback, and credential rotation.

- [ ] **Step 1: Write E2E acceptance tests**

Assert admin analytics redirects when logged out, appears after admin login, APIs return 401 without auth, dashboard renders truthful unconfigured states without credentials, public Reject never requests `googletagmanager.com`, public Accept loads only when a test Measurement ID is present, admin pages never request the tag, and core homepage/product/inquiry paths remain usable on desktop and mobile.

- [ ] **Step 2: Run the new E2E tests and fix only product defects**

Run: `npm run test:e2e -- tests/e2e/admin-analytics.spec.ts tests/e2e/public-analytics-consent.spec.ts`

Expected: PASS against the isolated test database; no production Google or database credential is used.

- [ ] **Step 3: Write the operations runbook**

Include exact five environment names, separate Preview/Production scopes, separate Preview GA4 Property rule, `Asia/Shanghai` GA property time zone, disabled GA browser-history auto page views, `inquiry_submit` Key event, Restricted GSC user with escalation only if read is denied, DNS rollback, private-key rotation, and safe status/error meanings. Never include actual IDs or secrets.

- [ ] **Step 4: Run the complete repository quality gate**

Run in order:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
git diff --check
```

Expected: every command exits 0 using development/test configuration; build does not connect to or mutate production Google resources or databases.

- [ ] **Step 5: Review tracked and untracked files for secrets/artifacts**

Run: `git status --short && git diff --check && git grep -n -I -E 'BEGIN PRIVATE KEY|private_key_id|client_x509_cert_url' -- . ':!package-lock.json'`

Expected: no credential material; no `.env.local`, service-account JSON, Playwright output, `.next`, or Vercel environment file staged.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/admin-analytics.spec.ts tests/e2e/public-analytics-consent.spec.ts docs/zyron-cms/google-analytics-search-console-runbook.md .gitignore
git commit -m "test: verify Google analytics integration"
```

### Task 8: Google resource setup, Preview validation, and production release

**Files:**
- No repository secrets or credential files.
- Operational evidence: deployment IDs, commit SHA, safe property/connection status, and acceptance results recorded in the final report only.

**Interfaces:**
- Consumes: the Task 7 runbook and a user-authenticated Google/Vercel/DNS session.
- Produces: verified Domain Property, GA4 production property/stream, optional separate Preview property/stream, least-privilege service account, Vercel environment configuration, Ready Preview, and Ready production deployment.

- [ ] **Step 1: Pause for the user to authenticate to Google and identify the DNS provider**

Do not request their password, recovery code, or two-factor code. Continue only in their authenticated session.

- [ ] **Step 2: Create and configure the Google resources**

Create the GA4 production property in `Asia/Shanghai`, Web stream for `https://www.zyroncnc.com`, GSC Domain Property `zyroncnc.com`, one Cloud project, enabled Analytics Data and Search Console APIs, and a dedicated service account. Grant GA Viewer and GSC Restricted access; verify both probes before considering escalation.

- [ ] **Step 3: Add only the Google-provided DNS TXT record and verify the Domain Property**

Resolve the exact DNS zone first. Do not change A/AAAA/CNAME/MX records. Confirm the TXT with a read-only DNS lookup and then complete Search Console verification.

- [ ] **Step 4: Configure Vercel environments without printing values**

Set service-side read variables for Preview and Production. Leave Preview `NEXT_PUBLIC_GA4_MEASUREMENT_ID` unset unless the separate test Property exists; set the production Measurement ID only in Production. Confirm names/scopes with `vercel env ls`, never `vercel env pull` into a tracked path.

- [ ] **Step 5: Build and deploy Preview**

Run the project's current Vercel flow (`vercel pull --environment=preview`, `vercel build`, `vercel deploy --prebuilt` or the repository's established equivalent). Record deployment ID/URL and wait for Ready; if it fails, inspect the first real build error rather than retrying blindly.

- [ ] **Step 6: Validate Preview**

Check homepage, product list, one product detail, inquiry flow using a clearly labeled test lead, `/admin/login`, `/admin/analytics`, unauthenticated admin API 401, static assets, mobile layout, GA test Realtime/DebugView if a test Property exists, and real read-only GA/GSC status. Empty new properties are valid only when permission probes succeed and the UI says no data.

- [ ] **Step 7: Final diff, branch review, and push**

Run the full quality gate again if any post-Preview code changed. Request whole-branch code review, fix Critical/Important findings with focused regression tests, confirm no secrets, then push the existing feature branch according to the repository's current Git/Vercel flow.

- [ ] **Step 8: Release production and validate**

Use the existing automatic production deployment when configured; otherwise deploy with the already granted production authorization. Wait for Ready and domain assignment, then verify `https://www.zyroncnc.com`, product routes, consent behavior, a labeled test inquiry, `/admin/login`, authenticated `/admin/analytics`, protected API 401, static assets, mobile layout, GA Realtime, and GSC connection. Preserve the old production deployment until all checks pass.

- [ ] **Step 9: Deliver the production report**

Report first error/root cause if any, changed files, every local check, Preview and production deployment IDs, commit SHA, production domain, page/API/Google/database acceptance, DNS change, secret-handling confirmation, and remaining data-delay or privacy-policy risks.
