# Manual Folding Machine Application Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the eight line-art application illustrations on the Manual Folding Machine page with eight distinct, locally hosted, licensed real photographs and deploy the verified change.

**Architecture:** Extend the existing application content records with `image` and `alt` fields so copy and imagery stay mapped in one source of truth. Store optimized WebP files and a source manifest under a dedicated public asset directory, then render them through Next.js `Image` inside the existing responsive card grid.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Node.js contract tests, Pexels source photography, macOS `sips` image conversion, Vercel production hosting.

## Global Constraints

- Use eight distinct real photographs: one for each existing application card.
- Source photographs only from Pexels under the Pexels License and preserve source-page and photographer details in a local manifest.
- Avoid prominent third-party trademarks and do not imply that photographed people or companies endorse ZYRON.
- Store optimized WebP files under `public/products/manual-folding-applications/`; do not hotlink images.
- Keep the existing application titles, descriptions, 4/2/1-column responsive grid, SEO metadata, schemas and technical parameters unchanged.
- Render application photos at a consistent 16:9 ratio with `object-cover`, application-specific alternative text and normal below-the-fold lazy loading.
- Remove only the Applications section line-art component; retain the separate folding process diagram.

---

### Task 1: Define the application-photo contract

**Files:**
- Modify: `scripts/verify-manual-folding-machine-page.mjs`

**Interfaces:**
- Consumes: `data/manual-folding-machine-page.ts`, `components/ManualFoldingMachineSolutionPage.tsx`, and files under `public/products/manual-folding-applications/`.
- Produces: Contract assertions for eight unique local WebP paths, descriptive alt text, a source manifest and raster rendering.

- [ ] **Step 1: Add the failing asset and rendering assertions**

Add `readdirSync` to the existing `node:fs` import and define the approved paths:

```js
const applicationImages = [
  "/products/manual-folding-applications/hvac-duct-panel-folding.webp",
  "/products/manual-folding-applications/roofing-sheet-metal-work.webp",
  "/products/manual-folding-applications/architectural-sheet-metal.webp",
  "/products/manual-folding-applications/signage-fabrication.webp",
  "/products/manual-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/manual-folding-applications/light-sheet-metal-workshop.webp",
  "/products/manual-folding-applications/repair-maintenance-workshop.webp",
  "/products/manual-folding-applications/on-site-sheet-metal-bending.webp",
];

assert.equal(new Set(applicationImages).size, 8, "Application photos must be unique");

for (const imagePath of applicationImages) {
  assertContains(contentSource, `image: "${imagePath}"`, "Missing application photo mapping");
  assert.ok(
    existsSync(resolve(root, `public${imagePath}`)),
    `Application photo file is missing: ${imagePath}`,
  );
}

assert.equal(
  (contentSource.match(/alt: "/g) ?? []).length,
  8,
  "Every application photo must have descriptive alt text",
);

const applicationAssetNames = readdirSync(
  resolve(root, "public/products/manual-folding-applications"),
).filter((name) => name.endsWith(".webp"));
assert.equal(applicationAssetNames.length, 8, "Exactly eight application WebP assets are required");

const sourceManifest = readSource("public/products/manual-folding-applications/SOURCES.md");
assertContains(sourceManifest, "https://www.pexels.com/license/", "Pexels license source is missing");
for (const photoId of [8297856, 9074493, 8368985, 15369831, 21812143, 15947586, 3855475, 31002308]) {
  assertContains(sourceManifest, String(photoId), "Pexels photo source is missing");
}

assertContains(componentSource, "<Image", "Applications must render raster photos");
assertContains(componentSource, "application.image", "Application image mapping is not rendered");
assertContains(componentSource, "application.alt", "Application image alt text is not rendered");
assert.doesNotMatch(componentSource, /function ApplicationSketch|line diagram/, "Application line art must be removed");
```

- [ ] **Step 2: Run the contract and confirm it fails for missing images**

Run:

```bash
node scripts/verify-manual-folding-machine-page.mjs
```

Expected: FAIL because the application image mappings and local WebP assets do not exist yet.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify-manual-folding-machine-page.mjs
git commit -m "test: require real manual folding application photos"
```

---

### Task 2: Add licensed WebP assets and typed content mappings

**Files:**
- Create: `public/products/manual-folding-applications/hvac-duct-panel-folding.webp`
- Create: `public/products/manual-folding-applications/roofing-sheet-metal-work.webp`
- Create: `public/products/manual-folding-applications/architectural-sheet-metal.webp`
- Create: `public/products/manual-folding-applications/signage-fabrication.webp`
- Create: `public/products/manual-folding-applications/electrical-cabinet-enclosure.webp`
- Create: `public/products/manual-folding-applications/light-sheet-metal-workshop.webp`
- Create: `public/products/manual-folding-applications/repair-maintenance-workshop.webp`
- Create: `public/products/manual-folding-applications/on-site-sheet-metal-bending.webp`
- Create: `public/products/manual-folding-applications/SOURCES.md`
- Modify: `data/manual-folding-machine-page.ts`

**Interfaces:**
- Consumes: Eight approved Pexels photo IDs and the existing `ManualFoldingTextCard` content.
- Produces: `ManualFoldingApplication` records with `{ title, text, image, alt }` for the page component.

- [ ] **Step 1: Download the approved photographs to a temporary directory**

Use these exact source records:

```text
8297856  Mikhail Nilov                 HVAC duct panel folding
9074493  Arayik Manukyan              Roofing sheet metal work
8368985  Mathias Reding               Architectural sheet metal
15369831 Şevval Karataş               Signage fabrication
21812143 Shameer Vayalakkad Hydrose   Electrical cabinet and enclosure
15947586 Hoang NC                     Light sheet metal workshop
3855475  Andrea Piacquadio            Repair and maintenance workshop
31002308 Kaybee Photography           On-site sheet metal bending
```

Download each Pexels CDN image at 1200 × 675 with `fit=crop` to `/tmp/manual-folding-application-source-<id>.jpg`; require HTTP 200 and `image/jpeg` before saving.

- [ ] **Step 2: Convert all eight photographs to local WebP assets**

Create `public/products/manual-folding-applications/` and run `sips` for each approved source:

```bash
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-8297856.jpg --out public/products/manual-folding-applications/hvac-duct-panel-folding.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-9074493.jpg --out public/products/manual-folding-applications/roofing-sheet-metal-work.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-8368985.jpg --out public/products/manual-folding-applications/architectural-sheet-metal.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-15369831.jpg --out public/products/manual-folding-applications/signage-fabrication.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-21812143.jpg --out public/products/manual-folding-applications/electrical-cabinet-enclosure.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-15947586.jpg --out public/products/manual-folding-applications/light-sheet-metal-workshop.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-3855475.jpg --out public/products/manual-folding-applications/repair-maintenance-workshop.webp
sips -s format webp -s formatOptions 76 /tmp/manual-folding-application-source-31002308.jpg --out public/products/manual-folding-applications/on-site-sheet-metal-bending.webp
```

Expected: eight 1200 × 675 WebP files, each below 300 KB.

- [ ] **Step 3: Add the source manifest**

Create `SOURCES.md` with the Pexels license URL, access date `2026-07-21`, the eight exact photo-page URLs, photographer names and their corresponding local filenames. State that the photographs illustrate general applications and do not depict ZYRON customers or the exact ZYRON product.

- [ ] **Step 4: Extend the content type and map each photograph**

Add this type:

```ts
export type ManualFoldingApplication = ManualFoldingTextCard & {
  image: string;
  alt: string;
};
```

Change `applications` in `ManualFoldingMachinePageContent` to `ManualFoldingApplication[]`. Add these image and alt pairs to the existing eight application objects without changing their current titles or text:

```ts
image: "/products/manual-folding-applications/hvac-duct-panel-folding.webp",
alt: "Installed rectangular HVAC ductwork made from folded sheet metal",
```

```ts
image: "/products/manual-folding-applications/roofing-sheet-metal-work.webp",
alt: "Worker carrying out metal roofing fabrication on a building",
```

```ts
image: "/products/manual-folding-applications/architectural-sheet-metal.webp",
alt: "Modern architectural facade formed from reflective sheet metal panels",
```

```ts
image: "/products/manual-folding-applications/signage-fabrication.webp",
alt: "Crafted metal panel being formed for decorative signage work",
```

```ts
image: "/products/manual-folding-applications/electrical-cabinet-enclosure.webp",
alt: "Technician working inside an industrial electrical control enclosure",
```

```ts
image: "/products/manual-folding-applications/light-sheet-metal-workshop.webp",
alt: "Metal fabrication team working across an industrial workshop floor",
```

```ts
image: "/products/manual-folding-applications/repair-maintenance-workshop.webp",
alt: "Technician repairing a metal component at a workshop bench",
```

```ts
image: "/products/manual-folding-applications/on-site-sheet-metal-bending.webp",
alt: "Workers assembling metal components at an outdoor job site",
```

- [ ] **Step 5: Verify the asset dimensions, formats and content mappings**

Run `file`, `sips -g pixelWidth -g pixelHeight` and a file-size check across the eight assets. Run the page contract; the asset assertions should pass and the component rendering assertions should remain the only expected failure.

- [ ] **Step 6: Commit assets and mappings**

```bash
git add public/products/manual-folding-applications data/manual-folding-machine-page.ts
git commit -m "feat: add manual folding application photos"
```

---

### Task 3: Render real photographs in the Applications section

**Files:**
- Modify: `components/ManualFoldingMachineSolutionPage.tsx`

**Interfaces:**
- Consumes: `content.applications: ManualFoldingApplication[]` with `image` and `alt` properties.
- Produces: Eight responsive 16:9 Next.js images inside the existing application cards.

- [ ] **Step 1: Remove the line-art component**

Delete `ApplicationSketch` completely. Do not remove `FoldingDiagram`, which belongs to the separate Process section.

- [ ] **Step 2: Replace the SVG call with Next.js Image**

Replace:

```tsx
<ApplicationSketch index={index} title={application.title} />
```

with:

```tsx
<div className="relative aspect-video overflow-hidden bg-neutral-900">
  <Image
    src={application.image}
    alt={application.alt}
    fill
    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
    className="object-cover transition duration-500 group-hover:scale-[1.03]"
  />
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
</div>
```

Remove the now-unused `index` parameter from the `content.applications.map` callback.

- [ ] **Step 3: Run the focused contract**

Run:

```bash
node scripts/verify-manual-folding-machine-page.mjs
```

Expected: `Manual Folding Machine page contract passed.`

- [ ] **Step 4: Run static validation**

```bash
npm run lint
npx tsc --noEmit
```

Expected: both commands exit with code 0.

- [ ] **Step 5: Commit the component change**

```bash
git add components/ManualFoldingMachineSolutionPage.tsx
git commit -m "feat: show real manual folding application photos"
```

---

### Task 4: Validate, deploy and verify production

**Files:**
- Verify: all tracked changes from Tasks 1–3
- Deploy: existing Vercel project linked by `.vercel/project.json`

**Interfaces:**
- Consumes: The completed application-photo implementation.
- Produces: A verified deployment at `https://www.zyroncnc.com/products/manual-sheet-metal-folding-machine`.

- [ ] **Step 1: Run every product-page contract and production build**

```bash
for test in scripts/verify-*.mjs; do node "$test"; done
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all contracts pass, lint and TypeScript exit 0, and Next.js completes the production build.

- [ ] **Step 2: Run rendered desktop and mobile QA**

The flow under test is: `/products/manual-sheet-metal-folding-machine` → scroll to `data-section="applications"` → eight distinct real photos render in aligned cards with no line-art application SVG, clipping, horizontal page overflow or console errors.

Check 1440-pixel desktop and 390-pixel mobile widths. Confirm page identity, non-empty content, no framework overlay, console health, image load completion and one FAQ open/close interaction. Save screenshots outside the repository.

- [ ] **Step 3: Push the verified commits**

```bash
git push origin main
git rev-parse HEAD
git rev-parse origin/main
```

Expected: local `HEAD` and `origin/main` are identical.

- [ ] **Step 4: Deploy the existing Vercel production project**

```bash
npx vercel --prod --yes
```

Expected: deployment is ready and aliased to `https://www.zyroncnc.com`.

- [ ] **Step 5: Verify the official production page**

Fetch the official page with cache bypass and assert HTTP 200, the exact SEO title and canonical, one H1, all 13 section markers, eight unique application image URLs, HTTP 200 for every application image, no `ApplicationSketch` line-diagram markup, the four original parameter rows, the three JSON-LD types, the legacy 308 redirect and the sitemap canonical URL.

- [ ] **Step 6: Confirm the repository is clean**

```bash
git status --short --branch
```

Expected: `main` matches `origin/main` with no uncommitted files.
