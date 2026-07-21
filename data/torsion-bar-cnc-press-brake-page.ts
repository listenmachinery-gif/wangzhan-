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
  torsion: string;
  electroHydraulic: string;
  nc: string;
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
    text: "Supports repeatable bending of brackets, panels, covers and standard fabricated parts in small and medium batches.",
    image: "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
    alt: "Real sheet metal fabrication workshop for CNC press brake applications",
  },
  {
    title: "Electrical cabinet and enclosure",
    text: "Fits cabinet panels, doors, housings, mounting plates, brackets and reinforcement parts with recurring bend dimensions.",
    image: "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
    alt: "Real electrical cabinet and enclosure manufacturing workshop",
  },
  {
    title: "HVAC duct and ventilation parts",
    text: "Suitable for duct panels, transitions, flanges and ventilation components that require controlled back-gauge positioning.",
    image: "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
    alt: "Real HVAC duct and ventilation parts fabrication",
  },
  {
    title: "Stainless steel products",
    text: "Handles suitable stainless panels and products when tonnage, bending length and tooling match the material requirement.",
    image: "/products/electric-folding-applications/stainless-steel-fabrication.webp",
    alt: "Real stainless steel product fabrication workshop",
  },
  {
    title: "Machinery manufacturing",
    text: "Useful for guards, supports, frames, covers and standard machinery components that need programmed bending steps.",
    image: "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
    alt: "Real machinery manufacturing and construction sheet metal workshop",
  },
  {
    title: "Steel structure components",
    text: "Provides hydraulic bending force for suitable gussets, covers, brackets and secondary structural components.",
    image: "/products/electric-folding-applications/architectural-sheet-metal.webp",
    alt: "Real architectural and steel structure component fabrication",
  },
  {
    title: "Door and window metal parts",
    text: "Supports frames, cover plates, brackets and formed metal parts used in door, window and architectural fabrication.",
    image: "/products/manual-folding-applications/architectural-sheet-metal.webp",
    alt: "Real door and window architectural metalwork",
  },
  {
    title: "General metalworking workshop",
    text: "A practical CNC bending platform for repair shops and general workshops producing varied standard parts.",
    image: "/products/manual-folding-applications/repair-maintenance-workshop.webp",
    alt: "Real general metalworking repair and maintenance workshop",
  },
] as const;

export const torsionBarCncPressBrakePage = {
  hero: {
    title: "Torsion Bar CNC Press Brake",
    subtitle: "Cost-effective CNC bending solution for standard sheet metal fabrication.",
    description:
      "A torsion bar CNC press brake designed for regular sheet metal bending, workshop production and standard metal fabrication. It combines hydraulic bending force, torsion bar synchronization and practical CNC control to help customers achieve repeatable bending with a more economical machine configuration.",
    primaryCta: "Get CNC Bending Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Torsion Bar Synchronization",
      "CNC Controlled Bending",
      "Hydraulic Bending Force",
      "Cost-effective Workshop Solution",
    ],
  },
  painPointHeading: "What Bending Problems Can It Solve?",
  painPoints: [
    {
      title: "Standard bending jobs need better repeatability",
      text: "CNC control of the back gauge and bending steps supports repeated dimensions and reduces positioning errors caused by fully manual measurement.",
    },
    {
      title: "Full electro-hydraulic CNC press brake is too costly",
      text: "For regular sheet-metal parts, small or medium batches and budget-sensitive projects, torsion-bar CNC control offers a more economical bending platform.",
    },
    {
      title: "Manual or basic hydraulic bending cannot meet production needs",
      text: "When a workshop needs more stable angles, longer workpieces and a higher production rhythm, a torsion-bar CNC press brake is a practical upgrade.",
    },
    {
      title: "Workshops need practical CNC operation",
      text: "The machine suits sheet-metal factories, cabinet producers, duct workshops, repair fabricators and general metalworking production.",
    },
    {
      title: "Different parts need flexible bending settings",
      text: "Tonnage and configuration can be selected around material, thickness, bending length, tooling, back-gauge requirements and part complexity.",
    },
  ] satisfies readonly ContentCard[],
  solutionHeading: "Torsion Bar CNC Sheet Metal Bending Solution",
  solutions: [
    {
      title: "General Sheet Metal Workshop",
      suitableFor: "Small and medium sheet-metal factories, non-standard part fabricators and repair workshops.",
      text: "Daily bending of mild steel, stainless steel, galvanized sheet and aluminum for regular fabricated parts.",
      productionValue: "A practical CNC-controlled hydraulic platform for routine work and small or medium batches.",
    },
    {
      title: "Cabinet & Enclosure Fabrication",
      suitableFor: "Electrical cabinet, control cabinet, enclosure and metal housing manufacturers.",
      text: "Bending panels, doors, housings, brackets and reinforcement plates with repeated dimensions.",
      productionValue: "Programmed positioning supports recurring cabinet work without the complexity of a high-end servo platform.",
    },
    {
      title: "Duct, Structure & Machinery Parts",
      suitableFor: "HVAC duct, steel-structure accessory, machinery and construction metalwork producers.",
      text: "Small and medium batch bending coordinated with shearing, laser cutting, rolling and welding processes.",
      productionValue: "Connects cutting and downstream assembly through a dependable core bending operation.",
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
      title: "CNC Back Gauge Positioning",
      text: "Use the CNC or NC back gauge to position the sheet for repeated bending sizes.",
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
  torsionHeading: "Torsion Bar Synchronization for Standard Bending",
  torsionIntro:
    "The torsion bar structure mechanically links both sides of the ram to support synchronized movement during standard sheet-metal bending. It is a mature, economical platform for regular workshop production.",
  torsionPoints: [
    "The torsion bar structure helps synchronize both sides of the ram during bending.",
    "It is a practical solution for standard sheet-metal bending and regular workshop production.",
    "Compared with electro-hydraulic servo CNC press brakes, the structure is generally more economical and easier to maintain.",
    "It suits customers who need CNC-controlled bending without high-end multi-axis servo synchronization.",
    "Before quotation, confirm material, thickness, bending length, controller requirement and part complexity.",
  ],
  torsionConfigurations: [
    "Torsion-bar mechanical synchronization",
    "Mechanical stop or Y-axis-related control",
    "CNC or NC controller",
    "X-axis back-gauge control",
    "Optional R-axis back-gauge configuration",
    "Mechanical or manual crowning where selected",
    "Hydraulic cylinders",
    "Back-gauge drive matched to the final configuration",
  ],
  controlHeading: "Practical CNC Control for Workshop Bending",
  controlIntro:
    "CNC control supports repeated bending jobs and standard sheet-metal production while keeping operation and configuration practical for small and medium workshops.",
  controlPoints: [
    "The controller can manage back-gauge positioning, bending steps and production settings depending on machine configuration.",
    "It is more economical and easier to operate than advanced full-servo CNC systems for standard bending tasks.",
    "Programmed positioning helps reduce repeated manual measuring and supports consistent part dimensions.",
    "Axis functions, controller model and programming capability must be confirmed against part complexity before quotation.",
  ],
  controllerFeatures: [
    "TP10, E300P and DA41T are supported in current product information as common configuration examples",
    "X-axis back-gauge positioning",
    "Y-axis stroke or bending-depth setting depending on configuration",
    "Program storage and multi-step bending settings",
    "Workpiece counting",
    "Optional R-axis capability where selected",
  ],
  advantageHeading: "Why Choose This Torsion Bar CNC Press Brake?",
  advantages: [
    "Cost-effective CNC bending solution",
    "Torsion-bar synchronization for standard bending tasks",
    "Hydraulic system for stable bending force",
    "CNC or NC back gauge for repeated positioning",
    "Whole welded steel frame for workshop use",
    "Practical for small and medium batch production",
    "Easier maintenance than more complex servo-hydraulic systems",
    "Works with shearing, laser cutting, rolling and welding processes",
  ],
  verifiedStructure: [
    "Whole welded steel frame",
    "Hydraulic cylinders",
    "Torsion-bar synchronization system",
    "CNC controller",
    "Back-gauge system",
    "Upper punch and lower die",
    "Front support arms",
    "Foot-pedal control",
    "Electrical cabinet",
    "Optional crowning configuration",
  ],
  comparisonHeading:
    "Torsion Bar CNC Press Brake vs Electro-hydraulic CNC Press Brake vs NC Press Brake",
  comparisonRows: [
    {
      label: "Synchronization method",
      torsion: "Mechanical torsion-bar synchronization links both sides of the ram.",
      electroHydraulic: "Closed-loop synchronization uses proportional servo valves and position feedback on Y1/Y2.",
      nc: "Commonly uses a mature mechanical synchronization structure for basic bending.",
    },
    {
      label: "Control system",
      torsion: "Practical CNC control for back gauge, stroke and programmed steps depending on configuration.",
      electroHydraulic: "Advanced CNC control for synchronized cylinders, multiple axes and broader programming.",
      nc: "Basic NC control focused on regular positioning and stroke settings.",
    },
    {
      label: "Axis configuration",
      torsion: "Common X/Y-related control with optional R-axis capability where selected.",
      electroHydraulic: "Y1/Y2, X, R and optional Z axes depending on the final machine.",
      nc: "Usually limited to the axes needed for basic positioning and stroke control.",
    },
    {
      label: "Suitable production type",
      torsion: "Standard sheet-metal parts and small or medium batch production.",
      electroHydraulic: "Precision batches, frequent changeovers and complex production.",
      nc: "Basic parts, routine workshop work and smaller batches.",
    },
    {
      label: "Bending complexity",
      torsion: "Conventional and standard multi-step bending within the selected configuration.",
      electroHydraulic: "Complex workpieces, multi-axis positioning and higher control requirements.",
      nc: "Simple and regular bending sequences.",
    },
    {
      label: "Cost level",
      torsion: "Economical CNC platform between basic NC and servo CNC machines.",
      electroHydraulic: "Higher investment for accuracy, axes, feedback and automation.",
      nc: "Lowest entry level for basic numerical-control bending.",
    },
    {
      label: "Maintenance difficulty",
      torsion: "Mechanical synchronization is generally simpler to maintain than closed-loop servo systems.",
      electroHydraulic: "More complex hydraulic, electrical and feedback systems require specialist support.",
      nc: "Relatively straightforward for routine workshop service.",
    },
    {
      label: "Recommended use",
      torsion: "Workshops needing practical CNC control and repeatable standard bending at a controlled investment.",
      electroHydraulic: "Factories prioritizing precision, complex parts, automation and frequent order changes.",
      nc: "Budget-conscious workshops handling simple and conventional bending tasks.",
    },
  ] satisfies readonly ComparisonRow[],
  workflowHeading: "Build a Complete Sheet Metal Fabrication Workflow",
  workflowSummary:
    "The torsion bar CNC press brake is not only a single machine, but also a core bending machine in a complete sheet metal fabrication workflow.",
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
      title: "Torsion Bar CNC Press Brake",
      text: "Core CNC-controlled sheet-metal bending and forming operation.",
      href: "/products/torsion-bar-cnc-press-brake",
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
    { title: "Welding Machine", text: "Joining formed components into assemblies." },
    { title: "Surface Treatment", text: "Grinding, finishing, coating or painting before delivery." },
  ] satisfies readonly WorkflowItem[],
  selectionHeading: "How to Choose the Right Torsion Bar CNC Press Brake?",
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Maximum bending length",
    "Required bending angle",
    "Minimum flange size",
    "Daily production quantity",
    "Part complexity",
    "Required tonnage",
    "Back-gauge axis requirement",
    "Controller preference",
    "Tooling requirement",
    "Voltage requirement",
    "Need crowning system or not",
    "Need to match with shearing, laser cutting or other equipment",
  ],
  selectionCta: {
    title: "Send Your Sheet Metal Bending Requirement",
    text: "Share the material, thickness, bending length, angle, drawing, production quantity and control requirement so the configuration can be reviewed against the real part.",
    label: "Request Recommendation",
  },
  specificationHeading: "Technical Specifications",
  specificationNote:
    "Final specifications depend on sheet material, thickness, bending length, tooling, controller, synchronization system and selected machine configuration.",
  toolingHeading: "Tooling Matters for Better Bending",
  toolingPoints: [
    "Different bending jobs require a suitable punch and die.",
    "V-die opening affects bending force, minimum flange size and bending quality.",
    "Stainless steel usually requires higher bending force than mild steel under similar conditions.",
    "Special profiles may require custom tooling.",
    "Final tooling recommendations should be confirmed from the drawing, material and bending angle.",
  ],
  toolingCta: "Send Drawing for Tooling Recommendation",
  faqHeading: "Frequently Asked Questions",
  faqs: [
    {
      question: "What is a torsion bar CNC press brake?",
      answer: "It is a CNC bending machine that uses hydraulic force and a mechanical torsion-bar structure to synchronize both sides of the ram. It is intended for standard sheet-metal bending and small or medium workshop production.",
    },
    {
      question: "What materials can this machine bend?",
      answer: "It is commonly used for mild steel, stainless steel, galvanized sheet, aluminum and copper. Actual capacity depends on material strength, thickness, bending length, tooling and machine tonnage.",
    },
    {
      question: "What is the difference between a torsion bar CNC press brake and an electro-hydraulic CNC press brake?",
      answer: "A torsion-bar machine uses mechanical synchronization and is an economical choice for standard bending. An electro-hydraulic machine uses closed-loop cylinder control and is better suited to higher accuracy, more axes and complex workpieces.",
    },
    {
      question: "What is the difference between an NC press brake and a torsion bar CNC press brake?",
      answer: "An NC press brake focuses on basic, economical control. A torsion-bar CNC press brake can provide broader controller, back-gauge and program-management capability depending on configuration, making it suitable for standard CNC bending needs.",
    },
    {
      question: "Is this machine suitable for small and medium workshops?",
      answer: "Yes. It is a practical choice for sheet-metal workshops, cabinet factories, duct producers and general metalworking customers that need an economical CNC bending solution.",
    },
    {
      question: "Can it bend stainless steel?",
      answer: "Yes, when tonnage and tooling are selected for the stainless-steel strength, thickness and bending length.",
    },
    {
      question: "How do I choose the right tonnage?",
      answer: "Confirm material type, thickness, bending length, V-die opening, bending angle and the workpiece drawing. Final tonnage should be reviewed by an engineer.",
    },
    {
      question: "What controller can be used on this machine?",
      answer: "Different CNC or NC controllers can manage the back gauge, ram stroke, program steps and workpiece counting. The final model and functions depend on the selected machine configuration.",
    },
    {
      question: "Can the machine be customized?",
      answer: "Bending length, tonnage, controller, back-gauge axes, voltage, tooling, safety configuration and crowning method can be reviewed before quotation.",
    },
    {
      question: "What information should I provide before quotation?",
      answer: "Provide the material, thickness, bending length, angle, part drawing, production quantity, voltage, controller requirement, back-gauge requirement and destination country or port.",
    },
  ] satisfies readonly FaqItem[],
  finalCta: {
    title: "Need a Cost-effective CNC Bending Solution?",
    text: "Send your material, thickness, bending length, drawing and production requirement. We will recommend a suitable torsion bar CNC press brake configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
  internalLinks: [
    { label: "NC hydraulic press brake", href: "/products/nc-hydraulic-press-brake" },
    {
      label: "electro-hydraulic CNC press brake",
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
