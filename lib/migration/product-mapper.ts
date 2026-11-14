import { validateModule } from "@/lib/product-modules/schemas";
import { SMALL_ELECTRIC_PRODUCT_MODULE_ORDER } from "@/lib/product-modules/small-electric-template";
import type { ProductModule, ProductModuleType } from "@/lib/product-modules/types";

export type LegacyTechnicalTable = { columns: string[]; rows: string[][] };

export type LegacyProductInput = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  tagline: string;
  image: string;
  specs: Array<{ label: string; value: string }>;
  highlights: string[];
  applications: string[];
  options: string[];
  performanceFeatures?: string;
  advantages?: string[];
  technicalParameters?: LegacyTechnicalTable;
  page?: Record<string, unknown>;
};

export type UnmappedLegacyContent = { path: string; value: unknown; reason: string };

export type MappingResult = {
  product: {
    slug: string;
    name: string;
    categorySlug: string;
    categoryName: string;
    summary: string;
    description: string | null;
  };
  modules: ProductModule<unknown>[];
  unmapped: UnmappedLegacyContent[];
};

function keyForColumn(label: string, index: number, used: Set<string>) {
  const base = label.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `column_${index + 1}`;
  let key = base;
  let suffix = 2;
  while (used.has(key)) key = `${base}_${suffix++}`;
  used.add(key);
  return key;
}

function splitAdvantage(value: string) {
  const separator = value.indexOf(":");
  if (separator < 1) return { title: value, text: value };
  return { title: value.slice(0, separator).trim(), text: value.slice(separator + 1).trim() || value };
}

export function mapLegacyProduct(legacy: LegacyProductInput): MappingResult {
  const byType = new Map<ProductModuleType, ProductModule<unknown>>(
    SMALL_ELECTRIC_PRODUCT_MODULE_ORDER.map((type, position) => [
      type,
      { type, position, visible: false, data: null },
    ]),
  );
  const set = (type: ProductModuleType, data: unknown) => {
    byType.set(type, {
      type,
      position: SMALL_ELECTRIC_PRODUCT_MODULE_ORDER.indexOf(type),
      visible: true,
      data: validateModule(type, data),
    });
  };

  set("HERO", {
    eyebrow: legacy.categoryName,
    title: legacy.name,
    subtitle: legacy.tagline,
    images: { desktop: legacy.image, alt: legacy.name },
    badges: legacy.highlights.length ? legacy.highlights : undefined,
    valuePoints: legacy.specs.length ? legacy.specs.map((item) => `${item.label}: ${item.value}`) : undefined,
    primaryCta: { label: "Request a Quote", href: "#quote" },
  });
  set("OVERVIEW", {
    eyebrow: "Product Overview",
    title: legacy.name,
    paragraphs: [legacy.performanceFeatures ?? legacy.tagline],
  });

  if (legacy.applications.length) {
    set("APPLICATIONS", {
      eyebrow: "Applications",
      title: `${legacy.name} Applications`,
      items: legacy.applications.map((application) => ({ title: application, text: application })),
    });
  }
  if (legacy.advantages?.length) {
    set("ADVANTAGES", {
      eyebrow: "Advantages",
      title: `${legacy.name} Advantages`,
      items: legacy.advantages.map(splitAdvantage),
    });
  }
  if (legacy.options.length) {
    set("MODEL_GUIDE", {
      eyebrow: "Available Options",
      title: `${legacy.name} Configuration Options`,
      paragraphs: legacy.options,
    });
  }
  if (legacy.technicalParameters?.columns.length && legacy.technicalParameters.rows.length) {
    const used = new Set<string>();
    const columns = legacy.technicalParameters.columns.map((label, index) => ({
      key: keyForColumn(label, index, used),
      label,
    }));
    set("TECHNICAL", {
      eyebrow: "Technical Parameters",
      title: `${legacy.name} Technical Parameters`,
      paragraphs: [legacy.performanceFeatures ?? legacy.tagline],
      columns,
      rows: legacy.technicalParameters.rows.map((values) =>
        Object.fromEntries(columns.map((column, index) => [column.key, values[index] ?? "—"])),
      ),
    });
  }

  const page = legacy.page ?? {};
  const consumed = new Set<string>();
  const object = (key: string) => {
    const value = page[key];
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  };
  const string = (key: string) => typeof page[key] === "string" ? page[key] as string : undefined;
  const stringArray = (key: string) => Array.isArray(page[key]) && (page[key] as unknown[]).every((item) => typeof item === "string")
    ? page[key] as string[]
    : undefined;
  const itemArray = (key: string) => Array.isArray(page[key]) ? page[key] as Array<Record<string, unknown>> : undefined;
  const mapCards = (items: Array<Record<string, unknown>>) => items.map((item) => ({
    title: String(item.title ?? item.label ?? ""),
    text: String(item.text ?? item.description ?? item.title ?? ""),
    ...(item.image ? { image: String(item.image) } : {}),
    ...(item.alt ? { alt: String(item.alt) } : {}),
  }));

  if (string("title") && string("heroBackgroundImage")) {
    set("HERO", {
      eyebrow: string("eyebrow") ?? legacy.categoryName,
      title: string("title")!,
      subtitle: string("heroSubtitle") ?? legacy.tagline,
      intro: string("heroIntro"),
      images: {
        desktop: string("heroBackgroundImage")!,
        ...(string("heroBackgroundTabletImage") ? { tablet: string("heroBackgroundTabletImage") } : {}),
        ...(string("heroBackgroundMobileImage") ? { mobile: string("heroBackgroundMobileImage") } : {}),
        alt: string("heroBackgroundAlt") ?? string("imageAlt") ?? legacy.name,
      },
      badges: stringArray("heroBadges"),
      valuePoints: stringArray("heroValuePoints") ?? stringArray("valuePoints"),
      primaryCta: { label: string("primaryCta") ?? "Request a Quote", href: "#quote" },
      ...(string("secondaryCta") ? { secondaryCta: { label: string("secondaryCta")!, href: "#models" } } : {}),
    });
    ["title", "heroBackgroundImage", "eyebrow", "heroSubtitle", "heroIntro", "heroBackgroundTabletImage", "heroBackgroundMobileImage", "heroBackgroundAlt", "imageAlt", "heroBadges", "heroValuePoints", "valuePoints", "primaryCta", "secondaryCta"].forEach((key) => consumed.add(key));
  }

  const overview = object("overview");
  if (overview) {
    const paragraphs = Array.isArray(overview.paragraphs) ? overview.paragraphs.map(String) : [String(overview.intro ?? legacy.tagline)];
    set("OVERVIEW", { eyebrow: String(overview.eyebrow ?? "Product Overview"), title: String(overview.title ?? legacy.name), paragraphs });
    consumed.add("overview");
  }

  const galleryMappings: Array<[string, ProductModuleType, "images" | "items"]> = [
    ["productShowcase", "PRODUCT_SHOWCASE", "images"],
    ["detailGallery", "DETAIL_GALLERY", "items"],
    ["backgaugeCarousel", "OPTION_CAROUSEL", "items"],
    ["materialRangeGallery", "MATERIAL_GALLERY", "items"],
    ["industryGallery", "INDUSTRY_GALLERY", "items"],
  ];
  for (const [key, type, itemsKey] of galleryMappings) {
    const source = object(key);
    const items = source?.[itemsKey];
    if (!source || !Array.isArray(items) || !items.length) continue;
    set(type, {
      eyebrow: String(source.eyebrow ?? legacy.categoryName),
      title: String(source.title ?? legacy.name),
      ...((source.description || source.intro) ? { paragraphs: [String(source.description ?? source.intro)] } : {}),
      items: (items as Array<Record<string, unknown>>).map((item) => ({
        image: String(item.image ?? ""),
        alt: String(item.alt ?? item.title ?? item.label ?? legacy.name),
        title: String(item.title ?? item.label ?? legacy.name),
        ...(item.text ? { text: String(item.text) } : {}),
        ...(item.label ? { label: String(item.label) } : {}),
      })),
    });
    consumed.add(key);
  }

  const cardMappings: Array<[string, ProductModuleType, string, string]> = [
    ["painPoints", "PROBLEMS", "painEyebrow", "painTitle"],
    ["processSteps", "PROCESS", "processEyebrow", "processTitle"],
    ["applications", "APPLICATIONS", "applicationsEyebrow", "applicationsTitle"],
    ["advantages", "ADVANTAGES", "advantagesEyebrow", "advantagesTitle"],
    ["supportItems", "MANUFACTURER_SUPPORT", "supportEyebrow", "supportTitle"],
  ];
  for (const [key, type, eyebrowKey, titleKey] of cardMappings) {
    const items = itemArray(key);
    if (!items?.length || typeof items[0] !== "object") continue;
    set(type, { eyebrow: string(eyebrowKey) ?? legacy.categoryName, title: string(titleKey) ?? legacy.name, items: mapCards(items) });
    [key, eyebrowKey, titleKey].forEach((mappedKey) => consumed.add(mappedKey));
  }

  const solutionParagraphs = stringArray("solutionParagraphs");
  if (solutionParagraphs?.length) {
    set("SOLUTION", {
      eyebrow: string("solutionEyebrow") ?? "Solution",
      title: string("solutionTitle") ?? legacy.name,
      paragraphs: solutionParagraphs,
      fit: stringArray("solutionFit"),
    });
    ["solutionParagraphs", "solutionEyebrow", "solutionTitle", "solutionFit", "solutionFitEyebrow", "solutionFitTitle"].forEach((key) => consumed.add(key));
  }

  const materials = object("materials");
  if (materials && Array.isArray(materials.items)) {
    set("MATERIAL_GUIDANCE", {
      eyebrow: String(materials.eyebrow ?? "Materials"),
      title: String(materials.title ?? `${legacy.name} Materials`),
      paragraphs: [String(materials.note ?? "Confirm material requirements before ordering.")],
      materials: (materials.items as Array<Record<string, unknown>>).map((item) => String(item.title ?? "")),
      note: String(materials.note ?? "Confirm material requirements before ordering."),
    });
    consumed.add("materials");
  }

  const structureParts = page.structureParts;
  if (Array.isArray(structureParts) && structureParts.length) {
    set("STRUCTURE", {
      eyebrow: string("structureEyebrow") ?? "Machine Structure",
      title: string("structureTitle") ?? `${legacy.name} Structure`,
      items: structureParts.map((part) => typeof part === "string"
        ? { title: part, text: part }
        : { title: String((part as Record<string, unknown>).title ?? ""), text: String((part as Record<string, unknown>).text ?? (part as Record<string, unknown>).title ?? "") }),
    });
    ["structureParts", "structureEyebrow", "structureTitle", "structureImageAlt", "structureCallouts"].forEach((key) => consumed.add(key));
  }

  const modelCards = itemArray("modelCards");
  if (modelCards?.length) {
    set("MODEL_CARDS", {
      eyebrow: "Models",
      title: `${legacy.name} Models`,
      paragraphs: [legacy.performanceFeatures ?? legacy.tagline],
      items: modelCards.map((item) => ({
        name: String(item.model ?? item.name ?? ""),
        specs: (Array.isArray(item.specifications) ? item.specifications : []).map((spec) => ({
          label: String((spec as Record<string, unknown>).label ?? ""),
          value: String((spec as Record<string, unknown>).value ?? ""),
        })),
      })),
    });
    consumed.add("modelCards");
  }

  const modelGuide = object("modelGuide");
  if (modelGuide) {
    const paragraphs = [
      ...(modelGuide.intro ? [String(modelGuide.intro)] : []),
      ...(Array.isArray(modelGuide.paragraphs) ? modelGuide.paragraphs.map(String) : []),
      ...(Array.isArray(modelGuide.items) ? (modelGuide.items as Array<Record<string, unknown>>).map((item) => `${item.title}: ${item.text}`) : []),
    ];
    if (paragraphs.length) {
      set("MODEL_GUIDE", { eyebrow: String(modelGuide.eyebrow ?? "Model Guide"), title: String(modelGuide.title ?? legacy.name), paragraphs });
      consumed.add("modelGuide");
    }
  }

  const comparisonRows = itemArray("comparisonRows");
  if (comparisonRows?.length) {
    const valueKeys = Object.keys(comparisonRows[0]).filter((key) => key !== "label");
    set("COMPARISON", {
      eyebrow: string("comparisonEyebrow") ?? "Comparison",
      title: string("comparisonTitle") ?? `${legacy.name} Comparison`,
      paragraphs: [string("comparisonIntro") ?? legacy.tagline],
      columns: ["Feature", ...valueKeys.map((key) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase()))],
      rows: comparisonRows.map((row) => ({ label: String(row.label ?? ""), values: valueKeys.map((key) => String(row[key] ?? "—")) })),
    });
    ["comparisonRows", "comparisonEyebrow", "comparisonTitle", "comparisonIntro", "comparisonElectricLabel", "comparisonHighlight", "binaryComparison"].forEach((key) => consumed.add(key));
  }

  const energyComparison = object("energyComparison");
  if (energyComparison && Array.isArray(energyComparison.rows)) {
    set("ENERGY_COMPARISON", {
      eyebrow: String(energyComparison.eyebrow ?? "Energy Comparison"),
      title: String(energyComparison.title ?? `${legacy.name} Energy Comparison`),
      paragraphs: [String(energyComparison.intro ?? legacy.tagline)],
      columns: ["Metric", String(energyComparison.leftLabel ?? "Option A"), String(energyComparison.rightLabel ?? "Option B")],
      rows: (energyComparison.rows as Array<Record<string, unknown>>).map((row) => ({ label: String(row.label ?? ""), values: [String(row.left ?? ""), String(row.right ?? "")] })),
    });
    consumed.add("energyComparison");
  }

  const workflow = object("workflow");
  if (workflow && Array.isArray(workflow.steps)) {
    set("WORKFLOW", {
      eyebrow: String(workflow.eyebrow ?? "Workflow"),
      title: String(workflow.title ?? `${legacy.name} Workflow`),
      paragraphs: workflow.intro ? [String(workflow.intro)] : undefined,
      items: workflow.steps.map((step, index) => ({ title: `Step ${index + 1}`, text: String(step) })),
    });
    consumed.add("workflow");
  }

  const faqs = itemArray("faqs");
  if (faqs?.length) {
    set("FAQ", {
      eyebrow: string("faqEyebrow") ?? "FAQ",
      title: string("faqTitle") ?? `${legacy.name} FAQ`,
      paragraphs: [legacy.performanceFeatures ?? legacy.tagline],
      items: faqs.map((item) => ({ question: String(item.question ?? ""), answer: String(item.answer ?? "") })),
    });
    ["faqs", "faqEyebrow", "faqTitle"].forEach((key) => consumed.add(key));
  }

  const relatedLinks = itemArray("relatedLinks");
  if (relatedLinks?.length) {
    set("RELATED_LINKS", {
      eyebrow: "Related Products",
      title: `Explore More ${legacy.categoryName}`,
      paragraphs: [legacy.performanceFeatures ?? legacy.tagline],
      items: relatedLinks.map((item) => ({ label: String(item.label ?? ""), href: String(item.href ?? "") })),
    });
    consumed.add("relatedLinks");
  }

  if (string("ctaTitle") && string("ctaIntro")) {
    set("CTA", {
      eyebrow: string("ctaEyebrow") ?? "Request a Quote",
      title: string("ctaTitle")!,
      paragraphs: [string("ctaIntro")!],
      primaryCta: { label: string("primaryCta") ?? "Request a Quote", href: "#quote" },
      requiredInfo: stringArray("requiredInfo"),
    });
    ["ctaEyebrow", "ctaTitle", "ctaIntro", "requiredInfo"].forEach((key) => consumed.add(key));
  }

  const hiddenSections = stringArray("hiddenSections") ?? [];
  const hiddenMap: Record<string, ProductModuleType> = {
    problems: "PROBLEMS", solution: "SOLUTION", process: "PROCESS", applications: "APPLICATIONS",
    materials: "MATERIAL_GUIDANCE", advantages: "ADVANTAGES", structure: "STRUCTURE", "model-guide": "MODEL_GUIDE",
    comparison: "COMPARISON", "energy-comparison": "ENERGY_COMPARISON", workflow: "WORKFLOW",
    manufacturer: "MANUFACTURER_SUPPORT", related: "RELATED_LINKS", cta: "CTA",
  };
  for (const section of hiddenSections) {
    const type = hiddenMap[section];
    const productModule = type ? byType.get(type) : undefined;
    if (productModule) byType.set(type, { ...productModule, visible: false });
  }
  if (hiddenSections.length) consumed.add("hiddenSections");

  const unmapped: UnmappedLegacyContent[] = [];
  for (const [key, value] of Object.entries(page)) {
    if (consumed.has(key)) continue;
    unmapped.push({ path: `page.${key}`, value, reason: "No standardized mapping" });
  }

  return {
    product: {
      slug: legacy.id,
      name: legacy.name,
      categorySlug: legacy.categoryId,
      categoryName: legacy.categoryName,
      summary: legacy.tagline,
      description: legacy.performanceFeatures ?? null,
    },
    modules: SMALL_ELECTRIC_PRODUCT_MODULE_ORDER.map((type) => byType.get(type)!),
    unmapped,
  };
}
