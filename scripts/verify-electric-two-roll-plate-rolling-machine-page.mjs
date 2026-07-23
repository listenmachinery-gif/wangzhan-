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
  "components/ElectricTwoRollPlateRollingMachineSolutionPage.tsx",
);
const data = read("data/electric-two-roll-plate-rolling-machine-page.ts");
const packageJson = JSON.parse(read("package.json"));
const sources = read(
  "public/products/electric-two-roll-plate-rolling-machine-applications/SOURCES.md",
);

assert.equal(
  packageJson.scripts?.["verify:electric-two-roll-rolling"],
  "node scripts/verify-electric-two-roll-plate-rolling-machine-page.mjs",
  "package.json must expose the focused page verifier",
);

assert.match(
  route,
  /ElectricTwoRollPlateRollingMachineSolutionPage/,
  "route must import the dedicated electric two-roll page",
);
assert.match(
  route,
  /product\.id === "electric-two-roll-plate-rolling-machine"/,
  "route must dispatch the electric two-roll product to its dedicated page",
);
assert.match(
  route,
  /Electric Two-Roll Plate Rolling Machine \| Thin Sheet Cylinder Rolling Solution/,
  "route must contain the exact meta title",
);
assert.match(
  route,
  /Electric two-roll plate rolling machine for thin sheet cylinder forming, HVAC parts, filter shells, exhaust covers, small tanks and metal round shells\./,
  "route must contain the approved meta description",
);

for (const keyword of [
  "Electric Two-Roll Plate Rolling Machine",
  "Electric 2-Roll Plate Rolling Machine",
  "Two-Roll Plate Rolling Machine",
  "2-Roll Plate Bending Machine",
  "Two-Roller Sheet Rolling Machine",
  "Electric Sheet Rolling Machine",
  "Thin Sheet Plate Rolling Machine",
  "Cylinder Rolling Machine",
  "Sheet Metal Cylinder Forming Machine",
  "Sheet Metal Rolling Solution",
]) {
  assert.ok(route.includes(keyword), `metadata must include keyword: ${keyword}`);
}

assert.match(
  component,
  /data-electric-two-roll-plate-rolling-machine-page/,
  "component must expose the dedicated page marker",
);
assert.equal(
  (component.match(/<h1\b/g) ?? []).length,
  1,
  "component source must contain exactly one H1",
);
assert.match(component, /product\.image/, "component must reuse the original product image");
assert.match(component, /product\.specs/, "component must resolve applicable original specs");
assert.match(
  component,
  /Electric two-roll plate rolling machine for thin sheet cylinder forming/,
  "component must use the approved product-image alt",
);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.ok(
  (component.match(/overflow-x-auto/g) ?? []).length >= 2,
  "comparison and specification tables must scroll locally",
);
assert.match(component, /loading="lazy"/, "application images must be lazy loaded");

const requiredSections = [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "cylindrical-parts",
  "rolling-process",
  "two-roll-design",
  "electric-drive",
  "advantages",
  "comparison",
  "fabrication-workflow",
  "selection-guide",
  "technical-specifications",
  "workshop-notes",
  "faq",
  "final-cta",
];

for (const section of requiredSections) {
  assert.ok(
    component.includes(`data-section="${section}"`),
    `component must render data-section=${section}`,
  );
}
assert.equal(
  (component.match(/data-section="/g) ?? []).length,
  requiredSections.length,
  "component must render exactly 17 primary sections",
);

for (const schemaType of ["ProductModel", "FAQPage", "BreadcrumbList"]) {
  assert.ok(component.includes(`"@type": "${schemaType}"`), `missing ${schemaType} schema`);
}

assert.match(
  data,
  /Customizable \/ Please confirm with our sales engineer/,
  "data must use the approved confirmation placeholder",
);
assert.match(data, /Electric Two-Roll Plate Rolling Machine/);
assert.match(
  data,
  /Fast thin sheet rolling solution for cylinders, HVAC parts, small tanks and round metal shells\./,
);
assert.match(data, /Get Thin Sheet Rolling Solution/);
assert.match(data, /Request Machine Configuration/);

for (const sourceIndex of [0, 1, 2, 3]) {
  assert.match(
    data,
    new RegExp(`sourceIndex:\\s*${sourceIndex}`),
    `data must preserve original product spec ${sourceIndex}`,
  );
}

const imagePathPattern =
  /image:\s*"(\/products\/electric-two-roll-plate-rolling-machine-applications\/[^"]+)"/g;
const imagePaths = Array.from(data.matchAll(imagePathPattern), (match) => match[1]);
assert.equal(imagePaths.length, 10, "data must contain ten application image entries");
assert.equal(new Set(imagePaths).size, 10, "application image paths must be unique");

for (const imagePath of imagePaths) {
  assert.doesNotMatch(imagePath, /\.svg$/i, "applications must not use line-art SVG files");
  assert.ok(
    existsSync(resolve(root, `public${imagePath}`)),
    `application image must exist: ${imagePath}`,
  );
}

assert.match(sources, /Pexels License|Unsplash License/);
assert.match(sources, /two-roll|two roller/i);
assert.match(sources, /do not define guaranteed ZYRON specifications/i);

const combined = `${route}\n${component}\n${data}`;
assert.doesNotMatch(combined, /offers\s*:/i, "Product schema must omit offers");
assert.doesNotMatch(combined, /\bprice\b|qr code|二维码/i);
assert.doesNotMatch(
  combined,
  /zero straight edge|100% forming|never deform|absolutely safe|no pre-bending required/i,
  "page must avoid unsupported absolute performance claims",
);

console.log("Electric Two-Roll Plate Rolling Machine page contract passed.");
