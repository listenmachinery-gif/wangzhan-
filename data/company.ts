export type CompanyStat = {
  value: string;
  label: string;
  verification: "existing-site-data";
};

export type CompanyStep = {
  title: string;
  description: string;
};

export type CompanyFaq = {
  question: string;
  answer: string;
};

export const companyIdentity = {
  name: "ZYRON Heavy Industry",
  alternateName: "ZYRON",
  url: "https://www.zyroncnc.com",
  logo: "https://www.zyroncnc.com/brand/zyron-header-logo-2026.png",
  email: "info@zyroncnc.com",
  telephone: "+8615655537083",
  displayTelephone: "+86 156 5553 7083",
  address:
    "Dongjiao Industrial Park, Bowang Town, Bowang District, Ma’anshan City, Anhui Province, China",
  addressParts: {
    streetAddress: "Dongjiao Industrial Park",
    addressLocality: "Bowang Town, Bowang District, Ma’anshan City",
    addressRegion: "Anhui Province",
    addressCountry: "CN",
  },
  sameAs: [] as string[],
};

// VERIFY BEFORE PUBLISHING: values are inherited from the existing live site.
export const companyStats: CompanyStat[] = [
  { value: "15+", label: "Years of Experience", verification: "existing-site-data" },
  { value: "60+", label: "Countries Served", verification: "existing-site-data" },
  { value: "200+", label: "Team Members", verification: "existing-site-data" },
  { value: "10,000m²+", label: "Factory Area", verification: "existing-site-data" },
];

export const companyFocus = [
  "Sheet Metal Processing Machinery",
  "HVAC Duct Production Equipment",
  "Fiber Laser Cutting Systems",
  "Plate Forming and Pressing Equipment",
  "Industrial Shredding Solutions",
  "OEM, ODM and Production-Line Matching",
];

export const productSystem = [
  {
    categoryId: "shearing-machines",
    title: "Shearing Machines",
    description:
      "Foot-operated, compact electric, energy-saving electric, hydraulic swing-beam, and hydraulic guillotine solutions for different sheet thicknesses, working lengths, and production volumes.",
  },
  {
    categoryId: "bending-machines",
    title: "Bending Machines",
    description:
      "Manual, pneumatic, electric, hydraulic, NC, torsion-bar CNC, and electro-hydraulic servo CNC equipment for different accuracy, automation, and output requirements.",
  },
  {
    categoryId: "laser-cutting-machines",
    title: "Fiber Laser Cutting",
    description:
      "Single-table, exchange-table, sheet-and-tube, and dedicated tube fiber laser systems for flexible plate and profile processing.",
  },
  {
    categoryId: "plate-rolling-machines",
    title: "Plate Rolling Machines",
    description:
      "Two-roll, three-roll, automatic three-roll, and hydraulic four-roll solutions for cylindrical and curved sheet-metal forming.",
  },
  {
    categoryId: "press-machines",
    title: "Press Machines",
    description:
      "Mechanical punch presses, pneumatic punch presses, and four-column hydraulic presses for punching, stamping, forming, and pressing applications.",
  },
  {
    categoryId: "rectangular-duct-production",
    title: "Rectangular Duct Production",
    description:
      "Beading, lock forming, flange forming, seam closing, riveting, notching, plasma cutting, and automatic duct production equipment.",
  },
  {
    categoryId: "round-duct-production",
    title: "Round and Spiral Duct Production",
    description:
      "Rolling, elbow forming, beading, angle-iron flange rolling, and spiral duct production solutions.",
  },
  {
    categoryId: "shredders",
    title: "Industrial Shredding",
    description:
      "Industrial granulators, single-shaft shredders, and dual-shaft shredders for material size reduction and recycling preparation.",
  },
];

export const engineeringInputs = [
  {
    title: "Material",
    items: [
      "Carbon steel",
      "Stainless steel",
      "Galvanized sheet",
      "Aluminum",
      "Copper",
      "Pre-painted sheet",
      "Other application-specific materials",
    ],
  },
  {
    title: "Production Requirement",
    items: [
      "Material thickness range",
      "Maximum working length",
      "Required part geometry",
      "Target daily output",
      "Accuracy requirement",
      "Batch size",
      "Available operators",
      "Future expansion",
    ],
  },
  {
    title: "Factory Conditions",
    items: [
      "Available floor space",
      "Loading and unloading method",
      "Local voltage and frequency",
      "Air or hydraulic requirements",
      "Upstream and downstream process",
      "Destination-country requirements",
    ],
  },
];

export const engineeringProcess: CompanyStep[] = [
  {
    title: "Requirement Review",
    description:
      "We collect the material, dimensions, process, output, accuracy, voltage, layout, and delivery information.",
  },
  {
    title: "Machine Matching",
    description:
      "The team compares suitable machine structures and automation levels.",
  },
  {
    title: "Configuration Proposal",
    description:
      "A recommended model, key configuration, optional equipment, and quotation path are prepared.",
  },
  {
    title: "Technical Confirmation",
    description:
      "Important parameters, drawings, tooling, controls, safety items, and production expectations are confirmed before manufacturing.",
  },
  {
    title: "Production Coordination",
    description:
      "Order requirements are transferred into production, assembly, inspection, and delivery preparation.",
  },
];

export const customizationOptions = [
  "Working length and capacity selection",
  "CNC and control-system options",
  "Manual, pneumatic, hydraulic and servo configurations",
  "Back-gauge and positioning options",
  "Tooling and forming requirements",
  "Feeding and supporting systems",
  "Voltage and electrical configuration",
  "Machine color and branding",
  "Safety guards and operating protection",
  "Production-line matching",
  "Packing method",
  "Documentation and spare-parts preparation",
];

export const qualityProcess: CompanyStep[] = [
  {
    title: "Requirement and Specification Review",
    description:
      "The confirmed configuration, capacity, controls, voltage, tooling, options, and destination information are reviewed before production.",
  },
  {
    title: "Incoming Component Check",
    description:
      "Key purchased components are checked against the approved machine configuration and order requirements.",
  },
  {
    title: "Structural Inspection",
    description:
      "The machine frame, welded parts, mounting positions, covers, guards, and visible joints are reviewed before final assembly.",
  },
  {
    title: "Mechanical Assembly Check",
    description:
      "Transmission, guides, bearings, shafts, rollers, tooling, fasteners, lubrication points, and moving mechanisms are checked for installation and movement.",
  },
  {
    title: "Hydraulic or Pneumatic Check",
    description:
      "Where applicable, pipes, connections, cylinders, valves, pumps, pressure conditions, and leakage risks are examined.",
  },
  {
    title: "Electrical Inspection",
    description:
      "Electrical cabinet wiring, controls, motors, sensors, limits, emergency stop, and operating functions are checked according to the machine configuration.",
  },
  {
    title: "Functional Testing",
    description:
      "The machine is powered on and operated through its main movements, controls, adjustments, safety functions, and configured options.",
  },
  {
    title: "Application Test",
    description:
      "Where appropriate, sample material is processed to observe machine movement, forming or cutting performance, and operating stability.",
  },
  {
    title: "Final Inspection",
    description:
      "Appearance, labels, accessories, tools, manuals, loose components, documentation, and packing list are reviewed.",
  },
  {
    title: "Shipment Approval",
    description:
      "The machine proceeds to packing only after the required checks and order information have been completed.",
  },
];

export const packingProcess: CompanyStep[] = [
  {
    title: "Machine Cleaning and Preparation",
    description:
      "The machine surface, operating area, accessories, and exposed components are prepared for packing.",
  },
  {
    title: "Moving-Part Protection",
    description:
      "Movable or exposed components are secured where required to reduce movement during transportation.",
  },
  {
    title: "Moisture and Surface Protection",
    description:
      "Appropriate protective material is applied according to the machine, packing method, and transport conditions.",
  },
  {
    title: "Accessory Organization",
    description:
      "Tooling, foot switches, controls, manuals, spare parts, loose components, and supplied accessories are organized and checked.",
  },
  {
    title: "Export Packing",
    description:
      "Packing may use protective wrapping, pallets, reinforced bases, wooden cases, or other suitable methods depending on the machine and shipment.",
  },
  {
    title: "Container Loading",
    description:
      "Machine size, weight, lifting position, container space, and unloading conditions are considered during loading preparation.",
  },
  {
    title: "Shipping Documentation",
    description:
      "The required packing information and commercial documentation are prepared according to the order and shipping arrangement.",
  },
];

export const globalServices: CompanyStep[] = [
  {
    title: "Pre-Sales Consultation",
    description:
      "Material, thickness, working length, production process, output, voltage, layout, and automation requirements are reviewed before quotation.",
  },
  {
    title: "Technical Documentation",
    description:
      "Depending on the machine and order, relevant specifications, configuration information, operating documents, electrical information, and packing details are prepared.",
  },
  {
    title: "Installation Preparation",
    description:
      "Foundation, space, power, air, hydraulic, lifting, and unloading requirements can be communicated before machine arrival where applicable.",
  },
  {
    title: "Operation Guidance",
    description:
      "Operating instructions, video guidance, remote communication, and technical explanation can support customer startup.",
  },
  {
    title: "Troubleshooting Support",
    description:
      "Customers can provide machine model, serial information, photos, videos, alarm messages, and operating conditions to help the technical team analyze the issue.",
  },
  {
    title: "Spare Parts Support",
    description:
      "Wear parts, electrical components, tooling, seals, switches, sensors, and other service items can be identified according to machine model and configuration.",
  },
];

export const serviceFlow = [
  "Submit machine information",
  "Provide photos, video and fault details",
  "Technical review",
  "Recommended action",
  "Parts or follow-up support where required",
];

export const whyZyron: CompanyStep[] = [
  {
    title: "Broad Product Coverage",
    description:
      "Cutting, bending, rolling, pressing, laser processing, HVAC duct forming, and shredding equipment can be reviewed through one supplier.",
  },
  {
    title: "Application-Based Selection",
    description:
      "Machine recommendations are based on material, thickness, dimensions, output, process, automation, voltage, and layout instead of a model name alone.",
  },
  {
    title: "Visible Manufacturing Process",
    description:
      "Factory images, assembly details, testing records, certificate documents, and machine operating materials help buyers perform supplier evaluation.",
  },
  {
    title: "Configuration Flexibility",
    description:
      "Standard machines and technically feasible configuration options support different production and market requirements.",
  },
  {
    title: "Export Preparation",
    description:
      "Technical confirmation, packing preparation, documentation, voltage review, and shipping coordination support international orders.",
  },
  {
    title: "Long-Term Support",
    description:
      "Machine identification, operating guidance, troubleshooting communication, and spare-parts support continue after delivery.",
  },
];

export const companyFaqs: CompanyFaq[] = [
  {
    question: "Is ZYRON a machinery manufacturer?",
    answer:
      "ZYRON Heavy Industry provides machinery manufacturing, configuration, testing, export preparation, and technical-support services for sheet metal processing, HVAC duct production, laser cutting, rolling, pressing, and shredding applications. Buyers can request factory information, machine videos, technical documents, inspection coordination, and production details during supplier evaluation.",
  },
  {
    question: "What information is required to recommend a machine?",
    answer:
      "The most useful information includes material type, minimum and maximum thickness, working length, required process, part shape, daily output, accuracy requirement, local voltage, available factory space, destination country, and any required automation.",
  },
  {
    question: "Can ZYRON provide customized machines?",
    answer:
      "Configuration adjustments may be available depending on the machine type, application, technical feasibility, order quantity, destination requirements, and confirmed technical agreement. Common requirements may involve capacity, working length, control system, tooling, voltage, feeding, positioning, protection, color, branding, and production-line matching.",
  },
  {
    question: "How are machines tested before shipment?",
    answer:
      "Testing depends on the machine type and configuration. It may include main movement, motor and transmission operation, hydraulic or pneumatic response, CNC functions, positioning, limits, emergency stop, tooling, sample processing, accessory confirmation, and final packing inspection.",
  },
  {
    question: "Can customers inspect the machine before delivery?",
    answer:
      "Depending on the project arrangement, customers can discuss factory visits, video inspection, operating videos, sample tests, remote review, or third-party inspection coordination before shipment.",
  },
  {
    question: "Does ZYRON provide installation and operation support?",
    answer:
      "Support may include installation preparation, operating documents, video guidance, remote technical communication, troubleshooting assistance, and spare-parts identification. The exact service scope should be confirmed according to the selected machine and contract.",
  },
  {
    question: "Does ZYRON support OEM or distributor cooperation?",
    answer:
      "OEM, ODM, branding, product configuration, documentation, and distributor cooperation can be discussed according to the target market, product range, technical requirements, and expected cooperation plan.",
  },
  {
    question: "What should I provide when requesting after-sales support?",
    answer:
      "Provide the machine model, serial or order information, operating condition, material details, fault description, alarm message, clear photos, and short videos. Complete information helps the technical team identify the machine configuration and analyze the issue more efficiently.",
  },
];
