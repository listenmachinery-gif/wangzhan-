import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readSource = (relativePath) => {
  const filePath = resolve(root, relativePath);
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
};

const productsSource = readSource("data/products.ts");
const detailsSource = readSource("data/bending-details.ts");
const contentSource = readSource("data/hydraulic-folding-machine-page.ts");
const componentSource = readSource("components/HydraulicFoldingMachineSolutionPage.tsx");
const routeSource = readSource("app/products/[id]/page.tsx");
const existingManifests = [
  "public/products/manual-folding-applications/SOURCES.md",
  "public/products/electric-folding-applications/SOURCES.md",
  "public/products/pneumatic-folding-applications/SOURCES.md",
].map(readSource).join("\n");

assert.ok(contentSource, "Dedicated Hydraulic Folding Machine content is missing");
assert.ok(componentSource, "Dedicated Hydraulic Folding Machine component is missing");

const assertContains = (source, value, label) => {
  assert.ok(source.includes(value), `${label}: ${value}`);
};

const expectedRows = [
  ["HWS-2 x 1300", "2 mm", "1300 mm", "3 kW", "1400 kg", "2150 x 1100 x 1450mm"],
  ["HWS-2 x 1600", "2 mm", "1600 mm", "3 kW", "1600 kg", "2450 x 1100 x 1500mm"],
  ["HWS-2 x 2000", "2 mm", "2000 mm", "4 kW", "2000 kg", "2850 x 1100 x 1500mm"],
  ["HWS-2 x 2500", "2 mm", "2500 mm", "5.5 kW", "2200 kg", "3350 x 1150 x 1500mm"],
  ["HWS-3 x 1600", "3 mm", "1600 mm", "5.5 kW", "1900 kg", "2450 x 1100 x 1500mm"],
  ["HWS-3 x 2000", "3 mm", "2000 mm", "7.5 kW", "2200 kg", "2850 x 1150 x 1500mm"],
  ["HWS-4 x 1600", "4 mm", "1600 mm", "7.5 kW", "2000 kg", "2450 x 1150 x 1500mm"],
];

for (const row of expectedRows) {
  for (const value of row) {
    assertContains(detailsSource, `"${value}"`, "Verified hydraulic technical value changed or is missing");
  }
}

for (const value of [
  'name: "Hydraulic Sheet Metal Folding Machine"',
  'detailKey: "hydraulic-folding-machine"',
  'legacyIds: ["hydraulic-folding-machine"]',
]) {
  assertContains(productsSource, value, "Missing hydraulic folding product identity");
}

const applicationImages = [
  "/products/hydraulic-folding-applications/hvac-duct-panel-folding.webp",
  "/products/hydraulic-folding-applications/rectangular-air-duct-fabrication.webp",
  "/products/hydraulic-folding-applications/roofing-sheet-metal-work.webp",
  "/products/hydraulic-folding-applications/architectural-sheet-metal.webp",
  "/products/hydraulic-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/hydraulic-folding-applications/stainless-steel-light-fabrication.webp",
  "/products/hydraulic-folding-applications/long-edge-sheet-metal-bending.webp",
  "/products/hydraulic-folding-applications/general-sheet-metal-workshop.webp",
];

assert.equal(new Set(applicationImages).size, 8, "Application photo paths must be unique");

for (const imagePath of applicationImages) {
  assertContains(contentSource, `image: "${imagePath}"`, "Missing application photo mapping");
  assert.ok(existsSync(resolve(root, `public${imagePath}`)), `Application photo file is missing: ${imagePath}`);
}

assert.equal((contentSource.match(/alt: "/g) ?? []).length, 8, "Every application photo needs alt text");

const applicationDirectory = resolve(root, "public/products/hydraulic-folding-applications");
assert.ok(existsSync(applicationDirectory), "Hydraulic application photo directory is missing");
assert.equal(
  readdirSync(applicationDirectory).filter((name) => name.endsWith(".webp")).length,
  8,
  "Exactly eight hydraulic application WebP assets are required",
);

const sourceManifest = readSource("public/products/hydraulic-folding-applications/SOURCES.md");
assertContains(sourceManifest, "https://www.pexels.com/license/", "Pexels license source is missing");
for (const photoId of [32032996, 15106927, 37704240, 9410735, 34526423, 29543207, 32845684, 33694015]) {
  assertContains(sourceManifest, String(photoId), "Pexels photo source is missing");
  assert.ok(!existingManifests.includes(String(photoId)), `Photo ${photoId} must be new to this page`);
}

for (const value of [
  "Hydraulic Folding Machine",
  "Heavy-duty sheet metal folding solution for HVAC duct fabrication, long edge bending and workshop production.",
  "Manual or pneumatic folding is not enough for heavier work",
  "Medium & Heavy-duty Sheet Metal Workshop",
  "Hydraulic System for Stable Folding",
  "From Flat Sheet to Folded Panel",
  "Power source",
  "Press Brake",
  "Need hydraulic cooling system",
  "What is a hydraulic folding machine?",
  "Need a Stronger Sheet Metal Folding Solution?",
]) {
  assertContains(contentSource, value, "Missing approved Hydraulic Folding Machine copy");
}

for (const section of [
  "hero",
  "problems",
  "solutions",
  "applications",
  "materials",
  "hydraulic-system",
  "process",
  "advantages",
  "comparison",
  "equipment",
  "selection",
  "technical",
  "faq",
  "cta",
]) {
  assertContains(componentSource, `data-section="${section}"`, "Missing dedicated page section");
}

assert.equal((componentSource.match(/<h1\b/g) ?? []).length, 1, "Hydraulic page must have one H1");
assert.match(
  componentSource,
  /<h1[\s\S]*?\{content\.hero\.title\}[\s\S]*?<\/h1>/,
  "The H1 must render the approved title",
);
assertContains(
  componentSource,
  'alt="Hydraulic folding machine for sheet metal and HVAC duct panel folding"',
  "Hero image alt text is missing",
);
assertContains(componentSource, "application.image", "Application photo mapping is not rendered");
assertContains(componentSource, "application.alt", "Application photo alt text is not rendered");
assert.doesNotMatch(componentSource, /ApplicationSketch|application line diagram/i, "Applications must use photos");

assertContains(componentSource, "inferColumnUnit", "Technical unit inference is missing");
assertContains(componentSource, "stripDisplayUnit", "Technical display-unit stripping is missing");
for (const unit of ["mm", "kW", "kg"]) {
  assertContains(componentSource, `"${unit}"`, "Technical display unit is missing");
}
assert.match(
  componentSource,
  /className="whitespace-nowrap[^"]*text-center/,
  "Technical labels must stay connected and centered",
);
assert.match(
  componentSource,
  /unit[\s\S]*className="[^"]*block[^"]*text-center/,
  "Technical units must render on a centered second line",
);
assert.match(componentSource, /max-w-full overflow-x-auto/, "Wide tables need local horizontal scrolling");
assertContains(
  componentSource,
  "Final specifications depend on sheet material, thickness, bending length, hydraulic configuration and selected machine structure.",
  "Technical qualification note is missing",
);

for (const schemaType of ["ProductModel", "BreadcrumbList", "FAQPage"]) {
  assertContains(componentSource, `"@type": "${schemaType}"`, `Missing ${schemaType} schema`);
}
assert.doesNotMatch(
  componentSource,
  /priceCurrency|aggregateRating|availability|offers\s*:|review\s*:/,
  "Hydraulic Folding Machine schema must not invent commercial or review data",
);

assert.match(routeSource, /import HydraulicFoldingMachineSolutionPage/, "Route must import the dedicated page");
assert.match(
  routeSource,
  /product\.id === "hydraulic-sheet-metal-folding-machine"[\s\S]*?<HydraulicFoldingMachineSolutionPage product=\{product\}/,
  "Route must render the dedicated hydraulic page",
);
assertContains(
  routeSource,
  "Hydraulic Folding Machine | Sheet Metal & HVAC Duct Folding Solution",
  "Approved metadata title is missing",
);
assertContains(
  routeSource,
  "Hydraulic folding machine for sheet metal edge bending, HVAC duct panel folding, long edge forming and workshop production. Get a suitable hydraulic sheet metal folding solution.",
  "Approved metadata description is missing",
);

console.log("Hydraulic Folding Machine page contract passed.");
