# ZYRON Analytics, CRM, and Live Chat Operations

## Release gates

1. Use separate Preview and Production PostgreSQL databases. Confirm the database name/host without printing credentials.
2. Use separate Preview and Production Redis resources or namespaces. Never point tests or Preview at the Production Redis URL.
3. Run `npm ci`, type checking, lint, unit tests, integration tests, production build, and browser tests against test-only resources.
4. Apply schema changes to Preview with `prisma migrate deploy`, run acceptance checks, and retain the current Production deployment.
5. Production requires a named deployment window, a current database backup/restore path, successful migration preflight, and explicit approval.

Never use `prisma migrate reset`, a forced `db push`, catalogue fixtures, or test seeds against Preview or Production.

## Environment matrix

Configure values in the deployment platform; only variable names belong in source control.

| Area | Required variables | Scope |
|---|---|---|
| Database | `DATABASE_URL` | Unique per Preview/Production |
| Authentication | `SESSION_SECRET` | Unique secret per environment |
| Scheduled jobs | `CRON_SECRET` | Unique secret per environment |
| Realtime | `REALTIME_ENABLED`, `UPSTASH_REDIS_URL`, `REALTIME_TOKEN_SECRET` | Separate Preview/Production Redis and secrets |
| Retention | `ANALYTICS_RAW_RETENTION_DAYS`, `ANALYTICS_SUMMARY_RETENTION_DAYS`, `CHAT_RETENTION_DAYS`, `PRIVACY_RETENTION_BATCH_SIZE` | Defaults: 180, 730, 730, 250 |
| GA4 browser tag | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Public identifier; optional until configured |
| Google reports | `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_SEARCH_CONSOLE_SITE_URL`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Server-only; optional sources fail independently |
| Media/email | Existing object-storage and SMTP variables | Preserve current environment separation |

## Scheduled operations

- `01:15 UTC`: summarize the previous UTC reporting day. The operation replaces only that day and environment.
- `01:45 UTC`: apply analytics/chat retention in bounded batches. Leads are never deleted by retention.
- Both routes require Vercel Cron bearer authentication and fail closed without `CRON_SECRET`.
- A rerun is safe. Review audit rows for counts, never for copied visitor PII.

## Degraded modes

### Redis or WebSocket unavailable

- Messages are persisted in PostgreSQL before any realtime publish attempt.
- The public and admin UI show that live updates are unavailable and continue through HTTP.
- Clients resynchronize by message cursor after reconnect; no high-frequency database polling is introduced.
- If errors or cost spike, set `REALTIME_ENABLED=false`. Do not remove stored conversations.

### GA4 or Search Console unavailable

- First-party analytics and CRM continue independently.
- The admin dashboard displays the source as unavailable; it must not substitute zero or merge person-level identities.
- Check service-account access and property/site identifiers without logging the private key.

### Database pressure

- Disable nonessential scheduled exports/reports first; keep inquiry and chat writes available.
- Check slow-query logs and index usage for environment/date indexes.
- Retention and summary jobs use bounded time windows/batches; lower `PRIVACY_RETENTION_BATCH_SIZE` if needed.

## Monitoring and budgets

- Alert on database connection saturation, API 5xx rate, cron failures, Redis connection/reconnect rate, and message publish degradation.
- Monitor Redis commands, bandwidth, simultaneous connections, and key count against the selected Upstash plan.
- Monitor Vercel function duration and WebSocket/function platform limits before increasing realtime traffic.
- Track daily message volume, stored chat growth, summary row growth, and retention deletion counts.

## Preview acceptance

Check the homepage, product list, one real product detail, `/admin/login`, `/admin/analytics`, `/admin/analytics/reports`, `/admin/analytics/visitors`, `/admin/chat`, public chat, admin chat, static assets, unauthorized management API responses, reconnect/resync, and a 390px mobile viewport. Confirm Preview data appears only in the Preview database/Redis namespace.

## Production migration and rollback

1. Confirm the current Production deployment remains healthy and record its deployment ID.
2. Confirm required variable names exist for Production without revealing values.
3. Confirm a usable database backup and restore procedure.
4. Run `prisma migrate status`, inspect pending migrations, then use only `prisma migrate deploy`.
5. Run the idempotent RBAC seed; do not run catalogue/test seeds.
6. Deploy once through the repository's normal GitHub/Vercel flow and wait for Ready before changing the production alias.
7. Smoke-test the documented routes, authentication boundaries, database logs, Redis delivery, reconnect, and mobile layout.
8. If the application deployment fails before alias promotion, keep the existing Ready deployment. If application behavior fails after promotion, repoint the alias to the prior Ready deployment. Database rollback uses the approved restore procedure; never improvise destructive reverse SQL.
