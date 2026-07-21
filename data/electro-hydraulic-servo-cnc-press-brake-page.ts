export type ContentCard = {
  title: string;
  text: string;
};

export type SolutionCard = ContentCard & {
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type ApplicationPhoto = ContentCard & {
  image: string;
  alt: string;
};

export type SystemSection = {
  eyebrow: string;
  heading: string;
  intro: string;
  points: readonly string[];
  configurations: readonly string[];
};

export type ComparisonRow = {
  label: string;
  nc: string;
  torsion: string;
  servo: string;
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
    title: "Precision sheet metal fabrication",
    text: "Supports multi-step parts, frequent job changes and repeat production where controlled ram movement and flexible positioning are important.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/precision-sheet-metal-fabrication.jpg",
    alt: "Real precision sheet metal fabrication workshop",
  },
  {
    title: "Electrical cabinet and enclosure",
    text: "Well suited to cabinet doors, side panels, mounting plates, housings and reinforcement parts with recurring bend sequences.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/electrical-cabinet-manufacturing.jpg",
    alt: "Real electrical cabinet manufacturing workshop",
  },
  {
    title: "Stainless steel products",
    text: "Provides a configurable platform for stainless-steel panels and products when tonnage, tooling and crowning are matched to the part.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/stainless-steel-products.jpg",
    alt: "Real stainless steel sheet product manufacturing environment",
  },
  {
    title: "HVAC duct and ventilation parts",
    text: "Handles suitable duct panels, transitions, flanges and ventilation components that require programmed press-brake forming.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/hvac-duct-and-ventilation.jpg",
    alt: "Real HVAC duct and ventilation installation",
  },
  {
    title: "Machinery manufacturing",
    text: "Forms guards, covers, brackets and machine components for workshops coordinating cutting, bending, welding and assembly.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/machinery-manufacturing.jpg",
    alt: "Real machinery manufacturing workshop",
  },
  {
    title: "Steel structure components",
    text: "Suitable for prepared gussets, plates, covers and secondary structural components within the selected machine capacity.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/steel-structure-components.jpg",
    alt: "Real steel structure component fabrication workshop",
  },
  {
    title: "Automotive and equipment parts",
    text: "Supports complex brackets, covers and formed components that may need several positions and repeatable bending programs.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/automotive-equipment-parts.jpg",
    alt: "Real automotive equipment metalworking application",
  },
  {
    title: "Metal furniture and panels",
    text: "Produces suitable doors, panels, frames and profiles for metal furniture, architectural products and equipment housings.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/metal-furniture-and-panels.jpg",
    alt: "Real formed metal panel application",
  },
  {
    title: "General metalworking workshop",
    text: "Adds higher-level CNC control to mixed workshop production where parts, materials and bend sequences change frequently.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/general-metalworking-workshop.jpg",
    alt: "Real general metalworking workshop",
  },
] as const;

export const electroHydraulicServoCncPressBrakePage = {
  hero: {
    title: "Electro-Hydraulic Servo CNC Press Brake",
    subtitle:
      "High-precision CNC sheet metal bending solution for demanding fabrication workshops.",
    description:
      "An electro-hydraulic servo CNC press brake designed for accurate sheet metal bending, complex parts, multi-step production and high-demand fabrication workshops. It combines servo-hydraulic synchronization, CNC control, precision back gauge positioning and optional crowning system to help customers achieve stable and repeatable bending results.",
    primaryCta: "Get Precision Bending Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Electro-Hydraulic Servo Synchronization",
      "CNC Controlled Bending",
      "Precision Back Gauge Positioning",
      "Suitable for Complex Sheet Metal Parts",
    ],
  },
  painPointHeading: "What Bending Problems Can It Solve?",
  painPoints: [
    {
      title: "Standard press brakes cannot meet precision requirements",
      text: "For more stable angles, more complex workpieces and higher repeatability, electro-hydraulic servo CNC control provides a stronger platform for precision sheet-metal production.",
    },
    {
      title: "Frequent job changes require faster setup",
      text: "CNC programs, stored bending steps, back-gauge positioning and a confirmed tooling plan reduce repeated manual measurement and setup work.",
    },
    {
      title: "Long workpieces need better angle consistency",
      text: "A rigid frame, suitable tooling and an optional crowning system can help manage deflection and improve consistency along the bending length.",
    },
    {
      title: "Complex parts need multi-axis back gauge support",
      text: "Optional multi-axis back gauges provide more positioning flexibility for multi-step bends, irregular parts and repeat batch production.",
    },
    {
      title: "Production needs a higher-level CNC solution",
      text: "Compared with basic NC or torsion-bar machines, this platform better serves customers needing Y1/Y2 closed-loop control, more axes and demanding production workflows.",
    },
  ] satisfies readonly ContentCard[],
  solutionHeading: "Precision CNC Sheet Metal Bending Solution",
  solutions: [
    {
      title: "Precision Sheet Metal Fabrication",
      suitableFor:
        "Precision sheet-metal factories, contract fabricators and non-standard component workshops.",
      recommendedUse:
        "Multi-variety, small or medium batches, complex bending sequences and parts with higher consistency requirements.",
      text: "Configure the controller, axes, tooling and compensation around actual part drawings rather than selecting the machine by tonnage alone.",
      productionValue:
        "A flexible CNC bending center for repeat programs, frequent changeovers and coordinated production.",
    },
    {
      title: "Cabinet & Electrical Enclosure Manufacturing",
      suitableFor:
        "Electrical cabinet, control cabinet, enclosure and equipment-housing manufacturers.",
      recommendedUse:
        "Doors, side panels, reinforcement parts, mounting plates, brackets and metal housings.",
      text: "Programmed bending steps and CNC back-gauge positioning support repeated cabinet dimensions and multi-side components.",
      productionValue:
        "Improves process control across recurring enclosure families and changing order sizes.",
    },
    {
      title: "Machinery, Structure & Stainless Steel Products",
      suitableFor:
        "Machinery, construction equipment, steel structure, stainless-product and metal furniture manufacturers.",
      recommendedUse:
        "Different materials and thicknesses coordinated with laser cutting, shearing, welding and surface treatment.",
      text: "Machine tonnage, bending length, V-die opening and part geometry are reviewed together for the target product range.",
      productionValue:
        "Connects precision bending with a complete fabrication workflow instead of operating as an isolated machine.",
    },
  ] satisfies readonly SolutionCard[],
  applicationHeading: "Applications",
  applicationIntro:
    "Nine real industrial photographs show representative production environments and downstream products. They are application references, not customer cases or photos of this exact machine.",
  applications: applicationPhotos,
  materialHeading: "Materials",
  materials: [
    "Mild Steel",
    "Stainless Steel",
    "Galvanized Sheet",
    "Aluminum Plate",
    "Copper Sheet",
    "Brass Sheet",
    "Thin Metal Plate",
  ],
  materialNote:
    "The suitable bending thickness depends on material strength, bending length, V-die opening, bending angle, tooling and machine tonnage. Please confirm your material and bending requirement before quotation.",
  processHeading: "From Flat Sheet to Precision Bent Part",
  processSteps: [
    {
      title: "Sheet Cutting",
      text: "Cut the sheet to the required size by fiber laser cutting machine, shearing machine or other cutting equipment.",
    },
    {
      title: "Tooling Selection",
      text: "Select suitable punch and die according to material, thickness, V opening, bending angle and part drawing.",
    },
    {
      title: "CNC Program Setting",
      text: "Set bending steps, back gauge positions, stroke and production data through the CNC controller.",
    },
    {
      title: "Back Gauge Positioning",
      text: "Use CNC-controlled back gauge axes to position the sheet for repeated and complex bending tasks.",
    },
    {
      title: "Servo-Hydraulic Bending",
      text: "The electro-hydraulic servo system controls ram movement to complete the bending process.",
    },
    {
      title: "Angle Checking",
      text: "Check the bending angle and adjust tooling, crowning or program settings when needed.",
    },
    {
      title: "Next Process",
      text: "Continue with welding, riveting, assembly, surface treatment or final product manufacturing.",
    },
  ] satisfies readonly ContentCard[],
  servoSynchronization: {
    eyebrow: "Closed-loop ram control",
    heading: "Electro-Hydraulic Servo Synchronization",
    intro:
      "The machine uses CNC control, proportional servo valves, hydraulic cylinders, linear scales and sensor feedback to coordinate the left and right cylinders through independent Y1/Y2 axes.",
    points: [
      "Closed-loop feedback detects ram position and supports continuous synchronization correction.",
      "Independent Y1/Y2 control provides a more controllable platform for asymmetric and complex workpieces.",
      "It is better suited than mechanical torsion-bar synchronization to precision, repeated and multi-step bending requirements.",
      "Final performance still depends on the workpiece, tooling, compensation, setup and selected machine configuration.",
    ],
    configurations: [
      "Y1/Y2 independent control",
      "Proportional servo valves",
      "Linear scale feedback",
      "Hydraulic cylinders",
      "CNC controller",
      "Mechanical or CNC crowning options",
    ],
  } satisfies SystemSection,
  cncControl: {
    eyebrow: "Programs, axes and production data",
    heading: "Advanced CNC Control for Complex Bending",
    intro:
      "The CNC system can coordinate bending steps, Y1/Y2 ram movement, back-gauge positions and compensation functions according to the selected controller and axes.",
    points: [
      "Multi-step programs support complex parts, repeated orders and frequent job changes.",
      "Program storage reduces repeated manual measurement after a process has been confirmed.",
      "Graphical programming and 2D or 3D simulation depend on the selected controller model.",
      "Controller selection should follow part complexity, operator workflow and required axes.",
    ],
    configurations: [
      "Delem CNC system options",
      "ESA CNC system options",
      "Cybelec CNC system options",
      "Multi-step bending programs",
      "Workpiece counting",
      "Optional graphical programming",
    ],
  } satisfies SystemSection,
  backGauge: {
    eyebrow: "Flexible part positioning",
    heading: "Multi-axis Back Gauge for Accurate Positioning",
    intro:
      "Back-gauge configuration directly affects positioning flexibility. Basic arrangements cover recurring straight bends, while additional axes support more complex flanges and part geometries.",
    points: [
      "X-axis controls the primary positioning depth for recurring bends.",
      "R-axis height movement can support different tooling and flange positions.",
      "Z1/Z2 fingers can be positioned for irregular or wider workpieces.",
      "Ball screws, linear guides and servo drives support controlled back-gauge movement depending on configuration.",
    ],
    configurations: [
      "X-axis positioning",
      "Optional R-axis lifting",
      "Optional Z1/Z2 fingers",
      "4+1-axis configurations",
      "6+1-axis configurations",
      "Automatic positioning fingers",
    ],
  } satisfies SystemSection,
  crowningTooling: {
    eyebrow: "Angle consistency starts with process matching",
    heading: "Crowning and Tooling Matter",
    intro:
      "Long workpieces can be affected by frame and tooling deflection. Crowning and the correct punch-and-die combination help manage angle consistency across the bending length.",
    points: [
      "V-die opening affects bending force, minimum flange size and bending quality.",
      "Stainless steel usually requires higher bending force than mild steel under comparable conditions.",
      "Special profiles may require custom tooling and a drawing review.",
      "Mechanical or CNC crowning should be selected from bending length, material, tooling and quality requirements.",
    ],
    configurations: [
      "Upper punch and lower die",
      "Quick-clamp options",
      "Mechanical crowning",
      "CNC crowning",
      "Custom profile tooling",
      "Front support arms",
    ],
    cta: "Send Drawing for Tooling Recommendation",
  },
  advantageHeading:
    "Why Choose This Electro-Hydraulic Servo CNC Press Brake?",
  advantages: [
    "Electro-hydraulic servo synchronization for precision bending",
    "Independent Y1/Y2 closed-loop ram control",
    "CNC control for complex and repeated bending jobs",
    "Multi-axis back gauge options for flexible positioning",
    "Optional crowning for long-workpiece angle consistency",
    "Whole welded steel frame for demanding workshop production",
    "Upper punch, lower die and optional quick-clamp configuration",
    "Integration with laser cutting, shearing, rolling and welding processes",
  ],
  verifiedStructure: [
    "Whole welded steel frame",
    "Y1/Y2 electro-hydraulic servo control",
    "CNC controller",
    "Proportional servo valves and hydraulic cylinders",
    "Linear scale feedback",
    "Multi-axis back gauge options",
    "Upper punch and lower die",
    "Mechanical or CNC crowning options",
  ],
  comparisonHeading:
    "Electro-Hydraulic Servo CNC Press Brake vs Torsion Bar CNC Press Brake vs NC Press Brake",
  comparisonRows: [
    {
      label: "Synchronization method",
      nc: "Mechanical torsion-bar synchronization in common entry-level configurations.",
      torsion: "Mechanical torsion bar coordinates both sides of the ram.",
      servo: "Y1/Y2 electro-hydraulic closed-loop synchronization with feedback.",
    },
    {
      label: "Control system",
      nc: "Basic NC control for regular settings and back-gauge positioning.",
      torsion: "CNC control for programmed positioning and regular bending work.",
      servo: "Advanced CNC control coordinating ram, back gauge and optional compensation.",
    },
    {
      label: "Axis configuration",
      nc: "Commonly focused on basic X/Y-related settings.",
      torsion: "Common CNC axes for standard production, depending on configuration.",
      servo: "Y1/Y2 with X, R, Z1/Z2 and other optional coordinated axes.",
    },
    {
      label: "Suitable production type",
      nc: "Regular parts and budget-conscious small or medium batches.",
      torsion: "Standard CNC sheet-metal work and recurring small or medium batches.",
      servo: "Precision parts, frequent changeovers, complex jobs and demanding batches.",
    },
    {
      label: "Bending complexity",
      nc: "Basic and conventional bending sequences.",
      torsion: "Standard multi-step parts within the selected control capability.",
      servo: "More complex multi-step workpieces and flexible positioning requirements.",
    },
    {
      label: "Angle consistency",
      nc: "Suitable for conventional requirements with correct setup and tooling.",
      torsion: "Stable for standard work when machine, tooling and process are matched.",
      servo: "Closed-loop ram control and optional crowning support demanding consistency needs.",
    },
    {
      label: "Cost level",
      nc: "Economical entry-level solution.",
      torsion: "Mid-level CNC investment for standard production.",
      servo: "Higher investment for closed-loop control, more axes and advanced functions.",
    },
    {
      label: "Recommended use",
      nc: "Basic workshop bending where cost and simple operation are priorities.",
      torsion: "Standard sheet-metal production needing CNC positioning at a controlled budget.",
      servo: "Precision fabrication, complex parts, higher stability and future automation planning.",
    },
  ] satisfies readonly ComparisonRow[],
  workflowHeading: "Build a Complete Sheet Metal Fabrication Workflow",
  workflowSummary:
    "The electro-hydraulic servo CNC press brake is not only a single machine, but also a core bending machine in a complete sheet metal fabrication workflow.",
  workflowEquipment: [
    {
      title: "Fiber Laser Cutting Machine",
      text: "Cuts complex contours and nested blanks before bending.",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    {
      title: "Shearing Machine",
      text: "Completes efficient straight cutting and blank preparation.",
      href: "/products/series/shearing-machines",
    },
    {
      title: "Servo CNC Press Brake",
      text: "Performs the core precision bending and programmed forming operation.",
      href: "/products/electro-hydraulic-servo-cnc-press-brake",
    },
    {
      title: "Plate Rolling Machine",
      text: "Forms arcs, cones and cylindrical parts after cutting.",
      href: "/products/hydraulic-four-roll-plate-rolling-machine",
    },
    {
      title: "Hydraulic Press",
      text: "Supports pressing, assembly, correction and suitable forming operations.",
      href: "/products/four-column-hydraulic-press",
    },
    {
      title: "Welding Machine",
      text: "Joins bent components into frames, housings and assemblies.",
    },
    {
      title: "Surface Treatment",
      text: "Adds grinding, coating, painting or final finishing.",
    },
    {
      title: "Automation / Robot",
      text: "Can be reviewed for higher-volume or automated bending requirements.",
    },
  ] satisfies readonly WorkflowItem[],
  selectionHeading:
    "How to Choose the Right Electro-Hydraulic Servo CNC Press Brake?",
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Maximum bending length",
    "Required bending angle",
    "Minimum flange size",
    "Daily production quantity",
    "Part complexity",
    "Required tonnage",
    "Required accuracy level",
    "Back gauge axis requirement",
    "Controller preference",
    "Need 2D/3D programming or not",
    "Tooling requirement",
    "Need CNC crowning system or not",
    "Voltage requirement",
    "Need quick clamp or automatic tool clamping",
    "Need to match with cutting or automation equipment",
  ],
  selectionCta: {
    title: "Send Your Precision Bending Requirement",
    text: "Share the material, thickness, bending length, angle, drawing, production quantity and preferred control functions so the configuration can be reviewed against the real part.",
    label: "Request Recommendation",
  },
  specificationHeading: "Technical Specifications",
  specificationNote:
    "Final specifications depend on sheet material, thickness, bending length, tooling, controller, back gauge axes, crowning system and selected machine configuration.",
  faqHeading: "Frequently Asked Questions",
  faqs: [
    {
      question: "What is an electro-hydraulic servo CNC press brake?",
      answer:
        "It is a sheet-metal bending machine that uses Y1/Y2 electro-hydraulic closed-loop control to coordinate both sides of the ram while a CNC system manages bending programs, back-gauge positions and configured machine functions.",
    },
    {
      question: "What materials can this machine bend?",
      answer:
        "It is commonly used for mild steel, stainless steel, galvanized sheet, aluminum and copper. Capacity depends on material strength, thickness, bending length, tooling and machine tonnage.",
    },
    {
      question: "What is the difference between electro-hydraulic CNC and torsion bar CNC press brakes?",
      answer:
        "A torsion-bar CNC press brake uses mechanical torsion-bar synchronization and suits standard CNC bending. The electro-hydraulic machine uses independent Y1/Y2 feedback control and is better suited to more axes, complex parts and demanding consistency requirements.",
    },
    {
      question: "What is the difference between an NC press brake and an electro-hydraulic CNC press brake?",
      answer:
        "An NC press brake is intended for basic and regular bending. An electro-hydraulic CNC press brake provides closed-loop ram control and broader axis and programming options for complex parts and frequent job changes.",
    },
    {
      question: "Is this machine suitable for precision sheet metal fabrication?",
      answer:
        "Yes. It is commonly selected for precision sheet metal, cabinets, enclosures, stainless-steel products and equipment housings, with the final configuration confirmed from part drawings and production requirements.",
    },
    {
      question: "Can it bend stainless steel?",
      answer:
        "Yes, provided tonnage and tooling are selected for the stainless-steel grade, strength, thickness, bending length, V-die opening and required angle.",
    },
    {
      question: "How do I choose the right tonnage?",
      answer:
        "Provide the material, thickness, bending length, V-die opening, angle and part drawing. An engineer should confirm tonnage and safety margin against the real application.",
    },
    {
      question: "What back gauge axes should I choose?",
      answer:
        "Basic positioning is suitable for regular bends. Parts with multiple flange heights or irregular geometry may benefit from X, R, Z1/Z2 or additional axes, confirmed from drawings.",
    },
    {
      question: "What controller can be used on this machine?",
      answer:
        "Delem, ESA, Cybelec and other CNC system options may be available. The exact controller and graphical functions depend on the final axis configuration and order.",
    },
    {
      question: "Does this machine need a crowning system?",
      answer:
        "Crowning is commonly considered for long workpieces or demanding angle consistency. The method should be selected from bending length, material, thickness, tooling and quality requirements.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Tonnage, bending length, controller, back-gauge axes, voltage, tooling, safety configuration, clamps and crowning method can be reviewed before quotation.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Provide material, thickness, bending length, angle, part drawings, production quantity, voltage, controller and back-gauge requirements, tooling needs and destination country or port.",
    },
  ] satisfies readonly FaqItem[],
  internalLinks: [
    { label: "NC hydraulic press brake", href: "/products/nc-hydraulic-press-brake" },
    { label: "torsion bar CNC press brake", href: "/products/torsion-bar-cnc-press-brake" },
    { label: "hydraulic press brake", href: "/products/series/bending-machines" },
    { label: "sheet metal shearing machine", href: "/products/series/shearing-machines" },
    { label: "fiber laser cutting machine", href: "/products/single-table-fiber-laser-cutting-machine" },
    { label: "plate rolling machine", href: "/products/hydraulic-four-roll-plate-rolling-machine" },
    { label: "hydraulic press", href: "/products/four-column-hydraulic-press" },
    { label: "sheet metal bending machine", href: "/products/series/bending-machines" },
  ],
  finalCta: {
    title: "Need a High-precision CNC Bending Solution?",
    text: "Send your material, thickness, bending length, drawing and production requirement. We will recommend a suitable electro-hydraulic servo CNC press brake configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
} as const;
