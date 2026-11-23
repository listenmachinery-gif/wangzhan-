import type { PageDocument } from "@/lib/page-builder/schema";

export { homepageRedesignDocument } from "@/lib/homepage/homepage-content";

export function isHomepageRedesign(document: PageDocument | null | undefined) {
  return document?.renderMode === "REPLACE_LEGACY"
    && document.nodes.some((node) => node.type === "HOME_HERO");
}

export const defaultHomepageDocument: PageDocument = {
  schemaVersion: 1,
  nodes: [
    {
      id: "homepage-factory-stats",
      type: "FACTORY_STATS",
      content: {
        eyebrow: "Company Strength",
        heading: "Manufacturing capacity behind every solution.",
        description: "Explore ZYRON machinery capabilities across sheet cutting, bending, rolling, and HVAC duct production.",
        image: "/brand/factory-showcase.png",
        imageAlt: "ZYRON Heavy Industry factory exterior",
        ctaLabel: "Explore Company",
        ctaHref: "/factory",
        stats: [
          { value: "Cutting", label: "Sheet Processing" },
          { value: "Bending", label: "Forming Equipment" },
          { value: "Rolling", label: "Curved Forming" },
          { value: "Ductwork", label: "HVAC Production" },
        ],
      },
    },
    {
      id: "homepage-advantages",
      type: "ADVANTAGES",
      content: {
        eyebrow: "Why Choose ZYRON",
        heading: "Built for buyers who need practical production answers.",
        description: "ZYRON focuses on complete sheet metal workflows, not isolated machines. We help customers confirm the right process, model, configuration, delivery plan, and support path before purchase.",
        items: [
          { title: "Complete Product Range", body: "Cutting, bending, rolling, pressing, duct forming, laser cutting, and shredding solutions from one supplier." },
          { title: "Configuration Guidance", body: "Machines are matched around material, thickness, working length, output target, voltage, and workshop layout." },
          { title: "Factory Quality Control", body: "Machine structure, assembly, testing, packing, and export preparation are managed under one production system." },
          { title: "Global Service Support", body: "Quotation, technical documents, operation guidance, spare parts, and after-sales support for overseas buyers." },
        ],
        primaryLabel: "Explore Product Series",
        primaryHref: "/products",
        secondaryLabel: "Ask an Engineer",
        secondaryHref: "/contact",
      },
    },
  ],
};
