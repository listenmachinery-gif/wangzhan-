import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
};

const route = read("app/(site)/factory/page.tsx");
const content = read("lib/page-builder/about-zyron-content.ts");
const registry = read("lib/page-builder/registry.ts");
const renderer = read("components/page-builder/renderers.tsx");
const structuredData = read("components/company/CompanyStructuredData.tsx");
const sidebar = read("components/admin/AdminSidebar.tsx");
const adminRoute = read("app/admin/about/page.tsx");
const pageService = read("lib/services/page-service.ts");
const componentSources = [
  "AboutHeroSection.tsx",
  "AboutCompanyOverviewSection.tsx",
  "AboutManufacturingSection.tsx",
  "IndustrialCta.tsx",
]
  .map((file) => read(`components/company/cms/${file}`))
  .join("\n");
const packageJson = JSON.parse(read("package.json"));

assert.equal(
  packageJson.scripts?.["verify:about-zyron"],
  "node scripts/verify-about-zyron-page.mjs",
  "package.json must expose the About ZYRON verifier",
);

assert.match(route, /About ZYRON \| Sheet Metal Machinery Manufacturer/);
assert.match(route, /canonical:\s*"\/factory"/);
assert.match(route, /\/images\/about\/zyron-factory-exterior\.webp/);
assert.match(route, /robots:\s*\{\s*index:\s*true,\s*follow:\s*true/s);
assert.match(route, /aboutZyronDocument/);
assert.match(route, /ABOUT_HERO/);
assert.match(route, /CompanyStructuredData/);

for (const type of ["ABOUT_HERO", "ABOUT_COMPANY_OVERVIEW", "ABOUT_MANUFACTURING"]) {
  assert.ok(content.includes(`type: "${type}"`), `default document must include ${type}`);
  assert.ok(registry.includes(`type: "${type}"`), `component registry must expose ${type}`);
  assert.ok(renderer.includes(`case "${type}"`), `page renderer must support ${type}`);
}

for (const nodeId of [
  "about-hero",
  "about-company-overview",
  "about-manufacturing",
  "about-capability-overview",
  "about-quality",
  "about-engineering",
  "about-global-delivery",
  "about-contact",
]) {
  assert.ok(content.includes(`id: "${nodeId}"`), `missing About page module: ${nodeId}`);
}

assert.equal(
  (componentSources.match(/<h1\b/g) ?? []).length,
  1,
  "About page custom components must contain exactly one H1",
);
assert.match(componentSources, /\bpriority\b/);
assert.match(componentSources, /sizes=/);
assert.match(componentSources, /aria-label=/);

for (const schemaType of ["Organization", "AboutPage", "BreadcrumbList"]) {
  assert.ok(structuredData.includes(`"@type": "${schemaType}"`), `missing ${schemaType} structured data`);
}
assert.doesNotMatch(structuredData, /AggregateRating|offers|priceCurrency/);

assert.match(sidebar, /href: "\/admin\/about", label: "关于 ZYRON"/);
assert.match(adminRoute, /getBySlug\(principal, "company"\)/);
assert.match(adminRoute, /\/admin\/pages\/\$\{page\.id\}\/edit/);
assert.match(pageService, /if \(slug === "company"\) return \["\/factory"\]/);

const requiredMedia = [
  "zyron-factory-exterior.webp",
  "press-brake-workshop.webp",
  "shearing-machine-workshop.webp",
  "laser-cutting-workshop.webp",
  "power-press-workshop.webp",
];
for (const file of requiredMedia) {
  const mediaPath = resolve(root, "public/images/about", file);
  assert.ok(existsSync(mediaPath), `missing About page media: ${file}`);
  assert.ok(statSync(mediaPath).size > 10_000, `About page media is unexpectedly small: ${file}`);
  assert.ok(content.includes(`/images/about/${file}`), `default content must reference ${file}`);
}

const combined = `${route}\n${content}\n${componentSources}`;
assert.doesNotMatch(
  combined,
  /world[- ]leading|number one|best in the world|100% defect[- ]free|guaranteed lifetime|customers in every country|official partner of/i,
  "About page must avoid unsupported absolute claims",
);
assert.doesNotMatch(
  combined,
  /customer logo wall|fortune 500|client testimonial/i,
  "About page must not invent customer proof",
);

console.log("About ZYRON CMS page contract passed.");
