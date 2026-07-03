import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routePath = resolve(root, "app/products/[id]/page.tsx");
const sharedComponentPath = resolve(root, "components/ShearingSolutionPage.tsx");
const wrapperPath = resolve(root, "components/EnergySavingElectricShearSolutionPage.tsx");
const dataPath = resolve(root, "data/energy-saving-electric-shear-page.ts");
const typesPath = resolve(root, "data/shearing-solution-types.ts");

for (const [path, message] of [
  [sharedComponentPath, "Shared ShearingSolutionPage component is missing"],
  [wrapperPath, "Energy-Saving Electric Shear wrapper is missing"],
  [dataPath, "Energy-Saving Electric Shear editorial data is missing"],
  [typesPath, "Shared shearing solution types are missing"],
]) {
  assert.ok(existsSync(path), message);
}

const route = readFileSync(routePath, "utf8");
const sharedComponent = readFileSync(sharedComponentPath, "utf8");
const wrapper = readFileSync(wrapperPath, "utf8");
const data = readFileSync(dataPath, "utf8");
const types = readFileSync(typesPath, "utf8");
const combined = `${route}\n${sharedComponent}\n${wrapper}\n${data}\n${types}`;

assert.match(route, /import EnergySavingElectricShearSolutionPage/);
assert.match(route, /product\.id === ["']energy-saving-electric-shearing-machine["']/);
assert.match(route, /<EnergySavingElectricShearSolutionPage product=\{product\}/);

assert.match(
  route,
  /Energy-Saving Electric Shearing Machine \| Thin Sheet Cutting Solution \| ZYRON/,
);
assert.match(
  route,
  /Energy-saving electric shearing machine for thin sheet metal cutting, HVAC duct fabrication, galvanized sheet processing and daily workshop production\. Get a lower-cost cutting solution from ZYRON Heavy Industry\./,
);
assert.match(
  combined,
  /Energy-Saving Electric Shearing Machine for Thin Sheet Cutting/,
);

for (const heading of [
  "What Production Problems Are You Trying to Reduce?",
  "A Lower-Cost Cutting Solution for Daily Thin Sheet Production",
  "Energy Saving Is Not Just a Feature — It Reduces Daily Operating Cost",
  "Energy Use Logic",
  "From Sheet Positioning to Energy-Saving Cutting",
  "Built for Energy-Conscious Sheet Metal Workshops",
  "Why Choose an Energy-Saving Electric Shearing Machine?",
  "Machine Structure Overview",
  "Technical Specifications",
  "Choose the Right Cutting Solution for Your Workshop",
  "Connect Cutting with Your Complete Sheet Metal Workflow",
  "More Than a Machine, A Practical Energy-Saving Cutting Recommendation",
  "Frequently Asked Questions",
  "Need a Lower-Cost Thin Sheet Cutting Solution?",
]) {
  assert.ok(combined.includes(heading), `Missing section heading: ${heading}`);
}

assert.match(types, /energyUse\?/);
assert.match(types, /comparisonElectricLabel\?/);
assert.match(sharedComponent, /content\.energyUse/);
assert.match(sharedComponent, /content\.comparisonElectricLabel/);
assert.match(sharedComponent, /product\.technicalParameters/);
assert.match(sharedComponent, /splitColumnHeading/);
assert.match(sharedComponent, /data-table-heading-unit/);
assert.match(sharedComponent, /whitespace-nowrap/);
assert.match(sharedComponent, /overflow-x-auto/);
assert.match(wrapper, /energySavingElectricShearPageContent/);

for (const file of [sharedComponent, data]) {
  assert.doesNotMatch(file, /Q11G-4 x 1300/);
  assert.doesNotMatch(file, /Q11G-6 x 2500/);
  assert.doesNotMatch(file, /(?:70|90)%/);
}

assert.equal((data.match(/question:/g) ?? []).length, 8, "Expected exactly eight FAQs");
assert.equal((data.match(/title: ".*"/g) ?? []).length >= 30, true, "Expected complete solution content");
assert.match(sharedComponent, /["']Product["']/);
assert.match(sharedComponent, /["']BreadcrumbList["']/);
assert.match(sharedComponent, /["']FAQPage["']/);
assert.match(data, /No power consumption when not shearing/);
assert.match(data, /Standby \/ Not Shearing/);
assert.match(data, /Cutting Action/);
assert.match(data, /Daily Workshop Use/);
assert.match(data, /Energy-Saving Electric Shearing Machine/);

console.log("Energy-Saving Electric Shear page source contract passed.");
