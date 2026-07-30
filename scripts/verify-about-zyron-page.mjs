import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
};

const header = read("components/SiteHeader.tsx");
const footer = read("components/SiteFooter.tsx");
const route = read("app/factory/page.tsx");
const page = read("components/company/CompanyPage.tsx");
const companySources = [
  "CompanyHero.tsx",
  "CompanyOverview.tsx",
  "ManufacturingCapabilities.tsx",
  "ProductSystem.tsx",
  "EngineeringQualitySections.tsx",
  "CompanySupportSections.tsx",
  "CompanyPage.tsx",
  "CompanyMediaDialog.tsx",
  "CompanyFaq.tsx",
  "TestingVideo.tsx",
  "CompanyInquiryForm.tsx",
]
  .map((file) => read(`components/company/${file}`))
  .join("\n");
const data = read("data/company.ts");
const inquiryRoute = read("app/api/inquiry/route.ts");
const photoShotList = read("docs/company-page-photo-shot-list.md");
const packageJson = JSON.parse(read("package.json"));

assert.equal(
  packageJson.scripts?.["verify:about-zyron"],
  "node scripts/verify-about-zyron-page.mjs",
  "package.json must expose the About ZYRON verifier",
);

assert.match(
  header,
  /<NavItem href="\/factory" label="ABOUT ZYRON" \/>/,
  "desktop navigation must link directly to About ZYRON",
);
assert.doesNotMatch(
  header,
  /SimpleDropdown label="COMPANY"|const aboutLinks/,
  "Company dropdown and duplicate child links must be removed",
);
assert.match(
  header,
  /\{ label: "About ZYRON", href: "\/factory" \}/,
  "mobile navigation must use the About ZYRON label",
);
assert.doesNotMatch(
  footer,
  /Factory & Solutions/,
  "footer must not duplicate the About page",
);
assert.match(footer, /About ZYRON/);

assert.match(
  route,
  /About ZYRON Heavy Industry \| Sheet Metal Machinery Manufacturer/,
  "route must use the approved title",
);
assert.match(
  route,
  /Explore ZYRON Heavy Industry’s factory, manufacturing process, quality control, product range, testing, export packing, certificates, and global machinery support\./,
  "route must use the approved meta description",
);
assert.match(route, /canonical:\s*"\/factory"/);
assert.match(route, /\/brand\/factory-showcase\.png/);
assert.match(route, /openGraph/);
assert.match(route, /twitter/);
assert.match(route, /robots:\s*\{\s*index:\s*true,\s*follow:\s*true/s);
assert.match(route, /<CompanyPage \/>/);

assert.match(page, /data-about-zyron-page/);
assert.equal(
  (companySources.match(/<h1\b/g) ?? []).length,
  1,
  "About page components must contain exactly one H1",
);

const requiredSections = [
  "hero",
  "overview",
  "stats",
  "manufacturing",
  "product-system",
  "engineering",
  "customization",
  "quality",
  "testing",
  "certificates",
  "factory-gallery",
  "packing",
  "global-support",
  "why-zyron",
  "faq",
  "final-cta",
];

for (const section of requiredSections) {
  assert.ok(
    companySources.includes(`data-company-section="${section}"`),
    `About page must render data-company-section=${section}`,
  );
}
assert.equal(
  (companySources.match(/data-company-section="/g) ?? []).length,
  requiredSections.length,
  "About page must render exactly 16 primary sections",
);
assert.match(companySources, /id="manufacturing-capability"/);
assert.match(companySources, /scroll-mt-/);
assert.match(companySources, /Explore Our Manufacturing/);
assert.match(companySources, /Talk to an Engineer/);

assert.match(
  data,
  /VERIFY BEFORE PUBLISHING: values are inherited from the existing live site/,
);
for (const stat of ["15+", "60+", "200+", "10,000m²+"]) {
  assert.ok(data.includes(stat), `missing existing site stat: ${stat}`);
}
for (const contactValue of [
  "info@zyroncnc.com",
  "+8615655537083",
  "Dongjiao Industrial Park, Bowang Town, Bowang District, Ma’anshan City, Anhui Province, China",
]) {
  assert.ok(data.includes(contactValue), `missing company value: ${contactValue}`);
}

for (const categoryId of [
  "shearing-machines",
  "bending-machines",
  "laser-cutting-machines",
  "plate-rolling-machines",
  "press-machines",
  "rectangular-duct-production",
  "round-duct-production",
  "shredders",
]) {
  assert.ok(data.includes(categoryId), `missing product system category: ${categoryId}`);
}

const requiredMedia = [
  "/brand/factory-showcase.png",
  "/brand/certificates-showcase.png",
  "/products/detail-body.jpg",
  "/products/detail-welded-body.jpg",
  "/products/detail-rear-power.jpg",
  "/products/detail-electric-inside.jpg",
  "/products/detail-control-inside.jpg",
  "/products/detail-adjustment.jpg",
  "/products/detail-front.jpg",
  "/products/detail-positioning.jpg",
  "/brand/exhibition/exhibition-booth-01.png",
  "/brand/exhibition/exhibition-booth-06.png",
];
for (const mediaPath of requiredMedia) {
  assert.ok(data.includes(mediaPath), `missing real site media mapping: ${mediaPath}`);
  assert.ok(
    existsSync(resolve(root, `public${mediaPath}`)),
    `mapped real site media must exist: ${mediaPath}`,
  );
}
assert.match(companySources, /loading="lazy"/);

for (const schemaType of ["Organization", "WebPage", "BreadcrumbList", "FAQPage"]) {
  assert.ok(page.includes(`"@type": "${schemaType}"`), `missing ${schemaType} schema`);
}
assert.doesNotMatch(page, /AggregateRating|offers|priceCurrency/);

assert.match(companySources, /<dialog/);
assert.match(companySources, /showModal\(\)/);
assert.match(companySources, /Escape/);
assert.match(companySources, /object-contain/);
assert.match(companySources, /aria-expanded=/);
assert.match(companySources, /aria-controls=/);
assert.match(companySources, /<video/);
assert.match(companySources, /controls/);
assert.doesNotMatch(companySources, /autoPlay/);

for (const field of [
  "company",
  "country",
  "material",
  "thicknessRange",
  "workingLength",
  "targetOutput",
  "website",
]) {
  assert.ok(
    companySources.includes(field),
    `company inquiry form must include ${field}`,
  );
  assert.ok(
    inquiryRoute.includes(field),
    `inquiry endpoint must accept ${field}`,
  );
}
assert.match(companySources, /aria-live/);
assert.match(inquiryRoute, /website/);

for (const requirement of [
  "recommended ratio",
  "ZYRON logo",
  "background cleanup",
  "Customer inspection",
  "Container loading",
]) {
  assert.match(
    photoShotList,
    new RegExp(requirement, "i"),
    `photo shot list must cover ${requirement}`,
  );
}

const combined = `${route}\n${companySources}\n${data}`;
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

console.log("About ZYRON company page contract passed.");
