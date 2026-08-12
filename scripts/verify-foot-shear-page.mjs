import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const files = {
  route: "app/products/[id]/page.tsx",
  component: "components/FootShearSolutionPage.tsx",
  data: "data/foot-shear-page.ts",
  products: "data/products.ts",
  parameters: "data/shearing-details.ts",
  sitemap: "app/sitemap.ts",
  robots: "app/robots.ts",
};

for (const path of Object.values(files)) {
  assert.ok(existsSync(resolve(root, path)), `Missing required file: ${path}`);
}

const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(resolve(root, path), "utf8")]),
);
const combined = Object.values(source).join("\n");

assert.match(source.route, /import FootShearSolutionPage/);
assert.match(source.route, /product\.id === ["']foot-shear["']/);
assert.match(source.route, /<FootShearSolutionPage product=\{product\}/);
assert.match(source.route, /Foot Operated Shearing Machine for Sheet Metal \| ZYRON/);
assert.match(
  source.route,
  /Foot operated shearing machine for accurate cutting of mild steel, galvanized steel and suitable thin sheet\. No electricity required; ideal for light fabrication\./,
);
assert.match(source.route, /canonical: `\/products\/\$\{product\.id\}`/);

assert.match(source.component, /data-foot-operated-shearing-machine-page/);
assert.match(source.component, /<h1[^>]*>\s*\{content\.title\}\s*<\/h1>/s);
assert.match(source.data, /title: ["']Foot Operated Shearing Machine["']/);
assert.equal((source.component.match(/<h1/g) ?? []).length, 1, "Dedicated page must render exactly one H1");

for (const heading of [
  "Product Overview",
  "Manual Sheet Metal Cutting Without Electricity",
  "What Problems This Machine Solves",
  "Why Choose Our Foot Shearing Machine",
  "Materials Suitable for Foot Shearing",
  "Key Machine Features",
  "How the Foot Pedal Mechanism Works",
  "Technical Specifications",
  "Available Q11 Foot Shear Models",
  "Application Industries",
  "Foot Shear vs Electric Shearing Machine",
  "How to Choose the Right Foot Shearing Machine",
  "Manufacturing Details and Quality Control Points",
  "Foot Operated Shearing Machine FAQ",
  "Request a Foot Shear Quotation",
]) {
  assert.ok(combined.includes(heading), `Missing SEO section: ${heading}`);
}

for (const phrase of [
  "foot operated shearing machine",
  "foot shearing machine",
  "foot shear machine",
  "pedal shearing machine",
  "foot pedal shearing machine",
  "sheet metal foot shear",
  "manual sheet metal shearing machine",
  "manual metal shear",
  "mechanical shearing machine",
  "foot shearing machine manufacturer",
  "foot shear machine supplier",
  "foot shear machine for sale",
  "manual foot shear for sheet metal",
  "foot shear for mild steel",
  "foot shear for galvanized steel",
  "foot shear for stainless steel",
  "manual sheet metal cutting machine",
  "sheet metal cutting machine for small workshop",
]) {
  assert.ok(combined.toLowerCase().includes(phrase), `Missing natural keyword coverage: ${phrase}`);
}

assert.doesNotMatch(source.route, /keywords:\s*\[[\s\S]*?foot operated shearing machine/);
assert.doesNotMatch(combined, /<meta[^>]+name=["']keywords["']/i);
assert.doesNotMatch(combined, /Q01(?:-|\s)/, "Unverified Q01 model terms must not be published");

for (const model of ["Q11-1 x 1000", "Q11-1 x 1300", "Q11-1 x 1500"]) {
  assert.match(source.parameters, new RegExp(model.replaceAll(" ", "\\s*")));
  assert.doesNotMatch(source.data, new RegExp(model.replaceAll(" ", "\\s*")));
  assert.doesNotMatch(source.component, new RegExp(model.replaceAll(" ", "\\s*")));
}
assert.match(source.component, /product\.technicalParameters/);
assert.match(source.data, /Actual cutting capacity depends on material tensile strength, grade, thickness, sheet condition and machine model\./);

assert.equal((source.data.match(/question:/g) ?? []).length, 10, "Expected exactly ten visible buyer FAQs");
for (const question of [
  "What is a foot operated shearing machine?",
  "How does a foot shearing machine work?",
  "Does a foot shear require electricity?",
  "What materials can a foot shear cut?",
  "Can a foot shear cut stainless steel?",
  "What thickness can a foot shearing machine cut?",
  "What is the difference between a foot shear and an electric shear?",
  "Which foot shear model should I choose?",
  "Can the machine be customized?",
  "How can I request a quotation?",
]) {
  assert.ok(source.data.includes(question), `Missing FAQ: ${question}`);
}

for (const route of [
  "/products/series/shearing-machines",
  "/products/compact-electric-shearing-machine",
  "/products/hydraulic-swing-beam-shear",
  "/products/hydraulic-guillotine-shear",
]) {
  assert.ok(source.data.includes(route), `Missing internal link: ${route}`);
}
assert.match(source.products, /legacyIds: \[["']foot-operated-shearing-machine["']\]/);
assert.match(source.sitemap, /products\.map/);
assert.match(source.robots, /allow: ["']\/["']/);

assert.match(source.data, /foot operated shearing machine for sheet metal cutting/);
assert.match(source.data, /Q11 foot operated shearing machine with manual pedal linkage/);
assert.match(source.component, /alt=\{content\.hero\.imageAlt\}/);
assert.match(source.component, /alt=\{content\.mechanism\.imageAlt\}/);

for (const schemaType of ["Product", "BreadcrumbList", "Organization", "FAQPage"]) {
  assert.match(source.component, new RegExp(`["']@type["']:\\s*["']${schemaType}["']`));
}
for (const forbidden of ["aggregateRating", "review", "offers", "price", "priceCurrency", "availability"]) {
  assert.doesNotMatch(source.component, new RegExp(`["']${forbidden}["']\\s*:`));
}

console.log("Foot Operated Shearing Machine SEO source contract passed.");
