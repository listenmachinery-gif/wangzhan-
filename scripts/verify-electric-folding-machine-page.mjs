import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hashFile = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const srgbChannel = (value) => {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
};
const relativeLuminance = (hex) => {
  const channels = hex.match(/[\da-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16));
  assert.equal(channels?.length, 3, `Invalid six-digit hex color: ${hex}`);
  const [red, green, blue] = channels.map(srgbChannel);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};
const contrastRatio = (foreground, background) => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};
const assertAccessibleContrast = (foreground, background, label) => {
  const ratio = contrastRatio(foreground, background);
  assert.ok(ratio >= 4.5, `${label} contrast is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
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

const photoIds = [28914401, 30749458, 8452865, 34766497, 33694019, 3677229, 11739091, 22863133];
const electricCatalogImage = "/products/catalog/electric-sheet-metal-folding-machine.png";

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

const manualApplicationAssetNames = readdirSync(
  resolve(root, "public/products/manual-folding-applications"),
).filter((name) => name.endsWith(".webp"));
assert.equal(manualApplicationAssetNames.length, 8, "Manual Folding Machine must retain eight application WebP assets");
const manualApplicationHashes = new Set(
  manualApplicationAssetNames.map((name) =>
    hashFile(resolve(root, "public/products/manual-folding-applications", name)),
  ),
);
for (const name of applicationAssetNames) {
  assert.ok(
    !manualApplicationHashes.has(hashFile(resolve(root, "public/products/electric-folding-applications", name))),
    `Electric Folding Machine must not reuse Manual Folding Machine image bytes: ${name}`,
  );
}

const sourceManifest = readSource("public/products/electric-folding-applications/SOURCES.md");
assertContains(sourceManifest, "https://www.pexels.com/license/", "Pexels license source is missing");
for (const [index, imagePath] of applicationImages.entries()) {
  const name = imagePath.split("/").at(-1);
  assert.match(
    sourceManifest,
    new RegExp(`\\|\\s*\\x60${escapeRegex(name)}\\x60\\s*\\|[^\\n]*${photoIds[index]}[^\\n]*\\|`),
    `Electric application manifest must bind ${name} to Pexels photo ${photoIds[index]}`,
  );
}

for (const value of [
  'name: "Electric Sheet Metal Folding Machine"',
  'detailKey: "electric-folding-machine"',
  'legacyIds: ["electric-folding-machine"]',
]) {
  assertContains(productsSource, value, "Missing electric folding product identity");
}
const electricSeedMatch = productsSource.match(
  /\{\s*name: "Electric Sheet Metal Folding Machine",([\s\S]*?)\n\s*\},/,
);
assert.ok(electricSeedMatch, "Electric Folding Machine product seed is missing");
assert.doesNotMatch(
  electricSeedMatch[1],
  /\bimage\s*:/,
  "Electric Folding Machine product seed must not override the catalog fallback image",
);
assert.match(
  productsSource,
  /const id = slugify\(seed\.name\);[\s\S]*?image: seed\.image \?\? `\/products\/catalog\/\$\{id\}\.png`/,
  "Catalog image resolver must use the product-ID fallback path",
);
assert.equal(
  `/products/catalog/${"electric-sheet-metal-folding-machine"}.png`,
  electricCatalogImage,
  "Electric Folding Machine catalog fallback path changed",
);
assert.ok(
  existsSync(resolve(root, `public${electricCatalogImage}`)),
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

assert.match(
  contentSource,
  /hero:\s*\{\s*title:\s*"Electric Folding Machine"/,
  "Approved Electric Folding Machine title must be the hero title",
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

for (const [foreground, background, label] of [
  ["#4E7A00", "#FFFFFF", "Light-surface green on white"],
  ["#4E7A00", "#F4F6F8", "Light-surface green on light gray"],
  ["#76B900", "#0B0D10", "Brand green on darkest surface"],
  ["#76B900", "#111417", "Brand green on dark surface"],
  ["#111417", "#76B900", "Primary CTA text"],
  ["#111417", "#8DDB00", "Primary CTA hover text"],
  ["#D4D4D8", "#111417", "Dark-surface zinc-300 text"],
]) {
  assertAccessibleContrast(foreground, background, label);
}
assertContains(
  componentSource,
  'const lightSectionLabelClass =\n  "text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]"',
  "Light-surface section labels must use the accessible green",
);
assertContains(
  componentSource,
  'const darkSectionLabelClass =\n  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]"',
  "Dark-surface section labels must retain the brand green",
);
assert.match(
  componentSource,
  /light \? darkSectionLabelClass : lightSectionLabelClass/,
  "SectionIntro must choose the section-label color for its surface",
);
assert.equal(
  (componentSource.match(/text-sm font-semibold text-\[#4E7A00\]/g) ?? []).length,
  2,
  "Problem and process numeric accents must use accessible light-surface green",
);
assertContains(
  componentSource,
  'className="font-semibold text-[#4E7A00]"',
  "Selection numeric accents must use accessible light-surface green",
);
assert.doesNotMatch(
  componentSource,
  /bg-\[#76B900\][^"\n]*text-white|text-white[^"\n]*bg-\[#76B900\]/,
  "Primary green CTA text must not remain white",
);
assert.equal(
  (componentSource.match(/bg-\[#76B900\][^"\n]*text-\[#111417\]/g) ?? []).length,
  3,
  "All three primary green CTAs must use dark text",
);
assertContains(
  componentSource,
  "block text-center text-xs font-medium text-zinc-300",
  "Technical units on the dark header must use accessible neutral text",
);
assertContains(
  componentSource,
  'className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300"',
  "Solution-card labels must use accessible dark-surface text",
);
assertContains(
  componentSource,
  'className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-zinc-300"',
  "Selection-card footer labels must use accessible dark-surface text",
);
assert.doesNotMatch(
  componentSource,
  /text-zinc-500/,
  "Electric Folding Machine must not use failing zinc-500 text on dark surfaces",
);
assert.match(
  componentSource,
  /data-section="comparison"[\s\S]*?<table[^>]*>[\s\S]*?<caption className="sr-only">[\s\S]*?<\/caption>[\s\S]*?data-section="equipment"/,
  "Comparison table must include an sr-only caption",
);
assert.match(
  componentSource,
  /content\.comparison\.map[\s\S]*?<th scope="row"[^>]*>\{row\.item\}<\/th>/,
  "Comparison item cells must be scoped row headers",
);
assert.match(
  componentSource,
  /data-section="technical"[\s\S]*?<table[^>]*>[\s\S]*?<caption className="sr-only">[\s\S]*?<\/caption>/,
  "Technical table must include an sr-only caption",
);
assert.match(
  componentSource,
  /technicalParameters\.rows\.map[\s\S]*?index === 0 \? \([\s\S]*?<th[\s\S]*?scope="row"[\s\S]*?\{value\}[\s\S]*?<\/th>[\s\S]*?\) : \([\s\S]*?<td/,
  "Technical model cells must render as row headers and other values as data cells",
);

for (const schemaType of ["ProductModel", "BreadcrumbList", "FAQPage"]) {
  assertContains(componentSource, `"@type": "${schemaType}"`, `Missing ${schemaType} schema`);
}

assert.doesNotMatch(
  `${contentSource}\n${componentSource}`,
  /\b(?:price|pricing|offers?|availability|aggregateRating|ratings?|reviews?)\b|href\s*=\s*["'](?:tel:|mailto:)|\b(?:tel:|mailto:)|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?){2,3}\d{3,4}\b|\b(?:address|street|road|avenue)\s*:|wa\.me|whats?app|wechat|weixin|(?:qr[\s_-]?code|二维码)|\b\d+(?:\.\d+)?\s*%|\btrusted\s+by\b|\bfactory\s+count\b|\b\d{2,}\+(?=\s|$)|\b(?:over|more than)\s+\d+\s+(?:factories|customers|clients|installations|countries|workers|employees)\b|\b\d+\s+(?:factories|customers|clients|installations|countries|workers|employees)\b|\b(?:customer|client)\s+(?:case|project|installation|testimonial|success story)|\b(?:customer|client)-(?:case|project|installation)|\b(?:customer|client)\s+endors(?:ed|ement)|\b(?:endorsement|testimonial)s?\b/i,
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

const electricMetadataBranch = routeSource.match(
  /if \(product\.id === "electric-sheet-metal-folding-machine"\) \{([\s\S]*?)\n  \}\n\n  if \(product\.id === "manual-sheet-metal-folding-machine"\)/,
)?.[1];
assert.ok(electricMetadataBranch, "Electric Folding Machine metadata branch is missing");
const keywordBlock = electricMetadataBranch.match(/keywords:\s*\[([\s\S]*?)\]/)?.[1];
assert.ok(keywordBlock, "Electric Folding Machine metadata keywords are missing");
const metadataKeywords = [...keywordBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(metadataKeywords, [
  "Electric Folding Machine",
  "Electric Sheet Metal Folding Machine",
  "Electric Sheet Metal Bender",
  "Electric Sheet Metal Brake",
  "Motorized Folding Machine",
  "Sheet Metal Edge Bending Machine",
  "HVAC Duct Folding Machine",
  "Electric Duct Folding Machine",
  "Sheet Metal Folding Solution",
], "Electric Folding Machine metadata must retain the exact nine approved keywords");

console.log("Electric Folding Machine page contract passed.");
