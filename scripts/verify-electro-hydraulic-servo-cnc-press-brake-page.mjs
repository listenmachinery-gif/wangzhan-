import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readSource = (relativePath) => {
  const absolutePath = path.join(root, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
};

const route = readSource("app/products/[id]/page.tsx");
const data = readSource("data/electro-hydraulic-servo-cnc-press-brake-page.ts");
const component = readSource(
  "components/ElectroHydraulicServoCncPressBrakeSolutionPage.tsx",
);
const details = readSource("data/bending-details.ts");
const sourceManifest = readSource(
  "public/products/electro-hydraulic-servo-cnc-press-brake-applications/SOURCES.md",
);

assert.match(route, /ElectroHydraulicServoCncPressBrakeSolutionPage/);
assert.match(
  route,
  /Electro-Hydraulic Servo CNC Press Brake \| Precision Sheet Metal Bending Solution/,
);
assert.match(route, /product\.id === "electro-hydraulic-servo-cnc-press-brake"/);

assert.match(data, /electroHydraulicServoCncPressBrakePage/);
assert.equal(
  (
    data.match(
      /image:\s*"\/products\/electro-hydraulic-servo-cnc-press-brake-applications\//g,
    ) ?? []
  ).length,
  9,
);
assert.match(data, /What Bending Problems Can It Solve\?/);
assert.match(data, /Electro-Hydraulic Servo Synchronization/);
assert.match(data, /Advanced CNC Control for Complex Bending/);
assert.match(data, /Multi-axis Back Gauge for Accurate Positioning/);
assert.match(data, /Crowning and Tooling Matter/);
assert.match(data, /Need a High-precision CNC Bending Solution\?/);
assert.doesNotMatch(data, /technicalParameters\s*:/);

for (const section of [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "process",
  "servo-synchronization",
  "cnc-control",
  "back-gauge",
  "crowning-tooling",
  "advantages",
  "comparison",
  "workflow",
  "selection",
  "technical",
  "faq",
  "internal-links",
  "cta",
]) {
  assert.match(
    component,
    new RegExp(`data-section=["']${section}["']`),
    `dedicated page must render the ${section} section`,
  );
}

assert.match(component, /detail\.technicalParameters\.columns/);
assert.match(component, /detail\.technicalParameters\.rows/);
assert.match(component, /splitColumnHeading/);
assert.match(component, /heading\.label/);
assert.match(component, /heading\.unit/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /"@type": "ProductModel"/);
assert.match(component, /"@type": "FAQPage"/);
assert.match(component, /"@type": "BreadcrumbList"/);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.doesNotMatch(component + data, /price|qr code|二维码/i);

assert.match(details, /"50T1600"/);
assert.match(details, /"320T6000"/);
assert.match(details, /"Nominal Pressure \(kN\)"/);
assert.match(details, /"Weight \(kg\)"/);
assert.match(sourceManifest, /Pexels|Unsplash/i);

console.log("Electro-Hydraulic Servo CNC Press Brake page contract passed.");
