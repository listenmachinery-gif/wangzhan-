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
const data = readSource("data/nc-hydraulic-press-brake-page.ts");
const component = readSource("components/NcHydraulicPressBrakeSolutionPage.tsx");

assert.match(route, /NcHydraulicPressBrakeSolutionPage/);
assert.match(route, /NC Hydraulic Press Brake \| Sheet Metal Bending Solution/);
assert.match(route, /product\.id === "nc-hydraulic-press-brake"/);

assert.match(data, /applicationPhotos/);
assert.equal((data.match(/\.webp/g) ?? []).length, 8);
assert.match(data, /What Bending Problems Can It Solve\?/);
assert.match(data, /Simple NC Control for Practical Bending/);
assert.match(data, /Tooling Matters for Better Bending/);
assert.match(data, /Need a Cost-effective Sheet Metal Bending Solution\?/);
assert.doesNotMatch(data, /technicalParameters\s*:/);

assert.match(component, /data-nc-press-brake-page/);
assert.match(component, /FAQPage/);
assert.match(component, /"@type": "Product"/);
assert.match(component, /BreadcrumbList/);
assert.match(component, /product\.technicalParameters/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /heading\.label/);
assert.match(component, /heading\.unit/);
assert.match(component, /whitespace-nowrap/);
assert.doesNotMatch(component, /price|qr code/i);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);

console.log("NC Hydraulic Press Brake page contract verified.");
