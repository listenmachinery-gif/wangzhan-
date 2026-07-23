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

export type TubeProfile = ContentCard & {
  shape:
    | "round"
    | "square"
    | "rectangle"
    | "oval"
    | "waist"
    | "angle"
    | "channel"
    | "profile";
};

export type ComparisonRow = {
  label: string;
  tubeLaser: string;
  sheetAndTube: string;
  traditional: string;
};

export type WorkflowItem = ContentCard & {
  href?: string;
};

export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "application" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const confirmationPlaceholder =
  "Customizable / Please confirm with our sales engineer";

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "Metal furniture",
    text: "Round, square and rectangular tube parts can be prepared with cut ends, holes and slots before welding furniture frames.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/metal-furniture.jpg",
    alt: "Real metal furniture made from shaped metal tube frames",
  },
  {
    title: "Fitness equipment",
    text: "Dedicated tube processing suits equipment frames, supports and connection features that need repeatable fit-up.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/fitness-equipment.jpg",
    alt: "Real fitness equipment with welded metal tube frames",
  },
  {
    title: "Guardrail and fence",
    text: "Tube and profile parts can be cut to length and prepared with connection holes before rail and fence assembly.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/guardrail-fence.jpg",
    alt: "Real steel guardrail constructed from metal profiles",
  },
  {
    title: "Door and window frame",
    text: "Profile cutting supports frame members, mounting features and joining geometry when the tube shape matches the selected chuck system.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/door-window-frame.jpg",
    alt: "Real metal door and window frame application",
  },
  {
    title: "Machinery frame",
    text: "Structural tube members can be prepared with holes, slots and connection contours for downstream welding and assembly.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/machinery-frame.jpg",
    alt: "Real machinery manufacturing environment with metal frame production",
  },
  {
    title: "Shelf and rack manufacturing",
    text: "Repeated upright, beam and brace parts benefit from a coordinated tube-cutting workflow before rack assembly.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/shelf-rack-manufacturing.jpg",
    alt: "Real industrial warehouse with steel shelf and rack structures",
  },
  {
    title: "Automotive and motorcycle parts",
    text: "Tube components and brackets can be prepared for fixtures and welding when material, section and tolerance requirements are confirmed.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/automotive-motorcycle-parts.jpg",
    alt: "Real automotive metal part welding and fabrication",
  },
  {
    title: "Agricultural machinery",
    text: "Frame tubes, guards and support members can move from programmed cutting to bending, welding and final machine assembly.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/agricultural-machinery.jpg",
    alt: "Real agricultural machinery with structural metal components",
  },
  {
    title: "Construction machinery",
    text: "The process supports selected structural tube and profile components used around equipment frames, guards and access structures.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/construction-machinery.jpg",
    alt: "Real construction machinery operating on a work site",
  },
  {
    title: "Steel structure tube parts",
    text: "Connection holes, tube ends and selected profiles can be prepared for structural welding when the configuration is matched to the drawing.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/steel-structure-tube-parts.jpg",
    alt: "Real steel structure component fabrication in a workshop",
  },
  {
    title: "Stainless steel products",
    text: "Stainless tube parts can be cut for product frames and assemblies with power, gas and edge-quality requirements selected together.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/stainless-steel-products.jpg",
    alt: "Real stainless steel product fabrication environment",
  },
  {
    title: "General tube fabrication workshop",
    text: "A dedicated system gives mixed tube orders a clear path from drawings and clamping to finished parts and welding.",
    image:
      "/products/fiber-tube-laser-cutting-machine-applications/general-tube-fabrication-workshop.jpg",
    alt: "Real general metal fabrication workshop processing tube components",
  },
] as const;

export const technicalSpecificationFields: readonly SpecificationField[] = [
  { heading: "Model", source: "name" },
  { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
  {
    heading: "Tube Type",
    source: "confirmed",
    confirmedValue:
      "Round, square, rectangular, oval, waist-round, angle steel, channel steel and selected profiles depending on configuration",
  },
  { heading: "Tube Diameter / Section Range (mm)", source: "confirmed" },
  { heading: "Tube Length (mm)", source: "confirmed" },
  { heading: "Maximum Tube Wall Thickness (mm)", source: "confirmed" },
  { heading: "Chuck Type", source: "confirmed" },
  { heading: "Loading Method", source: "confirmed" },
  { heading: "Unloading Method", source: "confirmed" },
  { heading: "Positioning Accuracy (mm)", source: "confirmed" },
  { heading: "Max Cutting Speed (m/min)", source: "confirmed" },
  { heading: "Transmission System", source: "spec", sourceIndex: 2 },
  { heading: "Control System", source: "spec", sourceIndex: 3 },
  { heading: "Cooling System", source: "confirmed" },
  { heading: "Machine Size L × W × H (mm)", source: "confirmed" },
  { heading: "Machine Weight (kg)", source: "confirmed" },
  { heading: "Application", source: "application" },
] as const;

export const fiberTubeLaserCuttingMachinePage = {
  hero: {
    H1: "Fiber Tube Laser Cutting Machine",
    subtitle:
      "Professional CNC laser tube cutting solution for round, square, rectangular and profile tubes.",
    description:
      "A fiber tube laser cutting machine designed for metal tube cutting, pipe hole cutting, slotting, contour cutting and structural tube processing. It helps workshops replace traditional sawing, drilling and manual marking with a more flexible CNC tube cutting workflow.",
    primaryCta: "Get Tube Cutting Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Dedicated Tube Laser Cutting",
      "Round / Square / Rectangular Tubes",
      "CNC Pipe Cutting Workflow",
      "Practical for Metal Structure Fabrication",
    ],
  },
  painPoints: [
    {
      title: "Traditional sawing and drilling take too many steps",
      text: "Separating tube cut-off, hole, slot and profile operations adds manual positioning, fixtures and secondary processing time.",
    },
    {
      title: "Tube parts need better hole and slot accuracy",
      text: "Tube joints, frames and welded structures often need matching hole positions, slots and contours that are easier to manage in one programmed workflow.",
    },
    {
      title: "Mixed tube shapes are hard to process manually",
      text: "Round, square, rectangular and selected profile tubes require suitable clamping, rotation and positioning for their geometry.",
    },
    {
      title: "Welded frames need more consistent tube joints",
      text: "Furniture, railings, racks and machinery frames benefit from repeatable tube ends, hole locations and connection surfaces before assembly.",
    },
    {
      title: "Workshops need a professional tube cutting workflow",
      text: "A dedicated tube laser is practical when tube orders, varied profiles or batch structural parts are a larger share of production.",
    },
  ] satisfies readonly ContentCard[],
  solutions: [
    {
      title: "Metal Furniture & Fitness Equipment",
      text: "Tube-part preparation for frames, supports and welded assemblies.",
      suitableFor:
        "Metal furniture factories, fitness-equipment makers, table and chair frames, display racks and sports-equipment manufacturers.",
      recommendedUse:
        "Round, square and rectangular tube cut-off, holes, slots and connection profiles.",
      productionValue:
        "Combines several front-end tube operations into one drawing-driven workflow before welding and assembly.",
    },
    {
      title: "Guardrail, Fence & Door Frame Fabrication",
      text: "Programmed tube and profile preparation for repeated architectural metal parts.",
      suitableFor:
        "Guardrails, fences, door and window structures, stair handrails and architectural metalwork.",
      recommendedUse:
        "Batch tube cutting, hole preparation and connection geometry before welding.",
      productionValue:
        "Creates more consistent part preparation while keeping final capability subject to the confirmed profile and chuck configuration.",
    },
    {
      title: "Machinery Frame & Structural Tube Processing",
      text: "Flexible front-end processing for structural tube members and equipment parts.",
      suitableFor:
        "Machinery frames, racks, agricultural equipment, construction machinery, vehicle parts and steel-structure tube components.",
      recommendedUse:
        "Structural members, mounting holes, connection slots and selected profile contours.",
      productionValue:
        "Provides an organized input stage for welding, bending, frame assembly and surface treatment.",
    },
  ] satisfies readonly SolutionCard[],
  tubeTypes: [
    {
      title: "Round Tube",
      text: "Rotational cutting for round pipe ends, holes, slots and contours.",
      shape: "round",
    },
    {
      title: "Square Tube",
      text: "Programmed cutting across four faces with suitable chuck positioning.",
      shape: "square",
    },
    {
      title: "Rectangular Tube",
      text: "Frame-member preparation for unequal-width rectangular sections.",
      shape: "rectangle",
    },
    {
      title: "Oval Tube",
      text: "Selected oval sections subject to chuck opening and control support.",
      shape: "oval",
    },
    {
      title: "Waist Round Tube",
      text: "Selected waist-round profiles when the machine configuration supports them.",
      shape: "waist",
    },
    {
      title: "Angle Steel",
      text: "Selected angle sections for structural and framework applications.",
      shape: "angle",
    },
    {
      title: "Channel Steel",
      text: "Selected channel profiles subject to clamping and software capability.",
      shape: "channel",
    },
    {
      title: "Selected Profile Tubes",
      text: "Profile support depends on geometry, chuck, section size and configuration.",
      shape: "profile",
    },
  ] satisfies readonly TubeProfile[],
  materials: [
    {
      title: "Carbon Steel Tube",
      text: "Common structural tube material with power and gas selected by wall thickness and edge needs.",
    },
    {
      title: "Stainless Steel Tube",
      text: "Suitable when power, cutting gas and surface-quality expectations are confirmed together.",
    },
    {
      title: "Galvanized Tube",
      text: "Requires process selection that considers coating behavior, fumes and edge requirements.",
    },
    {
      title: "Aluminum Tube",
      text: "Power, gas and control settings must match the alloy, wall thickness and section.",
    },
    {
      title: "Copper Tube",
      text: "Reflective non-ferrous material capability depends on the selected laser and process configuration.",
    },
    {
      title: "Brass Tube",
      text: "Final suitability depends on material grade, wall thickness, power and cutting gas.",
    },
    {
      title: "Thin-wall Metal Tube",
      text: "Heat control, support and clamping should be considered for thin-wall profiles.",
    },
  ] satisfies readonly ContentCard[],
  process: [
    {
      title: "Tube Drawing Import",
      text: "Import cutting files or create programs according to the selected control system and tube software.",
    },
    {
      title: "Tube Loading",
      text: "Load supported round, square, rectangular or profile tube according to machine configuration.",
    },
    {
      title: "Chuck Clamping",
      text: "Hold and rotate the tube with the configured chuck and support system.",
    },
    {
      title: "Program Setting",
      text: "Set tube type, section, length, holes, slots, path and processing parameters.",
    },
    {
      title: "Laser Tube Cutting",
      text: "Cut holes, slots, contours, tube ends and connection profiles from the approved drawing.",
    },
    {
      title: "Finished Part Unloading",
      text: "Remove finished parts and manage remaining tube material according to the selected unloading method.",
    },
    {
      title: "Welding / Assembly",
      text: "Continue with welding, polishing, bending, frame assembly or surface treatment.",
    },
  ] satisfies readonly ContentCard[],
  chuckPoints: [
    {
      title: "Clamping and rotation",
      text: "The chuck holds and rotates the tube during cutting, affecting positioning and processing stability.",
    },
    {
      title: "Profile matching",
      text: "Different tube sizes and profiles need a suitable chuck opening range and clamping method.",
    },
    {
      title: "Centering options",
      text: "Automatic-centering and pneumatic chuck designs may be available depending on the confirmed configuration.",
    },
    {
      title: "Chuck-count options",
      text: "Three-chuck or four-chuck designs are optional configurations and are not assumed as standard equipment.",
    },
    {
      title: "Long-tube support",
      text: "Support devices are important for long tubes to manage deflection, vibration and feeding stability.",
    },
  ] satisfies readonly ContentCard[],
  loadingOptions: [
    {
      title: "Manual Loading",
      text: "A practical option for lower production volume, mixed jobs and smaller workshops.",
    },
    {
      title: "Semi-automatic Loading",
      text: "An optional assisted approach that can reduce repeated operator handling in batch work.",
    },
    {
      title: "Automatic Loading / Unloading",
      text: "Optional automation is evaluated from tube length, tube weight, daily quantity, layout and budget.",
    },
  ] satisfies readonly ContentCard[],
  powerFactors: [
    {
      title: "Wall thickness",
      text: "Tube wall thickness is a key input when selecting laser power.",
    },
    {
      title: "Tube size and speed",
      text: "Larger sections or higher output requirements may change the recommended power.",
    },
    {
      title: "Material behavior",
      text: "Stainless steel, aluminum, copper and brass require material-specific power and gas choices.",
    },
    {
      title: "Hole and edge quality",
      text: "Heat input, small holes, profile geometry and edge expectations affect process selection.",
    },
    {
      title: "Final engineering match",
      text: "Material, wall thickness, section, quantity and budget are reviewed together before recommendation.",
    },
  ] satisfies readonly ContentCard[],
  gases: [
    {
      title: "Oxygen",
      text: "Often considered for carbon steel depending on wall thickness, speed and edge requirement.",
    },
    {
      title: "Nitrogen",
      text: "Can help manage oxidation on stainless steel and selected non-ferrous materials, subject to configuration.",
    },
    {
      title: "Compressed Air",
      text: "May suit cost-sensitive work when material, thickness and required edge quality allow it.",
    },
  ] satisfies readonly ContentCard[],
  advantages: [
    "Dedicated tube laser cutting solution",
    "Suitable for round, square, rectangular and selected profile tubes",
    "Helps combine selected sawing, drilling and punching operations",
    "Flexible cutting for holes, slots, tube ends and connection profiles",
    "Practical for furniture, fitness equipment, guardrail and frame products",
    "Chuck-based tube rotation supports the CNC cutting workflow",
    "Optional loading and unloading configurations for batch production",
    "Connects with tube bending, welding and surface-treatment processes",
  ],
  comparison: [
    {
      label: "Main function",
      tubeLaser: "Dedicated metal tube and selected profile processing.",
      sheetAndTube: "Mixed sheet and tube processing on one platform.",
      traditional: "Separate cut-off, drilling or punching operations.",
    },
    {
      label: "Tube cutting ability",
      tubeLaser: "Focused on tube rotation, clamping and programmed profile work.",
      sheetAndTube: "Useful for mixed demand; tube capability depends on the combined configuration.",
      traditional: "Practical for simpler operations but may require several machines and setups.",
    },
    {
      label: "Sheet cutting ability",
      tubeLaser: "Not the primary function of a dedicated tube machine.",
      sheetAndTube: "Designed to process both flat sheet and supported tube formats.",
      traditional: "Depends on separate sheet-cutting equipment.",
    },
    {
      label: "Production efficiency",
      tubeLaser: "Strong fit when tube parts represent a high share of production.",
      sheetAndTube: "Balances two material formats for mixed workshop orders.",
      traditional: "Effective for simple parts; complex parts may require multiple transfers.",
    },
    {
      label: "Investment level",
      tubeLaser: "Evaluated for a dedicated tube-processing role.",
      sheetAndTube: "Evaluated for combined capability and workshop utilization.",
      traditional: "Can start with simpler equipment but total multi-process needs should be considered.",
    },
    {
      label: "Workshop flexibility",
      tubeLaser: "High flexibility within confirmed tube and profile formats.",
      sheetAndTube: "Broad flexibility when both sheet and tube orders are regular.",
      traditional: "Flexible for basic tasks but more dependent on fixtures and process changes.",
    },
    {
      label: "Suitable production type",
      tubeLaser: "Tube-heavy orders, varied profiles and batch structural parts.",
      sheetAndTube: "Mixed products where tube volume is not the only priority.",
      traditional: "Simple cut-off and lower-complexity parts or smaller batches.",
    },
    {
      label: "Recommended use",
      tubeLaser: "Professional holes, slots, tube ends and connection contours.",
      sheetAndTube: "One-machine flexibility for workshops processing both formats.",
      traditional: "Straight cuts and straightforward operations with modest geometry variety.",
    },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    {
      title: "Fiber Tube Laser Cutting Machine",
      text: "Tube cut-off, holes, slots, ends and programmed profiles.",
    },
    {
      title: "Tube Bending Machine",
      text: "Bends prepared tube parts to the required radius and geometry.",
    },
    {
      title: "Welding Machine",
      text: "Joins prepared members into frames and assemblies.",
    },
    {
      title: "Press Brake",
      text: "Forms complementary sheet-metal components.",
      href: "/products/nc-hydraulic-press-brake",
    },
    {
      title: "Fiber Laser Sheet Cutting Machine",
      text: "Cuts complementary flat-sheet components.",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    {
      title: "Hydraulic Press",
      text: "Supports selected pressing, forming or assembly operations.",
      href: "/products/four-column-hydraulic-press",
    },
    {
      title: "Surface Treatment",
      text: "Completes polishing, grinding, coating or finishing as required.",
    },
  ] satisfies readonly WorkflowItem[],
  selectionQuestions: [
    "Tube material",
    "Tube type: round / square / rectangular / profile",
    "Tube diameter or section size",
    "Tube length",
    "Tube wall thickness",
    "Required cutting quality",
    "Hole and slot pattern",
    "Need bevel cutting or not",
    "Daily tube cutting quantity",
    "Main products or applications",
    "Required laser power",
    "Chuck type requirement",
    "Need three-chuck or four-chuck system",
    "Need automatic loading or unloading",
    "Need smoke exhaust system",
    "Available workshop space",
    "Voltage requirement",
    "Cooling system requirement",
    "Cutting gas condition",
    "Budget range",
    "Need to match bending, welding or sheet cutting equipment",
  ],
  safety: [
    "Prepare a stable power supply according to the selected machine configuration.",
    "Confirm cutting-gas supply and pressure requirements with the final process plan.",
    "Plan smoke exhaust or dust collection for the workshop layout.",
    "Provide the specified cooling system and a clean installation area.",
    "Keep enough front and rear space for loading and finished-part removal.",
    "Plan long-tube handling space before installation.",
    "Follow laser safety instructions and applicable local regulations.",
    "Use any optional enclosure, doors and safety interlocks according to manufacturer instructions.",
  ],
  faqs: [
    {
      question: "What is a fiber tube laser cutting machine?",
      answer:
        "It is a CNC fiber-laser system dedicated to metal-tube cut-off, holes, slots and contours. It is commonly considered for structural tube parts and recurring tube production.",
    },
    {
      question: "What tube types can this machine process?",
      answer:
        "Depending on configuration, it can process round, square, rectangular, oval and waist-round tube, angle steel, channel steel and selected profiles. Exact section, diameter, length and wall thickness must be confirmed against the chuck and control system.",
    },
    {
      question: "What materials can it cut?",
      answer:
        "Typical materials include carbon steel, stainless steel, galvanized steel, aluminum, copper and brass tube. Final capability depends on power, material grade, wall thickness, section and cutting gas.",
    },
    {
      question: "What is the difference between tube laser and sheet-and-tube laser?",
      answer:
        "A dedicated tube laser focuses on tube clamping, rotation and profile work, making it suitable for tube-heavy orders. A sheet-and-tube machine is practical when a workshop regularly needs both flat-sheet and tube processing.",
    },
    {
      question: "Can it replace sawing, drilling and punching?",
      answer:
        "For many cut-off, hole, slot and contour operations, laser tube cutting can reduce separate steps. Whether it replaces a traditional process depends on the part, volume, material, tolerance and cost requirement.",
    },
    {
      question: "Is it suitable for metal furniture and fitness equipment?",
      answer:
        "Yes, these products often use round, square or rectangular frames with holes and connection features. The machine configuration still needs to match the actual drawings and tube sizes.",
    },
    {
      question: "Does this machine support automatic loading?",
      answer:
        "Manual, semi-automatic or automatic loading may be selected depending on the model, tube length, tube weight, output requirement, layout and budget. Automatic loading is not assumed as standard equipment.",
    },
    {
      question: "How do I choose the right laser power?",
      answer:
        "Confirm the tube material, section, wall thickness, required speed, holes, edge quality and budget. An engineer can then match the laser power to the full process requirement.",
    },
    {
      question: "What cutting gas should I use?",
      answer:
        "Oxygen, nitrogen or compressed air may be considered according to material, wall thickness, edge requirement and operating cost. The final choice should follow the approved cutting process.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Provide material, tube type, diameter or section, length, wall thickness, drawings, daily quantity, loading requirement, voltage, destination country and any downstream bending or welding process.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Configuration can be discussed around the tube range, length, power, chuck system, loading method, control, cooling, exhaust, optional enclosure and voltage. Availability is confirmed with the selected model and engineering review.",
    },
  ] satisfies readonly FaqItem[],
  internalLinks: [
    {
      title: "Sheet and Tube Fiber Laser Cutting Machine",
      text: "Compare a combined sheet-and-tube platform for mixed workshop demand.",
      href: "/products/sheet-and-tube-fiber-laser-cutting-machine",
    },
    {
      title: "Single-Table Fiber Laser Cutting Machine",
      text: "Explore a practical open platform for flat-sheet cutting.",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    {
      title: "Exchange-Table Fiber Laser Cutting Machine",
      text: "Review a dual-platform approach for batch flat-sheet production.",
      href: "/products/exchange-table-fiber-laser-cutting-machine",
    },
    {
      title: "NC Hydraulic Press Brake",
      text: "Add practical numerical-control bending for complementary sheet parts.",
      href: "/products/nc-hydraulic-press-brake",
    },
    {
      title: "Torsion Bar CNC Press Brake",
      text: "Match sheet-metal bending with a stable torsion-bar CNC workflow.",
      href: "/products/torsion-bar-cnc-press-brake",
    },
    {
      title: "Hydraulic Four-Roll Plate Rolling Machine",
      text: "Explore complementary curved-sheet production equipment.",
      href: "/products/hydraulic-four-roll-plate-rolling-machine",
    },
  ] satisfies readonly WorkflowItem[],
} as const;
