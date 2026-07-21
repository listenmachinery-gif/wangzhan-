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
const contentSource = readSource("data/electric-folding-machine-page.ts");
const componentSource = readSource("components/ElectricFoldingMachineSolutionPage.tsx");
const routeSource = readSource("app/products/[id]/page.tsx");

assert.ok(contentSource, "Dedicated Electric Folding Machine content is missing");
assert.ok(componentSource, "Dedicated Electric Folding Machine component is missing");

const assertContains = (source, value, label) => {
  assert.ok(source.includes(value), `${label}: ${value}`);
};

const rows = [
  ["DWS-1.5 x 1300", "1.5", "1300", "55", "2.2/0.75", "450", "1950 x 650 x 1550"],
  ["DWS-1.5 x 1500", "1.5", "1500", "55", "2.2/0.75", "500", "2150 x 650 x 1550"],
  ["DWS-1.5 x 2000", "1.5", "2000", "55", "2.2/0.75", "600", "2650 x 650 x 1550"],
  ["DWS-1.5 x 2500", "1.5", "2500", "55", "3/0.75", "700", "3100 x 650 x 1550"],
];

const sections = [
  "hero", "problems", "solutions", "applications", "materials", "process",
  "advantages", "comparison", "equipment", "selection", "technical", "faq", "cta",
];

const applicationImages = [
  "/products/electric-folding-applications/hvac-duct-panel-folding.webp",
  "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
  "/products/electric-folding-applications/roofing-sheet-metal-work.webp",
  "/products/electric-folding-applications/architectural-sheet-metal.webp",
  "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/electric-folding-applications/signage-fabrication.webp",
  "/products/electric-folding-applications/stainless-steel-fabrication.webp",
  "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
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
  resolve(root, "public/products/electric-folding-applications"),
).filter((name) => name.endsWith(".webp"));
assert.equal(applicationAssetNames.length, 8, "Exactly eight application WebP assets are required");

const sourceManifest = readSource("public/products/electric-folding-applications/SOURCES.md");
assertContains(sourceManifest, "https://www.pexels.com/license/", "Pexels license source is missing");
for (const photoId of [28914401, 30749458, 48895, 34766497, 33694019, 3677229, 34329584, 28852853]) {
  assertContains(sourceManifest, String(photoId), "Pexels photo source is missing");
}

for (const value of [
  'name: "Electric Sheet Metal Folding Machine"',
  'detailKey: "electric-folding-machine"',
  'legacyIds: ["electric-folding-machine"]',
]) {
  assertContains(productsSource, value, "Missing electric folding product identity");
}

for (const row of rows) {
  for (const value of row) {
    assertContains(detailsSource, `"${value}"`, "Verified technical value changed or is missing");
  }
}

for (const section of sections) {
  assertContains(componentSource, `data-section="${section}"`, "Missing dedicated page section");
}

assert.equal(
  (componentSource.match(/<h1\b/g) ?? []).length,
  1,
  "Electric Folding Machine page must contain exactly one H1 in source",
);
assert.match(
  componentSource,
  /<h1[\s\S]*?\{content\.hero\.title\}[\s\S]*?<\/h1>/,
  "The single H1 must render the approved Electric Folding Machine title",
);
assertContains(
  componentSource,
  'alt="Electric folding machine for sheet metal edge bending"',
  "Hero image alt text is missing",
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

for (const schemaType of ["ProductModel", "BreadcrumbList", "FAQPage"]) {
  assertContains(componentSource, `"@type": "${schemaType}"`, `Missing ${schemaType} schema`);
}

assert.doesNotMatch(
  componentSource,
  /priceCurrency|aggregateRating|availability|offers\s*:|review\s*:/,
  "Electric Folding Machine schema must not invent commercial or review data",
);
assert.match(
  routeSource,
  /import ElectricFoldingMachineSolutionPage/,
  "Product route must import the dedicated Electric Folding Machine page",
);
assert.match(
  routeSource,
  /product\.id === "electric-sheet-metal-folding-machine"[\s\S]*?<ElectricFoldingMachineSolutionPage product=\{product\}/,
  "Product route must render the dedicated Electric Folding Machine page",
);
assertContains(
  routeSource,
  "Electric Folding Machine | Sheet Metal Edge Bending Solution",
  "Approved metadata title is missing",
);
assertContains(
  routeSource,
  "Electric folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable electric sheet metal folding solution.",
  "Approved metadata description is missing",
);

console.log("Electric Folding Machine page contract passed.");
