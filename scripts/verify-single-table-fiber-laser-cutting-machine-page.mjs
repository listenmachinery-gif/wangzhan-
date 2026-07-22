import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
};

const route = read("app/products/[id]/page.tsx");
const component = read(
  "components/SingleTableFiberLaserCuttingMachineSolutionPage.tsx",
);
const data = read("data/single-table-fiber-laser-cutting-machine-page.ts");
const packageJson = JSON.parse(read("package.json"));
const sources = read(
  "public/products/single-table-fiber-laser-cutting-machine-applications/SOURCES.md",
);

assert.equal(
  packageJson.scripts?.["verify:single-table-laser"],
  "node scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs",
  "package.json must expose the focused page verifier",
);

assert.match(
  route,
  /SingleTableFiberLaserCuttingMachineSolutionPage/,
  "route must import the dedicated single-table page",
);
assert.match(
  route,
  /product\.id === "single-table-fiber-laser-cutting-machine"/,
  "route must dispatch the single-table product to its dedicated page",
);
assert.match(
  route,
  /Single-Table Fiber Laser Cutting Machine \| Sheet Metal Cutting Solution/,
  "route must contain the exact meta title",
);
assert.match(
  route,
  /Single-table fiber laser cutting machine for cost-effective sheet metal cutting, metal fabrication, stainless steel products, cabinet manufacturing and workshop production\./,
  "route must contain the approved meta description",
);

for (const keyword of [
  "Single-Table Fiber Laser Cutting Machine",
  "Single Platform Fiber Laser Cutting Machine",
  "Open Type Fiber Laser Cutting Machine",
  "Sheet Metal Fiber Laser Cutting Machine",
  "Metal Sheet Laser Cutting Machine",
  "Fiber Laser Cutter for Metal Sheet",
  "CNC Fiber Laser Cutting Machine",
  "Sheet Metal Cutting Solution",
  "Steel Plate Laser Cutting Machine",
  "Stainless Steel Laser Cutting Machine",
]) {
  assert.ok(route.includes(keyword), `metadata must include keyword: ${keyword}`);
}

assert.match(
  component,
  /data-single-table-fiber-laser-cutting-machine-page/,
  "component must expose the dedicated page marker",
);
assert.equal(
  (component.match(/<h1\b/g) ?? []).length,
  1,
  "component source must contain exactly one H1",
);
assert.match(component, /product\.image/, "component must reuse the original product image");
assert.match(component, /product\.specs/, "component must resolve applicable original specs");
assert.match(
  component,
  /Single-table fiber laser cutting machine for sheet metal cutting/,
  "component must use the approved product-image alt",
);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.ok(
  (component.match(/overflow-x-auto/g) ?? []).length >= 2,
  "comparison and specification tables must scroll locally",
);
assert.match(component, /loading="lazy"/, "application images must be lazy loaded");

const requiredSections = [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "cutting-process",
  "single-table-design",
  "laser-power",
  "cutting-gas",
  "advantages",
  "comparison",
  "fabrication-workflow",
  "selection-guide",
  "technical-specifications",
  "workshop-safety",
  "faq",
  "internal-links",
  "final-cta",
];

for (const section of requiredSections) {
  assert.ok(
    component.includes(`data-section="${section}"`),
    `component must render data-section=${section}`,
  );
}
assert.equal(
  (component.match(/data-section="/g) ?? []).length,
  requiredSections.length,
  "component must render exactly 18 primary sections",
);

for (const schemaType of ["ProductModel", "FAQPage", "BreadcrumbList"]) {
  assert.ok(component.includes(`"@type": "${schemaType}"`), `missing ${schemaType} schema`);
}

assert.match(
  data,
  /Customizable \/ Please confirm with our sales engineer/,
  "data must use the approved confirmation placeholder",
);
assert.match(data, /Single-Table Fiber Laser Cutting Machine/);
assert.match(
  data,
  /Cost-effective sheet metal laser cutting solution for small and medium fabrication workshops\./,
);
assert.match(data, /Get Laser Cutting Solution/);
assert.match(data, /Request Machine Configuration/);

const imagePathPattern =
  /image:\s*"(\/products\/single-table-fiber-laser-cutting-machine-applications\/[^"]+)"/g;
const imagePaths = Array.from(data.matchAll(imagePathPattern), (match) => match[1]);
assert.equal(imagePaths.length, 9, "data must contain nine application image entries");
assert.equal(new Set(imagePaths).size, 9, "application image paths must be unique");

for (const imagePath of imagePaths) {
  assert.ok(
    existsSync(resolve(root, `public${imagePath}`)),
    `application image must exist: ${imagePath}`,
  );
}

assert.match(sources, /Pexels License|Unsplash License/);
assert.match(sources, /bodor\.com/i);
assert.match(sources, /senfenglaser\.com/i);
assert.match(sources, /do not define guaranteed ZYRON specifications/i);

const combined = `${route}\n${component}\n${data}`;
assert.doesNotMatch(combined, /offers\s*:/i, "Product schema must omit offers");
assert.doesNotMatch(combined, /\bprice\b|qr code|二维码/i);
assert.doesNotMatch(
  combined,
  /continuous cutting without loading downtime|automatic exchange table/i,
  "single-table page must not inherit exchange-table selling claims",
);

console.log("Single-Table Fiber Laser Cutting Machine page contract passed.");
