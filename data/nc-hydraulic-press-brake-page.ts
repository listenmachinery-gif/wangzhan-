export type ContentCard = {
  title: string;
  text: string;
};

export type SolutionCard = ContentCard & {
  suitableFor: string;
  productionValue: string;
};

export type ApplicationPhoto = ContentCard & {
  image: string;
  alt: string;
};

export type ComparisonRow = {
  label: string;
  nc: string;
  cnc: string;
  folding: string;
};

export type WorkflowItem = ContentCard & {
  href?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "Sheet metal fabrication",
    text: "A practical bending platform for regular brackets, panels, covers and fabricated sheet-metal parts in small and medium batches.",
    image: "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
    alt: "Sheet metal fabrication workshop for NC hydraulic press brake applications",
  },
  {
    title: "Electrical cabinet and enclosure",
    text: "Supports repeatable bending of cabinet panels, doors, enclosures, mounting plates and reinforcement parts.",
    image: "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
    alt: "Electrical cabinet and enclosure manufacturing workshop",
  },
  {
    title: "Stainless steel products",
    text: "Suitable for stainless panels and fabricated products when tonnage, bend length and tooling are matched to the material.",
    image: "/products/electric-folding-applications/stainless-steel-fabrication.webp",
    alt: "Stainless steel fabrication for sheet metal bending applications",
  },
  {
    title: "HVAC duct and ventilation parts",
    text: "Handles suitable duct panels, flanges, transitions and ventilation components that require press-brake tooling and hydraulic force.",
    image: "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
    alt: "HVAC duct and ventilation fabrication workshop",
  },
  {
    title: "Machinery manufacturing",
    text: "Fits general machinery production for guards, frames, supports and formed components with recurring bend dimensions.",
    image: "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
    alt: "Machinery manufacturing and construction sheet metal workshop",
  },
  {
    title: "Steel structure components",
    text: "Provides stable hydraulic force for suitable gussets, covers and secondary structural parts after cutting and preparation.",
    image: "/products/electric-folding-applications/architectural-sheet-metal.webp",
    alt: "Architectural and steel structure sheet metal fabrication",
  },
  {
    title: "Door and window metal parts",
    text: "Useful for metal profiles, frames, cover plates and formed parts used in door, window and architectural fabrication.",
    image: "/products/manual-folding-applications/architectural-sheet-metal.webp",
    alt: "Door and window architectural metal parts workshop",
  },
  {
    title: "General metalworking workshop",
    text: "An economical entry into NC-controlled bending for repair shops and general workshops handling varied regular jobs.",
    image: "/products/manual-folding-applications/repair-maintenance-workshop.webp",
    alt: "General metalworking repair and maintenance workshop",
  },
] as const;

export const ncHydraulicPressBrakePage = {
  hero: {
    title: "NC Hydraulic Press Brake",
    subtitle:
      "Cost-effective sheet metal bending solution for workshops and general metal fabrication.",
    description:
      "An NC hydraulic press brake designed for regular sheet metal bending, small and medium batch production, and practical workshop use. It provides stable hydraulic bending performance, simple NC control, and a more economical solution for customers who need reliable bending capacity without the higher cost of full CNC press brakes.",
    primaryCta: "Get Bending Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "NC Controlled Bending",
      "Hydraulic Bending Force",
      "Cost-effective Workshop Solution",
      "Suitable for Sheet Metal Fabrication",
    ],
  },
  painPointHeading: "What Bending Problems Can It Solve?",
  painPoints: [
    {
      title: "Manual bending cannot meet production needs",
      text: "When a workshop needs more stable bending angles, greater bending force and longer workpieces, an NC hydraulic press brake is a more practical production choice than manual bending methods.",
    },
    {
      title: "Full CNC press brake budget is too high",
      text: "For regular bends, standard parts and small or medium batches, NC control provides a more economical entry-level numerical-control solution.",
    },
    {
      title: "Sheet metal parts need repeatable bending",
      text: "An NC back gauge and programmed positioning help repeat bend dimensions and reduce dependence on fully manual measurement.",
    },
    {
      title: "Workshops need a practical bending machine",
      text: "The machine fits sheet-metal factories, repair shops, cabinet workshops, duct fabricators and general metalworking production.",
    },
    {
      title: "Different materials require different bending settings",
      text: "Tonnage and configuration can be matched to the material, thickness, bending length, tooling and required angle.",
    },
  ] satisfies readonly ContentCard[],
  solutionHeading: "NC Sheet Metal Bending Solution",
  solutions: [
    {
      title: "General Sheet Metal Workshop",
      suitableFor:
        "Small and medium sheet-metal factories, non-standard part fabricators and repair workshops.",
      text: "Daily bending of mild steel, stainless steel, galvanized sheet and aluminum for regular fabricated parts.",
      productionValue:
        "A practical hydraulic bending platform for routine jobs and small or medium batches.",
    },
    {
      title: "Cabinet & Enclosure Fabrication",
      suitableFor:
        "Electrical cabinet, control cabinet, enclosure and metal housing manufacturers.",
      text: "Bending panels, doors, housings, brackets and reinforcement plates with repeatable dimensions.",
      productionValue:
        "NC back-gauge positioning supports recurring cabinet and enclosure work without full multi-axis CNC complexity.",
    },
    {
      title: "Duct, Structure & Machinery Parts",
      suitableFor:
        "Ventilation duct, steel-structure accessory, machinery and construction metalwork producers.",
      text: "Small and medium batch bending coordinated with shearing, laser cutting, rolling and welding processes.",
      productionValue:
        "Connects cutting and downstream assembly through a dependable core bending operation.",
    },
  ] satisfies readonly SolutionCard[],
  applicationHeading: "Applications",
  applications: applicationPhotos,
  materialHeading: "Materials",
  materials: [
    "Mild Steel",
    "Stainless Steel",
    "Galvanized Sheet",
    "Aluminum Plate",
    "Copper Sheet",
    "Thin Metal Plate",
  ],
  materialNote:
    "The suitable bending thickness depends on material strength, bending length, V-die opening, bending angle and machine tonnage. Please confirm your material and bending requirement before quotation.",
  processHeading: "From Flat Sheet to Bent Part",
  processSteps: [
    {
      title: "Sheet Cutting",
      text: "Cut the sheet to the required size by shearing machine, laser cutting machine or other cutting equipment.",
    },
    {
      title: "Tooling Selection",
      text: "Select suitable punch and die according to material, thickness and bending angle.",
    },
    {
      title: "Back Gauge Positioning",
      text: "Use the NC back gauge to position the sheet for repeated bending sizes.",
    },
    {
      title: "Hydraulic Bending",
      text: "The hydraulic system drives the ram to bend the sheet between upper and lower tooling.",
    },
    {
      title: "Angle Checking",
      text: "Check the bending angle and adjust stroke, tooling or compensation when needed.",
    },
    {
      title: "Next Process",
      text: "Continue with welding, riveting, assembly, surface treatment or final product manufacturing.",
    },
  ] satisfies readonly ContentCard[],
  controlHeading: "Simple NC Control for Practical Bending",
  controlIntro:
    "Basic NC control is designed for regular bending jobs, repeated positioning and practical workshop operation without the complexity of advanced multi-axis CNC systems.",
  controlPoints: [
    "NC control is suitable for regular bending jobs and repeated production.",
    "The controller can help manage back gauge positioning and bending stroke depending on machine configuration.",
    "It is easier to operate than advanced CNC systems for basic bending tasks.",
    "It is a cost-effective choice for workshops that do not need complex multi-axis CNC bending.",
    "Before quotation, confirm the required axis configuration, controller model and bending complexity.",
  ],
  controllerFeatures: [
    "Common E21 controller configuration",
    "X-axis back gauge positioning",
    "Y-axis stroke or bending-depth setting",
    "Multi-step program setting",
    "Workpiece counting",
  ],
  advantageHeading: "Why Choose This NC Hydraulic Press Brake?",
  advantages: [
    "Cost-effective hydraulic bending solution",
    "Suitable for regular sheet metal bending",
    "NC back gauge for repeated positioning",
    "Hydraulic system for stable bending force",
    "Mature torsion-bar synchronization structure",
    "Easier operation than complex CNC systems",
    "Practical for small and medium batch production",
    "Works with cutting, rolling, welding and assembly processes",
  ],
  verifiedStructure: [
    "Hydraulic drive",
    "Torsion-bar synchronization",
    "NC controller",
    "Back gauge system",
    "Upper punch and lower die",
    "Front support and foot-pedal operation",
  ],
  comparisonHeading:
    "NC Press Brake vs CNC Press Brake vs Hydraulic Folding Machine",
  comparisonRows: [
    {
      label: "Control system",
      nc: "Basic NC control for back-gauge positioning and machine settings, depending on configuration.",
      cnc: "Advanced CNC control with closed-loop motion and broader programming capability.",
      folding: "Manual, electric, pneumatic, hydraulic or CNC folding control depending on machine type.",
    },
    {
      label: "Axis configuration",
      nc: "Commonly focused on basic X/Y-related positioning or stroke settings.",
      cnc: "Supports multiple coordinated axes such as Y1/Y2, X, R and optional Z axes.",
      folding: "Varies by folding-beam design and automation level.",
    },
    {
      label: "Suitable production type",
      nc: "Regular parts and small or medium batches.",
      cnc: "Frequent changeovers, complex parts and precision batch production.",
      folding: "Long-edge folding, hemming and suitable thin-sheet panel work.",
    },
    {
      label: "Bending complexity",
      nc: "Best for basic and conventional bending sequences.",
      cnc: "Better suited to complex multi-step and high-accuracy workpieces.",
      folding: "Well suited to panels and edge-folding profiles within machine capacity.",
    },
    {
      label: "Cost level",
      nc: "Economical entry-level numerical-control solution.",
      cnc: "Higher investment for accuracy, axes and automation.",
      folding: "Depends on drive, length, capacity and automation.",
    },
    {
      label: "Operation difficulty",
      nc: "Relatively simple for regular work and repeated dimensions.",
      cnc: "Requires more programming and process knowledge.",
      folding: "Often intuitive for edge folding, with complexity varying by controls.",
    },
    {
      label: "Recommended use",
      nc: "Budget-conscious workshops needing hydraulic force and basic NC positioning.",
      cnc: "Factories prioritizing precision, complex parts, automation and frequent order changes.",
      folding: "Thin-sheet long edges, hems, duct panels and suitable box or tray work.",
    },
  ] satisfies readonly ComparisonRow[],
  workflowHeading: "Build a Complete Sheet Metal Fabrication Workflow",
  workflowSummary:
    "The NC hydraulic press brake is not only a single machine, but also a core bending machine in a complete sheet metal fabrication workflow.",
  workflowEquipment: [
    {
      title: "Shearing Machine",
      text: "Straight cutting and blank preparation before bending.",
      href: "/products/series/shearing-machines",
    },
    {
      title: "Fiber Laser Cutting Machine",
      text: "Complex contour cutting and nested sheet preparation.",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    {
      title: "NC Hydraulic Press Brake",
      text: "Core sheet-metal bending and forming operation.",
      href: "/products/nc-hydraulic-press-brake",
    },
    {
      title: "Plate Rolling Machine",
      text: "Arc, cone or cylinder forming for curved workpieces.",
      href: "/products/hydraulic-four-roll-plate-rolling-machine",
    },
    {
      title: "Hydraulic Press",
      text: "Pressing, assembly, forming and correction processes.",
      href: "/products/four-column-hydraulic-press",
    },
    {
      title: "Welding Machine",
      text: "Joining formed components into assemblies.",
    },
    {
      title: "Surface Treatment",
      text: "Grinding, finishing, coating or painting before delivery.",
    },
  ] satisfies readonly WorkflowItem[],
  selectionHeading: "How to Choose the Right NC Hydraulic Press Brake?",
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Maximum bending length",
    "Required bending angle",
    "Minimum flange size",
    "Daily production quantity",
    "Part complexity",
    "Required tonnage",
    "Back gauge requirement",
    "Controller preference",
    "Tooling requirement",
    "Voltage requirement",
    "Need crowning system or not",
    "Need to match with shearing, laser cutting or other equipment",
  ],
  selectionCta: {
    title: "Send Your Sheet Metal Bending Requirement",
    text: "Share your material, thickness, bending length, angle, drawing and production quantity so the machine configuration can be reviewed against the real part.",
    label: "Request Recommendation",
  },
  specificationHeading: "Technical Specifications",
  specificationNote:
    "Final specifications depend on sheet material, thickness, bending length, tooling, controller and selected machine configuration.",
  toolingHeading: "Tooling Matters for Better Bending",
  toolingPoints: [
    "Different bending jobs require a suitable punch and die.",
    "V-die opening affects bending force, minimum flange size and bending quality.",
    "Stainless steel usually requires higher bending force than mild steel under similar conditions.",
    "Special profiles may require custom tooling.",
    "Final tooling recommendations should be confirmed from the drawing, material and bending angle.",
  ],
  toolingCta: "Send drawing for tooling recommendation",
  faqHeading: "Frequently Asked Questions",
  faqs: [
    {
      question: "What is an NC hydraulic press brake?",
      answer:
        "It is a sheet-metal bending machine that uses hydraulic force and an NC controller to manage functions such as back-gauge positioning or ram stroke, depending on the configuration. It is suited to regular sheet-metal bending work.",
    },
    {
      question: "What materials can this machine bend?",
      answer:
        "It is commonly used for mild steel, stainless steel, galvanized sheet, aluminum and copper. Actual capacity depends on material strength, thickness, bending length, tooling and machine tonnage.",
    },
    {
      question: "What is the difference between an NC press brake and a CNC press brake?",
      answer:
        "An NC press brake is an economical choice for basic and regular bending. A CNC press brake is generally better for tighter accuracy requirements, multi-axis control, complex parts and higher automation.",
    },
    {
      question: "Is an NC hydraulic press brake suitable for small workshops?",
      answer:
        "Yes. It is a practical option for small and medium sheet-metal workshops, repair fabricators and general metalworking customers that need an economical hydraulic bending solution.",
    },
    {
      question: "Can it bend stainless steel?",
      answer:
        "Yes, when the machine tonnage and tooling are selected for the stainless-steel strength, thickness and bending length.",
    },
    {
      question: "How do I choose the right tonnage?",
      answer:
        "Confirm material type, thickness, bending length, V-die opening, bending angle and the workpiece drawing. Final tonnage should be reviewed by an engineer.",
    },
    {
      question: "What controller can be used on an NC press brake?",
      answer:
        "Controller options can manage the back gauge, ram stroke, program steps or workpiece counting. The current project information supports a common E21 configuration; the final model depends on the selected machine.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Bending length, tonnage, back gauge, controller, voltage, tooling and safety configuration can be reviewed for the application before quotation.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Provide the material, thickness, bending length, angle, part drawing, production quantity, voltage, controller requirement and destination country or port.",
    },
  ] satisfies readonly FaqItem[],
  finalCta: {
    title: "Need a Cost-effective Sheet Metal Bending Solution?",
    text: "Send your material, thickness, bending length, drawing and production requirement. We will recommend a suitable NC hydraulic press brake configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
  internalLinks: [
    {
      label: "CNC press brake",
      href: "/products/electro-hydraulic-servo-cnc-press-brake",
    },
    { label: "hydraulic press brake", href: "/products/nc-hydraulic-press-brake" },
    { label: "sheet metal shearing machine", href: "/products/series/shearing-machines" },
    {
      label: "fiber laser cutting machine",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    {
      label: "plate rolling machine",
      href: "/products/hydraulic-four-roll-plate-rolling-machine",
    },
    { label: "hydraulic press", href: "/products/four-column-hydraulic-press" },
    { label: "sheet metal bending machine", href: "/products/series/bending-machines" },
  ],
} as const;
