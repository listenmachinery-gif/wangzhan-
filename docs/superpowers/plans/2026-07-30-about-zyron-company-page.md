# About ZYRON Company Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the lightweight `/factory` route with one evidence-led About
ZYRON manufacturing page and simplify Company navigation to one direct link.

**Architecture:** Keep page copy and data server rendered through
`data/company.ts` and focused server components. Limit client JavaScript to an
accessible media dialog, FAQ accordion, click-to-load video, and expanded
inquiry form that reuses `/api/inquiry`. The current header, footer, product
catalog, language entry, contact details, sitemap, and Vercel project remain in
place.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS,
`next/image`, lucide-react, Node-based source contracts, Codex in-app browser.

## Global Constraints

- Canonical route remains `/factory`.
- Desktop navigation label is exactly `ABOUT ZYRON` and has no dropdown.
- Do not create `/about`, duplicate the page, or change existing contact values.
- Use only existing site imagery; do not add competitor or AI factory evidence.
- Existing statistics are centralized and marked `VERIFY BEFORE PUBLISHING`.
- Do not invent production equipment, customers, patents, output, staffing,
  certifications, export coverage, or service promises.
- Use exactly one H1 and server-render all core page copy.
- Preserve sitemap, robots, product navigation, language entry, inquiry
  endpoint, Header, Footer, and existing product pages.
- Required metadata and JSON-LD must match the design specification exactly.
- Non-hero images use lazy loading, responsive sizes, and stable aspect ratios.

---

### Task 1: Create the About page source contract

**Files:**
- Create: `scripts/verify-about-zyron-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `components/SiteHeader.tsx`, `app/factory/page.tsx`,
  `components/company/**`, `data/company.ts`, and public assets.
- Produces: `npm run verify:about-zyron`.

- [ ] **Step 1: Write the failing contract**

Create assertions that verify:

```js
assert.match(header, /<NavItem href="\\/factory" label="ABOUT ZYRON" \\/>/);
assert.doesNotMatch(header, /SimpleDropdown label="COMPANY"/);
assert.match(route, /About ZYRON Heavy Industry \\| Sheet Metal Machinery Manufacturer/);
assert.equal((companyPage.match(/data-company-section="/g) ?? []).length, 16);
assert.equal((companyPage.match(/<h1\\b/g) ?? []).length, 1);
```

Also assert:

- four current stats and `VERIFY BEFORE PUBLISHING`;
- Organization, WebPage, BreadcrumbList, and FAQPage schemas;
- current email, WhatsApp, and address;
- eight product-series links;
- real factory, certificate, detail, gallery, and exhibition image paths;
- button-controlled FAQ with `aria-expanded`;
- accessible media dialog and Escape handling;
- extended company inquiry fields and honeypot;
- absence of unsupported absolutes and fake customer/logo claims.

- [ ] **Step 2: Register the script**

Add:

```json
"verify:about-zyron": "node scripts/verify-about-zyron-page.mjs"
```

- [ ] **Step 3: Run the contract to verify red**

Run:

```bash
npm run verify:about-zyron
```

Expected: FAIL because the direct About navigation and company components do
not exist.

- [ ] **Step 4: Commit the contract**

```bash
git add package.json scripts/verify-about-zyron-page.mjs
git commit -m "test: define About ZYRON page contract"
```

### Task 2: Centralize company content and evidence

**Files:**
- Create: `data/company.ts`
- Create: `docs/company-page-photo-shot-list.md`

**Interfaces:**
- Produces typed exports:
  `companyIdentity`, `companyStats`, `companyFocus`,
  `manufacturingCapabilities`, `productSystem`, `engineeringProcess`,
  `customizationOptions`, `qualityProcess`, `testingChecks`, `certificates`,
  `factoryGallery`, `packingProcess`, `globalServices`, `whyZyron`, and
  `companyFaqs`.
- Consumed by every company page component and JSON-LD.

- [ ] **Step 1: Define exact data types**

Use explicit types such as:

```ts
export type CompanyStat = {
  value: string;
  label: string;
  verification: "existing-site-data";
};

export type CompanyMediaItem = {
  src: string;
  title: string;
  description: string;
  alt: string;
  width: number;
  height: number;
};
```

- [ ] **Step 2: Centralize the four current stats**

Include one code comment above the array:

```ts
// VERIFY BEFORE PUBLISHING: values are inherited from the existing live site.
```

Do not add numeric claims beyond the four current values.

- [ ] **Step 3: Map real site media**

Use:

- `/brand/factory-showcase.png`
- `/brand/certificates-showcase.png`
- `/products/detail-body.jpg`
- `/products/detail-welded-body.jpg`
- `/products/detail-rear-power.jpg`
- `/products/detail-electric-inside.jpg`
- `/products/detail-control-inside.jpg`
- `/products/detail-adjustment.jpg`
- `/products/detail-front.jpg`
- `/products/detail-positioning.jpg`
- `/brand/exhibition/exhibition-booth-01.png` through `06.png`

Captions must describe visible evidence without claiming an unsupported process.

- [ ] **Step 4: Add the photo shot list**

Document every missing requested factory photo with recommended ratio, angle,
page use, ZYRON-logo requirement, and background-cleanup guidance.

- [ ] **Step 5: Run the focused contract**

Run:

```bash
npm run verify:about-zyron
```

Expected: still FAIL on missing route/components while data and media assertions
start passing.

- [ ] **Step 6: Commit content and evidence**

```bash
git add data/company.ts docs/company-page-photo-shot-list.md
git commit -m "feat: add verified About ZYRON content"
```

### Task 3: Simplify navigation to one About ZYRON page

**Files:**
- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`

**Interfaces:**
- Produces one desktop and mobile link to `/factory`.
- Preserves product mega menu, support dropdown, language menu, quote CTA, and
  all other navigation.

- [ ] **Step 1: Remove the Company dropdown data and call**

Replace:

```tsx
<SimpleDropdown label="COMPANY" href="/factory" links={aboutLinks} />
```

with:

```tsx
<NavItem href="/factory" label="ABOUT ZYRON" />
```

Remove `aboutLinks` only; retain `newsLinks` and `SimpleDropdown` for Support.

- [ ] **Step 2: Update mobile and footer labels**

Use `About ZYRON` for the mobile link and footer Explore link. Remove the
duplicate `Factory & Solutions` footer item.

- [ ] **Step 3: Run focused contract and lint**

```bash
npm run verify:about-zyron
npm run lint
```

Expected: navigation assertions PASS; page assertions still FAIL.

- [ ] **Step 4: Commit navigation**

```bash
git add components/SiteHeader.tsx components/SiteFooter.tsx
git commit -m "refactor: simplify About ZYRON navigation"
```

### Task 4: Build server-rendered company content

**Files:**
- Create: `components/company/CompanyHero.tsx`
- Create: `components/company/CompanyOverview.tsx`
- Create: `components/company/ManufacturingCapabilities.tsx`
- Create: `components/company/ProductSystem.tsx`
- Create: `components/company/EngineeringQualitySections.tsx`
- Create: `components/company/CompanySupportSections.tsx`
- Create: `components/company/CompanyPage.tsx`
- Modify: `app/factory/page.tsx`

**Interfaces:**
- `CompanyPage` composes the 16 required
  `data-company-section="<id>"` section markers.
- Server components consume typed arrays from `data/company.ts`.
- ProductSystem resolves `getCategoryHref()` and existing category imagery.

- [ ] **Step 1: Implement the hero and overview**

Hero requirements:

```tsx
<section data-company-section="hero">
  <h1>Manufacturing Strength Behind Complete Sheet Metal Solutions</h1>
  <Link href="#manufacturing-capability">Explore Our Manufacturing</Link>
  <Link href="/contact">Talk to an Engineer</Link>
</section>
```

Use `/brand/factory-showcase.png` with `priority`, the exact eyebrow and body
copy, and the four stats from `data/company.ts`.

- [ ] **Step 2: Implement manufacturing and product-system sections**

Manufacturing rows alternate on desktop and use image-first order on mobile.
ProductSystem maps all eight `productCategories`, existing images, and
`getCategoryHref()` links with descriptive `aria-label` attributes.

- [ ] **Step 3: Implement engineering, customization, quality, and testing**

Render:

- three engineering input groups and five-step technical process;
- twelve conditional customization options plus the feasibility disclaimer;
- ten-step quality process with the machine-specific inspection disclaimer;
- testing checklist and the existing local video without autoplay.

- [ ] **Step 4: Implement packing, support, Why ZYRON, and visit CTA**

Include seven packing steps, six service areas and five-step service flow, six
reasons to choose ZYRON, the exact factory contact information, and three
conversion points from the spec.

- [ ] **Step 5: Replace the route content**

`app/factory/page.tsx` should only define metadata and render:

```tsx
export default function FactoryPage() {
  return <CompanyPage />;
}
```

- [ ] **Step 6: Run focused contract, lint, and build**

```bash
npm run verify:about-zyron
npm run lint
npm run build
```

Expected: contract may still fail only on interactive components; lint and
build must pass.

- [ ] **Step 7: Commit server content**

```bash
git add app/factory/page.tsx components/company
git commit -m "feat: build About ZYRON manufacturing page"
```

### Task 5: Add accessible media, FAQ, video, and inquiry interactions

**Files:**
- Create: `components/company/CompanyMediaDialog.tsx`
- Create: `components/company/CompanyFaq.tsx`
- Create: `components/company/TestingVideo.tsx`
- Create: `components/company/CompanyInquiryForm.tsx`
- Modify: `components/company/CompanyPage.tsx`
- Modify: `app/api/inquiry/route.ts`

**Interfaces:**
- Media dialog consumes `CompanyMediaItem[]`.
- FAQ consumes `CompanyFaq[]`.
- CompanyInquiryForm posts compatible JSON to `/api/inquiry`.
- Existing Contact-page InquiryForm remains operational.

- [ ] **Step 1: Implement media dialog**

Use a native `<dialog>` client component. Trigger buttons expose meaningful
labels. On open, call `showModal()` and focus the close button. On close, restore
focus to the trigger. Listen for Escape and close. Use an uncropped
`object-contain` layout for certificates.

- [ ] **Step 2: Implement FAQ**

Each question uses:

```tsx
<button
  type="button"
  aria-expanded={openIndex === index}
  aria-controls={`company-faq-answer-${index}`}
>
```

Default the first item open. Render answers from the same data array used by
FAQPage JSON-LD.

- [ ] **Step 3: Implement click-to-load video**

Render the poster and a button before the local video. Only mount the controlled
`<video controls preload="metadata">` after activation. Never autoplay.

- [ ] **Step 4: Extend the inquiry endpoint compatibly**

Add optional fields:

```ts
company?: unknown;
country?: unknown;
material?: unknown;
thicknessRange?: unknown;
workingLength?: unknown;
targetOutput?: unknown;
website?: unknown;
```

Return 400 with a generic success-like response when the honeypot `website` is
filled. Preserve current required fields and current Contact form payload.

- [ ] **Step 5: Implement CompanyInquiryForm**

Provide all requested labelled fields, native required validation, status
message with `aria-live`, focus-visible styling, no overflow, and the current
mail fallback with every field included.

- [ ] **Step 6: Run focused and regression checks**

```bash
npm run verify:about-zyron
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 7: Commit interactions**

```bash
git add app/api/inquiry/route.ts components/company
git commit -m "feat: add accessible About ZYRON interactions"
```

### Task 6: Add SEO and structured data

**Files:**
- Modify: `app/factory/page.tsx`
- Modify: `components/company/CompanyPage.tsx`

**Interfaces:**
- Metadata uses exact title, description, canonical, robots, OG, and Twitter
  values.
- CompanyPage emits Organization, WebPage, BreadcrumbList, and FAQPage scripts.

- [ ] **Step 1: Add route metadata**

Use:

```ts
export const metadata: Metadata = {
  title: "About ZYRON Heavy Industry | Sheet Metal Machinery Manufacturer",
  description:
    "Explore ZYRON Heavy Industry’s factory, manufacturing process, quality control, product range, testing, export packing, certificates, and global machinery support.",
  alternates: { canonical: "/factory" },
  robots: { index: true, follow: true },
};
```

Add matching Open Graph and Twitter values with
`/brand/factory-showcase.png`.

- [ ] **Step 2: Add JSON-LD**

Serialize with `<` escaping and omit offers, prices, ratings, or unsupported
social links. Organization uses `companyIdentity`; FAQPage uses the visible FAQ
array.

- [ ] **Step 3: Run contract and production build**

```bash
npm run verify:about-zyron
npm run lint
npm run build
```

Expected: PASS with `/factory` generated as static content.

- [ ] **Step 4: Commit SEO**

```bash
git add app/factory/page.tsx components/company/CompanyPage.tsx
git commit -m "feat: add About ZYRON SEO and structured data"
```

### Task 7: Browser QA and production release

**Files:**
- Modify only files required by browser findings.

**Interfaces:**
- Validated route:
  `http://127.0.0.1:3100/factory`
- Production route:
  `https://www.zyroncnc.com/factory`

- [ ] **Step 1: Run all source and build checks**

```bash
npm run verify:about-zyron
npm run verify:electric-two-roll-rolling
npm run verify:sheet-and-tube-laser
npm run verify:fiber-tube-laser
npm run verify:single-table-laser
npm run verify:exchange-table-laser
npm run verify:nc-press-brake
npm run verify:torsion-bar-press-brake
npm run lint
npm run build
```

- [ ] **Step 2: Test in the in-app browser**

At 360, 390, 430, 768, 1024, 1280, 1440, and 1920:

- confirm one H1 and 16 section markers;
- confirm no document-level horizontal overflow;
- confirm hero CTAs remain visible;
- confirm 8 product links and images;
- confirm all gallery images load;
- open and close certificate/gallery dialogs with button, Escape, and backdrop;
- expand/collapse FAQ and verify `aria-expanded`;
- submit an empty inquiry form and observe native validation;
- verify sticky-header anchor offset;
- check console warnings/errors and framework overlays.

- [ ] **Step 3: Re-run checks after browser fixes**

Repeat the focused contract, lint, and build after any UI edit.

- [ ] **Step 4: Merge and push**

Fast-forward the verified feature branch into `main`, rerun the focused
contract, lint, and build in the merged checkout, then push `main`.

- [ ] **Step 5: Deploy the existing Vercel project**

Run:

```bash
npx --yes vercel@56.5.0 --prod --yes
```

Wait for `Ready` and the existing `www.zyroncnc.com` alias.

- [ ] **Step 6: Verify production**

Assert on the live HTML:

- HTTP 200;
- exact metadata title and description;
- direct ABOUT ZYRON header link;
- one H1 and 16 section markers;
- all four JSON-LD types;
- factory and certificate assets return 200;
- `/factory` remains in `sitemap.xml`;
- all eight category links are present.
