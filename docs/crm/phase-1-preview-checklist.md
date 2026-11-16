# CRM Phase 1 Preview acceptance

This checklist records readiness; an unchecked item is not a successful check. Never include credentials, connection strings, session cookies, personal customer data or raw environment output in reports.

## Isolation before deployment

- [ ] Confirm the intended Vercel project and **Preview** environment. Pull configuration only into ignored `.vercel/` or `.env.*.local` files; do not print values.
- [ ] Compare Preview and Production database identities privately. Require a separately provisioned Preview database with an explicitly verified name/host. A Preview label alone is insufficient proof of isolation. Stop if the Preview database is missing, shared with Production or cannot be verified.
- [ ] Verify `VERCEL_ENV=preview`; Production migration, password reset and authorization gates must remain inactive. Do not change Production environment variables, aliases or domains.
- [ ] Ensure notification, email, storage and realtime integrations are isolated or disabled for test traffic. Never send test inquiries to real customers.
- [ ] Tests that modify data use `.env.test`, exact matching `DATABASE_URL` / `TEST_DATABASE_URL`, a database name ending `_test`, and a matching `current_database()` result. Do not reuse a server connected to another database.

## Preview schema and reference data

Run these only with the verified isolated Preview/test database loaded into the process. Do not copy a Production connection string into these commands.

1. Record a Preview backup/snapshot and inspect `prisma migrate status`.
2. Apply `npx prisma migrate deploy` to the isolated Preview database. This is a deliberate operator step, never an automatic Production build side effect.
3. Run `npm run db:seed:crm` and `npm run db:seed:rbac` against the same isolated database. Confirm stage reference data and role definitions exist.
4. Run `npm run db:backfill:crm -- --batch-limit 100` (default dry-run). Review selected count, clear contacts/companies, incomplete identities, conflicts, duplicate count, next cursor and remaining batches. Keep any ID-level output restricted; the acceptance summary contains counts only.
5. Do not apply ambiguous matches. Continue dry-run pagination as needed. Non-Production apply is intentionally permitted only for exact matching `_test` URLs; never bypass the guard for a Preview database with a different name.
6. If a separately authorized apply is required, retain the reviewed dry-run and snapshot, use bounded batches, and verify repeated application changes zero records. **Production migration/backfill requires new explicit authorization.**

## Local verification before Preview

Run in order, preserving exit status and recording summary counts:

```sh
npm ci
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
```

On memory-constrained machines, if the Next development server exhausts its heap during the full browser run, preserve the failing evidence and run all three shards sequentially with a fresh test-only server for each: `npm run test:e2e -- --workers=1 --shard=1/3`, then `2/3`, then `3/3`. Verify the protected database and absence of an unrelated running server before every shard. Keep every assertion, timeout and test; report retry-dependent cases separately. The local test storage adapter is intentionally disabled in production mode, so do not bypass that guard to run upload tests against `next start`.

After all pass, pull Preview configuration and run `vercel build` (no `--prod`). Inspect the effective build command and guards first. Create only a Preview deployment (`vercel deploy --prebuilt`, no `--prod`, no shared-branch push). Record deployment ID, URL, status and source commit. A successful build is not evidence that the remote database schema exists.

## Browser and API acceptance

- [ ] Public `/api/inquiry` returns 202 and its Lead appears through old `/admin/leads` and new `/admin/inquiries` lists and details.
- [ ] Manual inquiry form persists snapshots, selected owner, initial history and explicitly requested customer/company links.
- [ ] Customer creation and detail work; linking an existing customer preserves one customer and exposes only permitted inquiry summaries.
- [ ] Old/new API aliases agree; status compatibility and stage history remain correct after a transition.
- [ ] Stale version PATCH returns 409, preserves the winning write, shows a reload message and allows recovery.
- [ ] Anonymous protected endpoints return 401; authenticated forbidden operations return 403. Out-of-scope customer detail may return 404 to avoid disclosing existence. Cross-origin writes return 403.
- [ ] Check CSS, JavaScript, fonts and representative public images return successfully; confirm no blank page, hydration errors, missing assets or unintended horizontal overflow on desktop/mobile.
- [ ] Preview-only public inquiry and read/write smoke checks run only after database and outbound-service isolation is verified. Do not point the committed local E2E suite at Production.

| Role | Read scope | Writes / negative checks |
| --- | --- | --- |
| Admin | All inquiries/customers | Create, link, assign, transition and add note |
| Sales | Current own assignments | Permitted stage/note edits; no inquiry/customer create; reassignment immediately revokes old access |
| Sales manager | Active team assignments | Team assignment/edit; cannot assign outside managed teams; expired memberships confer no access |
| CRM viewer | Active team assignments | Read-only UI and API; no stage, assignment, note or creation writes |
| Anonymous | None | 401 on protected lists/details |

Customer detail/list/timeline must never reveal another salesperson's out-of-scope inquiry history or private internal notes. Test shared customers across different teams and active versus expired memberships.

## Rollback and evidence

- [ ] Keep nullable CRM relations and compatible legacy status/snapshot fields; do not drop or rewrite legacy data to roll back.
- [ ] Stop the Preview deployment or restore its previous compatible build if checks fail. Keep the schema additive; use the isolated database snapshot if Preview data recovery is necessary.
- [ ] Record commands, counts, route/role outcomes, deployment identity, warnings and blockers with no secrets.
- [ ] Do not promote to Production or run Production migration/backfill/reset without separate explicit authorization. Preview readiness does not grant that authorization.
