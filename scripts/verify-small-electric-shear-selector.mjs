import assert from "node:assert/strict";
import {
  SMALL_ELECTRIC_SHEAR_BACKGAUGES,
  SMALL_ELECTRIC_SHEAR_MATERIALS,
  recommendSmallElectricShear,
} from "../data/small-electric-shear-selector.ts";

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

console.log("Small Electric Shear selector rules passed.");
