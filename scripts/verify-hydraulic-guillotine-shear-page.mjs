import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routePath = resolve(root, "app/products/[id]/page.tsx");
const sharedComponentPath = resolve(root, "components/ShearingSolutionPage.tsx");
const wrapperPath = resolve(root, "components/HydraulicGuillotineShearSolutionPage.tsx");
const dataPath = resolve(root, "data/hydraulic-guillotine-shear-page.ts");
const detailsPath = resolve(root, "data/shearing-details.ts");

for (const [path, message] of [
  [sharedComponentPath, "Shared ShearingSolutionPage component is missing"],
  [wrapperPath, "Hydraulic Guillotine Shear wrapper is missing"],
  [dataPath, "Hydraulic Guillotine Shear editorial data is missing"],
  [detailsPath, "Original shearing details are missing"],
]) {
  assert.ok(existsSync(path), message);
}

const route = readFileSync(routePath, "utf8");
const sharedComponent = readFileSync(sharedComponentPath, "utf8");
const wrapper = readFileSync(wrapperPath, "utf8");
const data = readFileSync(dataPath, "utf8");
const details = readFileSync(detailsPath, "utf8");
const combined = `${route}\n${sharedComponent}\n${wrapper}\n${data}`;

assert.match(route, /import HydraulicGuillotineShearSolutionPage/);
assert.match(route, /product\.id === ["']hydraulic-guillotine-shear["']/);
assert.match(route, /<HydraulicGuillotineShearSolutionPage product=\{product\}/);
assert.match(
  route,
  /Hydraulic Guillotine Shearing Machine \| Sheet Metal Cutting Solution/,
);
assert.match(
  route,
  /Heavy-duty hydraulic guillotine shearing machine for straight cutting of mild steel, stainless steel, galvanized sheet and aluminum plate\./,
);

for (const heading of [
  "What Cutting Problems Can It Solve?",
  "Sheet Metal Cutting Solution for Different Workshops",
  "From Plate to Finished Blank",
  "Applications",
  "Materials",
  "Why Choose a Hydraulic Guillotine Shear?",
  "Hydraulic Guillotine Shear vs Hydraulic Swing Beam Shear",
  "Technical Specifications",
  "How to Choose the Right Guillotine Shear",
  "Frequently Asked Questions",
  "Need a Sheet Metal Cutting Solution for Your Workshop?",
]) {
  assert.ok(combined.includes(heading), `Missing section heading: ${heading}`);
}

assert.match(sharedComponent, /splitColumnHeading/);
assert.match(sharedComponent, /data-table-heading-unit/);
assert.match(sharedComponent, /whitespace-nowrap/);
assert.match(sharedComponent, /overflow-x-auto/);
assert.match(sharedComponent, /painIcons\[index % painIcons\.length\]/);
assert.match(wrapper, /hydraulicGuillotineShearPageContent/);

assert.match(data, /leftLabel: "Hydraulic Guillotine Shear"/);
assert.match(data, /rightLabel: "Hydraulic Swing Beam Shear"/);
assert.match(data, /Final specifications depend on material type, cutting thickness, cutting length and selected controller\./);
assert.equal((data.match(/question:/g) ?? []).length, 8, "Expected exactly eight FAQs");

const originalTable = details.match(
  /"hydraulic-guillotine-shearing-machine": \{[\s\S]*?"technicalParameters": (\{[\s\S]*?\n    \})\n  \}/,
);
assert.ok(originalTable, "Original guillotine parameter table is missing");
assert.match(originalTable[1], /"6 x 2500"/);
assert.match(originalTable[1], /"Main Power\(Kw\)"/);
assert.doesNotMatch(data, /"6 x 2500"/);

console.log("Hydraulic Guillotine Shear page source contract passed.");
