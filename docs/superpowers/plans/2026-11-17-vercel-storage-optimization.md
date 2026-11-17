# Vercel Storage Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce ZYRON's future Vercel deployment output and build context without changing behavior, media quality, SEO content, or persistent data.

**Architecture:** A read-only audit helper measures tracked/public/build-output bytes and exact-content duplicates. Duplicate public assets are consolidated behind permanent redirects, while `.vercelignore` removes developer-only inputs before Vercel builds.

**Tech Stack:** Node.js 24, TypeScript, Vitest, Next.js 15, Vercel Build Output API.

**Spec:** `docs/superpowers/specs/2026-11-17-vercel-storage-optimization.md`

## Global Constraints

- Do not change visible image pixels, video quality, SEO copy, routes, database schema, customer data, environment variables, or domains.
- Do not delete any Vercel deployment or change retention policy.
- Use only free repository/build optimizations.
- Preserve every removed static URL with a permanent redirect.

## Review Focus

- A duplicate path stored in the CMS/database must still resolve through a permanent redirect.
- The audit must hash content rather than assume matching filenames are duplicates.
- Redirect sources must be unique and their destinations must exist.
- Developer-only ignore rules must not remove migration, seed, or production build scripts.
- Build output reduction must be measured against the 331,732,785-byte baseline.

---

### Task 1: Repeatable deployment-size audit

**Files:**
- Create: `scripts/lib/deployment-size-audit.mjs`
- Create: `scripts/audit-deployment-size.mjs`
- Create: `tests/unit/deployment/deployment-size-audit.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `summarizeDirectory(root)` and `findDuplicateGroups(root)` for the CLI and tests.

- [ ] Write failing tests for byte totals and SHA-256 duplicate grouping.
- [ ] Run the focused test and confirm the missing-module failure.
- [ ] Implement the audit helper and CLI.
- [ ] Add `npm run audit:deployment-size`.
- [ ] Run focused tests and the audit command.
- [ ] Commit the task.

### Task 2: Consolidate exact duplicate assets with compatibility redirects

**Files:**
- Create: `data/static-asset-redirects.ts`
- Create: `tests/unit/deployment/static-asset-redirects.test.ts`
- Modify: `next.config.ts`
- Modify: affected `data/*-page.ts` image references.
- Delete: 17 redundant image files identified by SHA-256 audit.

**Interfaces:**
- Consumes: Task 1 duplicate audit.
- Produces: `staticAssetRedirects`, included before existing application redirects.

- [ ] Write failing tests for current duplicate groups, redirect uniqueness, canonical destination existence, and permanent redirects.
- [ ] Run the focused test and confirm it fails on the 13 duplicate groups.
- [ ] Add the redirect manifest and update Next.js redirects.
- [ ] Update source references to canonical assets.
- [ ] Remove only the verified byte-identical redundant files.
- [ ] Run focused tests and the deployment-size audit; confirm at least 8 MB reduction.
- [ ] Commit the task.

### Task 3: Reduce Vercel build context safely

**Files:**
- Modify: `.vercelignore`
- Modify: `tests/unit/deployment/static-asset-redirects.test.ts`

**Interfaces:**
- Produces: ignore coverage for `.codex/`, `docs/`, `tests/`, development reports, and `public/**/SOURCES.md` while preserving runtime build scripts.

- [ ] Add failing assertions for required ignore entries and production script availability.
- [ ] Run the focused test and confirm it fails.
- [ ] Add minimal ignore rules without excluding `scripts/vercel-build.ts`, Prisma migrations, seeds, or reset scripts.
- [ ] Run focused tests.
- [ ] Commit the task.

### Task 4: Full validation and Preview

**Files:**
- Modify only if verification exposes a regression.

**Interfaces:**
- Consumes: Tasks 1-3.

- [ ] Run TypeScript, lint, unit tests, integration tests, and production build.
- [ ] Run `vercel pull --environment=production` and `vercel build --prod` without committing pulled secrets.
- [ ] Compare Build Output API byte totals with baseline.
- [ ] Create and inspect a Preview deployment.
- [ ] Verify homepage, products, product detail, admin login, unauthenticated admin redirects/API responses, and static asset redirects.
- [ ] Perform a whole-branch review and commit any required RED→GREEN fixes.

