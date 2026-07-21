import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";

const routePath = "app/products/[id]/page.tsx";
const componentPath = "components/TorsionBarCncPressBrakeSolutionPage.tsx";
const dataPath = "data/torsion-bar-cnc-press-brake-page.ts";

assert.ok(existsSync(componentPath), "Dedicated torsion-bar component must exist");
assert.ok(existsSync(dataPath), "Typed torsion-bar page data must exist");

const route = readFileSync(routePath, "utf8");
const component = readFileSync(componentPath, "utf8");
const data = readFileSync(dataPath, "utf8");
const bendingSource = readFileSync("data/bending-details.ts", "utf8")
  .replace(/^import[^\n]*\n/, "")
  .replace(
    "export const bendingProductDetails: Partial<Record<string, ProductDetailContent>> =",
    "globalThis.bendingProductDetails =",
  );
const dataSandbox = {};
vm.runInNewContext(bendingSource, dataSandbox);
const technicalParameters = dataSandbox.bendingProductDetails["torsion-bar-nc-press-brake"].technicalParameters;

assert.equal(technicalParameters.columns.length, 9, "Original torsion-bar table must keep 9 columns");
assert.equal(technicalParameters.rows.length, 37, "Original torsion-bar table must keep all 37 rows");
assert.equal(technicalParameters.rows[0][0], "40T/2200");
assert.equal(technicalParameters.rows.at(-1)[0], "600T/6000");

assert.match(route, /TorsionBarCncPressBrakeSolutionPage/);
assert.match(route, /product\.id === "torsion-bar-cnc-press-brake"/);
assert.match(
  route,
  /Torsion Bar CNC Press Brake \| Cost-effective Sheet Metal Bending Solution/,
);
assert.match(route, /Torsion bar CNC press brake for cost-effective sheet metal bending/);
assert.match(route, /Torsion bar CNC press brake for sheet metal bending/);

assert.match(component, /data-torsion-bar-cnc-press-brake-page/);
assert.match(component, /product\.technicalParameters/);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /heading\.label/);
assert.match(component, /heading\.unit/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /"@type": "Product"/);
assert.match(component, /"@type": "FAQPage"/);
assert.match(component, /"@type": "BreadcrumbList"/);
assert.doesNotMatch(component, /offers\s*:/i);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1, "Page must render exactly one H1");
assert.doesNotMatch(`${component}\n${data}`, /\bprice\b|qr code/i);

const sections = [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "process",
  "torsion-synchronization",
  "cnc-control",
  "advantages",
  "comparison",
  "workflow",
  "selection",
  "technical",
  "tooling",
  "faq",
  "internal-links",
  "cta",
];
for (const section of sections) {
  assert.match(component, new RegExp(`data-section=["']${section}["']`), `Missing ${section} section`);
}

assert.equal((data.match(/\.webp/g) ?? []).length, 8, "Applications must use eight real photos");
assert.equal(new Set(data.match(/\/products\/[^"']+\.webp/g) ?? []).size, 8);
assert.match(data, /Torsion Bar CNC Press Brake/);
assert.match(data, /What Bending Problems Can It Solve\?/);
assert.match(data, /Torsion Bar CNC Sheet Metal Bending Solution/);
assert.match(data, /Applications/);
assert.match(data, /From Flat Sheet to Bent Part/);
assert.match(data, /Torsion Bar Synchronization for Standard Bending/);
assert.match(data, /Practical CNC Control for Workshop Bending/);
assert.match(data, /Why Choose This Torsion Bar CNC Press Brake\?/);
assert.match(data, /Torsion Bar CNC Press Brake vs Electro-hydraulic CNC Press Brake vs NC Press Brake/);
assert.match(data, /Build a Complete Sheet Metal Fabrication Workflow/);
assert.match(data, /How to Choose the Right Torsion Bar CNC Press Brake\?/);
assert.match(data, /Technical Specifications/);
assert.match(data, /Tooling Matters for Better Bending/);
assert.match(data, /Frequently Asked Questions/);
assert.match(data, /Need a Cost-effective CNC Bending Solution\?/);

console.log("Torsion Bar CNC Press Brake page contract verified.");
