import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routePath = resolve(root, "app/products/[id]/page.tsx");
const sharedComponentPath = resolve(root, "components/ShearingSolutionPage.tsx");
const wrapperPath = resolve(root, "components/HydraulicSwingBeamShearSolutionPage.tsx");
const dataPath = resolve(root, "data/hydraulic-swing-beam-shear-page.ts");
const typesPath = resolve(root, "data/shearing-solution-types.ts");
const detailsPath = resolve(root, "data/shearing-details.ts");

for (const [path, message] of [
  [sharedComponentPath, "Shared ShearingSolutionPage component is missing"],
  [wrapperPath, "Hydraulic Swing Beam Shear wrapper is missing"],
  [dataPath, "Hydraulic Swing Beam Shear editorial data is missing"],
  [typesPath, "Shared shearing solution types are missing"],
  [detailsPath, "Original shearing details are missing"],
]) {
  assert.ok(existsSync(path), message);
}

const route = readFileSync(routePath, "utf8");
const sharedComponent = readFileSync(sharedComponentPath, "utf8");
const wrapper = readFileSync(wrapperPath, "utf8");
const data = readFileSync(dataPath, "utf8");
const types = readFileSync(typesPath, "utf8");
const details = readFileSync(detailsPath, "utf8");
const combined = `${route}\n${sharedComponent}\n${wrapper}\n${data}\n${types}`;

assert.match(route, /import HydraulicSwingBeamShearSolutionPage/);
assert.match(route, /product\.id === ["']hydraulic-swing-beam-shear["']/);
assert.match(route, /<HydraulicSwingBeamShearSolutionPage product=\{product\}/);

assert.match(
  route,
  /Hydraulic Swing Beam Shearing Machine \| Sheet Metal Cutting Solution/,
);
assert.match(
  route,
  /Reliable hydraulic swing beam shearing machine for sheet metal cutting, suitable for carbon steel, stainless steel, galvanized sheet, aluminum and general fabrication workshops\./,
);
assert.match(combined, /Hydraulic Swing Beam Shearing Machine/);

for (const heading of [
  "Common Sheet Metal Cutting Problems We Help You Solve",
  "A Practical Cutting Solution for Daily Fabrication Work",
  "From Sheet Loading to Finished Cut",
  "Built for Real Sheet Metal Production Scenarios",
  "Suitable for Multiple Sheet Metal Materials",
  "Core Features Designed for Stable Cutting",
  "Key Functional Areas",
  "Technical Parameters",
  "Why Choose a Hydraulic Swing Beam Shear?",
  "Optional Configurations for Your Production Needs",
  "From Machine Selection to After-sales Support",
  "Frequently Asked Questions",
  "Need a Sheet Metal Cutting Solution for Your Workshop?",
]) {
  assert.ok(combined.includes(heading), `Missing section heading: ${heading}`);
}

assert.match(types, /materials\?/);
assert.match(types, /binaryComparison\?/);
assert.match(types, /structureCallouts\?/);
assert.match(sharedComponent, /content\.materials/);
assert.match(sharedComponent, /content\.binaryComparison/);
assert.match(sharedComponent, /content\.structureCallouts/);
assert.match(sharedComponent, /product\.technicalParameters/);
assert.match(sharedComponent, /splitColumnHeading/);
assert.match(sharedComponent, /data-table-heading-unit/);
assert.match(sharedComponent, /whitespace-nowrap/);
assert.match(sharedComponent, /overflow-x-auto/);
assert.match(wrapper, /hydraulicSwingBeamShearPageContent/);

for (const material of [
  "Carbon steel",
  "Stainless steel",
  "Galvanized sheet",
  "Aluminum plate",
  "Copper sheet",
  "Color coated sheet",
]) {
  assert.ok(data.includes(material), `Missing material capability: ${material}`);
}

assert.equal((data.match(/question:/g) ?? []).length, 6, "Expected exactly six FAQs");
assert.equal((data.match(/left: "[0-9]+%"/g) ?? []).length, 7, "Expected seven image callout positions");
assert.match(data, /Hydraulic Swing Beam Shear/);
assert.match(data, /Hydraulic Guillotine Shear/);
assert.match(data, /Available cutting thickness depends on model configuration\./);
assert.match(sharedComponent, /["']Product["']/);
assert.match(sharedComponent, /["']BreadcrumbList["']/);
assert.match(sharedComponent, /["']FAQPage["']/);

assert.match(details, /"hydraulic-swing-beam-shearing-machine"/);
assert.match(details, /"4 x 2500"/);
assert.match(details, /"16 x 3200"/);
for (const file of [sharedComponent, data]) {
  assert.doesNotMatch(file, /"4 x 2500"/);
  assert.doesNotMatch(file, /"16 x 3200"/);
}

console.log("Hydraulic Swing Beam Shear page source contract passed.");
