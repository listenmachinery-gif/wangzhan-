import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
};

const route = read("app/products/[id]/page.tsx");
const component = read(
  "components/SemiAutomaticThreeRollPlateRollingMachineSolutionPage.tsx",
);
const data = read(
  "data/semi-automatic-three-roll-plate-rolling-machine-page.ts",
);
const products = read("data/products.ts");
const packageJson = JSON.parse(read("package.json"));
const sources = read(
  "public/products/semi-automatic-three-roll-plate-rolling-machine-applications/SOURCES.md",
);

assert.equal(
  packageJson.scripts?.["verify:semi-automatic-three-roll-rolling"],
  "node scripts/verify-semi-automatic-three-roll-plate-rolling-machine-page.mjs",
  "package.json must expose the focused verifier",
);

assert.match(route, /SemiAutomaticThreeRollPlateRollingMachineSolutionPage/);
assert.match(
  route,
  /product\.id === "semi-automatic-three-roll-plate-rolling-machine"/,
);
assert.match(
  route,
  /Semi-Automatic Three-Roll Plate Rolling Machine \| Cylinder & Cone Rolling Solution/,
);
assert.match(
  route,
  /Semi-automatic three-roll plate rolling machine for cylinder forming, arc bending, cone rolling, tank shells, duct parts and metal fabrication workshops\./,
);

for (const keyword of [
  "Semi-Automatic Three-Roll Plate Rolling Machine",
  "Semi-Automatic 3-Roll Plate Rolling Machine",
  "Three-Roll Plate Rolling Machine",
  "3-Roll Plate Bending Machine",
  "Three-Roller Sheet Rolling Machine",
  "Semi-Automatic Plate Bending Machine",
  "Sheet Metal Rolling Machine",
  "Cylinder Rolling Machine",
  "Cone Rolling Machine",
  "Sheet Metal Cylinder Forming Machine",
  "Plate Rolling Solution",
]) {
  assert.ok(route.includes(keyword), `metadata must include keyword: ${keyword}`);
}

assert.match(component, /data-semi-automatic-three-roll-plate-rolling-machine-page/);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.match(component, /product\.image/);
assert.match(component, /product\.specs/);
assert.match(
  component,
  /Semi-automatic three-roll plate rolling machine for cylinder and cone forming/,
);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.ok((component.match(/overflow-x-auto/g) ?? []).length >= 2);
assert.match(component, /loading="lazy"/);

const requiredSections = [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "formed-shapes",
  "rolling-process",
  "pre-bending",
  "three-roll-structure",
  "semi-automatic-operation",
  "advantages",
  "comparison",
  "fabrication-workflow",
  "selection-guide",
  "technical-specifications",
  "workshop-notes",
  "faq",
  "final-cta",
];

let previousIndex = -1;
for (const section of requiredSections) {
  const marker = `data-section="${section}"`;
  const currentIndex = component.indexOf(marker);
  assert.ok(currentIndex > previousIndex, `missing or out-of-order section: ${section}`);
  previousIndex = currentIndex;
}
assert.equal((component.match(/data-section="/g) ?? []).length, requiredSections.length);

for (const schemaType of ["ProductModel", "FAQPage", "BreadcrumbList"]) {
  assert.ok(component.includes(`"@type": "${schemaType}"`), `missing ${schemaType}`);
}

for (const sourceIndex of [0, 1, 2, 3]) {
  assert.match(data, new RegExp(`sourceIndex:\\s*${sourceIndex}`));
}
assert.match(data, /Customizable \/ Please confirm with our sales engineer/);

for (const originalValue of [
  "Selected by plate thickness, width, material, and minimum diameter",
  "Two-roll, three-roll, or four-roll construction",
  "Electric, semi-automatic, fully automatic, or hydraulic",
  "Cylinders, arcs, cones, and curved sheet components",
]) {
  assert.ok(products.includes(originalValue), `original product value missing: ${originalValue}`);
}

const imagePattern =
  /image:\s*"(\/products\/semi-automatic-three-roll-plate-rolling-machine-applications\/[^\"]+)"/g;
const images = Array.from(data.matchAll(imagePattern), (match) => match[1]);
assert.equal(images.length, 10);
assert.equal(new Set(images).size, 10);

const electricTwoRollData = read("data/electric-two-roll-plate-rolling-machine-page.ts");
const electricTwoRollSources = read(
  "public/products/electric-two-roll-plate-rolling-machine-applications/SOURCES.md",
);
for (const imagePath of images) {
  assert.doesNotMatch(imagePath, /\.svg$/i);
  assert.ok(existsSync(resolve(root, `public${imagePath}`)), `missing image: ${imagePath}`);
  assert.ok(!electricTwoRollData.includes(imagePath), `image path reused: ${imagePath}`);
}
assert.match(sources, /Pexels License|Unsplash License/);
assert.ok(sources.length > 500, "source notes must contain photo provenance");
for (const sourceUrl of sources.match(/https:\/\/[^\s)]+/g) ?? []) {
  if (sourceUrl.includes("pexels.com/photo") || sourceUrl.includes("unsplash.com/photos")) {
    assert.ok(!electricTwoRollSources.includes(sourceUrl), `source photo reused: ${sourceUrl}`);
  }
}

const combined = `${route}\n${component}\n${data}`;
assert.doesNotMatch(combined, /offers\s*:/i);
assert.doesNotMatch(combined, /\bprice\b|qr code|二维码/i);
assert.doesNotMatch(
  combined,
  /zero straight edge|100% forming|never deform|absolutely safe|guaranteed roundness/i,
);

console.log("Semi-Automatic Three-Roll Plate Rolling Machine page contract passed.");
