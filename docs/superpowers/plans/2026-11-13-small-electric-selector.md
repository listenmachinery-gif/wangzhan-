# Small Electric Shear Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live small-electric-shear model selector and SMTP-backed inquiry form below the model carousel.

**Architecture:** A pure TypeScript rules module is shared by a focused client form and the inquiry API. The browser gives immediate feedback; the server recomputes the model and sends canonical structured fields.

**Tech Stack:** Next.js 15, React, TypeScript, Nodemailer, Node assertion scripts

**Spec:** `docs/superpowers/specs/2026-11-13-small-electric-selector-design.md`

## Global Constraints

- Keep all nine material names, eight capacity tiers, and three backgauge labels exactly as supplied.
- Place the form directly below the model carousel inside the technical section.
- Deliver to `INQUIRY_TO_EMAIL` or `info@zyroncnc.com` using the existing SMTP configuration.
- The server must recompute the recommendation.

## Review Focus

- A dimension between width tiers selects the next larger tier.
- A thick, wide sheet that exceeds the reduced long-width thickness limit returns no standard model.
- Zero, negative, blank, or non-numeric dimensions never produce a model.
- A forged posted recommendation cannot override the server calculation.
- SMTP failure preserves a usable prefilled email fallback.

---

### Task 1: Selection rules

**Files:**
- Create: `data/small-electric-shear-selector.ts`
- Create: `scripts/verify-small-electric-shear-selector.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `SMALL_ELECTRIC_SHEAR_MATERIALS`, `SMALL_ELECTRIC_SHEAR_BACKGAUGES`, and `recommendSmallElectricShear(material, thickness, width)`.

- [ ] Write assertions for all nine materials, exact tier boundaries, between-tier widths, reduced long-width thickness limits, invalid dimensions, and out-of-range inputs.
- [ ] Run the verification script and confirm it fails because the rules module is missing.
- [ ] Implement the immutable data and pure recommendation function.
- [ ] Run the verification script and confirm all assertions pass.

### Task 2: Selector UI and inquiry delivery

**Files:**
- Create: `components/SmallElectricShearSelector.tsx`
- Modify: `components/ShearingSolutionPage.tsx`
- Modify: `app/api/inquiry/route.ts`
- Modify: `scripts/verify-small-electric-shear-selector.mjs`

**Interfaces:**
- Consumes: Task 1 selector exports.
- Produces: a responsive form and canonical selector email rows.

- [ ] Add source-contract assertions for field order, accessibility, API recomputation, recipient, and fallback mailto; confirm they fail.
- [ ] Implement the client form below `ModelCardCarousel` with derived recommendation and submit states.
- [ ] Extend the inquiry API with a selector-specific validation branch and structured email rows.
- [ ] Run selector, media, SEO, lint, and production-build checks.
- [ ] Verify desktop/mobile layout, live recommendation, no-match state, backgauge choice, and successful request handling in the browser.
