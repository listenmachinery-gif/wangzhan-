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
  sheetLaser: string;
  sheetAndTubeLaser: string;
  tubeLaser: string;
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

const confirmationValue = "Customizable / Please confirm with our sales engineer";

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "Sheet metal fabrication",
    text: "Supports mixed jobs that combine flat brackets, panels and connection parts with tube-based frames or structures.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/sheet-metal-fabrication.jpg",
    alt: "Real sheet metal fabrication work in an industrial workshop",
  },
  {
    title: "Metal furniture",
    text: "Prepares sheet details and tubular furniture structures from one coordinated front-end cutting system.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/metal-furniture.jpg",
    alt: "Real metal furniture made with sheet and tube components",
  },
  {
    title: "Fitness equipment",
    text: "Fits products that use tube frames together with sheet gussets, mounting plates, slots and connection points.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/fitness-equipment.jpg",
    alt: "Real fitness equipment with metal tube and sheet structures",
  },
  {
    title: "Guardrail and fence",
    text: "Cuts suitable rail tubes, frame profiles, decorative elements and mounting plates when the chuck configuration supports them.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/guardrail-fence.jpg",
    alt: "Real metal guardrail and fence structure",
  },
  {
    title: "Electrical cabinet and enclosure",
    text: "Cuts flat cabinet panels and brackets while adding tube capability for bases, supports and protective frames.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/electrical-cabinet-enclosure.jpg",
    alt: "Real electrical cabinet and enclosure production environment",
  },
  {
    title: "Machinery frame and structure",
    text: "Combines plate covers, brackets and guards with round, square or rectangular structural tube work.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/machinery-frame-structure.jpg",
    alt: "Real machinery manufacturing and metal frame environment",
  },
  {
    title: "Stainless steel products",
    text: "Processes configured stainless sheet and tube parts for housings, frames and fabricated products.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/stainless-steel-products.jpg",
    alt: "Real stainless steel product manufacturing environment",
  },
  {
    title: "Advertising signage",
    text: "Produces sheet letters and decorative profiles together with tube supports or display frames.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/advertising-signage.jpg",
    alt: "Real advertising signage fabrication work",
  },
  {
    title: "Metal door and window parts",
    text: "Prepares suitable frame tubes, reinforcement pieces, brackets and decorative sheet components.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/metal-door-window-parts.jpg",
    alt: "Real fabricated metal door and window product",
  },
  {
    title: "Agricultural and construction machinery",
    text: "Supports mixed structural components where sheet plates, guards and brackets meet tube frames or supports.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/agricultural-construction-machinery.jpg",
    alt: "Real agricultural and construction machinery application",
  },
  {
    title: "General metalworking workshop",
    text: "Adds one flexible cutting station for changing sheet and tube orders before forming, welding and assembly.",
    image:
      "/products/sheet-and-tube-fiber-laser-cutting-machine-applications/general-metalworking-workshop.jpg",
    alt: "Real general metalworking workshop",
  },
] as const;

export const sheetAndTubeFiberLaserCuttingMachinePage = {
  hero: {
    title: "Sheet and Tube Fiber Laser Cutting Machine",
    subtitle:
      "One machine for metal sheet cutting and tube cutting in flexible fabrication workshops.",
    description:
      "A sheet and tube fiber laser cutting machine designed for workshops that need to process both flat metal sheets and metal tubes. It helps customers reduce duplicate machine investment, expand cutting capability and handle more product types with one integrated laser cutting solution.",
    primaryCta: "Get Sheet & Tube Cutting Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Sheet and Tube Dual Use",
      "Suitable for Flat Sheet and Metal Pipe",
      "Flexible Fabrication Solution",
      "Reduce Separate Machine Investment",
    ],
  },
  painPoints: [
    {
      title: "Workshops need to cut both sheets and tubes",
      text: "Many fabricated products combine flat sheet components with tubular structures, so one integrated machine can cover both cutting requirements.",
    },
    {
      title: "Buying two separate laser machines is costly",
      text: "For small and medium workshops or mixed-order businesses, a dual-use layout can reduce the pressure of purchasing separate sheet and tube systems.",
    },
    {
      title: "Product structures are becoming more mixed",
      text: "Metal furniture, fitness equipment, guardrails, racks and machine frames often combine sheet parts with round, square or rectangular tubes.",
    },
    {
      title: "Traditional tube processing is slow and inaccurate",
      text: "Tube cutting, holes, slots and shaped profiles can require several saw, drill or manual operations when a programmable cutting process is unavailable.",
    },
    {
      title: "Customers need a flexible front-end cutting machine",
      text: "Finished sheet and tube parts can continue into bending, welding, grinding, coating and final assembly as one coordinated workflow.",
    },
  ] satisfies readonly ContentCard[],
  solutions: [
    {
      title: "Mixed Sheet & Tube Fabrication",
      suitableFor:
        "Sheet-metal factories, general metal processors and custom fabrication workshops.",
      recommendedUse:
        "Orders that regularly combine flat sheet components with round, square or rectangular tube parts.",
      productionValue:
        "Expands the range of work one cutting station can accept while keeping mixed production organized.",
      text: "Final capability is matched to sheet size, tube profile, thickness and chuck configuration.",
    },
    {
      title: "Furniture, Fitness & Frame Products",
      suitableFor:
        "Metal furniture, fitness equipment, shelving, guardrail and machinery-frame manufacturers.",
      recommendedUse:
        "Cut sheet connectors, brackets and plates together with tube holes, slots, ends and profiles.",
      productionValue:
        "Creates a coordinated front-end process for products built from both sheet and tube structures.",
      text: "Tube format support depends on the selected chuck and control-system capability.",
    },
    {
      title: "Complete Sheet Metal Workflow",
      suitableFor:
        "Workshops already using press brakes, shears, rolling machines, welding and surface-treatment equipment.",
      recommendedUse:
        "Supply cut sheet and tube parts to downstream forming, joining, finishing and assembly operations.",
      productionValue:
        "Connects two material paths to one practical fabrication workflow rather than treating the laser as an isolated machine.",
      text: "Production planning should account for both sheet handling and tube loading space.",
    },
  ] satisfies readonly SolutionCard[],
  applications: applicationPhotos,
  applicationIntro:
    "These eleven real photographs show representative production environments and downstream products. They are application references, not customer cases or photos of this exact machine.",
  sheetMaterials: [
    "Mild Steel Sheet",
    "Stainless Steel Sheet",
    "Galvanized Sheet",
    "Aluminum Plate",
    "Copper Sheet",
    "Brass Sheet",
    "Thin Metal Plate",
  ],
  sheetMaterialNote:
    "The suitable sheet cutting thickness depends on laser power, material type, cutting gas, cutting speed, cutting quality requirement and machine configuration. Please confirm your sheet material and cutting requirement before quotation.",
  tubeTypes: [
    "Round Tube",
    "Square Tube",
    "Rectangular Tube",
    "Oval Tube",
    "Angle Steel",
    "Channel Steel",
    "Selected Profile Tubes",
  ],
  tubeTypeNote:
    "Tube cutting capability depends on chuck structure, tube diameter, tube length, wall thickness, material type and machine configuration. Please confirm your tube drawing and processing requirement before quotation.",
  sheetProcessSteps: [
    {
      title: "Drawing Import",
      text: "Import DXF or compatible cutting files according to the nesting software and control system.",
    },
    {
      title: "Sheet Loading",
      text: "Place the metal sheet on the working table according to sheet size and machine configuration.",
    },
    {
      title: "Cutting Parameter Setting",
      text: "Set laser power, cutting speed, focus, gas type and pressure according to material and thickness.",
    },
    {
      title: "Fiber Laser Sheet Cutting",
      text: "Cut contours, holes, slots and profiles on flat metal sheets.",
    },
    {
      title: "Part Sorting",
      text: "Remove finished parts and scrap from the working table after cutting.",
    },
    {
      title: "Next Process",
      text: "Continue with bending, rolling, welding, polishing, powder coating or final assembly.",
    },
  ] satisfies readonly ContentCard[],
  tubeProcessSteps: [
    {
      title: "Tube Loading",
      text: "Load round, square or rectangular tube according to supported tube size and machine configuration.",
    },
    {
      title: "Chuck Clamping",
      text: "Use the chuck system to hold and rotate the tube during cutting.",
    },
    {
      title: "Tube Profile Setting",
      text: "Set tube type, diameter, length, cutting pattern and processing program through the control system.",
    },
    {
      title: "Laser Tube Cutting",
      text: "Cut holes, slots, bevel-like profiles or contours according to drawing and machine capability.",
    },
    {
      title: "Tube Part Removal",
      text: "Remove finished tube parts and manage remaining material.",
    },
    {
      title: "Welding / Assembly",
      text: "Continue with welding, polishing, frame assembly or surface treatment.",
    },
  ] satisfies readonly ContentCard[],
  dualUsePoints: [
    "Combines flat sheet cutting and tube cutting functions in one equipment layout.",
    "Fits workshops that process both plate parts and tube structures.",
    "Can be a practical alternative to purchasing separate systems for mixed production.",
    "Helps a workshop handle more product categories within a planned equipment footprint.",
    "Matches furniture, equipment frames, guardrails, fitness equipment and general fabrication products.",
  ],
  dualUseNote:
    "It is not a universal substitute for a dedicated tube laser. High-volume, complex-profile, long or large-diameter tube work may be better served by a dedicated tube laser cutting machine.",
  powerGuide: [
    {
      title: "Sheet thickness and tube wall",
      text: "Confirm both the maximum sheet thickness and the tube wall thickness instead of selecting power from only one material path.",
    },
    {
      title: "Material mix",
      text: "Mild steel, stainless steel, aluminum, copper and brass may require different power and gas choices.",
    },
    {
      title: "Speed and edge requirement",
      text: "Thicker material or higher output targets may need a different power class, gas system and cutting process.",
    },
    {
      title: "Tube profile and heat control",
      text: "Tube wall thickness, profile geometry and heat accumulation should be included in the final recommendation.",
    },
  ] satisfies readonly ContentCard[],
  laserPowerValue: confirmationValue,
  powerNote:
    "Final power should be confirmed from material, sheet thickness, tube wall thickness, cutting quantity, edge requirement and budget.",
  gasOptions: [
    {
      title: "Oxygen",
      text: "Often considered for carbon steel depending on thickness, cutting process and edge requirement.",
    },
    {
      title: "Nitrogen",
      text: "Can help reduce oxidation on stainless steel and selected non-ferrous metals when the machine and gas system are configured for the process.",
    },
    {
      title: "Compressed Air",
      text: "May suit cost-sensitive tasks when material, edge quality and operating conditions are compatible.",
    },
  ] satisfies readonly ContentCard[],
  gasNote:
    "Sheet and tube cutting may require different parameters even for the same material. Final gas selection depends on material, thickness, edge quality and operating cost.",
  advantages: [
    "One machine for both sheet cutting and tube cutting",
    "Suitable for mixed metal fabrication orders",
    "Helps reduce separate machine investment",
    "Supports configured flat sheet, round tube, square tube and rectangular tube work",
    "Practical for furniture, fitness equipment, guardrail and frame products",
    "Flexible cutting of contours, holes and supported tube profiles",
    "Works with bending, rolling, welding and surface-treatment processes",
    "Supports customers upgrading from traditional cutting and drilling methods",
  ],
  comparisonRows: [
    {
      label: "Main function",
      sheetLaser: "Flat metal sheet cutting",
      sheetAndTubeLaser: "Integrated flat sheet and configured tube cutting",
      tubeLaser: "Dedicated tube and profile cutting",
    },
    {
      label: "Material type",
      sheetLaser: "Metal sheet",
      sheetAndTubeLaser: "Metal sheet plus supported tube formats",
      tubeLaser: "Supported tube and profile formats",
    },
    {
      label: "Tube cutting ability",
      sheetLaser: "Not designed for tube cutting",
      sheetAndTubeLaser: "Available within chuck, diameter, length and control limits",
      tubeLaser: "Purpose-built around tube production",
    },
    {
      label: "Investment level",
      sheetLaser: "Single-purpose sheet system",
      sheetAndTubeLaser: "One integrated system for two material paths",
      tubeLaser: "Separate dedicated tube system",
    },
    {
      label: "Workshop space",
      sheetLaser: "Plan for sheet loading and unloading",
      sheetAndTubeLaser: "Plan for sheet handling plus front and rear tube space",
      tubeLaser: "Plan around tube loading, support and part removal",
    },
    {
      label: "Production flexibility",
      sheetLaser: "Focused on sheet orders",
      sheetAndTubeLaser: "Flexible for mixed sheet and tube orders",
      tubeLaser: "Focused on tube orders and tube-specific production",
    },
    {
      label: "Suitable production type",
      sheetLaser: "Sheet-dominant workshops",
      sheetAndTubeLaser: "Mixed-product and multi-variety workshops",
      tubeLaser: "Tube-dominant or specialized tube production",
    },
    {
      label: "Recommended use",
      sheetLaser: "Choose when tube demand is limited",
      sheetAndTubeLaser: "Choose when both material paths are regular requirements",
      tubeLaser: "Choose for high tube volume, complex profiles or wider tube requirements",
    },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    {
      title: "Sheet and Tube Fiber Laser Cutting Machine",
      text: "Front-end cutting for configured metal sheets and tubes.",
    },
    {
      title: "Shearing Machine",
      text: "Straight blanking or simple sheet division before other operations.",
      href: "/products/hydraulic-guillotine-shear",
    },
    {
      title: "Press Brake",
      text: "Bends laser-cut sheet parts into panels, brackets and enclosures.",
      href: "/products/electro-hydraulic-servo-cnc-press-brake",
    },
    {
      title: "Plate Rolling Machine",
      text: "Forms suitable sheet parts into arcs, cylinders or curved components.",
      href: "/products/hydraulic-four-roll-plate-rolling-machine",
    },
    {
      title: "Tube Bending Machine",
      text: "Bends suitable tube parts after profile cutting when the product requires formed geometry.",
    },
    {
      title: "Welding Machine",
      text: "Joins sheet and tube structures into frames, furniture or fabricated assemblies.",
    },
    {
      title: "Hydraulic Press",
      text: "Supports configured pressing, assembly or forming operations.",
      href: "/products/four-column-hydraulic-press",
    },
    {
      title: "Surface Treatment",
      text: "Completes grinding, polishing, coating or final product finishing.",
    },
  ] satisfies readonly WorkflowItem[],
  workflowNote:
    "The sheet and tube fiber laser cutting machine is not only a single machine, but also a flexible front-end cutting machine in a complete metal fabrication workflow.",
  selectionInputs: [
    "Sheet material",
    "Maximum sheet cutting thickness",
    "Common sheet size",
    "Tube material",
    "Tube type: round / square / rectangular / profile",
    "Tube diameter or section size",
    "Tube length",
    "Tube wall thickness",
    "Required cutting quality",
    "Daily sheet cutting quantity",
    "Daily tube cutting quantity",
    "Main products or applications",
    "Required laser power",
    "Need open type or enclosed cover",
    "Need exchange table or single table",
    "Need smoke exhaust system",
    "Available workshop space",
    "Voltage requirement",
    "Cooling system requirement",
    "Cutting gas condition",
    "Budget range and matching downstream equipment",
  ],
  selectionCta: {
    title: "Send Your Sheet & Tube Cutting Requirement",
    text: "Share drawings and the real production mix so an engineer can match the cutting table, chuck, laser source, gas system and workshop layout.",
    button: "Request Recommendation",
  },
  specificationFields: [
    { heading: "Model", source: "name" },
    { heading: "Working Area (mm)", source: "confirmed" },
    { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
    { heading: "Cutting Format", source: "spec", sourceIndex: 1 },
    { heading: "Sheet Cutting Material", source: "confirmed", confirmedValue: "Mild steel, stainless steel, galvanized sheet, aluminum, copper and brass; confirm the selected process" },
    { heading: "Maximum Sheet Cutting Thickness (mm)", source: "confirmed" },
    { heading: "Tube Type", source: "confirmed" },
    { heading: "Tube Diameter / Section Range (mm)", source: "confirmed" },
    { heading: "Tube Length (mm)", source: "confirmed" },
    { heading: "Maximum Tube Wall Thickness (mm)", source: "confirmed" },
    { heading: "Chuck Type", source: "confirmed" },
    { heading: "Positioning Accuracy (mm)", source: "confirmed" },
    { heading: "Max Cutting Speed (m/min)", source: "confirmed" },
    { heading: "Transmission System", source: "spec", sourceIndex: 2 },
    { heading: "Control / Software", source: "spec", sourceIndex: 3 },
    { heading: "Cooling System", source: "confirmed" },
    { heading: "Machine Size (mm)", source: "confirmed" },
    { heading: "Machine Weight (kg)", source: "confirmed" },
    { heading: "Application", source: "confirmed", confirmedValue: "Integrated metal sheet and tube cutting" },
  ] satisfies readonly SpecificationField[],
  specificationNote:
    "Final specifications depend on sheet material, tube material, thickness, working area, tube size, laser power, cutting gas, chuck system, control system and selected machine configuration.",
  safetyPoints: [
    "Prepare stable power supply according to machine configuration.",
    "Confirm cutting gas supply and gas pressure requirements.",
    "Plan smoke exhaust or dust collection according to workshop layout.",
    "Prepare the cooling system and a clean installation area.",
    "Keep enough space for sheet loading, tube loading and finished-part removal.",
    "Reserve front and rear tube space according to the confirmed tube length.",
    "Follow laser safety instructions and applicable local safety regulations.",
    "Use an optional protective enclosure, doors, windows and interlocks according to manufacturer instructions when selected.",
  ],
  faqs: [
    {
      question: "What is a sheet and tube fiber laser cutting machine?",
      answer:
        "It is a fiber laser system that supports flat metal sheet cutting and configured metal tube cutting in one equipment layout. It suits workshops that regularly produce both sheet parts and tube structures.",
    },
    {
      question: "What materials can this machine cut?",
      answer:
        "It can be configured for materials such as mild steel, stainless steel, galvanized sheet, aluminum, copper and brass in sheet and tube form. Actual capability depends on laser power, thickness, tube size, gas and machine configuration.",
    },
    {
      question: "What tube types can it process?",
      answer:
        "Depending on the selected chuck and control system, it may process round, square, rectangular, oval and selected profile tubes. Confirm tube type, size, length and wall thickness before quotation.",
    },
    {
      question: "What is the difference between sheet laser and sheet-and-tube laser?",
      answer:
        "A sheet laser focuses on flat metal. A sheet-and-tube system adds a chuck and rotary tube-cutting path for customers who need both material types.",
    },
    {
      question: "Can it replace a dedicated tube laser cutting machine?",
      answer:
        "It is practical for regular small or medium mixed production. A dedicated tube laser may be more suitable when tube volume is high or the work involves complex profiles, larger diameters or long material.",
    },
    {
      question: "Is it suitable for metal furniture and fitness equipment?",
      answer:
        "Yes, when the required sheet parts and tube formats fall within the confirmed configuration. These products commonly combine tube frames with plates, holes, slots and connection parts.",
    },
    {
      question: "How do I choose the right laser power?",
      answer:
        "Provide sheet thickness, tube wall thickness, materials, speed expectations, edge requirements and budget. An engineer can then recommend the suitable power and gas system.",
    },
    {
      question: "What cutting gas should I use?",
      answer:
        "Oxygen, nitrogen or compressed air may be selected according to material, thickness, edge quality and operating cost. Final parameters should follow the confirmed cutting process.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Send sheet material, thickness and size; tube material, type, section, length and wall thickness; daily quantities; application; voltage; configuration needs; and delivery country or destination port.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Configuration can be confirmed around the working table, laser power, chuck system, tube length, controller, cooling, exhaust, optional enclosure and voltage according to available manufacturing options.",
    },
  ] satisfies readonly FaqItem[],
  internalLinks: [
    {
      title: "Single-Table Fiber Laser Cutting Machine",
      text: "A sheet-only open platform for practical flat-sheet cutting.",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    {
      title: "Exchange-Table Fiber Laser Cutting Machine",
      text: "A sheet-only platform focused on reducing loading interruption.",
      href: "/products/exchange-table-fiber-laser-cutting-machine",
    },
    {
      title: "Fiber Tube Laser Cutting Machine",
      text: "A dedicated system for tube-dominant production.",
      href: "/products/fiber-tube-laser-cutting-machine",
    },
    {
      title: "Hydraulic Guillotine Shear",
      text: "Straight sheet blanking for general fabrication workflows.",
      href: "/products/hydraulic-guillotine-shear",
    },
    {
      title: "Electro-Hydraulic Servo CNC Press Brake",
      text: "Precision bending for laser-cut sheet components.",
      href: "/products/electro-hydraulic-servo-cnc-press-brake",
    },
    {
      title: "Hydraulic Four-Roll Plate Rolling Machine",
      text: "Curved forming for compatible laser-cut sheet parts.",
      href: "/products/hydraulic-four-roll-plate-rolling-machine",
    },
  ] satisfies readonly WorkflowItem[],
  finalCta: {
    title: "Need a Flexible Sheet and Tube Cutting Solution?",
    text: "Send your sheet material, tube type, thickness, size and production requirement. We will recommend a suitable sheet and tube fiber laser cutting machine configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
} as const;
