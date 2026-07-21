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
const manualContentSource = readSource("data/manual-folding-machine-page.ts");
const manualSourceManifest = readSource("public/products/manual-folding-applications/SOURCES.md");
const packageSource = readSource("package.json");

assert.ok(contentSource, "Dedicated Electric Folding Machine content is missing");
assert.ok(componentSource, "Dedicated Electric Folding Machine component is missing");

const assertContains = (source, value, label) => {
  assert.ok(source.includes(value), `${label}: ${value}`);
};

const normalize = (source) => source.replace(/\s+/g, " ");

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

const photoIds = [28914401, 30749458, 48895, 34766497, 33694019, 3677229, 34329584, 28852853];

assert.equal(new Set(applicationImages).size, 8, "Application photos must be unique");
assert.ok(manualContentSource, "Manual Folding Machine application mapping is missing");
assert.ok(manualSourceManifest, "Manual Folding Machine source manifest is missing");

const manualApplicationImages = [...manualContentSource.matchAll(
  /image: "(\/products\/manual-folding-applications\/[^\"]+)"/g,
)].map((match) => match[1]);
assert.equal(manualApplicationImages.length, 8, "Manual Folding Machine must retain eight application mappings");
for (const imagePath of applicationImages) {
  assert.ok(
    !manualApplicationImages.includes(imagePath),
    `Electric Folding Machine must not reuse Manual Folding Machine photo: ${imagePath}`,
  );
}

const manualPhotoIds = [...manualSourceManifest.matchAll(/Photo (\d+)/g)].map((match) => Number(match[1]));
assert.equal(manualPhotoIds.length, 8, "Manual Folding Machine manifest must retain eight photo IDs");
for (const photoId of photoIds) {
  assert.ok(
    !manualPhotoIds.includes(photoId),
    `Electric Folding Machine must not reuse Manual Folding Machine Pexels photo ID: ${photoId}`,
  );
}

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
for (const photoId of photoIds) {
  assertContains(sourceManifest, String(photoId), "Pexels photo source is missing");
}

for (const value of [
  'name: "Electric Sheet Metal Folding Machine"',
  'detailKey: "electric-folding-machine"',
  'legacyIds: ["electric-folding-machine"]',
]) {
  assertContains(productsSource, value, "Missing electric folding product identity");
}
assertContains(
  productsSource,
  "image: seed.image ?? `/products/catalog/${id}.png`",
  "Catalog image resolution changed",
);
assert.ok(
  existsSync(resolve(root, "public/products/catalog/electric-sheet-metal-folding-machine.png")),
  "Existing Electric Folding Machine catalog image is missing",
);

const normalizedDetailsSource = normalize(detailsSource);
for (const row of rows) {
  assertContains(
    normalizedDetailsSource,
    `[ ${row.map((value) => `"${value}"`).join(", ")} ]`,
    "Verified technical row changed, reordered, or is missing",
  );
}

const packageJson = JSON.parse(packageSource);
assert.deepEqual(packageJson.dependencies, {
  "lucide-react": "^0.468.0",
  next: "^15.5.19",
  nodemailer: "^9.0.1",
  react: "19.0.0",
  "react-dom": "19.0.0",
}, "Production dependency set changed");
assert.deepEqual(packageJson.devDependencies, {
  "@types/node": "^20.17.9",
  "@types/nodemailer": "^8.0.1",
  "@types/react": "^19.0.1",
  "@types/react-dom": "^19.0.1",
  autoprefixer: "^10.4.20",
  eslint: "8.57.1",
  "eslint-config-next": "15.5.19",
  postcss: "^8.4.49",
  tailwindcss: "^3.4.16",
  typescript: "^5.7.2",
}, "Development dependency set changed");

assertContains(
  contentSource,
  'title: "Electric Folding Machine"',
  "Approved Electric Folding Machine content title is missing",
);

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
assert.match(
  componentSource,
  /data-section="hero"[\s\S]*?<Image[\s\S]*?src=\{product\.image\}/,
  "Hero must reuse the existing catalog product image",
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
  `${contentSource}\n${componentSource}`,
  /\b(?:price|pricing|offers?|availability|aggregateRating|ratings?|reviews?)\b|href\s*=\s*["']tel:|\btel:|wa\.me|whats?app|wechat|weixin|(?:qr[\s_-]?code|二维码)|\b\d+(?:\.\d+)?\s*%|\b(?:customer|client)\s+(?:case|project|installation|testimonial|success story)|\b(?:customer|client)-(?:case|project|installation)|\b(?:customer|client)\s+endors(?:ed|ement)|\b(?:endorsement|testimonial)s?\b/i,
  "Electric Folding Machine content must not add commercial, contact, performance, or customer-claim content",
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
