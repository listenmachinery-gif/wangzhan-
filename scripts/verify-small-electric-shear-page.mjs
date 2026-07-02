import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routePath = resolve(root, "app/products/[id]/page.tsx");
const sharedComponentPath = resolve(root, "components/ShearingSolutionPage.tsx");
const wrapperPath = resolve(root, "components/SmallElectricShearSolutionPage.tsx");
const dataPath = resolve(root, "data/small-electric-shear-page.ts");

for (const [path, message] of [
  [sharedComponentPath, "Shared ShearingSolutionPage component is missing"],
  [wrapperPath, "Small Electric Shear wrapper is missing"],
  [dataPath, "Small Electric Shear editorial data is missing"],
]) {
  assert.ok(existsSync(path), message);
}

const route = readFileSync(routePath, "utf8");
const sharedComponent = readFileSync(sharedComponentPath, "utf8");
const wrapper = readFileSync(wrapperPath, "utf8");
const data = readFileSync(dataPath, "utf8");
const combined = `${route}\n${sharedComponent}\n${wrapper}\n${data}`;

assert.match(route, /import SmallElectricShearSolutionPage/);
assert.match(route, /product\.id === ["']compact-electric-shearing-machine["']/);
assert.match(route, /<SmallElectricShearSolutionPage product=\{product\}/);

assert.match(
  route,
  /Small Electric Shearing Machine \| Compact Sheet Metal Cutting Solution \| ZYRON/,
);
assert.match(
  route,
  /Small electric shearing machine for thin sheet metal cutting, HVAC duct fabrication, roofing sheet processing and small batch workshop production\./,
);
assert.match(
  combined,
  /Small Electric Shearing Machine for Fast Thin Sheet Cutting/,
);

for (const heading of [
  "What Problems Does This Small Electric Shear Solve?",
  "A Compact Cutting Solution for Daily Thin Sheet Production",
  "From Sheet Positioning to Clean Electric Cutting",
  "Designed for Real Sheet Metal Workshops",
  "Why Choose a Small Electric Shearing Machine?",
  "Machine Structure Overview",
  "Technical Specifications",
  "Choose the Right Shearing Solution for Your Workshop",
  "Build Your Sheet Metal Cutting and Forming Workflow",
  "More Than a Machine, A Practical Cutting Recommendation",
  "Frequently Asked Questions",
  "Need a Compact Sheet Metal Cutting Solution?",
]) {
  assert.ok(combined.includes(heading), `Missing section heading: ${heading}`);
}

assert.match(sharedComponent, /product\.technicalParameters/);
assert.match(sharedComponent, /splitColumnHeading/);
assert.match(sharedComponent, /data-table-heading-unit/);
assert.match(sharedComponent, /text-center/);
assert.match(wrapper, /smallElectricShearPageContent/);

for (const file of [sharedComponent, data]) {
  assert.doesNotMatch(file, /Q11G-2 x 600/);
  assert.doesNotMatch(file, /Q11G-1\.2 x 2500/);
}

assert.equal((data.match(/question:/g) ?? []).length, 7, "Expected exactly seven FAQs");
assert.match(sharedComponent, /["']Product["']/);
assert.match(sharedComponent, /["']BreadcrumbList["']/);
assert.match(sharedComponent, /["']FAQPage["']/);
assert.match(
  data,
  /Small electric shearing machine for thin sheet metal cutting/,
);

console.log("Small Electric Shear page source contract passed.");
