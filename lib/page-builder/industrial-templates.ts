import type { PageDocument, PageNode } from "@/lib/page-builder/schema";

const node = (id: string, type: PageNode["type"], content: PageNode["content"], style?: PageNode["style"]): PageNode => ({ id, type, content, ...(style ? { style } : {}) });
const hero = (title: string, description: string, image: string, label = "Explore Machines", href = "/products"): PageNode => ({
  ...node("hero", "HERO", { eyebrow: "ZYRON Heavy Industry", title, description, primaryLabel: label, primaryHref: href, image, alt: title }, { textColor: "#FFFFFF" }),
  placement: "BEFORE_LEGACY",
});
const split = (id: string, eyebrow: string, title: string, body: string, image: string, reverse = false) => node(id, "SPLIT_FEATURE", { eyebrow, title, body, image, imageAlt: title, reverse, ctaLabel: "Talk to Our Team", ctaHref: "/contact" });
const faq = node("faq", "FAQ", { heading: "Frequently Asked Questions", items: [
  { title: "How do I choose the correct machine?", body: "Tell us your material, thickness, working length, process requirements and output target." },
  { title: "Can the machine be configured to my requirements?", body: "Available configurations depend on the model. Share your requirements to confirm suitable options." },
  { title: "How do I request technical support?", body: "Contact our team with your machine model, serial number and a description of the issue." },
] });
const cta = node("cta", "INQUIRY_CTA", { heading: "Plan Your Next Production Upgrade", description: "Share your project requirements to receive a suitable equipment recommendation.", label: "Request a Quote", href: "/contact" });
const support = node("support-resources", "RESOURCE_LINKS", { heading: "Support and Resources", description: "Access news, shipping records, and direct engineering support.", items: [
  { title: "Technical Support", description: "Talk through machine operation, settings and maintenance.", href: "/contact" },
  { title: "Company News", description: "Read production and industry updates.", href: "/news" },
  { title: "Shipping Highlights", description: "Browse completed shipments and equipment deliveries.", href: "/shipping-highlights" },
] });
const products = node("product-series", "CATEGORY_CARDS", { heading: "Explore Our Machine Series", items: [
  { title: "Shearing Machines", description: "Cutting solutions for sheet metal fabrication.", image: "/products/series-heroes/shearing-machine-series.png", href: "/products" },
  { title: "Bending Machines", description: "Press brakes and folding solutions.", image: "/products/hydraulic-press-brake-hero.png", href: "/products" },
  { title: "Laser Cutting", description: "Fiber laser processing systems.", image: "/products/product-center-hero.png", href: "/products" },
] });
const timeline = node("timeline", "TIMELINE", { heading: "From Inquiry to Delivery", items: [
  { year: "01", title: "Understand Your Process", body: "Confirm the material, working size, accuracy and daily throughput." },
  { year: "02", title: "Select the Configuration", body: "Evaluate machines, tooling, controls and optional accessories." },
  { year: "03", title: "Verify and Prepare", body: "Coordinate testing, documentation and shipping requirements." },
  { year: "04", title: "Deliver and Support", body: "Provide operation resources and follow-up technical guidance." },
] });
export const INDUSTRIAL_PAGE_TEMPLATES: Record<string, { label: string; document: PageDocument }> = {
  home: { label: "品牌首页 · Industrial Home", document: { schemaVersion: 1, nodes: [
    hero("Precision Machinery. Practical Production.", "Explore sheet metal cutting, bending, rolling, laser processing, hydraulic pressing, and duct fabrication solutions.", "/products/hydraulic-press-brake-hero.png"),
    products,
    split("home-engineering", "Built for Production", "Find the machine that fits your workflow.", "From material thickness to output targets, our team helps evaluate the configuration for your production requirements.", "/brand/factory-showcase.png"),
    node("home-advantages", "ADVANTAGES", { eyebrow: "Why ZYRON", heading: "Machinery Solutions That Fit Your Needs", description: "From selecting machine configuration to shipment preparation.", items: [
      { title: "Process Guidance", body: "Match the equipment to material, thickness and workflow." },
      { title: "Product Range", body: "Explore multiple metal fabrication processes in one catalog." },
      { title: "Configuration Options", body: "Discuss controls, tooling and accessories before ordering." },
      { title: "After-Sales Assistance", body: "Get operation and technical support after delivery." },
    ], primaryLabel: "Explore Products", primaryHref: "/products", secondaryLabel: "Contact Us", secondaryHref: "/contact" }),
    support, cta,
  ] } },
  company: { label: "公司介绍 · Company", document: { schemaVersion: 1, nodes: [
    hero("About ZYRON Heavy Industry", "Discover our approach to sheet metal manufacturing equipment and global project support.", "/brand/factory-showcase.png", "Explore Products", "/products"),
    split("company-intro", "Who We Are", "Manufacturing Solutions for Practical Work.", "ZYRON focuses on equipment selection and configuration across cutting, bending, rolling, pressing, laser processing and duct fabrication.", "/brand/factory-showcase.png"),
    timeline, split("company-quality", "Quality and Process", "Attention to the manufacturing details.", "From equipment assembly and inspection to documentation and shipping preparation, every stage matters.", "/products/hydraulic-press-brake-hero.png", true), support, cta,
  ] } },
  products: { label: "产品中心 · Products", document: { schemaVersion: 1, nodes: [
    hero("Explore Sheet Metal Machinery", "Browse equipment by manufacturing process and production requirements.", "/products/product-center-hero.png"),
    products, timeline, faq, cta,
  ] } },
  series: { label: "产品系列 · Series", document: { schemaVersion: 1, nodes: [
    hero("Shearing Machine Solutions", "Find shearing equipment that matches the material, thickness, cutting length and productivity required.", "/products/series-heroes/shearing-machine-series.png"),
    split("series-types", "Choose Your Equipment", "Match machine structure to your application.", "Compare cutting capacity, operation method, control options, maintenance requirements and expected throughput.", "/products/series-heroes/shearing-machine-series.png"),
    node("series-comparison", "MODEL_COMPARISON", { heading: "Machine Selection Guide", columns: ["Selection Factor", "What to Confirm"], rows: [["Material", "Steel, stainless steel, aluminum or other"], ["Thickness", "Maximum required cutting thickness"], ["Length", "Maximum sheet width"], ["Control", "Manual or controlled backgauge"]] }), faq, cta,
  ] } },
  detail: { label: "单品详情 · Product Detail", document: { schemaVersion: 1, renderMode: "REPLACE_LEGACY", nodes: [
    hero("Configured for Your Workshop", "Review features, materials, processing requirements and machine configuration options.", "/products/hydraulic-press-brake-hero.png"),
    split("detail-performance", "Equipment Overview", "Precision starts with a suitable configuration.", "Explain actual machine structure and processing capabilities based on verified product information.", "/products/hydraulic-press-brake-hero.png"),
    node("detail-spec", "SPECIFICATION_TABLE", { heading: "Technical Specifications", columns: ["Item", "Value"], rows: [["Model", "Confirm model before publishing"], ["Working Capacity", "Confirm specification"], ["Power", "Confirm specification"]] }),
    node("detail-gallery", "PRODUCT_GALLERY", { heading: "Machine Details", images: [{ src: "/products/hydraulic-press-brake-hero.png", alt: "Equipment view" }] }), faq, cta,
  ] } },
  support: { label: "支持中心 · Support", document: { schemaVersion: 1, nodes: [
    hero("Support for Every Production Stage", "Get help with machine selection, operating guidance, technical inquiries and after-sales questions.", "/brand/factory-showcase.png", "Contact Support", "/contact"),
    support, timeline, faq, node("support-form", "INQUIRY_FORM", { eyebrow: "Contact Support", heading: "Tell Us How We Can Help", description: "Include your machine model and technical question so our team can respond." }),
  ] } },
  showcase: { label: "展示中心 · Showcase", document: { schemaVersion: 1, nodes: [
    hero("Machines in Real-World Production", "Explore equipment cases, manufacturing stories and delivery records.", "/brand/factory-showcase.png", "Shipping Highlights", "/shipping-highlights"),
    node("showcase-cases", "CUSTOMER_CASES", { heading: "Project and Delivery Highlights", items: [{ title: "Equipment Shipment", description: "Explore recent shipment records.", image: "/brand/factory-showcase.png", href: "/shipping-highlights" }] }),
    split("showcase-application", "Application Stories", "Solutions shaped around production requirements.", "Present verified customer projects, production photos and actual application scenarios.", "/products/hydraulic-press-brake-hero.png"), cta,
  ] } },
  contact: { label: "联系我们 · Contact", document: { schemaVersion: 1, nodes: [
    hero("Let's Discuss Your Production Requirements", "Tell us about your material, working size, target output and destination.", "/brand/factory-showcase.png", "View Products", "/products"),
    node("contact-form", "INQUIRY_FORM", { eyebrow: "Contact ZYRON", heading: "Request a Machine Recommendation", description: "Our team can review your requirements and discuss suitable configurations." }),
    support,
  ] } },
};
