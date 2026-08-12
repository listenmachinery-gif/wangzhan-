import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
};

const route = read("app/products/[id]/page.tsx");
const component = read(
  "components/FullyAutomaticThreeRollPlateRollingMachineSolutionPage.tsx",
);
const data = read(
  "data/fully-automatic-three-roll-plate-rolling-machine-page.ts",
);
const products = read("data/products.ts");
const packageJson = JSON.parse(read("package.json"));
const sourcePath =
  "public/products/fully-automatic-three-roll-plate-rolling-machine-applications/SOURCES.md";
const sources = read(sourcePath);

assert.equal(
  packageJson.scripts?.["verify:fully-automatic-three-roll-rolling"],
  "node scripts/verify-fully-automatic-three-roll-plate-rolling-machine-page.mjs",
  "package.json must expose the focused verifier",
);

assert.match(route, /FullyAutomaticThreeRollPlateRollingMachineSolutionPage/);
assert.match(
  route,
  /product\.id === "fully-automatic-three-roll-plate-rolling-machine"/,
);
assert.match(
  route,
  /Fully Automatic Three-Roll Plate Rolling Machine \| CNC Cylinder & Cone Rolling Solution/,
);
assert.match(
  route,
  /Fully automatic three-roll plate rolling machine for CNC plate rolling, automatic pre-bending, cylinder forming, cone rolling, tank shells, pressure vessels and heavy fabrication workshops\./,
);

for (const keyword of [
  "Fully Automatic Three-Roll Plate Rolling Machine",
  "Fully Automatic 3-Roll Plate Rolling Machine",
  "CNC Three-Roll Plate Rolling Machine",
  "CNC 3-Roll Plate Bending Machine",
  "Automatic Plate Rolling Machine",
  "Automatic Plate Bending Machine",
  "Three-Roll Plate Rolling Machine",
  "Cylinder Rolling Machine",
  "Cone Rolling Machine",
  "Tank Shell Rolling Machine",
  "Plate Rolling Solution",
  "CNC Plate Rolling Solution",
]) {
  assert.ok(route.includes(keyword), `metadata must include keyword: ${keyword}`);
}

assert.match(component, /data-fully-automatic-three-roll-plate-rolling-machine-page/);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.match(component, /product\.image/);
assert.match(component, /product\.specs/);
assert.match(
  component,
  /Fully automatic three-roll plate rolling machine for CNC cylinder and cone rolling/,
);
assert.match(component, /unoptimized/);
assert.match(component, /fetchPriority="high"/);
assert.match(component, /loading="lazy"/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.ok((component.match(/overflow-x-auto/g) ?? []).length >= 2);

const requiredSections = [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "formed-shapes",
  "rolling-process",
  "cnc-control",
  "pre-bending",
  "three-roll-structure",
  "feeding-unloading",
  "advantages",
  "comparison",
  "fabrication-workflow",
  "selection-guide",
  "technical-specifications",
  "workshop-notes",
  "related-machines",
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
assert.match(data, /CNC Automatic Rolling Cycle/);
assert.match(data, /Automatic Pre-bending/);
assert.match(data, /Cylinder \/ Cone \/ Arc Forming/);
assert.match(data, /Suitable for Batch Shell Production/);

for (const originalValue of [
  "Selected by plate thickness, width, material, and minimum diameter",
  "Two-roll, three-roll, or four-roll construction",
  "Electric, semi-automatic, fully automatic, or hydraulic",
  "Cylinders, arcs, cones, and curved sheet components",
]) {
  assert.ok(products.includes(originalValue), `original product value missing: ${originalValue}`);
}

const imagePattern =
  /image:\s*"(\/products\/fully-automatic-three-roll-plate-rolling-machine-applications\/[^\"]+)"/g;
const images = Array.from(data.matchAll(imagePattern), (match) => match[1]);
assert.equal(images.length, 12);
assert.equal(new Set(images).size, 12);

for (const imagePath of images) {
  assert.doesNotMatch(imagePath, /\.svg$/i);
  assert.ok(existsSync(resolve(root, `public${imagePath}`)), `missing image: ${imagePath}`);
}

assert.match(sources, /Pexels License|Unsplash License/);
assert.ok(sources.length > 1000, "source notes must contain photo provenance");
const sourceUrls = sources.match(/https:\/\/[^\s)]+/g) ?? [];
assert.ok(sourceUrls.length >= 13, "source notes must contain license and photo URLs");

const otherSourceFiles = readdirSync(resolve(root, "public/products"), {
  recursive: true,
  withFileTypes: true,
})
  .filter((entry) => entry.isFile() && entry.name === "SOURCES.md")
  .map((entry) => resolve(entry.parentPath, entry.name))
  .filter((path) => path !== resolve(root, sourcePath));
const otherSources = otherSourceFiles
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
for (const sourceUrl of sourceUrls) {
  if (sourceUrl.includes("pexels.com/photo") || sourceUrl.includes("unsplash.com/photos")) {
    assert.ok(!otherSources.includes(sourceUrl), `source photo reused: ${sourceUrl}`);
  }
}

const combined = `${route}\n${component}\n${data}`;
assert.doesNotMatch(combined, /offers\s*:/i);
assert.doesNotMatch(combined, /\bprice\b|qr code|二维码/i);
assert.doesNotMatch(
  combined,
  /zero straight edge|100% forming|never deform|absolutely safe|guaranteed roundness|fully unattended/i,
);

console.log("Fully Automatic Three-Roll Plate Rolling Machine page contract passed.");
