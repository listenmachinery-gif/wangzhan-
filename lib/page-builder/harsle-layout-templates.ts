import type { PageDocument, PageNode } from "@/lib/page-builder/schema";

/**
 * Reference-inspired layout-only presets. Do NOT replace existing site data automatically.
 * Each section is editable and can be removed or reordered. Every image/video is replaceable
 * through the existing admin MediaAsset library.
 */
const make = (id: string, type: PageNode["type"], content: PageNode["content"]): PageNode => ({ id, type, content });
const hero = (id: string, title: string, description: string, layout: "full" | "split" = "full", image = "/products/hydraulic-press-brake-hero.png"): PageNode =>
  make(id, "MEDIA_HERO", {
    eyebrow: "ZYRON HEAVY INDUSTRY", title, description,
    image, videoSrc: "", poster: image, alt: title,
    mediaKind: "image", layout, mediaSide: "right",
    primaryLabel: "Explore Products", primaryHref: "/products",
    secondaryLabel: "Request a Quote", secondaryHref: "/contact",
  });
const feature = (id: string, eyebrow: string, title: string, body: string, reverse = false): PageNode => make(id, "SPLIT_FEATURE", {
  eyebrow, title, body, reverse, image: "/brand/factory-showcase.png", imageAlt: title, ctaLabel: "Learn More", ctaHref: "/contact",
});
const faq = (id: string) => make(id, "FAQ", { heading: "Frequently Asked Questions", items: [
  { title: "Which machine configuration is suitable for my work?", body: "Please provide the material, thickness, working length, output target and any required controls." },
  { title: "Can I request specific technical documents?", body: "Please contact ZYRON and identify the product model and documents required." },
]});
const inquiry = (id: string) => make(id, "INQUIRY_FORM", { eyebrow: "Talk to ZYRON", heading: "Tell Us About Your Project", description: "Share the machine type, material, working length and application so our team can advise." });
const showcase = (id: string, title: string) => make(id, "MEDIA_SHOWCASE", {
  eyebrow: "Applications and Media", heading: title,
  description: "Replace these placeholders with your approved equipment and project photography or video.",
  items: [
    { title: "Equipment Overview", description: "Upload an approved equipment image.", mediaKind: "image", src: "/products/hydraulic-press-brake-hero.png", alt: "Equipment overview" },
    { title: "Factory and Production", description: "Add a factory image or a real manufacturing video.", mediaKind: "image", src: "/brand/factory-showcase.png", alt: "Factory" },
  ],
});
const category = (id: string) => make(id, "CATEGORY_CARDS", {
  heading: "Explore Our Machinery Series",
  items: [
    { title: "Shearing Machines", description: "Cutting equipment for sheet metal production.", image: "/products/series-heroes/shearing-machine-series.png", href: "/products" },
    { title: "Bending Machines", description: "Press brakes and folding solutions.", image: "/products/hydraulic-press-brake-hero.png", href: "/products" },
    { title: "Laser Cutting Machines", description: "Fiber laser solutions for metalworking.", image: "/products/product-center-hero.png", href: "/products" },
  ],
});
const strength = (id: string) => make(id, "FACTORY_STATS", {
  eyebrow: "About ZYRON", heading: "A Manufacturing Partner for Industrial Production",
  description: "Introduce your actual factory, manufacturing processes, equipment, and customer service. Verify all figures before publication.",
  image: "/brand/factory-showcase.png", imageAlt: "ZYRON factory",
  ctaLabel: "About Us", ctaHref: "/factory",
  stats: [{ value: "—", label: "Verified Years of Experience" }, { value: "—", label: "Verified Factory Capacity" }],
});
const benefits = (id: string) => make(id, "ADVANTAGES", {
  eyebrow: "Why ZYRON", heading: "Solutions Built Around Your Work",
  description: "We help customers understand their required process, equipment specifications and configuration options.",
  items: [
    { title: "Machine Selection", body: "Review material, working length and throughput." },
    { title: "Configuration Support", body: "Confirm the relevant options for the selected machine." },
    { title: "Documentation", body: "Discuss technical and operating documentation." },
    { title: "Project Communication", body: "Coordinate quotation, delivery details and support requests." },
  ],
  primaryLabel: "Explore Products", primaryHref: "/products", secondaryLabel: "Get in Touch", secondaryHref: "/contact",
});
const step = (id: string) => make(id, "TIMELINE", { heading: "How We Work", items: [
  { year: "01", title: "Confirm Requirements", body: "Review materials, working length and project goals." },
  { year: "02", title: "Choose the Machine", body: "Compare machine type and suitable configuration." },
  { year: "03", title: "Coordinate the Order", body: "Confirm details, delivery and documentation." },
  { year: "04", title: "Technical Support", body: "Request service and operational guidance." },
]});
const resources = (id: string) => make(id, "RESOURCE_LINKS", { heading: "Support and Resources", description: "Explore available support and recent company information.", items: [
  { title: "Technical Support", description: "Ask the team about equipment and operation.", href: "/support" },
  { title: "Company News", description: "Explore product information and updates.", href: "/news" },
  { title: "Showcase", description: "Browse projects and shipping highlights.", href: "/showcase" },
]});
const cta = (id: string) => make(id, "INQUIRY_CTA", {
  heading: "Need Help Selecting a Machine?", description: "Contact ZYRON with your production specifications.", label: "Request a Quote", href: "/contact",
});
const spec = (id: string) => make(id, "SPECIFICATION_TABLE", {
  heading: "Technical Specifications", columns: ["Specification", "Value"],
  rows: [["Machine Model", "Confirm with product data"], ["Working Capacity", "Confirm with product data"], ["Controls", "Confirm actual configuration"]],
});
const basic = (nodes: PageNode[]): PageDocument => ({ schemaVersion: 1, nodes });

export const HARSLE_LAYOUT_TEMPLATES: Record<string, { label: string; document: PageDocument }> = {
  "reference-home": {
    label: "HARSLE 排版参考 · 首页",
    document: basic([hero("ref-home-hero", "Precision Metalworking Machinery", "Solutions for cutting, bending, rolling and sheet metal production."),
      feature("ref-home-about", "COMPANY", "Engineering the Right Equipment for Your Work", "Introduce your brand and production approach with a spacious half-image, half-copy section."),
      strength("ref-home-strength"), category("ref-home-series"), benefits("ref-home-benefits"),
      showcase("ref-home-media", "Discover the Machines"), step("ref-home-process"), cta("ref-home-cta")]),
  },
  "reference-company": {
    label: "HARSLE 排版参考 · 公司",
    document: basic([hero("ref-company-hero", "About ZYRON", "Explore our approach to industrial machinery production and service.", "split", "/brand/factory-showcase.png"),
      strength("ref-company-stats"), feature("ref-company-about", "WHO WE ARE", "Focused on Your Manufacturing Process", "Replace with verified company history and capabilities."),
      feature("ref-company-engineering", "MANUFACTURING", "Equipment. People. Processes.", "Share authentic workshop photographs and quality procedures.", true),
      step("ref-company-history"), showcase("ref-company-gallery", "Factory and Team"), cta("ref-company-cta")]),
  },
  "reference-products": {
    label: "HARSLE 排版参考 · 产品中心",
    document: basic([hero("ref-products-hero", "Explore Our Machinery", "Browse solutions by process and equipment type."),
      category("ref-products-categories"), feature("ref-products-cutting", "SHEARING", "Sheet Cutting Solutions", "Insert real category information and direct links to the appropriate product series."),
      feature("ref-products-bending", "BENDING", "Precision Bending Equipment", "Introduce machine types, specifications and applications.", true),
      feature("ref-products-rolling", "ROLLING", "Rolling and Forming Machines", "Present machinery categories as large image-text sections."),
      step("ref-products-selection"), cta("ref-products-cta")]),
  },
  "reference-series": {
    label: "HARSLE 排版参考 · 产品系列",
    document: basic([hero("ref-series-hero", "Shearing Machine Series", "Compare machines and select the right setup for your work."),
      feature("ref-series-intro", "SERIES OVERVIEW", "Choose According to Your Cutting Needs", "Introduce machine families and explain when different models are suitable."),
      category("ref-series-catalog"), benefits("ref-series-strengths"),
      showcase("ref-series-applications", "Applications and Equipment Details"), spec("ref-series-comparison"),
      step("ref-series-guide"), faq("ref-series-faq"), cta("ref-series-cta")]),
  },
  "reference-product-story": {
    label: "HARSLE 排版参考 · 设备专题详情",
    document: { schemaVersion: 1, renderMode: "REPLACE_LEGACY", nodes: [
      hero("ref-product-hero", "Built Around Your Production Requirements", "Review machine structure, application and configuration.", "split"),
      feature("ref-product-overview", "EQUIPMENT OVERVIEW", "Introducing the Machine", "Replace this copy with the verified product description."),
      feature("ref-product-controls", "CONTROLS", "Practical Operation", "Use real control-system images and accurate functional descriptions.", true),
      feature("ref-product-structure", "ENGINEERING", "Structure and Key Components", "Show the actual machine frame and component details."),
      showcase("ref-product-details", "Equipment Photos and Video"), spec("ref-product-specification"),
      faq("ref-product-faq"), inquiry("ref-product-form"), cta("ref-product-cta"),
    ] },
  },
  "reference-product-catalog": {
    label: "HARSLE 排版参考 · 图库型产品详情",
    document: { schemaVersion: 1, renderMode: "REPLACE_LEGACY", nodes: [
      hero("ref-catalog-hero", "Industrial Machinery", "View product details and ask about configurations.", "split"),
      showcase("ref-catalog-gallery", "Machine Gallery and Videos"), feature("ref-catalog-overview", "PRODUCT DETAILS", "Designed for Your Workshop", "Replace with verified specifications and details."),
      spec("ref-catalog-spec"), faq("ref-catalog-faq"), inquiry("ref-catalog-form"),
    ] },
  },
  "reference-support": {
    label: "HARSLE 排版参考 · 支持",
    document: basic([hero("ref-support-hero", "Support Center", "Technical guidance and resources before and after delivery.", "split"),
      resources("ref-support-resources"), showcase("ref-support-tutorials", "Tutorials and Technical Media"),
      step("ref-support-steps"), faq("ref-support-faq"), inquiry("ref-support-inquiry")]),
  },
  "reference-showcase": {
    label: "HARSLE 排版参考 · 展示",
    document: basic([hero("ref-showcase-hero", "Machinery Showcase", "Equipment, manufacturing and delivered project media."),
      showcase("ref-showcase-videos", "Factory and Machine Videos"),
      feature("ref-showcase-case", "CASE STUDIES", "See Real Manufacturing Applications", "Present authentic installation details and application context."),
      showcase("ref-showcase-photos", "Photos and Project Highlights"), cta("ref-showcase-cta")]),
  },
  "reference-contact": {
    label: "HARSLE 排版参考 · 联系",
    document: basic([hero("ref-contact-hero", "Contact ZYRON", "Tell us your machine and project requirements.", "split"),
      inquiry("ref-contact-form"), resources("ref-contact-options"), faq("ref-contact-faq")]),
  },
};
