import type { Product, ProductCategory } from "./products";

export type SolutionCard = {
  title: string;
  text: string;
};

export type ProductSolutionProfile = {
  categoryId: Product["categoryId"];
  eyebrow: string;
  buyerOutcome: string;
  challenges: SolutionCard[];
  workflow: SolutionCard[];
  selectionQuestions: string[];
  supportSteps: SolutionCard[];
  inquiryFields: string[];
  applicationContext: string;
  configurationContext: string;
};

export type ProductSolutionViewModel = {
  profile: ProductSolutionProfile;
  intro: string;
  detail: string;
  outcomes: string[];
  applications: SolutionCard[];
  advantages: SolutionCard[];
  configurations: SolutionCard[];
  decisionSnapshot: Array<{ label: string; value: string }>;
};

export const productSolutionProfiles: Record<string, ProductSolutionProfile> = {
  "shearing-machines": {
    categoryId: "shearing-machines",
    eyebrow: "Sheet Metal Cutting Solution",
    buyerOutcome:
      "Match the cutting method to your material, sheet thickness, cutting width, production frequency, and handling needs.",
    challenges: [
      {
        title: "Unclear cutting capacity",
        text: "Material grade, tensile strength, thickness, and cutting width must be reviewed together before choosing a model.",
      },
      {
        title: "Inconsistent blank sizes",
        text: "The positioning method and back-gauge configuration should suit both one-off work and repeated batch cutting.",
      },
      {
        title: "Mismatch between drive and workload",
        text: "Manual, electric, and hydraulic drive options serve different production frequencies and plate ranges.",
      },
      {
        title: "Disconnected downstream flow",
        text: "Cut blanks should move efficiently into bending, rolling, welding, or assembly without unnecessary handling.",
      },
    ],
    workflow: [
      { title: "Confirm the sheet", text: "Define material, grade, maximum thickness, and required cutting width." },
      { title: "Position the workpiece", text: "Square and support the sheet according to the selected machine layout." },
      { title: "Set the cutting size", text: "Use the applicable gauge or positioning method for the required blank." },
      { title: "Complete the cut", text: "Hold and shear the sheet within the selected model capacity." },
      { title: "Move to the next process", text: "Transfer the blank to forming, joining, or assembly as required." },
    ],
    selectionQuestions: [
      "What material grade and maximum thickness will be cut?",
      "What is the maximum cutting width and usual blank size?",
      "How many cutting cycles are expected in a normal shift?",
      "Which positioning, support, and safety configuration fits the workshop?",
    ],
    supportSteps: [
      { title: "Requirement review", text: "Check material, thickness, width, duty cycle, and finished blank requirements." },
      { title: "Model matching", text: "Compare the required capacity with the available drive and machine structures." },
      { title: "Configuration confirmation", text: "Confirm gauge, support, tooling, control, voltage, and safety needs." },
      { title: "Delivery preparation", text: "Align packing, documentation, installation guidance, and operating support." },
    ],
    inquiryFields: ["Material and grade", "Maximum thickness", "Cutting width", "Daily cutting frequency", "Voltage and destination"],
    applicationContext: "straight cutting and blank preparation",
    configurationContext: "cutting capacity, positioning, support, and safety",
  },
  "bending-machines": {
    categoryId: "bending-machines",
    eyebrow: "Sheet Metal Bending Solution",
    buyerOutcome:
      "Select the bending method around part geometry, material, thickness, working length, tooling, and batch requirements.",
    challenges: [
      {
        title: "Machine capacity does not match the part",
        text: "Material, thickness, bend length, flange depth, and target angle all affect machine and tooling selection.",
      },
      {
        title: "Too much setup between jobs",
        text: "Control, gauge, clamping, and tooling choices should reflect the real product mix and changeover frequency.",
      },
      {
        title: "Repeated angles vary",
        text: "Positioning and process control should be selected according to the required batch consistency and part tolerance.",
      },
      {
        title: "Operator workflow is overlooked",
        text: "Loading, part support, control complexity, and safe handling matter as much as nominal bending force.",
      },
    ],
    workflow: [
      { title: "Review the drawing", text: "Confirm material, thickness, bend length, angles, flange sizes, and part geometry." },
      { title: "Select the tooling", text: "Match upper and lower tools to the bend, material, and finished-part requirement." },
      { title: "Set the position", text: "Configure the gauge or manual reference for the required bend line." },
      { title: "Form the part", text: "Complete the bend with the selected manual, pneumatic, electric, hydraulic, NC, or CNC method." },
      { title: "Inspect and continue", text: "Check the formed part before repeating the job or moving to assembly." },
    ],
    selectionQuestions: [
      "What material, thickness, and maximum bend length are required?",
      "Which angles, flanges, boxes, or profiles must be produced?",
      "Is the work one-off, mixed small-batch, or repeat production?",
      "What level of tooling, gauge, control, and part support is appropriate?",
    ],
    supportSteps: [
      { title: "Part review", text: "Review drawings, material, bend length, geometry, and expected batch size." },
      { title: "Bending-method selection", text: "Match the task to folding, NC press-brake, or CNC press-brake capability." },
      { title: "Tooling and control", text: "Confirm tools, clamping, gauge, controller, support, and safety requirements." },
      { title: "Production preparation", text: "Coordinate machine setup information, shipment, training guidance, and service support." },
    ],
    inquiryFields: ["Part drawing", "Material and thickness", "Bending length", "Required angle or profile", "Batch size and voltage"],
    applicationContext: "sheet forming and bend preparation",
    configurationContext: "bending method, tooling, positioning, control, and part support",
  },
  "laser-cutting-machines": {
    categoryId: "laser-cutting-machines",
    eyebrow: "Fiber Laser Cutting Solution",
    buyerOutcome:
      "Build the cutting platform around material mix, thickness range, sheet or tube format, nesting workflow, and required output.",
    challenges: [
      {
        title: "Laser power is selected in isolation",
        text: "Power must be considered with material, thickness range, cut quality, assist gas, and expected production volume.",
      },
      {
        title: "Loading limits overall output",
        text: "Table format, exchange strategy, tube handling, and material flow can determine practical throughput.",
      },
      {
        title: "Software and production are disconnected",
        text: "Drawing preparation, nesting, job management, and machine operation should form one clear workflow.",
      },
      {
        title: "The platform does not fit the product mix",
        text: "Sheet-only, sheet-and-tube, and dedicated tube systems suit different part families and utilization patterns.",
      },
    ],
    workflow: [
      { title: "Prepare the cutting file", text: "Confirm part geometry, material, thickness, tolerance, and edge requirement." },
      { title: "Nest the job", text: "Arrange parts for practical material use and the planned production sequence." },
      { title: "Load material", text: "Place sheet or tube according to the selected table and handling configuration." },
      { title: "Cut the parts", text: "Apply the matched cutting process within the configured laser platform." },
      { title: "Unload and sort", text: "Move finished parts into deburring, bending, welding, or assembly." },
    ],
    selectionQuestions: [
      "Which materials and thickness range must be processed?",
      "Is the work sheet, tube, or a regular mix of both?",
      "What table size, loading method, and daily output are expected?",
      "Which nesting, extraction, gas, and automation configuration is required?",
    ],
    supportSteps: [
      { title: "Part-family review", text: "Review materials, thicknesses, formats, drawings, and target output." },
      { title: "Platform matching", text: "Select sheet, sheet-and-tube, or tube architecture and the suitable working format." },
      { title: "Process configuration", text: "Confirm laser source, cutting head, gas, extraction, software, and loading needs." },
      { title: "Implementation preparation", text: "Coordinate layout, utilities, shipment, setup guidance, and technical support." },
    ],
    inquiryFields: ["Material list", "Thickness range", "Sheet or tube size", "Daily output", "Factory layout and utilities"],
    applicationContext: "precision profile cutting and part preparation",
    configurationContext: "laser power, working format, software, material handling, and extraction",
  },
  "plate-rolling-machines": {
    categoryId: "plate-rolling-machines",
    eyebrow: "Plate Rolling Solution",
    buyerOutcome:
      "Choose the roll structure from material, thickness, width, minimum diameter, pre-bending needs, and production rhythm.",
    challenges: [
      {
        title: "Required diameter is not defined",
        text: "Plate properties, finished diameter, straight-edge allowance, and springback affect the rolling method.",
      },
      {
        title: "Pre-bending is treated as an afterthought",
        text: "End preparation and pre-bending capability can reduce flat ends and downstream correction work.",
      },
      {
        title: "Roll structure does not fit the job mix",
        text: "Two-roll, three-roll, and four-roll machines provide different handling and production characteristics.",
      },
      {
        title: "Part handling is underestimated",
        text: "Plate weight, loading direction, discharge, support, and operator access should shape the final configuration.",
      },
    ],
    workflow: [
      { title: "Define the workpiece", text: "Confirm material, thickness, width, finished diameter, and shape." },
      { title: "Set the rolls", text: "Prepare roll position and process settings for the selected workpiece." },
      { title: "Pre-bend the edge", text: "Prepare plate ends when required by the roll structure and finished geometry." },
      { title: "Complete the rolling cycle", text: "Form the cylinder, arc, or curved component in controlled passes." },
      { title: "Inspect the geometry", text: "Check diameter, roundness, seam alignment, and next-process requirements." },
    ],
    selectionQuestions: [
      "What material, thickness, and maximum plate width are required?",
      "What is the minimum finished diameter or required curvature?",
      "Are pre-bending, cone rolling, or repeat programs needed?",
      "How will the plate and finished part be loaded, supported, and removed?",
    ],
    supportSteps: [
      { title: "Workpiece review", text: "Review material, plate dimensions, target diameter, shape, and tolerance." },
      { title: "Roll-structure selection", text: "Match two-roll, three-roll, or four-roll operation to the production need." },
      { title: "Handling configuration", text: "Confirm controls, supports, drop end, cone device, and workshop layout." },
      { title: "Production preparation", text: "Coordinate foundation, shipment, setup guidance, and operating support." },
    ],
    inquiryFields: ["Material and grade", "Plate thickness and width", "Minimum diameter", "Required shape", "Production frequency"],
    applicationContext: "cylinder, arc, cone, and curved-part forming",
    configurationContext: "roll structure, pre-bending, controls, support, and unloading",
  },
  "press-machines": {
    categoryId: "press-machines",
    eyebrow: "Industrial Pressing Solution",
    buyerOutcome:
      "Match the press structure and drive to the operation, required force, stroke, tooling, feeding, and safety method.",
    challenges: [
      {
        title: "Tonnage is the only selection input",
        text: "Force, stroke, daylight, table size, tool geometry, and material behavior must be evaluated together.",
      },
      {
        title: "The press cycle does not fit the process",
        text: "Punching, stamping, forming, correction, and assembly need different control and motion characteristics.",
      },
      {
        title: "Tooling and feeding are disconnected",
        text: "Die layout, workpiece positioning, feeding, and discharge determine how the press performs in production.",
      },
      {
        title: "Safety is considered too late",
        text: "Guarding and operator controls should be planned with the tooling, access points, and production method.",
      },
    ],
    workflow: [
      { title: "Define the operation", text: "Confirm punching, stamping, forming, correction, or assembly requirements." },
      { title: "Match force and tooling", text: "Review material, part, die, force, stroke, daylight, and table needs." },
      { title: "Position the workpiece", text: "Load manually or through the selected feeding and positioning method." },
      { title: "Complete the press cycle", text: "Run the configured mechanical, pneumatic, or hydraulic operation." },
      { title: "Unload and inspect", text: "Remove the part safely and check it before the next operation." },
    ],
    selectionQuestions: [
      "What operation and material will the press perform?",
      "What force, stroke, daylight, and table size does the tooling require?",
      "Will parts be manually loaded or integrated with a feeder?",
      "Which control, guarding, and safety method is required?",
    ],
    supportSteps: [
      { title: "Process review", text: "Review the part, material, die, required force, and production sequence." },
      { title: "Press matching", text: "Compare mechanical, pneumatic, and hydraulic structures for the operation." },
      { title: "Line configuration", text: "Confirm controls, feeding, tooling interface, guarding, and utilities." },
      { title: "Project preparation", text: "Coordinate layout, shipment, setup information, and technical support." },
    ],
    inquiryFields: ["Part and process", "Material", "Required force and stroke", "Tooling information", "Feeding and safety needs"],
    applicationContext: "punching, stamping, forming, correction, or assembly",
    configurationContext: "press force, stroke, tooling, feeding, controls, and safety",
  },
  "rectangular-duct-production": {
    categoryId: "rectangular-duct-production",
    eyebrow: "Rectangular Duct Production Solution",
    buyerOutcome:
      "Place each machine in the correct duct-production stage and match it to material, duct sizes, connection system, labor, and output.",
    challenges: [
      {
        title: "A standalone machine becomes a bottleneck",
        text: "Cutting, beading, locking, flanging, closing, and corner work must be balanced across the whole duct flow.",
      },
      {
        title: "Connection method and tooling do not match",
        text: "Roll profiles, flange systems, seam types, and corners should be selected around the duct specification.",
      },
      {
        title: "Automation is added without a layout plan",
        text: "Coil or sheet flow, operator positions, transfer space, and finished duct handling affect the useful line layout.",
      },
      {
        title: "Material variation causes setup problems",
        text: "Galvanized sheet, stainless steel, and aluminum require suitable thickness ranges and forming configurations.",
      },
    ],
    workflow: [
      { title: "Prepare the blank", text: "Feed or cut the material to the required duct development size." },
      { title: "Form the profile", text: "Complete beading, locking, flanging, notching, or other required preparation." },
      { title: "Connect the edges", text: "Close seams and install corners or fasteners according to the selected system." },
      { title: "Assemble the duct", text: "Fold, close, inspect, and move the section into installation or dispatch." },
    ],
    selectionQuestions: [
      "Which duct-production stage should this machine complete?",
      "What material, thickness, and duct-size range are required?",
      "Which seam, lock, flange, or corner system is used?",
      "What output, labor level, and workshop layout must be supported?",
    ],
    supportSteps: [
      { title: "Duct-flow review", text: "Map the current cutting, forming, joining, and assembly steps." },
      { title: "Machine matching", text: "Select the machine or line position that removes the identified production gap." },
      { title: "Profile and layout", text: "Confirm roll sets, connections, controls, transfer direction, and utilities." },
      { title: "Line preparation", text: "Coordinate equipment layout, shipment, setup guidance, and operating support." },
    ],
    inquiryFields: ["Duct type and size", "Material and thickness", "Connection system", "Daily output", "Workshop layout"],
    applicationContext: "rectangular duct preparation, forming, joining, and assembly",
    configurationContext: "duct profile, material range, line position, controls, and layout",
  },
  "round-duct-production": {
    categoryId: "round-duct-production",
    eyebrow: "Round Duct Production Solution",
    buyerOutcome:
      "Match forming equipment to duct diameter, material, thickness, profile or connection method, output, and available floor space.",
    challenges: [
      {
        title: "Diameter range and tooling are not aligned",
        text: "Duct or flange diameter, material, thickness, and profile geometry should define the machine setup.",
      },
      {
        title: "Forming stages do not connect",
        text: "Rolling, beading, elbow forming, flange-ring work, and spiral forming should create a practical production flow.",
      },
      {
        title: "Manual handling limits output",
        text: "Feed direction, workpiece support, discharge, and operator access affect the real cycle and finished-part quality.",
      },
      {
        title: "The machine format does not fit the workshop",
        text: "Vertical, horizontal, electric, and hydraulic layouts have different space, handling, and production implications.",
      },
    ],
    workflow: [
      { title: "Define the duct part", text: "Confirm material, thickness, diameter, length, and required profile." },
      { title: "Prepare the feed", text: "Set the sheet, strip, elbow segment, or angle section for forming." },
      { title: "Form the geometry", text: "Roll, bead, connect, or spiral-form the part with the selected process." },
      { title: "Finish and inspect", text: "Check diameter, seam, profile, and fit before assembly or installation." },
    ],
    selectionQuestions: [
      "What duct, elbow, bead, flange ring, or spiral profile is required?",
      "What material, thickness, and diameter range will be processed?",
      "What daily output and changeover frequency are expected?",
      "Which orientation, drive, controls, and handling method fit the workshop?",
    ],
    supportSteps: [
      { title: "Part review", text: "Review duct geometry, material, diameter range, profile, and output." },
      { title: "Process matching", text: "Match rolling, beading, elbow, flange, or spiral equipment to the part." },
      { title: "Configuration and layout", text: "Confirm tools, drive, controls, orientation, support, and floor space." },
      { title: "Production preparation", text: "Coordinate shipment, setup information, operating guidance, and support." },
    ],
    inquiryFields: ["Required duct part", "Material and thickness", "Diameter range", "Daily output", "Workshop space and voltage"],
    applicationContext: "round and spiral duct forming, profiling, and connection work",
    configurationContext: "diameter range, forming tools, drive, orientation, controls, and handling",
  },
  "shredders": {
    categoryId: "shredders",
    eyebrow: "Material Size-Reduction Solution",
    buyerOutcome:
      "Choose the shredding stage from feedstock, input dimensions, target output, contamination, throughput, and downstream separation.",
    challenges: [
      {
        title: "Feedstock is described too broadly",
        text: "Material type, shape, bulk density, contamination, and maximum input size affect the cutting system and feeding method.",
      },
      {
        title: "Target output size is not defined",
        text: "The required downstream size and consistency should guide shredder, granulator, screen, and recirculation choices.",
      },
      {
        title: "Throughput is considered without material behavior",
        text: "Actual production depends on the feedstock, cutter configuration, loading, discharge, and downstream equipment.",
      },
      {
        title: "The shredder is isolated from the line",
        text: "Conveying, separation, dust control, collection, and service access should be considered with the core machine.",
      },
    ],
    workflow: [
      { title: "Describe the feedstock", text: "Confirm material type, dimensions, form, contamination, and loading method." },
      { title: "Feed the machine", text: "Introduce material through the selected hopper, conveyor, or controlled loading method." },
      { title: "Reduce the material", text: "Process feedstock with the selected shaft, cutter, and screen configuration." },
      { title: "Discharge and separate", text: "Move output into collection, screening, separation, granulation, or recycling." },
    ],
    selectionQuestions: [
      "What material, shape, input size, and contamination are expected?",
      "What target output size and downstream process are required?",
      "What throughput range and operating schedule should be evaluated?",
      "Which feeding, screen, conveyor, separation, and safety options are needed?",
    ],
    supportSteps: [
      { title: "Material review", text: "Review representative feedstock, input size, contamination, and target output." },
      { title: "Process selection", text: "Match granulation, single-shaft, or dual-shaft reduction to the material." },
      { title: "Line configuration", text: "Confirm hopper, cutters, screens, conveying, separation, and controls." },
      { title: "Project preparation", text: "Coordinate layout, utilities, shipment, setup guidance, and support." },
    ],
    inquiryFields: ["Material type", "Maximum input size", "Target output size", "Expected throughput", "Line layout and utilities"],
    applicationContext: "primary or secondary material size reduction",
    configurationContext: "feeding, cutter structure, screen, discharge, and downstream separation",
  },
};

const splitStatement = (value: string): SolutionCard => {
  const separatorIndex = value.indexOf(":");

  if (separatorIndex === -1) {
    return { title: value, text: "" };
  }

  return {
    title: value.slice(0, separatorIndex).trim(),
    text: value.slice(separatorIndex + 1).trim(),
  };
};

const safeOptionsForProduct = (product: Product) => {
  if (product.id !== "manual-sheet-metal-folding-machine") {
    return product.options;
  }

  return product.options.filter(
    (option) => option !== "CNC controller" && option !== "Servo back gauge",
  );
};

export function buildProductSolutionViewModel(
  product: Product,
  category: ProductCategory,
): ProductSolutionViewModel {
  const profile = productSolutionProfiles[product.categoryId];

  if (!profile) {
    throw new Error(`Missing product solution profile for ${product.categoryId}`);
  }

  const advantageSource = product.advantages ?? product.highlights;
  const applications = product.applications.map((application) => ({
    title: application,
    text: `This machine can support ${application.toLowerCase()} as part of ${profile.applicationContext}, subject to the selected model and process requirement.`,
  }));
  const configurations = safeOptionsForProduct(product).map((option) => ({
    title: option,
    text: `${option} can be reviewed as part of the ${profile.configurationContext} requirement for the final machine configuration.`,
  }));
  const decisionSnapshot = product.specs.slice(0, 4).map((specification) => ({
    label: specification.label,
    value: specification.value,
  }));

  return {
    profile,
    intro: product.tagline,
    detail: product.performanceFeatures ?? category.description,
    outcomes: product.highlights.slice(0, 3),
    applications,
    advantages: advantageSource.map(splitStatement),
    configurations,
    decisionSnapshot,
  };
}
