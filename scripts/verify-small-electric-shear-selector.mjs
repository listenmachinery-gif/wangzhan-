import assert from "node:assert/strict";
import {
  SMALL_ELECTRIC_SHEAR_BACKGAUGES,
  SMALL_ELECTRIC_SHEAR_MATERIALS,
  recommendSmallElectricShear,
} from "../data/small-electric-shear-selector.ts";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const materialNames = [
  "Mild Steel Sheet",
  "Aluminum Sheet",
  "Galvanized Steel Sheet",
  "Stainless Steel Sheet",
  "Copper Sheet",
  "Printed Circuit Board",
  "Stainless Steel Security Mesh",
  "Prepainted Steel Sheet",
  "Glass-Epoxy Laminate Sheet",
];

const backgaugeNames = [
  "Manually Adjustable Backgauge",
  "Handwheel-Adjustable Backgauge",
  "Motorized Backgauge",
];

assert.deepEqual(SMALL_ELECTRIC_SHEAR_MATERIALS, materialNames);
assert.deepEqual(SMALL_ELECTRIC_SHEAR_BACKGAUGES, backgaugeNames);

const standardMaterials = [
  "Mild Steel Sheet",
  "Galvanized Steel Sheet",
  "Printed Circuit Board",
  "Stainless Steel Security Mesh",
  "Prepainted Steel Sheet",
  "Glass-Epoxy Laminate Sheet",
];

const expectedModels = [
  [600, "Q11G-2X600"],
  [800, "Q11G-2X800"],
  [1000, "Q11G-2X1000"],
  [1300, "Q11G-2X1300"],
  [1500, "Q11G-2X1500"],
  [1600, "Q11G-2X1600"],
  [2000, "Q11G-1.5X2000"],
  [2500, "Q11G-1.2X2500"],
];

for (const material of standardMaterials) {
  for (const [width, model] of expectedModels) {
    const maxThickness = width <= 1600 ? 2 : width === 2000 ? 1.5 : 1.2;
    assert.equal(recommendSmallElectricShear(material, maxThickness, width)?.model, model);
  }
}

for (const material of ["Aluminum Sheet", "Copper Sheet"]) {
  for (const [width, model] of expectedModels) {
    const maxThickness = width <= 1600 ? 3 : width === 2000 ? 2.5 : 2;
    assert.equal(recommendSmallElectricShear(material, maxThickness, width)?.model, model);
  }
}

for (const [width, model] of expectedModels) {
  const maxThickness = width <= 1600 ? 1 : width === 2000 ? 0.8 : 0.6;
  assert.equal(recommendSmallElectricShear("Stainless Steel Sheet", maxThickness, width)?.model, model);
}

assert.equal(recommendSmallElectricShear("Mild Steel Sheet", 2, 601)?.model, "Q11G-2X800");
assert.equal(recommendSmallElectricShear("Aluminum Sheet", 3, 1301)?.model, "Q11G-2X1500");
assert.equal(recommendSmallElectricShear("Stainless Steel Sheet", 1, 1501)?.model, "Q11G-2X1600");

assert.equal(recommendSmallElectricShear("Mild Steel Sheet", 1.6, 1700), null);
assert.equal(recommendSmallElectricShear("Aluminum Sheet", 2.6, 1700), null);
assert.equal(recommendSmallElectricShear("Stainless Steel Sheet", 0.9, 1700), null);
assert.equal(recommendSmallElectricShear("Mild Steel Sheet", 2.1, 600), null);
assert.equal(recommendSmallElectricShear("Mild Steel Sheet", 1, 2501), null);
assert.equal(recommendSmallElectricShear("Unknown Sheet", 1, 600), null);
assert.equal(recommendSmallElectricShear("Mild Steel Sheet", 0, 600), null);
assert.equal(recommendSmallElectricShear("Mild Steel Sheet", -1, 600), null);
assert.equal(recommendSmallElectricShear("Mild Steel Sheet", 1, Number.NaN), null);

const selectorPath = resolve(root, "components/SmallElectricShearSelector.tsx");
assert.ok(existsSync(selectorPath), "The selector client component must exist");
const selectorSource = readFileSync(selectorPath, "utf8");
assert.match(selectorSource, /^"use client";/);
assert.match(selectorSource, /recommendSmallElectricShear\(material, thickness, width\)/);
assert.match(selectorSource, /aria-live="polite"/);
assert.match(selectorSource, /fetch\("\/api\/inquiry"/);
assert.match(selectorSource, /mailto:info@zyroncnc\.com/);
assert.doesNotMatch(selectorSource, /name="name"/);
assert.match(selectorSource, /data-selector-grid/);
assert.match(selectorSource, /lg:grid-cols-2/, "The desktop selector must use two columns");
assert.match(selectorSource, /data-selector-submit[^>]*className="lg:col-span-2"/, "The submit area must span the full desktop form width");

const fieldOrder = [
  "Cutting Material",
  "Cutting Thickness",
  "Cutting Width",
  "Recommended Model",
  "Backgauge Type",
  "Email",
  "WhatsApp / Phone",
  "Destination Country",
];
let previousFieldIndex = -1;
for (const label of fieldOrder) {
  const fieldIndex = selectorSource.indexOf(label);
  assert.ok(fieldIndex > previousFieldIndex, `${label} must appear in the requested field order`);
  previousFieldIndex = fieldIndex;
}

const solutionSource = readFileSync(resolve(root, "components/ShearingSolutionPage.tsx"), "utf8");
const carouselIndex = solutionSource.indexOf("<ModelCardCarousel");
const selectorIndex = solutionSource.indexOf("<SmallElectricShearSelector");
assert.ok(carouselIndex >= 0 && selectorIndex > carouselIndex, "The selector must render below the model carousel");

const inquiryRouteSource = readFileSync(resolve(root, "app/api/inquiry/route.ts"), "utf8");
assert.match(inquiryRouteSource, /recommendSmallElectricShear\(material, cuttingThickness, cuttingWidth\)/);
assert.match(inquiryRouteSource, /Small Electric Shear Selection/);
assert.match(inquiryRouteSource, /\["Recommended Model", recommendedModel\]/);
assert.doesNotMatch(inquiryRouteSource, /cleanValue\(payload\.recommendedModel\)/);
assert.match(inquiryRouteSource, /process\.env\.INQUIRY_TO_EMAIL \|\| "info@zyroncnc\.com"/);

console.log("Small Electric Shear selector rules passed.");
