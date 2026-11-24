# Machines Mega Menu Premium Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the existing PRODUCTS mega menu into a premium industrial catalogue without changing data, routes, or CMS architecture.

**Architecture:** Refine the existing `MachinesDesktopPanel` presentation only, consuming the already-resolved CMS settings and catalogue view model. Keep the current accessible tab and scroll-region behavior and cover the new information hierarchy with component and Playwright assertions.

**Tech Stack:** Next.js, React, Tailwind CSS, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-11-24-machines-menu-premium-visual-design.md`

## Global Constraints

- Keep the public navigation label `PRODUCTS`.
- Preserve all product data, URLs, SEO, media references, and database structure.
- Reuse the existing Machines CMS editor and version workflow.
- Update Preview only; do not promote to production.

## Review Focus

- Category switching must keep active content and footer destinations synchronized.
- Long categories must retain a bounded, keyboard-focusable scroll area.
- Product cards must remain real links with accessible names.
- CMS-configured font sizes and colors must still apply after the visual refinement.
- Compact admin preview must not overflow its container.

---

### Task 1: Premium catalogue hierarchy

**Files:**
- Modify: `components/SiteHeader.tsx`
- Test: `tests/unit/site/site-navigation.test.tsx`
- Test: `tests/e2e/public-navigation-shipping.spec.ts`

**Interfaces:**
- Consumes: existing `MachinesMenuView` and resolved style settings.
- Produces: indexed category rail, catalogue header, numbered product cards, fixed action bar, and unchanged accessible interactions.

- [x] Write a failing component test for the catalogue context and numbered product entries.
- [x] Implement the premium visual hierarchy without changing routes or state behavior.
- [x] Run focused component tests until green.

### Task 2: Verification and Preview update

**Files:**
- Modify: `docs/superpowers/plans/2026-11-24-machines-menu-premium-visual.md`

- [x] Run TypeScript, lint, full unit tests, integration tests, and production build.
- [x] Capture and inspect the desktop menu at 1440px and verify mobile navigation.
- [ ] Commit, push to the existing Draft PR, and verify both Vercel Preview checks are Ready.
