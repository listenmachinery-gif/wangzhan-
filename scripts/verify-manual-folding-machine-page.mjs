import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readSource = (relativePath) => {
  const path = resolve(root, relativePath);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
};

const productsSource = readSource("data/products.ts");
const detailsSource = readSource("data/bending-details.ts");
const contentSource = readSource("data/manual-folding-machine-page.ts");
const componentSource = readSource("components/ManualFoldingMachineSolutionPage.tsx");
const routeSource = readSource("app/products/[id]/page.tsx");

assert.ok(contentSource, "Dedicated Manual Folding Machine content is missing");
assert.ok(componentSource, "Dedicated Manual Folding Machine component is missing");

const assertContains = (source, value, label) => {
  assert.ok(source.includes(value), `${label}: ${value}`);
};

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
assert.doesNotMatch(
  componentSource,
  /function ApplicationSketch|line diagram/,
  "Application line art must be removed",
);

for (const value of [
  'name: "Manual Sheet Metal Folding Machine"',
  'detailKey: "manual-folding-machine"',
  'legacyIds: ["manual-folding-machine"]',
]) {
  assertContains(productsSource, value, "Missing manual folding product identity");
}

const rows = [
  ["WS-1.5X1300B", "55", "400", "0.3-1.5 mm", "1300", "1980 x 800 x 1320"],
  ["WS-1.5X1500B", "55", "450", "0.3-1.5 mm", "1500", "2180 x 800 x 1320"],
  ["WS-1.5X2000B", "55", "550", "0.3-1.5 mm", "2000", "2680 x 800 x 1320"],
  ["WS-1.5X2500B", "55", "600", "0.3-1.5 mm", "2500", "3180 x 800 x 1320"],
];

for (const row of rows) {
  for (const value of row) {
    assertContains(detailsSource, `"${value}"`, "Verified technical value changed or is missing");
  }
}

for (const value of [
  "Manual Folding Machine",
  "Practical sheet metal edge bending solution for workshops, duct fabrication and on-site sheet metal work.",
  "Small batches do not need expensive CNC bending",
  "Small Sheet Metal Workshop",
  "HVAC duct panel folding",
  "Galvanized Sheet",
  "Sheet Cutting",
  "Manual handwheel and lever operation",
  "Power source",
  "Shearing Machine",
  "Sheet material",
  "What is a manual folding machine?",
  "Need a Practical Sheet Metal Folding Solution?",
]) {
  assertContains(contentSource, value, "Missing approved Manual Folding Machine copy");
}

for (const section of [
  "hero",
  "problems",
  "solutions",
  "applications",
  "materials",
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
  "Manual Folding Machine page must contain exactly one H1 in source",
);
assert.match(
  componentSource,
  /<h1[\s\S]*?\{content\.hero\.title\}[\s\S]*?<\/h1>/,
  "The single H1 must render the approved Manual Folding Machine title",
);
assertContains(
  componentSource,
  'alt="Manual folding machine for sheet metal edge bending"',
  "Hero image alt text is missing",
);
assert.match(
  componentSource,
  /loading="lazy"/,
  "The existing product image must use lazy loading",
);
assertContains(
  componentSource,
  "const splitColumnHeading",
  "Technical headings must be split intentionally",
);
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
assert.match(
  componentSource,
  /max-w-full overflow-x-auto/,
  "Wide tables must scroll only inside their wrappers",
);
assertContains(
  componentSource,
  "Final specifications depend on sheet material, thickness, bending length and selected machine structure.",
  "Technical qualification note is missing",
);

for (const schemaType of ["ProductModel", "BreadcrumbList", "FAQPage"]) {
  assertContains(componentSource, `"@type": "${schemaType}"`, `Missing ${schemaType} schema`);
}

assert.doesNotMatch(
  componentSource,
  /priceCurrency|aggregateRating|availability|offers\s*:|review\s*:/,
  "Manual Folding Machine schema must not invent commercial or review data",
);
assert.match(
  routeSource,
  /import ManualFoldingMachineSolutionPage/,
  "Product route must import the dedicated Manual Folding Machine page",
);
assert.match(
  routeSource,
  /product\.id === "manual-sheet-metal-folding-machine"[\s\S]*?<ManualFoldingMachineSolutionPage product=\{product\}/,
  "Product route must render the dedicated Manual Folding Machine page",
);
assertContains(
  routeSource,
  "Manual Folding Machine | Sheet Metal Edge Bending Solution",
  "Approved metadata title is missing",
);
assertContains(
  routeSource,
  "Manual folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable manual sheet metal folding solution.",
  "Approved metadata description is missing",
);

console.log("Manual Folding Machine page contract passed.");
