# Small Electric Shearing Machine DOCX Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Small Electric Shearing Machine product page from the supplied Word document, add real photography to every application and material card, preserve original parameters and FAQs, and deploy the verified result.

**Architecture:** Extend the existing optional shared shearing-page item media contract, then configure only the compact Q11G page with photo-led content. Keep technical data centralized in `data/shearing-details.ts` and guard page requirements with executable Node contracts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Node.js assertion scripts, Next Image

**Spec:** `docs/superpowers/specs/2026-09-23-small-electric-shear-docx-refresh-design.md`

## Global Constraints

- Preserve all eight original Q11G parameter rows in `data/shearing-details.ts` unchanged.
- Preserve the nine existing Small Electric Shearing Machine FAQ questions and answers unchanged.
- Use real licensed photographs, never line drawings, for all eight applications and all six materials.
- Correct copied foot-shear wording from the source document to Q11G small-electric wording.
- Preserve the canonical route, shared navigation/footer, brand colors, responsive table behavior, and centered second-line units.
- Do not add unsupported accuracy, lifetime, stock, certification, price, delivery-time, energy-saving, or output claims.

## Review Focus

- Other shared shearing pages without item media must retain the icon-only card presentation.
- Every photo-led entry must have a unique existing file and descriptive alt text.
- The tenth advantage must not index past the icon array and crash rendering.
- The wide technical table must scroll locally on mobile without creating document-level horizontal overflow.
- The deployed page must retain exactly nine FAQs and all eight parameter rows.

---

### Task 1: Lock the refreshed content and media contract

**Files:**
- Create: `scripts/verify-small-electric-shear-media.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `smallElectricShearPageContent` exported by `data/small-electric-shear-page.ts`.
- Produces: `npm run verify:small-electric-shear-media`, an executable contract for the required applications, materials, images, advantages, parameters, and FAQs.

- [ ] **Step 1: Write the failing media/content contract**

Create a Node assertion script that imports the real content object, asserts these literal application titles:

```js
[
  "HVAC and Duct Fabrication",
  "Roofing and Architectural Sheet Work",
  "Sign Making and Metal Panel Preparation",
  "Electrical Cabinet and Enclosure Fabrication",
  "General Sheet Metal Fabrication",
  "Repair and Maintenance Workshops",
  "Small-Batch and Mixed Production",
  "Material Preparation Before Forming",
]
```

It must also assert six literal material titles, ten advantages, nine FAQs, eight unchanged Q11G rows, fourteen distinct existing `.webp` paths, descriptive alt text, and no `Foot Operated`/`foot-operated` wording in the refreshed data.

- [ ] **Step 2: Run the contract and verify RED**

Run: `npm run verify:small-electric-shear-media`

Expected: FAIL because the current page has seven applications, six advantages, no item images, and the old sixth material.

- [ ] **Step 3: Preserve the failing test for implementation**

Do not weaken the literal assertions. Record the failure as the proof that the new contract detects the old page.

### Task 2: Implement photo-led document content

**Files:**
- Modify: `data/shearing-solution-types.ts`
- Modify: `components/ShearingSolutionPage.tsx`
- Modify: `data/small-electric-shear-page.ts`

**Interfaces:**
- Consumes: optional `image?: string` and `alt?: string` on `ShearingSolutionItem`.
- Produces: conditional photo cards for media entries while leaving non-media entries unchanged.

- [ ] **Step 1: Extend the item type**

Add optional image and alt fields:

```ts
export type ShearingSolutionItem = {
  title: string;
  text: string;
  image?: string;
  alt?: string;
};
```

- [ ] **Step 2: Render application photography conditionally**

When `item.image` exists, render an aspect-ratio Next Image region above the content with `alt={item.alt ?? item.title}`, `fill`, responsive `sizes`, and `object-cover`. Keep the current icon card when no image exists.

- [ ] **Step 3: Render material photography conditionally**

Apply the same media contract to materials. Preserve the numbered content hierarchy and cautious capacity note.

- [ ] **Step 4: Make advantage icon selection length-safe**

Use modulo indexing so ten advantages reuse the icon set safely:

```ts
const Icon = advantageIcons[index % advantageIcons.length];
```

- [ ] **Step 5: Replace compact Q11G content from the document**

Update the overview, solution explanation, eight applications, six materials, ten advantages, and capacity-factor note. Use distinct existing Pexels-licensed project photos and descriptive literal alt text. Leave the `faqs` array and `data/shearing-details.ts` unchanged.

- [ ] **Step 6: Run the focused contracts and verify GREEN**

Run: `npm run verify:small-electric-shear-media && npm run verify:small-electric-shear-seo`

Expected: both contracts pass with the refreshed content.

### Task 3: Regression, browser QA, and deployment

**Files:**
- Verify: all modified files and deployed route

**Interfaces:**
- Consumes: the completed page implementation and build output.
- Produces: a deployable commit on `codex/small-electric-shear-docx-update`, then the same verified commit on `main` and production.

- [ ] **Step 1: Run focused regression checks**

Run:

```bash
npm run verify:small-electric-shear-media
npm run verify:small-electric-shear-seo
npm run verify:energy-saving-shear-seo
npm run verify:foot-shear-seo
npm run verify:foot-shear-media
```

Expected: every command exits 0.

- [ ] **Step 2: Run static and production checks**

Run: `npm run lint && npm run build && git diff --check`

Expected: ESLint reports no errors, Next.js builds successfully, and Git reports no whitespace errors.

- [ ] **Step 3: Run local browser QA**

Start the production server and inspect `/products/compact-electric-shearing-machine` at desktop and 390 × 844. Verify fourteen real photos load, the technical table contains eight rows and keeps its own horizontal scroll, the page has no horizontal overflow, an FAQ expands, and the browser console has no application errors.

- [ ] **Step 4: Commit the verified branch**

Run:

```bash
git add package.json scripts/verify-small-electric-shear-media.mjs data/shearing-solution-types.ts components/ShearingSolutionPage.tsx data/small-electric-shear-page.ts docs/superpowers/specs/2026-09-23-small-electric-shear-docx-refresh-design.md docs/superpowers/plans/2026-09-23-small-electric-shear-docx-refresh.md
git commit -m "feat: refresh small electric shear product page"
```

Expected: one commit containing the reviewed page, contract, design, and plan.

- [ ] **Step 5: Integrate and deploy the explicitly requested change**

Merge the verified feature branch into `main`, rerun the focused contracts and production build on `main`, then push `main` to `origin` so the configured hosting deployment starts.

- [ ] **Step 6: Verify production**

Open `https://www.zyroncnc.com/products/compact-electric-shearing-machine` with a cache-busting query. Confirm HTTP 200 and check live HTML/browser output for the refreshed eight application titles, Brass Sheet, ten advantages, original parameter rows, and existing FAQ content.
