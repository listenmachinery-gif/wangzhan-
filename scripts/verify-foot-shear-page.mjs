import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const routePath = resolve(root, "app/products/[id]/page.tsx");
const componentPath = resolve(root, "components/FootShearSolutionPage.tsx");
const dataPath = resolve(root, "data/foot-shear-page.ts");

assert.ok(existsSync(componentPath), "Dedicated FootShearSolutionPage component is missing");
assert.ok(existsSync(dataPath), "Centralized Foot Shear page data is missing");

const route = readFileSync(routePath, "utf8");
const component = readFileSync(componentPath, "utf8");
const data = readFileSync(dataPath, "utf8");
const combined = `${route}\n${component}\n${data}`;

assert.match(route, /import FootShearSolutionPage/);
assert.match(route, /product\.id === ["']foot-shear["']/);
assert.match(route, /<FootShearSolutionPage product=\{product\}/);

assert.match(
  route,
  /Foot Operated Shearing Machine \| Sheet Metal Foot Pedal Shear \| ZYRON/,
);
assert.match(
  combined,
  /Foot Operated Shearing Machine for Efficient Thin Sheet Cutting/,
);

for (const heading of [
  "Common Thin Sheet Cutting Challenges",
  "A Practical Cutting Solution for Light-Gauge Sheet Metal",
  "A Simple Five-Step Cutting Process",
  "Built for Everyday Sheet Metal Applications",
  "Core Advantages",
  "Machine Structure Overview",
  "Technical Specifications",
  "Choose the Right Shearing Solution",
  "More Than a Machine, A Cutting Solution",
  "Frequently Asked Questions",
]) {
  assert.ok(combined.includes(heading), `Missing section heading: ${heading}`);
}

assert.match(component, /product\.technicalParameters/);
assert.doesNotMatch(component, /Q11-1 x 1000/);
assert.doesNotMatch(data, /Q11-1 x 1000/);

assert.equal((data.match(/question:/g) ?? []).length, 6, "Expected exactly six FAQs");
assert.match(component, /["']Product["']/);
assert.match(component, /["']BreadcrumbList["']/);
assert.match(component, /["']FAQPage["']/);
assert.match(
  component,
  /Foot operated shearing machine for sheet metal cutting/,
);

console.log("Foot Shear page source contract passed.");
