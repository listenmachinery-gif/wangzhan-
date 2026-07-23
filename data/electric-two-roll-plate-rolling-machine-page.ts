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

export type ComparisonRow = {
  label: string;
  twoRoll: string;
  threeRoll: string;
  fourRoll: string;
};

export type WorkflowItem = ContentCard & {
  href?: string;
};

export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const confirmationValue =
  "Customizable / Please confirm with our sales engineer";

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "HVAC round duct parts",
    text: "Representative round ventilation parts and transitions formed from thin galvanized or stainless sheet.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/hvac-round-duct-parts.jpg",
    alt: "Real HVAC round duct and ventilation parts",
  },
  {
    title: "Ventilation sleeves",
    text: "Short cylindrical sleeves can continue into seaming, flanging and assembly for air-handling systems.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/ventilation-sleeves.jpg",
    alt: "Real industrial ventilation sleeves and ducts",
  },
  {
    title: "Filter shells and components",
    text: "Cylindrical filter-related parts show the round formats used in air-handling and filtration assemblies.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/filter-shells-and-components.jpg",
    alt: "Real circular filter and metal air-handling components",
  },
  {
    title: "Exhaust pipes and covers",
    text: "Thin metal blanks can be rolled into compatible round shells for exhaust and protective-cover fabrication.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/exhaust-pipes-and-covers.jpg",
    alt: "Real round metal exhaust pipe",
  },
  {
    title: "Fire extinguisher shells",
    text: "Small-diameter cylindrical body production is a representative two-roll application when material and dimensions are confirmed.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/fire-extinguisher-shells.jpg",
    alt: "Real cylindrical fire extinguisher bodies",
  },
  {
    title: "Small tank shells",
    text: "Rolled stainless or mild-steel shells can enter welding and finishing processes for compatible small vessels.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/small-tank-shells.jpg",
    alt: "Real stainless steel cylindrical tank shells",
  },
  {
    title: "Lighting covers",
    text: "Round lighting bodies and metal shades represent light-gauge decorative shell forming.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/lighting-covers.jpg",
    alt: "Real round metal lighting cover",
  },
  {
    title: "Stainless cylindrical products",
    text: "Food-service, container and light-industrial products often combine rolled stainless bodies with welded end details.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/stainless-steel-cylindrical-products.jpg",
    alt: "Real stainless steel cylindrical containers",
  },
  {
    title: "Thin-sheet metal shells",
    text: "General metal containers demonstrate the cylindrical shell geometry used across many light-fabrication products.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/thin-sheet-metal-shells.jpg",
    alt: "Real thin sheet metal cylindrical shells",
  },
  {
    title: "General sheet-metal workshop",
    text: "Rolling normally connects with cutting, welding, grinding, surface treatment and final assembly.",
    image:
      "/products/electric-two-roll-plate-rolling-machine-applications/general-sheet-metal-workshop.jpg",
    alt: "Real sheet metal fabrication workshop",
  },
] as const;

export const electricTwoRollPlateRollingMachinePage = {
  hero: {
    title: "Electric Two-Roll Plate Rolling Machine",
    subtitle:
      "Fast thin sheet rolling solution for cylinders, HVAC parts, small tanks and round metal shells.",
    description:
      "The electric two-roll plate rolling machine combines a rigid upper roll with an elastic lower roll to form compatible thin sheet into repeatable cylindrical parts. Share your material, thickness, width and target diameter so we can match a practical configuration.",
    primaryCta: "Get Thin Sheet Rolling Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Thin-Sheet Cylinder Forming",
      "Electric Drive",
      "Compact Two-Roll Layout",
      "Application-Matched Configuration",
    ],
  },
  painPoints: [
    {
      title: "Thin sheets are easy to mark or distort",
      text: "Light-gauge work needs controlled contact and a suitable roll surface to form cylinders without unnecessary handling damage.",
    },
    {
      title: "Small diameters are difficult to start",
      text: "Conventional rolling can leave a straight edge that requires extra pre-bending or correction before seam joining.",
    },
    {
      title: "Short-batch output needs consistency",
      text: "Operators need a simple, repeatable setup when producing ventilation sleeves, filter bodies or other small shells.",
    },
    {
      title: "Manual rolling can slow downstream work",
      text: "Variable cylinder shape creates extra fitting time at the welding, seaming and assembly stages.",
    },
    {
      title: "Capacity is application-specific",
      text: "Material strength, thickness, rolling width and minimum diameter must be assessed together before selecting a machine.",
    },
  ] satisfies readonly ContentCard[],
  solutions: [
    {
      title: "HVAC & Ventilation Parts",
      suitableFor:
        "Round ducts, short sleeves, connectors, filter housings and light-gauge ventilation products.",
      recommendedUse:
        "Frequent cylindrical parts made from compatible galvanized, stainless or mild sheet.",
      productionValue:
        "Creates a repeatable rolling stage that connects cleanly to locking, seaming, flanging and assembly.",
      text: "Confirm sheet coating, seam allowance, width and target diameter before configuration.",
    },
    {
      title: "Small Cylindrical Shells",
      suitableFor:
        "Exhaust covers, fire-extinguisher bodies, lighting covers, containers and small tank shells.",
      recommendedUse:
        "Small- and medium-batch parts with stable material, blank size and required diameter.",
      productionValue:
        "Keeps the forming path compact while reducing repeated manual correction between parts.",
      text: "Final suitability depends on material springback, part length, diameter and downstream joining method.",
    },
    {
      title: "Flexible Light Fabrication",
      suitableFor:
        "General sheet-metal shops producing several thin-sheet cylindrical products.",
      recommendedUse:
        "Workflows that already include shearing or laser cutting, welding, grinding and surface treatment.",
      productionValue:
        "Adds a dedicated cylinder-forming station without overcomplicating routine workshop operation.",
      text: "Use sample drawings and actual blanks to confirm the required roll material and control options.",
    },
  ] satisfies readonly SolutionCard[],
  applications: applicationPhotos,
  applicationIntro:
    "These ten real photographs show representative products or production contexts. They are not customer cases and do not claim that the photographed items were produced on this exact machine.",
  materials: [
    "Mild Steel Sheet",
    "Stainless Steel Sheet",
    "Galvanized Sheet",
    "Aluminum Sheet",
    "Copper Sheet",
    "Pre-Coated Thin Sheet",
    "Other Compatible Light-Gauge Metals",
  ],
  materialNote:
    "Material compatibility depends on tensile strength, yield strength, surface condition, sheet thickness, rolling width, target diameter and the selected elastic lower roll. Confirm real material data before quotation.",
  cylindricalParts: [
    "Round Ducts",
    "Cylindrical Sleeves",
    "Filter Shells",
    "Exhaust Covers",
    "Fire-Extinguisher Bodies",
    "Lighting Covers",
    "Small Tank Shells",
    "General Round Metal Housings",
  ],
  process: [
    {
      title: "Blank Preparation",
      text: "Cut the sheet to the confirmed length, width and seam allowance, then remove burrs that could affect the roll surface.",
    },
    {
      title: "Machine Setup",
      text: "Set roll pressure and forming position according to the material, thickness and required cylinder diameter.",
    },
    {
      title: "Sheet Feeding",
      text: "Align the blank squarely between the rigid upper roll and elastic lower roll.",
    },
    {
      title: "Progressive Forming",
      text: "The driven roll movement wraps the compatible blank around the upper roll in a controlled forming pass.",
    },
    {
      title: "Cylinder Removal",
      text: "Release and remove the rolled shell according to the confirmed machine opening and unloading method.",
    },
    {
      title: "Joining & Finishing",
      text: "Continue with seaming, welding, flanging, grinding, coating or assembly as required by the finished product.",
    },
  ] satisfies readonly ContentCard[],
  twoRollDesign: [
    {
      title: "Rigid upper roll",
      text: "Provides the principal forming diameter and stable support for the sheet during rolling.",
    },
    {
      title: "Elastic lower roll",
      text: "Deforms under pressure so a compatible blank can wrap progressively around the upper roll.",
    },
    {
      title: "Simplified roll arrangement",
      text: "The two-roll layout focuses on routine cylindrical thin-sheet work rather than broad heavy-plate geometry.",
    },
    {
      title: "Application-matched tooling",
      text: "Upper-roll diameter and lower-roll material must be selected around the actual sheet and target part.",
    },
    {
      title: "Downstream-ready cylinders",
      text: "Consistent blank preparation and setup help rolled shells fit the planned seam or welding process.",
    },
  ] satisfies readonly ContentCard[],
  electricDrive: [
    {
      title: "Motorized rotation",
      text: "Electric roll drive supports controlled, repeatable sheet movement during routine forming.",
    },
    {
      title: "Straightforward operation",
      text: "A focused control layout helps operators manage feeding, rolling and return according to the selected configuration.",
    },
    {
      title: "Workshop integration",
      text: "The machine can be positioned between blank preparation and cylinder joining within a compact fabrication cell.",
    },
    {
      title: "Configuration options",
      text: "Voltage, control mode, guarding and unloading details are confirmed for the installation and production requirement.",
    },
  ] satisfies readonly ContentCard[],
  advantages: [
    "Focused solution for compatible thin-sheet cylinder forming",
    "Two-roll structure with rigid upper roll and elastic lower roll",
    "Electric drive for routine workshop production",
    "Suitable for small cylindrical shells, sleeves and covers",
    "Compact forming stage for HVAC and light-fabrication workflows",
    "Configuration selected from material, thickness, width and diameter",
    "Connects with cutting, seaming, welding and finishing equipment",
    "Original product specifications remain clearly separated from confirmation fields",
  ],
  comparisonRows: [
    {
      label: "Primary focus",
      twoRoll: "Repeatable cylindrical forming of compatible thin sheet",
      threeRoll: "General-purpose sheet and plate rolling",
      fourRoll: "Controlled plate handling and broader production workflows",
    },
    {
      label: "Roll arrangement",
      twoRoll: "Rigid upper roll plus elastic lower roll",
      threeRoll: "Three rigid rolls in selected geometry",
      fourRoll: "Four rigid rolls with dedicated pinching and bending functions",
    },
    {
      label: "Pre-bending approach",
      twoRoll: "Forming action can reduce straight-end correction for matched thin-sheet work",
      threeRoll: "Depends on machine geometry and operator sequence",
      fourRoll: "Designed for controlled clamping and pre-bending sequences",
    },
    {
      label: "Typical work",
      twoRoll: "Sleeves, small shells, ducts and round housings",
      threeRoll: "Cylinders, arcs and selected conical work",
      fourRoll: "Production cylinders, arcs and configured plate work",
    },
    {
      label: "Material range",
      twoRoll: "Application-matched light-gauge material",
      threeRoll: "Selected sheet and plate range",
      fourRoll: "Selected plate range and production requirements",
    },
    {
      label: "Setup priority",
      twoRoll: "Blank, elastic roll, upper-roll diameter and target cylinder",
      threeRoll: "Roll positions, pre-bend sequence and operator setup",
      fourRoll: "Clamping, side-roll positions and programmed sequence",
    },
    {
      label: "Best fit",
      twoRoll: "Stable part families and repeat thin-sheet cylinders",
      threeRoll: "Flexible general rolling needs",
      fourRoll: "Production control and more complex plate-handling requirements",
    },
    {
      label: "Selection warning",
      twoRoll: "Not a universal replacement for heavy or varied plate rolling",
      threeRoll: "Capability varies widely by geometry and drive",
      fourRoll: "Higher system complexity should match real production demand",
    },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    {
      title: "Sheet Cutting",
      text: "Prepare accurate blanks by shearing or laser cutting.",
      href: "/products/hydraulic-guillotine-shear",
    },
    {
      title: "Blank Deburring",
      text: "Remove sharp edges and contamination before the sheet reaches the roll surface.",
    },
    {
      title: "Two-Roll Cylinder Forming",
      text: "Roll the prepared blank using the confirmed pressure, alignment and forming sequence.",
    },
    {
      title: "Seaming or Welding",
      text: "Join the cylinder edge according to product design and leak-tightness requirements.",
    },
    {
      title: "Lock Forming",
      text: "Prepare compatible HVAC seams where the product workflow requires them.",
      href: "/products/multi-function-lock-forming-machine",
    },
    {
      title: "Flanging",
      text: "Form the cylinder edge for connection, reinforcement or downstream assembly.",
    },
    {
      title: "Surface Treatment",
      text: "Complete grinding, polishing, coating or cleaning for the specified finish.",
    },
    {
      title: "Final Assembly",
      text: "Add end caps, fittings, brackets or other components and inspect the finished part.",
    },
  ] satisfies readonly WorkflowItem[],
  workflowNote:
    "The electric two-roll plate rolling machine is one forming stage in a complete thin-sheet cylinder workflow. Blank accuracy and downstream joining determine final product quality together with the rolling setup.",
  selectionInputs: [
    "Sheet material and grade",
    "Sheet thickness",
    "Maximum rolling width",
    "Minimum and common cylinder diameter",
    "Blank length and width",
    "Material surface or coating",
    "Required roundness and seam gap",
    "Daily or monthly quantity",
    "Part drawing or finished-product photo",
    "Joining process: lock seam / welding / other",
    "Need manual, semi-automatic or automatic operation",
    "Loading and unloading method",
    "Required guarding and control options",
    "Workshop voltage and frequency",
    "Installation space and delivery destination",
  ],
  specificationFields: [
    { heading: "Model", source: "name" },
    { heading: "Rolling Capacity", source: "spec", sourceIndex: 0 },
    { heading: "Roll Structure", source: "spec", sourceIndex: 1 },
    { heading: "Operation", source: "spec", sourceIndex: 2 },
    { heading: "Workpiece", source: "spec", sourceIndex: 3 },
    { heading: "Rolling Length (mm)", source: "confirmed" },
    { heading: "Sheet Thickness (mm)", source: "confirmed" },
    { heading: "Minimum Rolling Diameter (mm)", source: "confirmed" },
    { heading: "Roller Material", source: "confirmed" },
    { heading: "Upper Roller Diameter (mm)", source: "confirmed" },
    { heading: "Lower Roller Type", source: "confirmed" },
    { heading: "Motor Power (kW)", source: "confirmed" },
    { heading: "Rolling Speed (m/min)", source: "confirmed" },
    { heading: "Voltage (V)", source: "confirmed" },
    { heading: "Machine Size (mm)", source: "confirmed" },
    { heading: "Machine Weight (kg)", source: "confirmed" },
    {
      heading: "Application",
      source: "confirmed",
      confirmedValue: "Thin sheet cylinder forming",
    },
  ] satisfies readonly SpecificationField[],
  specificationNote:
    "The four original catalog rows are retained unchanged. All missing numeric specifications remain confirmation fields because final capacity depends on material, thickness, rolling width, minimum diameter and selected machine configuration.",
  workshopNotes: [
    {
      title: "Prepare level installation space",
      text: "Reserve safe space for sheet feeding, part removal, electrical access and operator movement.",
    },
    {
      title: "Protect the elastic roll",
      text: "Keep blanks clean and deburred; sharp scrap and surface contamination can damage or mark the lower roll.",
    },
    {
      title: "Control the blank",
      text: "Support wider sheets during feeding and removal so they do not twist, drop or pull the operator toward moving rolls.",
    },
    {
      title: "Confirm electrical supply",
      text: "Match voltage, frequency, grounding and protection devices to the final machine configuration.",
    },
    {
      title: "Use trained operators",
      text: "Follow the machine manual, guarding instructions, local regulations and safe lockout procedures.",
    },
    {
      title: "Validate with sample parts",
      text: "For critical finish or diameter requirements, confirm material samples and part drawings before production release.",
    },
  ] satisfies readonly ContentCard[],
  faqs: [
    {
      question: "What is an electric two-roll plate rolling machine?",
      answer:
        "It is a motor-driven sheet forming machine that uses a rigid upper roll and an elastic lower roll to wrap compatible thin sheet into cylindrical parts.",
    },
    {
      question: "What is the machine mainly used for?",
      answer:
        "Representative uses include HVAC sleeves, filter-related shells, exhaust covers, lighting bodies, small containers and other thin-sheet cylindrical parts.",
    },
    {
      question: "Which materials can be rolled?",
      answer:
        "Potential materials include mild steel, stainless steel, galvanized sheet, aluminum and other compatible thin metals. Actual suitability depends on grade, strength, surface, thickness, width and diameter.",
    },
    {
      question: "Can it roll small diameters?",
      answer:
        "Small-diameter capability depends on the upper-roll diameter, lower-roll material, sheet properties, width and required finish. Send the target diameter and drawing for confirmation.",
    },
    {
      question: "Does a two-roll machine need pre-bending?",
      answer:
        "Its forming principle can reduce straight-end correction for matched thin-sheet work, but final edge condition depends on the blank, setup, material and required seam.",
    },
    {
      question: "What is the difference between two-roll and three-roll machines?",
      answer:
        "A two-roll machine focuses on application-matched thin-sheet cylinders using an elastic lower roll. Three-roll machines use rigid rolls and generally cover a wider range of rolling tasks and setup methods.",
    },
    {
      question: "Can it make cones or heavy plate cylinders?",
      answer:
        "This page presents the machine as a thin-sheet cylinder solution. Conical or heavy-plate work should be evaluated for a suitable three-roll or four-roll machine instead.",
    },
    {
      question: "How do I choose the correct model?",
      answer:
        "Provide material grade, thickness, rolling width, minimum diameter, blank size, required roundness, production quantity, voltage and part drawings.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Rolling width, roll dimensions and materials, motor and controls, voltage, guarding and unloading arrangement can be confirmed around available manufacturing options.",
    },
    {
      question: "What should I send for a quotation?",
      answer:
        "Send material, thickness, maximum width, minimum and common diameters, blank dimensions, part drawings, quantity, voltage and delivery destination.",
    },
    {
      question: "Are the application photos customer cases?",
      answer:
        "No. They are licensed real photographs showing representative products and environments, not customer cases or proof that those exact items were produced on this machine.",
    },
  ] satisfies readonly FaqItem[],
  finalCta: {
    title: "Need a Thin-Sheet Cylinder Rolling Solution?",
    text: "Send your material, thickness, rolling width, target diameter and part drawing. We will recommend a suitable electric two-roll plate rolling machine configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
} as const;
