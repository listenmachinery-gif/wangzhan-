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
const contentSource = readSource("data/pneumatic-folding-machine-page.ts");
const componentSource = readSource("components/PneumaticFoldingMachineSolutionPage.tsx");
const routeSource = readSource("app/products/[id]/page.tsx");
const manualManifest = readSource("public/products/manual-folding-applications/SOURCES.md");

assert.ok(contentSource, "Dedicated Pneumatic Folding Machine content is missing");
assert.ok(componentSource, "Dedicated Pneumatic Folding Machine component is missing");

const assertContains = (source, value, label) => {
  assert.ok(source.includes(value), `${label}: ${value}`);
};

const expectedRows = [
  ["QS-1.5 x 1000", "60 deg", "0.3-1.5 mm", "1000 mm", "380 kg", "1650 x 680 x 1350mm"],
  ["QS-1.5 x 1300", "60 deg", "0.3-1.5 mm", "1300 mm", "420 kg", "1980 x 800 x 1350mm"],
  ["QS-1.5 x 1500", "60 deg", "0.3-1.5 mm", "1500 mm", "550 kg", "2180 x 800 x 1350mm"],
  ["QS-1.5 x 2000", "60 deg", "0.3-1.5 mm", "2000 mm", "620 kg", "2680 x 800 x 1350mm"],
  ["QS-1.5 x 2500", "60 deg", "0.3-1.5 mm", "2500 mm", "700 kg", "3180 x 800 x 1350mm"],
];

for (const row of expectedRows) {
  for (const value of row) {
    assertContains(detailsSource, `"${value}"`, "Verified pneumatic technical value changed or is missing");
  }
}

for (const value of [
  'name: "Pneumatic Sheet Metal Folding Machine"',
  'detailKey: "pneumatic-folding-machine"',
  'legacyIds: ["pneumatic-folding-machine"]',
]) {
  assertContains(productsSource, value, "Missing pneumatic folding product identity");
}

const applicationImages = [
  "/products/pneumatic-folding-applications/hvac-duct-panel-folding.webp",
  "/products/pneumatic-folding-applications/rectangular-air-duct-fabrication.webp",
  "/products/pneumatic-folding-applications/ventilation-duct-workshop.webp",
  "/products/pneumatic-folding-applications/galvanized-sheet-folding.webp",
  "/products/pneumatic-folding-applications/light-sheet-metal-fabrication.webp",
  "/products/pneumatic-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/pneumatic-folding-applications/stainless-steel-light-forming.webp",
  "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
];

assert.equal(new Set(applicationImages).size, 8, "Application photo paths must be unique");

for (const imagePath of applicationImages) {
  assertContains(contentSource, `image: "${imagePath}"`, "Missing application photo mapping");
  assert.ok(existsSync(resolve(root, `public${imagePath}`)), `Application photo file is missing: ${imagePath}`);
}

assert.equal(
  (contentSource.match(/alt: "/g) ?? []).length,
  8,
  "Every application photo must have descriptive alt text",
);

const applicationDirectory = resolve(root, "public/products/pneumatic-folding-applications");
assert.ok(existsSync(applicationDirectory), "Pneumatic application photo directory is missing");
const applicationAssetNames = readdirSync(applicationDirectory).filter((name) => name.endsWith(".webp"));
assert.equal(applicationAssetNames.length, 8, "Exactly eight pneumatic application WebP assets are required");

const sourceManifest = readSource("public/products/pneumatic-folding-applications/SOURCES.md");
assertContains(sourceManifest, "https://www.pexels.com/license/", "Pexels license source is missing");
for (const photoId of [30749458, 28914401, 5505867, 5845972, 9242175, 33694019, 5362681, 7788264]) {
  assertContains(sourceManifest, String(photoId), "Pexels photo source is missing");
  assert.ok(!manualManifest.includes(String(photoId)), `Photo ${photoId} must not repeat the Manual Folding Machine set`);
}

for (const value of [
  "Pneumatic Folding Machine",
  "Efficient air-driven sheet metal folding solution for HVAC duct fabrication and thin metal forming.",
  "Manual folding is tiring for repeated duct work",
  "HVAC Duct Fabrication",
  "Galvanized Sheet",
  "Compressed Air Requirement",
  "Pneumatic Clamping",
  "Four-cylinder pneumatic structure",
  "Power source",
  "Shearing Machine",
  "Available air pressure",
  "What is a pneumatic folding machine?",
  "Need an Air-driven Sheet Metal Folding Solution?",
]) {
  assertContains(contentSource, value, "Missing approved Pneumatic Folding Machine copy");
}

for (const section of [
  "hero",
  "problems",
  "solutions",
  "applications",
  "materials",
  "air",
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

assert.equal(
  (componentSource.match(/<h1\b/g) ?? []).length,
  1,
  "Pneumatic Folding Machine page must contain exactly one H1 in source",
);
assert.match(
  componentSource,
  /<h1[\s\S]*?\{content\.hero\.title\}[\s\S]*?<\/h1>/,
  "The single H1 must render the approved Pneumatic Folding Machine title",
);
assertContains(
  componentSource,
  'alt="Pneumatic folding machine for HVAC duct sheet metal folding"',
  "Hero image alt text is missing",
);
assertContains(componentSource, "application.image", "Application image mapping is not rendered");
assertContains(componentSource, "application.alt", "Application image alt text is not rendered");
assert.doesNotMatch(
  componentSource,
  /function ApplicationSketch|application line diagram/i,
  "Applications must use real photographs rather than line drawings",
);

assertContains(contentSource, "export const technicalHeadings", "Technical heading display map is missing");
for (const unit of ["(deg)", "(mm)", "(kg)"]) {
  assertContains(contentSource, `unit: "${unit}"`, "Technical heading unit is missing");
}
assert.match(
  componentSource,
  /className="whitespace-nowrap[^"]*text-center/,
  "Technical labels must stay together and remain centered",
);
assert.match(
  componentSource,
  /heading\.unit[\s\S]*className="[^"]*block[^"]*text-center/,
  "Technical units must render on their own centered line",
);
assert.match(componentSource, /max-w-full overflow-x-auto/, "Wide tables must scroll only inside their wrappers");
assertContains(
  componentSource,
  "Final specifications depend on sheet material, thickness, bending length, air pressure and selected machine configuration.",
  "Technical qualification note is missing",
);

for (const schemaType of ["ProductModel", "BreadcrumbList", "FAQPage"]) {
  assertContains(componentSource, `"@type": "${schemaType}"`, `Missing ${schemaType} schema`);
}
assert.doesNotMatch(
  componentSource,
  /priceCurrency|aggregateRating|availability|offers\s*:|review\s*:/,
  "Pneumatic Folding Machine schema must not invent commercial or review data",
);

assert.match(routeSource, /import PneumaticFoldingMachineSolutionPage/, "Product route must import the dedicated page");
assert.match(
  routeSource,
  /product\.id === "pneumatic-sheet-metal-folding-machine"[\s\S]*?<PneumaticFoldingMachineSolutionPage product=\{product\}/,
  "Product route must render the dedicated Pneumatic Folding Machine page",
);
assertContains(
  routeSource,
  "Pneumatic Folding Machine | HVAC Duct Sheet Metal Folding Solution",
  "Approved metadata title is missing",
);
assertContains(
  routeSource,
  "Pneumatic folding machine for thin sheet metal bending, HVAC duct panel folding, galvanized sheet forming and rectangular air duct fabrication. Get a suitable air-driven folding solution.",
  "Approved metadata description is missing",
);

console.log("Pneumatic Folding Machine page contract passed.");
