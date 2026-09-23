export type FootShearItem = {
  title: string;
  text: string;
};

export type FootShearLink = FootShearItem & {
  href: string;
  anchor: string;
};

export const footShearPageContent = {
  title: "Foot Operated Shearing Machine",
  hero: {
    eyebrow: "Q11 Manual Sheet Metal Shear",
    subtitle: "Manual Sheet Metal Cutting Without Electricity",
    intro:
      "A foot operated shearing machine is a manually powered sheet metal shear for straight cutting of light-gauge metal sheets. It uses a foot pedal and mechanical linkage to drive the moving blade, so no electrical, hydraulic or compressed-air power is required during the cutting stroke.",
    imageAlt: "foot operated shearing machine for sheet metal cutting",
    primaryCta: "Request a Foot Shear Quote",
    secondaryCta: "Compare Q11 Models",
    valuePoints: [
      "Manual mechanical drive",
      "No motor or hydraulic station",
      "1000-1500 mm verified working widths",
    ],
  },
  overview: {
    eyebrow: "Product Overview",
    title: "Product Overview",
    paragraphs: [
      "This Q11 foot shearing machine is a manual sheet metal cutting machine designed for straight cutting and blanking of suitable light-gauge sheet. When the operator presses the pedal, mechanical force transfers through the linkage to the upper cutting beam, allowing the upper blade to pass across the fixed lower blade and shear the positioned sheet.",
      "The foot-operated design keeps both hands available for supporting, aligning and positioning the workpiece before cutting. Depending on the selected configuration, front gauges, back gauges and sheet hold-down devices can assist positioning and improve repeatability when cutting several parts to the same size.",
      "The machine is built around a rigid frame, working table, upper and lower cutting blades and a simple mechanical transmission system. It is easy to operate, straightforward to maintain and especially practical for small-batch, intermittent and general-purpose thin-sheet cutting.",
      "For applications requiring higher cutting frequency, greater sheet thickness or continuous production, an electric or hydraulic shearing machine is generally more suitable.",
    ],
    facts: [
      { title: "Drive", text: "Manual pedal and mechanical linkage" },
      { title: "Power supply", text: "No electricity required" },
      { title: "Model family", text: "Q11 foot shear" },
      { title: "Working widths", text: "1000, 1300 and 1500 mm" },
    ],
  },
  noElectricity: {
    eyebrow: "Manual Cutting",
    title: "Manual Sheet Metal Cutting Without Electricity",
    intro:
      "The Q11 is a mechanical shearing machine. Operator force moves through the foot pedal, linkage and return-spring structure instead of an electric motor or hydraulic power unit.",
    steps: [
      { title: "Position the sheet", text: "Place the sheet flat on the working table and align the cut line or back-gauge setting." },
      { title: "Keep both hands available", text: "Support and position the workpiece while keeping hands away from the blade and hold-down area." },
      { title: "Apply pedal force", text: "Press the full-width foot pedal to move the guided cutting beam through one controlled stroke." },
      { title: "Return for the next cut", text: "The tension-spring mechanism helps return the cutting assembly after the pedal is released." },
    ],
  },
  problems: {
    eyebrow: "Workshop Needs",
    title: "What Problems This Machine Solves",
    items: [
      { title: "No suitable electrical supply", text: "Manual operation supports sheet cutting in small shops or work areas where a powered shear is unnecessary." },
      { title: "Hand tools produce uneven edges", text: "A fixed blade, guided cutting beam and stable frame support straighter cuts than basic handheld cutting methods." },
      { title: "Short runs do not justify powered equipment", text: "Simple setup suits samples, maintenance parts and intermittent light-gauge blank preparation." },
      { title: "Operators need both hands for positioning", text: "The pedal controls the cut so the sheet can be supported, aligned and held before the stroke." },
    ],
  },
  reasons: {
    eyebrow: "Buyer Fit",
    title: "Why Choose Our Foot Shearing Machine",
    intro:
      "This manual foot shear for sheet metal focuses on simple operation, convenient material positioning and reliable straight cutting of suitable light-gauge material.",
    items: [
      { title: "No electricity required", text: "The cutting stroke is completed by foot power and mechanical linkage, without an electric motor, hydraulic power unit or compressed-air supply." },
      { title: "Hands remain free", text: "Because the pedal controls the cutting action, the operator can use both hands to support and align larger or flexible thin sheets." },
      { title: "Simple mechanical operation", text: "The direct mechanical cutting mechanism avoids the extra motor, pump and hydraulic components found on powered shears." },
      { title: "Stable material holding", text: "Hold-down devices can secure the sheet as the blades move through the material, helping reduce unwanted movement during cutting." },
      { title: "Convenient repeat positioning", text: "Front gauges and back gauges can help position the sheet before cutting, especially for repeated parts of the same size." },
      { title: "Rigid construction", text: "Quality foot shears use a stable frame to support the bed and cutting head, helping control deflection and blade alignment." },
      { title: "Suitable for light-gauge sheet", text: "The machine is well suited to thin mild steel, galvanized sheet, aluminum and other compatible sheet materials within confirmed capacity." },
      { title: "Practical small-batch choice", text: "HVAC shops, repair teams, training workshops and intermittent production can cut straight blanks without investing in a powered shear." },
    ],
  },
  materials: {
    eyebrow: "Material Review",
    title: "Materials Suitable for Foot Shearing",
    note:
      "Actual cutting capacity depends on material type, grade, tensile strength, hardness or temper, sheet thickness, cutting length, blade condition and blade clearance. The rated thickness for mild steel should not be applied automatically to every metal.",
    items: [
      { title: "Mild steel sheet", text: "A foot shear for mild steel can prepare panels, covers, brackets, enclosures and other thin sheet components within confirmed capacity.", image: "/products/foot-shear-content/material-mild-steel.webp", alt: "Real mild steel sheet being processed on an industrial laser cutting table" },
      { title: "Galvanized steel sheet", text: "A foot shear for galvanized steel can prepare suitable thin sheet for HVAC ductwork, ventilation parts, flashing and covers within rated capacity.", image: "/products/foot-shear-content/material-galvanized-steel.webp", alt: "Close-up real photograph of the crystalline surface pattern on galvanized steel sheet" },
      { title: "Aluminum sheet", text: "Can be used for aluminum panels, covers, housings, decorative parts and general fabrication after alloy and temper confirmation.", image: "/products/foot-shear-content/material-aluminum.webp", alt: "Real formed aluminum sheet panels used on a modern architectural metal facade" },
      { title: "Stainless steel sheet", text: "A foot shear for stainless steel requires grade and thickness review because allowable thickness is normally lower than mild steel as cutting force is higher.", image: "/products/foot-shear-content/material-stainless-steel.webp", alt: "Real stainless steel sheet being measured by a worker in a metal processing plant" },
      { title: "Copper sheet", text: "Soft copper sheet can be processed within appropriate capacity for electrical work, decorative fabrication, roofing and flashing.", image: "/products/foot-shear-content/material-copper.webp", alt: "Real copper sheet being formed into a decorative circular metal panel at a workbench" },
      { title: "Brass sheet", text: "Soft and half-hard brass sheets may be sheared when thickness and temper are suitable for the selected machine.", image: "/products/foot-shear-content/material-brass.webp", alt: "Real formed brass-colored sheet metal used as an industrial-style lighting cover" },
    ],
  },
  features: {
    eyebrow: "Machine Construction",
    title: "Key Machine Features",
    items: [
      { title: "Full-width foot pedal", text: "Provides a broad operating position across the front of the machine." },
      { title: "Sliding guide rails", text: "Guide the cutting movement through the manual shearing stroke." },
      { title: "Tension-spring linkage", text: "The fixed sliding-fulcrum structure is designed to reduce required pedal effort and return the mechanism." },
      { title: "Optional hold-down spring", text: "Helps control suitable sheet during straight-line cutting when fitted to the selected configuration." },
      { title: "Front and back gauges", text: "Assist material positioning before cutting and support repeat workpiece dimensions in short batches." },
      { title: "9CrSi blade material", text: "Documented blade construction for durable cutting edges and routine regrinding when required." },
    ],
  },
  mechanism: {
    eyebrow: "Operating Principle",
    title: "How the Foot Pedal Mechanism Works",
    imageAlt: "Q11 foot operated shearing machine with manual pedal linkage",
    paragraphs: [
      "The operator presses the long front pedal. Side linkages transfer this motion to the upper cutting beam, which travels along the sliding guides. The upper blade crosses the fixed lower blade at the documented shearing angle to cut the positioned sheet.",
      "The tension spring assists the linkage and returns the beam after the stroke. This foot pedal shearing machine therefore completes one cut using mechanical movement only. Operators must keep hands clear of the blade and hold-down area, follow the supplied safety instructions and never exceed the confirmed capacity.",
    ],
    labels: ["Foot pedal", "Side linkage", "Tension spring", "Guided cutting beam", "Upper and lower blades", "Working table"],
  },
  technical: {
    eyebrow: "Verified Product Data",
    title: "Technical Specifications",
    note:
      "The Q11 values below are the existing product parameters. The 1.0 mm entry must not be treated as a universal capacity for every metal; material grade, tensile strength and condition affect the permissible cut.",
  },
  models: {
    eyebrow: "Model Range",
    title: "Available Q11 Foot Shear Models",
    intro:
      "All three verified models use the same documented 1°30′ shearing angle and 1.0 mm nominal table value. Choose working width around the largest sheet blank, then confirm material-specific capacity before ordering.",
  },
  applications: {
    eyebrow: "Production Use",
    title: "Application Industries",
    items: [
      { title: "HVAC and Duct Fabrication", text: "Cuts galvanized steel, aluminum and other thin sheet used in ductwork, ventilation panels, covers and related parts.", image: "/products/foot-shear-content/application-hvac-duct.webp", alt: "Real installed sheet-metal HVAC ducts in a commercial building service corridor" },
      { title: "General Sheet Metal Fabrication", text: "Prepares blanks, trims sheets and cuts material before bending, forming, punching or welding.", image: "/products/foot-shear-content/application-general-fabrication.webp", alt: "Real workers carrying out general metal fabrication inside an industrial workshop" },
      { title: "Repair and Maintenance Workshops", text: "A practical sheet metal cutting machine for small workshop teams making replacement panels, covers, guards, brackets and repair components.", image: "/products/foot-shear-content/application-repair-maintenance.webp", alt: "Real maintenance technician repairing a metal component at a workshop bench" },
      { title: "Automotive Body and Panel Work", text: "Prepares body panels, patch panels, floor sections and other light-gauge repair parts within rated capacity.", image: "/products/foot-shear-content/application-automotive-body.webp", alt: "Real automotive body technician working on a metal vehicle floor panel" },
      { title: "Prototyping and Custom Fabrication", text: "Supports different sheet sizes in small quantities before material moves to bending, rolling or other forming processes.", image: "/products/foot-shear-content/application-prototyping.webp", alt: "Real custom fabrication workshop with technicians measuring and preparing components" },
      { title: "Educational and Training Workshops", text: "Helps teach sheet positioning, measuring and straight-line shearing techniques through a visible mechanical process.", image: "/products/foot-shear-content/application-training-workshop.webp", alt: "Real vocational metalworking instructor guiding a student during practical welding training" },
      { title: "Small-Batch Production", text: "This manual sheet metal cutting machine fits workshops that make varied part sizes rather than one continuous high-speed production run.", image: "/products/foot-shear-content/application-small-batch.webp", alt: "Real worker completing small-batch metal fabrication inside a compact workshop" },
      { title: "Light Metalworking", text: "Provides a flexible manual metal shear for thin-sheet preparation where simple operation matters more than maximum cutting speed.", image: "/products/foot-shear-content/application-light-metalworking.webp", alt: "Real craft worker carrying out detailed light metalworking at a workshop machine" },
    ],
  },
  comparison: {
    eyebrow: "Equipment Comparison",
    title: "Foot Shear vs Electric Shearing Machine",
    intro:
      "For buyers comparing a sheet metal foot shear with powered equipment, neither drive type is universally better. Match the machine to material, daily volume, required repeatability and available workshop services.",
    rows: [
      { label: "Power source", foot: "Manual pedal force; no electricity", electric: "Electric motor and controls" },
      { label: "Operation", foot: "One controlled manual stroke", electric: "Powered repetitive cutting cycle" },
      { label: "Production volume", foot: "Small-batch, intermittent and flexible work", electric: "Regular small- and medium-batch work" },
      { label: "Maintenance", foot: "Mechanical inspection and blade care", electric: "Mechanical plus motor, drive and electrical care" },
      { label: "Cutting application", foot: "Suitable light-gauge sheet", electric: "Model-dependent light to medium sheet" },
      { label: "Workshop requirement", foot: "Floor space and safe operating clearance", electric: "Floor space, safe clearance and electrical supply" },
      { label: "Investment", foot: "Lower-complexity entry equipment", electric: "Higher initial system complexity for more output" },
      { label: "Automation level", foot: "Manual", electric: "Powered; model-dependent controls" },
    ],
    linkText: "View the compact electric shearing machine for higher daily cutting output.",
    linkHref: "/products/compact-electric-shearing-machine",
  },
  selection: {
    eyebrow: "Purchasing Checklist",
    title: "How to Choose the Right Foot Shearing Machine",
    intro:
      "Before asking a foot shear machine supplier for a quotation, prepare the six production details below. They determine whether a Q11 foot shear or a powered shearing machine is the safer fit.",
    items: [
      { title: "Material", text: "State the metal grade or alloy, not only a general material name." },
      { title: "Thickness", text: "Provide normal and maximum thickness for every material you intend to cut." },
      { title: "Maximum cutting width", text: "Select a 1000, 1300 or 1500 mm working width around the largest required blank." },
      { title: "Daily production volume", text: "Estimate cuts per shift; higher output may justify an electric shearing machine." },
      { title: "Required accuracy", text: "Share finished-size tolerance and whether repeat back-gauge positioning is needed." },
      { title: "Workshop space", text: "Allow safe front and rear material handling clearance as well as the machine footprint." },
    ],
    hydraulicIntro:
      "If your plate is thicker, higher-strength or outside the confirmed Q11 range, compare a hydraulic shearing machine instead of exceeding manual shear capacity.",
  },
  quality: {
    eyebrow: "Order Confirmation",
    title: "Manufacturing Details and Quality Control Points",
    intro:
      "A reliable order starts with correct specifications. As a foot shearing machine manufacturer serving export buyers, ZYRON confirms the model and requested configuration against the submitted material and working width.",
    items: [
      { title: "Frame and table review", text: "Check the assembled rigid frame, working table and installation points before shipment." },
      { title: "Blade and clearance review", text: "Confirm documented 9CrSi blades, fastening condition and model-appropriate blade setting." },
      { title: "Pedal and linkage movement", text: "Check pedal travel, side linkages, sliding guides and spring return through a complete manual stroke." },
      { title: "Parameter confirmation", text: "Match the nameplate/model, working width, nominal table values and overall dimensions to the order." },
      { title: "Packing requirements", text: "Confirm export packing and shipment details for the destination and handling method." },
      { title: "Operating handover", text: "Provide the operator with model documentation, safety instructions and routine maintenance guidance." },
    ],
  },
  faqs: {
    eyebrow: "Buyer Questions",
    title: "Foot Operated Shearing Machine FAQ",
    items: [
      { question: "What is a foot operated shearing machine?", answer: "It is a manual sheet metal shearing machine that uses pedal force, mechanical linkages and a guided blade beam to make straight cuts in suitable thin sheet. It is commonly selected for light, intermittent workshop cutting." },
      { question: "How does a foot shearing machine work?", answer: "The operator positions the sheet and presses the foot pedal. Linkages transfer the motion to the upper cutting beam, the blade passes the fixed lower blade, and the tension spring assists the return after the stroke." },
      { question: "Does a foot shear require electricity?", answer: "No. The Q11 foot shear uses manual mechanical force and does not require an electric motor or hydraulic power unit for the cutting stroke." },
      { question: "What materials can a foot shear cut?", answer: "Suitable thin mild steel, galvanized steel and aluminum may be considered. Actual capacity depends on material grade, tensile strength, thickness, sheet condition and the selected model." },
      { question: "Can a foot shear cut stainless steel?", answer: "Possibly, but stainless steel generally requires more cutting force than mild steel at the same thickness. Send the exact grade and thickness so the manufacturer can confirm whether the foot shear is appropriate." },
      { question: "What thickness can a foot shearing machine cut?", answer: "The current Q11 table lists 1.0 mm for the three models, but this is not a universal value for every metal. Confirm material-specific capacity before ordering or cutting." },
      { question: "What is the difference between a foot shear and an electric shear?", answer: "A foot shear uses one manually powered pedal stroke and suits intermittent light-gauge work. An electric shear uses a motor-driven cycle and is generally more suitable for regular batches and higher daily output." },
      { question: "Which foot shear model should I choose?", answer: "Choose among the verified 1000, 1300 and 1500 mm working widths according to maximum blank size. Then confirm material, thickness, required accuracy, daily cuts and available handling space." },
      { question: "Can the machine be customized?", answer: "Requested configuration, color, identification and packing can be reviewed for an order, but available changes depend on the selected model. No customization should be assumed until it is confirmed in writing." },
      { question: "How can I request a quotation?", answer: "Send the material grade, normal and maximum thickness, required cutting width, daily production volume, destination country and any configuration request. The sales engineer can then confirm the model and quotation." },
    ],
  },
  related: {
    eyebrow: "Related Equipment",
    title: "Compare the Complete Shearing Machine Range",
    items: [
      { title: "Shearing Machines", text: "Review manual, electric and hydraulic sheet cutting equipment in one product family.", href: "/products/series/shearing-machines", anchor: "View all shearing machines" },
      { title: "Compact Electric Shear", text: "Consider powered cutting when daily output is higher than practical manual operation.", href: "/products/compact-electric-shearing-machine", anchor: "Compact electric shearing machine" },
      { title: "Hydraulic Swing Beam Shear", text: "Compare a hydraulic option for higher cutting capacity and production requirements.", href: "/products/hydraulic-swing-beam-shear", anchor: "Hydraulic swing beam shearing machine" },
      { title: "Hydraulic Guillotine Shear", text: "Review guillotine cutting for heavier plate and more demanding straight-line work.", href: "/products/hydraulic-guillotine-shear", anchor: "Hydraulic guillotine shearing machine" },
    ] satisfies readonly FootShearLink[],
  },
  cta: {
    eyebrow: "Manufacturer Quotation",
    title: "Request a Foot Shear Quotation",
    intro:
      "If you are comparing a foot shearing machine manufacturer, foot shear machine supplier or foot shear machine for sale, send the real workpiece data first. We will confirm whether this foot operated sheet metal shearing machine matches your production before preparing the offer.",
    note:
      "Please include material grade, thickness, maximum cutting width, daily quantity, destination and required configuration.",
  },
} as const;
