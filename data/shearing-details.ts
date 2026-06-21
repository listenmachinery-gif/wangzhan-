export type TechnicalParameterTable = {
  columns: string[];
  rows: string[][];
};

export type ProductDetailContent = {
  performanceFeatures: string;
  advantages: string[];
  technicalParameters: TechnicalParameterTable;
};

export const shearingProductDetails: Partial<Record<string, ProductDetailContent>> = {
  "foot-operated-shearing-machine": {
    "performanceFeatures": "The foot-operated shearing machine features an attractive appearance and a novel structure. It uses sliding guide rails, and the foot-operated tension spring adopts a fixed sliding-fulcrum structure, reducing the operating force by two-thirds. The foot-operated shearing machine can be equipped with a hold-down spring, delivering high shearing quality. It is also lightweight and easy to move, and is widely used for manual shearing and blanking in the thin sheet metal industry. The blades of this machine are made of 9CrSi material, with durable cutting edges.",
    "advantages": [
      "No power required, energy-saving and cost-saving: The machine relies on foot-operated manual force to complete shearing, making it suitable for small-batch production, thin sheet cutting, shop processing, and on-site trimming.",
      "Step-to-shear operation, simple and easy to use: The shearing mechanism is driven by the foot pedal. It has a low operating threshold and allows ordinary workers to get started quickly.",
      "Labor-saving structural design: The foot-operated shear adopts a sliding-fulcrum tension spring structure, which can significantly reduce the required foot-pedal force.",
      "Stable shearing quality: Hold-down and back-gauge devices help secure the sheet, support dimensional positioning, and ensure straight-line shearing.",
      "Simple structure, durable and easy to maintain: The machine body has a relatively simple structure and is suitable for long-term use in thin metal sheet and sheet-metal cutting and blanking.",
      "Wide application range: It can be used for manual shearing and blanking of thin metal sheets, sheet-metal materials, plastic sheets, and other materials."
    ],
    "technicalParameters": {
      "columns": [
        "Model",
        "Shearing Thickness(mm)",
        "Shearing Width(mm)",
        "Shearing Angle(deg)",
        "Overall Dimensions(mm)"
      ],
      "rows": [
        [
          "Q11-1 x 1000",
          "1.0",
          "1000",
          "1 deg 30 min",
          "1200 x 650 x 950"
        ],
        [
          "Q11-1 x 1300",
          "1.0",
          "1300",
          "1 deg 30 min",
          "1500 x 650 x 950"
        ],
        [
          "Q11-1 x 1500",
          "1.0",
          "1500",
          "1 deg 30 min",
          "1800 x 650 x 950"
        ]
      ]
    }
  },
  "small-electric-shearing-machine": {
    "performanceFeatures": "The electric shearing machine adopts an all-steel welded structure and a guillotine-type lower drive principle. The motor and cycloidal pinwheel reducer are integrated, with a built-in brake device and chain drive. It consumes no power when not cutting. It features a reasonable design, easy operation, low energy consumption, and attractive appearance. It is suitable for processing and shearing steel plates below 2 mm. The machine blades are made of high-alloy tool steel, and the cutting edges are durable.",
    "advantages": [
      "All-steel welded machine body, solid and durable structure: The integral steel-plate welded structure improves machine-body rigidity and operating stability.",
      "Guillotine-type lower drive for more stable shearing: The guillotine shearing structure is suitable for thin-sheet blanking, with direct shearing action and reliable operation.",
      "Integrated motor and cycloidal pinwheel reducer for stable power: The motor, reducer, and brake device are integrated, and combined with chain drive, the structure is simple and maintenance is convenient.",
      "No power consumption when not cutting, saving energy and cost: The motor does not run before cutting, and the machine stops after the cut is completed, which can reduce energy consumption and noise.",
      "Simple operation and quick learning: The structure is intuitive and suitable for sheet-metal cutting scenarios such as storefront workshops, small processing plants, ventilation ducts, and advertising sheet-metal work.",
      "High-alloy blades with durable cutting edges: The blades are made of high-alloy tool steel and feature four-sided cutting edges, making them suitable for long-term cutting of metal sheets.",
      "Adjustable back gauge for better dimensional control: The adjustable back gauge is conducive to batch fixed-size shearing and improves blanking efficiency.",
      "Suitable for efficient blanking of various thin sheets: It is suitable for efficient shearing of iron sheets, galvanized sheets, aluminum sheets, stainless steel sheets, copper sheets, color steel tiles, epoxy boards, circuit boards, and other types of sheet material."
    ],
    "technicalParameters": {
      "columns": [
        "Model",
        "Max. Shearing Thickness(mm)",
        "Max. Shearing Width(mm)",
        "Shearing Angle(deg)",
        "Shearing Frequency(times/min)",
        "Back Gauge Travel(mm)",
        "Motor Power(kW)",
        "Overall Dimensions(mm)"
      ],
      "rows": [
        [
          "Q11G-2 x 600",
          "2",
          "600",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "1200 x 640 x 1100"
        ],
        [
          "Q11G-2 x 800",
          "2",
          "800",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "1400 x 640 x 1100"
        ],
        [
          "Q11G-2 x 1000",
          "2",
          "1000",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "1600 x 640 x 1100"
        ],
        [
          "Q11G-2 x 1300",
          "2",
          "1300",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "1900 x 640 x 1100"
        ],
        [
          "Q11G-2 x 1500",
          "2",
          "1500",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "2100 x 640 x 1100"
        ],
        [
          "Q11G-2 x 1600",
          "2",
          "1600",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "2200 x 640 x 1100"
        ],
        [
          "Q11G-1.5 x 2000",
          "1.5",
          "2000",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "2600 x 640 x 1100"
        ],
        [
          "Q11G-1.2 x 2500",
          "1.2",
          "2500",
          "1 deg 30 min",
          "30",
          "500",
          "3",
          "3100 x 640 x 1100"
        ]
      ]
    }
  },
  "energy-saving-electric-shearing-machine": {
    "performanceFeatures": "The electric shearing machine adopts an all-steel welded structure and a guillotine-type lower-drive transmission principle. The motor and cycloidal pinwheel reducer are integrated, with a built-in braking device and chain transmission. It consumes no power when not shearing. It features a rational design, simple operation, low energy consumption and an attractive appearance. It is suitable for processing and shearing steel plates under 6 mm. The machine blades are made of high-alloy tool steel, with cutting edges that are durable for long-term use.",
    "advantages": [
      "All-steel welded structure provides solid rigidity and stable operation.",
      "Guillotine-type lower-drive transmission supports reliable straight-line shearing.",
      "Integrated motor, cycloidal pinwheel reducer, braking device, and chain transmission simplify maintenance.",
      "No power consumption when not shearing helps reduce energy use and operating cost.",
      "Simple operation and low energy consumption make it practical for daily workshop production.",
      "High-alloy tool steel blades provide durable cutting edges for long-term use."
    ],
    "technicalParameters": {
      "columns": [
        "Model",
        "Max. Shearing Thickness(mm)",
        "Max. Shearing Width(mm)",
        "Shearing Angle(deg)",
        "Shearing Frequency(times/min)",
        "Backgauge Travel(mm)",
        "Motor Power(kW)",
        "Overall Dimensions(mm)"
      ],
      "rows": [
        [
          "Q11G-2 x 2000",
          "2",
          "3000",
          "1 deg 30 min",
          "30",
          "500",
          "4.5",
          "2600 x 1050 x 1200"
        ],
        [
          "Q11G-2 x 2500",
          "2",
          "3000",
          "1 deg 30 min",
          "30",
          "500",
          "5.5",
          "3100 x 1050 x 1200"
        ],
        [
          "Q11G-3 x 1300",
          "3",
          "1300",
          "1 deg 30 min",
          "30",
          "500",
          "4.5",
          "1900 x 1050 x 1200"
        ],
        [
          "Q11G-3 x 1500",
          "3",
          "1500",
          "1 deg 30 min",
          "30",
          "500",
          "4.5",
          "2100 x 1050 x 1200"
        ],
        [
          "Q11G-3 x 1600",
          "3",
          "1600",
          "1 deg 30 min",
          "30",
          "500",
          "4.5",
          "2200 x 1050 x 1200"
        ],
        [
          "Q11G-3 x 2000",
          "3",
          "2000",
          "1 deg 30 min",
          "30",
          "500",
          "5.5",
          "2600 x 1050 x 1200"
        ],
        [
          "Q11G-3 x 2500",
          "3",
          "2500",
          "1 deg 30 min",
          "30",
          "500",
          "5.5",
          "3100 x 1050 x 1200"
        ],
        [
          "Q11G-4 x 1300",
          "4",
          "1300",
          "1 deg 30 min",
          "30",
          "500",
          "5.5",
          "1900 x 1100 x 1200"
        ],
        [
          "Q11G-4 x 1500",
          "4",
          "1500",
          "1 deg 30 min",
          "30",
          "500",
          "5.5",
          "2100 x 1100 x 1200"
        ],
        [
          "Q11G-4 x 1600",
          "4",
          "1600",
          "1 deg 30 min",
          "30",
          "500",
          "5.5",
          "2200 x 1100 x 1200"
        ],
        [
          "Q11G-4 x 2000",
          "4",
          "2000",
          "1 deg 30 min",
          "30",
          "500",
          "7.5",
          "2600 x 1100 x 1200"
        ],
        [
          "Q11G-4 x 2500",
          "4",
          "2500",
          "1 deg 30 min",
          "30",
          "500",
          "7.5",
          "3100 x 1100 x 1200"
        ],
        [
          "Q11G-6 x 1300",
          "6",
          "1300",
          "1 deg 30 min",
          "30",
          "500",
          "7.5",
          "1900 x 1100 x 1200"
        ],
        [
          "Q11G-6 x 1600",
          "6",
          "1600",
          "1 deg 30 min",
          "30",
          "500",
          "7.5",
          "2200 x 1100 x 1200"
        ]
      ]
    }
  },
  "hydraulic-swing-beam-shearing-machine": {
    "performanceFeatures": "The hydraulic swing beam shearing machine is a hydraulic shearing device used for straight-line cutting and blanking of metal sheets. Common models include the QC12Y and QC12K series. It usually adopts an all-steel welded frame. The upper blade holder is driven by the hydraulic system to perform swing movement, shearing steel plates, stainless steel plates, aluminum plates, copper plates and other metal sheets. Compared with ordinary mechanical shearing machines, it runs more smoothly, provides greater shearing force, and is easier to operate. It is suitable for sheet metal processing, ventilation ducts, chassis and cabinets, decoration engineering, machinery manufacturing and other industries.",
    "advantages": [
      "All-steel welded frame, high strength and good rigidity: The QC12Y/QC12K hydraulic swing beam shearing machine adopts an all-steel welded structure to ensure machine stability and overall precision.",
      "Hydraulic transmission, smooth and reliable operation: The hydraulic system provides stable shearing force, making it suitable for continuous shearing of metal sheets and ensuring safer and more reliable operation.",
      "Swing beam shearing structure, smooth cutting and low maintenance cost: The swing upper blade holder completes shearing through a swing trajectory. The structure is relatively simple and suitable for processing thin to medium-thick sheets.",
      "Good cutting quality, neat and consistent cut edges: The hydraulic swing beam shearing machine has a smaller shearing angle, offering good cutting quality and consistency, and is suitable for batch sheet blanking.",
      "Convenient blade clearance adjustment: Equipped with a blade clearance adjustment mechanism, it can be quickly adjusted according to different sheet thicknesses to improve shearing precision.",
      "Backgauge positioning improves batch processing efficiency: Equipped with an E21S CNC system, backgauge control and repeat positioning functions, it is suitable for fixed-size batch shearing.",
      "Nitrogen cylinder return, fast and stable action: The QC12Y/QC12K hydraulic swing beam shearing machine uses hydraulic transmission and nitrogen cylinder return, offering convenient operation and reliable performance.",
      "High cost performance, suitable for general sheet metal processing: The swing beam shearing machine is an economical hydraulic shearing device that balances shearing efficiency, reliability and cost."
    ],
    "technicalParameters": {
      "columns": [
        "Model",
        "CuttingThickness(mm)",
        "CuttingWidth(mm)",
        "CuttingAngle(deg)",
        "MaterialStrength(kN/cm)",
        "BackgaugeTravel(mm)",
        "CuttingTimes(T/min)",
        "Main MotorPower(kW)",
        "Overall DimensionsL x W x H(mm)"
      ],
      "rows": [
        [
          "4 x 2500",
          "4",
          "2500",
          "1 deg30 min",
          "<=450",
          "20-600",
          "16",
          "4",
          "3040 x 1610 x 1620"
        ],
        [
          "4 x 3200",
          "4",
          "3200",
          "1 deg30 min",
          "<=450",
          "20-600",
          "14",
          "5.5",
          "3840 x 1610 x 1620"
        ],
        [
          "4 x 4000",
          "4",
          "4000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "10",
          "5.5",
          "4600 x 1700 x 1700"
        ],
        [
          "4 x 6000",
          "4",
          "6000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "8",
          "7.5",
          "6460 x 2100 x 3200"
        ],
        [
          "6 x 2500",
          "6",
          "2500",
          "1 deg30 min",
          "<=450",
          "20-600",
          "14",
          "7.5",
          "3040 x 1610 x 1620"
        ],
        [
          "6 x 3200",
          "6",
          "3200",
          "1 deg30 min",
          "<=450",
          "20-600",
          "12",
          "7.5",
          "3840 x 1610 x 1620"
        ],
        [
          "6 x 4000",
          "6",
          "4000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "8",
          "7.5",
          "4620 x 1750 x 1700"
        ],
        [
          "6 x 5000",
          "6",
          "5000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "6",
          "11",
          "5400 x 1800 x 1900"
        ],
        [
          "6 x 6000",
          "6",
          "6000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "5",
          "11",
          "6480 x 2100 x 2300"
        ],
        [
          "8 x 2500",
          "8",
          "2500",
          "1 deg30 min",
          "<=450",
          "20-600",
          "10",
          "11",
          "3040 x 1700 x 1700"
        ],
        [
          "8 x 3200",
          "8",
          "3200",
          "1 deg30 min",
          "<=450",
          "20-600",
          "8",
          "11",
          "3860 x 1700 x 1700"
        ],
        [
          "8 x 4000",
          "8",
          "4000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "8",
          "11",
          "4640 x 1700 x 1700"
        ],
        [
          "8 x 5000",
          "8",
          "5000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "8",
          "11",
          "5400 x 2100 x 2000"
        ],
        [
          "8 x 6000",
          "8",
          "6000",
          "1 deg30 min",
          "<=450",
          "20-600",
          "8",
          "11",
          "6480 x 2100 x 2350"
        ],
        [
          "10 x 2500",
          "10",
          "2500",
          "2 deg",
          "<=450",
          "20-600",
          "9",
          "15",
          "3040 x 1700 x 1700"
        ],
        [
          "10 x 3200",
          "10",
          "3200",
          "2 deg",
          "<=450",
          "20-600",
          "9",
          "15",
          "3860 x 1700 x 1700"
        ],
        [
          "10 x 4000",
          "10",
          "4000",
          "2 deg",
          "<=450",
          "20-600",
          "8",
          "15",
          "4650 x 2100 x 2000"
        ],
        [
          "10 x 6000",
          "10",
          "6000",
          "2 deg",
          "<=450",
          "20-1000",
          "5",
          "15",
          "6500 x 2100 x 2300"
        ],
        [
          "12 x 2500",
          "12",
          "2500",
          "2 deg",
          "<=450",
          "20-600",
          "9",
          "15",
          "3140 x 2150 x 2000"
        ],
        [
          "12 x 3200",
          "12",
          "3200",
          "2 deg",
          "<=450",
          "20-600",
          "9",
          "15",
          "3880 x 2150 x 2000"
        ],
        [
          "12 x 4000",
          "12",
          "4000",
          "2 deg",
          "<=450",
          "20-600",
          "8",
          "18.5",
          "4680 x 2150 x 2000"
        ],
        [
          "12 x 5000",
          "12",
          "5000",
          "2 deg",
          "<=450",
          "20-750",
          "6",
          "18.5",
          "5900 x 2150 x 2000"
        ],
        [
          "12 x 6000",
          "12",
          "6000",
          "2 deg",
          "<=450",
          "20-750",
          "5",
          "18.5",
          "6900 x 2600 x 2700"
        ],
        [
          "12 x 8000",
          "12",
          "8000",
          "2 deg",
          "<=450",
          "20-1000",
          "5",
          "18.5",
          "9000 x 3500 x 3500"
        ],
        [
          "16 x 2500",
          "16",
          "2500",
          "2 deg30 min",
          "<=450",
          "20-600",
          "9",
          "22",
          "3140 x 2150 x 2000"
        ],
        [
          "16 x 3200",
          "16",
          "3200",
          "2 deg30 min",
          "<=450",
          "20-600",
          "8",
          "22",
          "3880 x 2150 x 2000"
        ],
        [
          "16 x 4000",
          "16",
          "4000",
          "2 deg30 min",
          "<=450",
          "20-600",
          "8",
          "22",
          "4650 x 2150 x 2200"
        ],
        [
          "16 x 5000",
          "16",
          "5000",
          "2 deg30 min",
          "<=450",
          "20-750",
          "6",
          "22",
          "5900 x 2600 x 2700"
        ],
        [
          "16 x 6000",
          "16",
          "6000",
          "2 deg30 min",
          "<=450",
          "20-750",
          "5",
          "22",
          "6900 x 2700 x 2700"
        ],
        [
          "16 x 8000",
          "16",
          "8000",
          "2 deg30 min",
          "<=450",
          "20-1000",
          "5",
          "22",
          "9000 x 3500 x 3500"
        ],
        [
          "20 x 2500",
          "20",
          "2500",
          "3 deg",
          "<=450",
          "20-1000",
          "8",
          "22",
          "3440 x 2300 x 2500"
        ],
        [
          "20 x 3200",
          "20",
          "3200",
          "3 deg",
          "<=450",
          "20-1000",
          "8",
          "22",
          "4150 x 2350 x 2700"
        ],
        [
          "20 x 4000",
          "20",
          "4000",
          "3 deg",
          "<=450",
          "20-1000",
          "5",
          "22",
          "4850 x 2600 x 2700"
        ],
        [
          "20 x 6000",
          "20",
          "6000",
          "3 deg",
          "<=450",
          "20-1000",
          "4",
          "30",
          "6700 x 3000 x 3000"
        ],
        [
          "25 x 2500",
          "25",
          "2500",
          "3 deg",
          "<=450",
          "20-1000",
          "8",
          "37",
          "3200 x 2700 x 2900"
        ],
        [
          "25 x 3200",
          "25",
          "3200",
          "3 deg",
          "<=450",
          "20-1000",
          "5",
          "37",
          "4200 x 2700 x 2900"
        ],
        [
          "30 x 2500",
          "30",
          "2500",
          "3 deg",
          "<=450",
          "20-1000",
          "4",
          "37",
          "3300 x 2900 x 3000"
        ],
        [
          "30 x 3200",
          "30",
          "3200",
          "3 deg30 min",
          "<=450",
          "20-1000",
          "4",
          "40",
          "4200 x 2900 x 3200"
        ],
        [
          "40 x 2500",
          "40",
          "2500",
          "4 deg",
          "<=450",
          "20-1000",
          "3",
          "55",
          "3200 x 3300 x 3000"
        ],
        [
          "40 x 3200",
          "40",
          "3200",
          "4 deg",
          "<=450",
          "20-1000",
          "3",
          "55",
          "4300 x 3300 x 3200"
        ]
      ]
    }
  },
  "hydraulic-guillotine-shearing-machine": {
    "performanceFeatures": "The hydraulic guillotine shearing machine is a hydraulic shearing device used for straight-line cutting and blanking of metal plates. It is commonly used in sheet metal processing, machinery manufacturing, steel structure fabrication, stainless steel processing, cabinet and enclosure manufacturing, ventilation duct production, and other industries. The machine usually adopts an all-steel welded frame. The hydraulic system drives the upper blade holder to move downward in a straight line along the guide rail, and the backgauge positioning system realizes fixed-length plate cutting. Compared with a hydraulic swing beam shearing machine, the guillotine structure is more suitable for medium and thick plates, high-strength plates, and processing scenarios with higher requirements for cutting quality.",
    "advantages": [
      "All-steel welded frame, strong rigidity and good stability: The frame usually adopts an all-steel welded structure, and internal stress is relieved by vibration stress relief or heat treatment, making it suitable for stable cutting of medium and thick plates.",
      "Guillotine straight-line cutting for higher precision: The upper blade holder moves in an almost vertical straight line along the guide rail, making it more suitable than swing beam cutting for thick plates, high-strength plates, and high-precision blanking.",
      "Adjustable cutting angle for less plate deformation: The cutting angle can be adjusted according to plate thickness. This reduces deformation when cutting thin plates and lowers cutting resistance when cutting thick plates, providing a wider application range.",
      "Adjustable blade clearance for cleaner cuts: Proper blade clearance adjustment improves the sheared edge quality, reduces burrs, and improves processing consistency.",
      "Four-edge rectangular blades with long service life: Guillotine shearing machines commonly use rectangular blades. All four cutting edges can be used, helping reduce blade consumable costs.",
      "Hydraulic drive, smooth operation and low noise: The hydraulic system drives the cutting action with less impact and vibration, resulting in smoother operation and a quieter working environment.",
      "CNC backgauge for efficient batch blanking: The machine is equipped with a CNC system, electric backgauge, digital display, and positioning control, making it suitable for fixed-length batch cutting.",
      "Suitable for heavy-duty processing scenarios: It is especially suitable for medium and thick plates, stainless steel, high-strength steel, shipbuilding, steel structure fabrication, sheet metal processing, and other scenarios requiring high cutting precision and edge quality."
    ],
    "technicalParameters": {
      "columns": [
        "Model",
        "Cutting Thickness(mm)",
        "Cutting Length(mm)",
        "Angle Range(deg)",
        "Backgauge Stroke(mm)",
        "Overall Length(mm)",
        "Overall Width(mm)",
        "Overall Height(mm)",
        "Main Power(Kw)"
      ],
      "rows": [
        [
          "6 x 2500",
          "6",
          "2500",
          "1-3 deg",
          "750",
          "3140",
          "1740",
          "2040",
          "7.5"
        ],
        [
          "6 x 3200",
          "6",
          "3200",
          "1-3 deg",
          "750",
          "3750",
          "1770",
          "2150",
          "7.5"
        ],
        [
          "6 x 4000",
          "6",
          "4000",
          "1-3 deg",
          "750",
          "4830",
          "1840",
          "2150",
          "7.5"
        ],
        [
          "6 x 5000",
          "6",
          "5000",
          "1-3 deg",
          "750",
          "5830",
          "1840",
          "2150",
          "11"
        ],
        [
          "6 x 6000",
          "6",
          "6000",
          "1-3 deg",
          "750",
          "6480",
          "2100",
          "2300",
          "11"
        ],
        [
          "8 x 2500",
          "8",
          "2500",
          "1-3 deg",
          "750",
          "3040",
          "1700",
          "1700",
          "11"
        ],
        [
          "8 x 3200",
          "8",
          "3200",
          "1-3 deg",
          "750",
          "3860",
          "1700",
          "1700",
          "11"
        ],
        [
          "8 x 4000",
          "8",
          "4000",
          "1-3 deg",
          "750",
          "4640",
          "1700",
          "1700",
          "11"
        ],
        [
          "8 x 5000",
          "8",
          "5000",
          "1-3 deg",
          "750",
          "5400",
          "2400",
          "2000",
          "11"
        ],
        [
          "8 x 6000",
          "8",
          "6000",
          "1-3 deg",
          "750",
          "6480",
          "2100",
          "2350",
          "11"
        ],
        [
          "8 x 8000",
          "8",
          "8000",
          "1-3 deg",
          "750",
          "8580",
          "2130",
          "2350",
          "11"
        ],
        [
          "10 x 2500",
          "10",
          "2500",
          "1-3 deg",
          "750",
          "3040",
          "1800",
          "1700",
          "15"
        ],
        [
          "10 x 3200",
          "10",
          "3200",
          "1-3 deg",
          "750",
          "3850",
          "1830",
          "1900",
          "15"
        ],
        [
          "10 x 4000",
          "10",
          "4000",
          "1-3 deg",
          "750",
          "4650",
          "2100",
          "2000",
          "15"
        ],
        [
          "10 x 5000",
          "10",
          "5000",
          "1-3 deg",
          "750",
          "5750",
          "2100",
          "2000",
          "15"
        ],
        [
          "10 x 6000",
          "10",
          "6000",
          "1-3 deg",
          "750",
          "6500",
          "2100",
          "2300",
          "15"
        ],
        [
          "10 x 8000",
          "10",
          "8000",
          "1-3 deg",
          "750",
          "6800",
          "2100",
          "2300",
          "15"
        ],
        [
          "12 x 2500",
          "12",
          "2500",
          "1-3 deg",
          "750",
          "3285",
          "1830",
          "2390",
          "15"
        ],
        [
          "12 x 3200",
          "12",
          "3200",
          "1-3 deg",
          "750",
          "3855",
          "1830",
          "2390",
          "15"
        ],
        [
          "12 x 4000",
          "12",
          "4000",
          "1-3 deg",
          "1000",
          "4850",
          "1830",
          "2390",
          "18.5"
        ],
        [
          "12 x 6000",
          "12",
          "6000",
          "1-3 deg",
          "1000",
          "6850",
          "1930",
          "2650",
          "18.5"
        ],
        [
          "12 x 8000",
          "12",
          "8000",
          "1-3 deg",
          "1000",
          "8950",
          "2130",
          "2850",
          "18.5"
        ],
        [
          "12 x 9000",
          "12",
          "9000",
          "1-3 deg",
          "1000",
          "9980",
          "2300",
          "2950",
          "18.5"
        ],
        [
          "12 x 10000",
          "12",
          "10000",
          "1-3 deg",
          "1000",
          "11050",
          "2500",
          "3100",
          "18.5"
        ],
        [
          "16 x 2500",
          "16",
          "2500",
          "1-3 deg",
          "1000",
          "3440",
          "1940",
          "2830",
          "22"
        ],
        [
          "16 x 3200",
          "16",
          "3200",
          "1-3 deg",
          "1000",
          "4010",
          "1940",
          "2830",
          "22"
        ],
        [
          "16 x 4000",
          "16",
          "4000",
          "1-3 deg",
          "1000",
          "5010",
          "1980",
          "2830",
          "22"
        ],
        [
          "16 x 5000",
          "16",
          "5000",
          "1-3.5 deg",
          "1000",
          "5900",
          "2600",
          "2830",
          "22"
        ],
        [
          "16 x 6000",
          "16",
          "6000",
          "1-3.5 deg",
          "1000",
          "6900",
          "2700",
          "2830",
          "22"
        ],
        [
          "16 x 8000",
          "16",
          "8000",
          "1-3.5 deg",
          "1000",
          "8900",
          "2900",
          "3430",
          "22"
        ],
        [
          "20 x 2500",
          "20",
          "2500",
          "1-3.5 deg",
          "1000",
          "3440",
          "1980",
          "2830",
          "30"
        ],
        [
          "20 x 3200",
          "20",
          "3200",
          "1-3.5 deg",
          "1000",
          "4010",
          "1900",
          "2830",
          "30"
        ],
        [
          "20 x 4000",
          "20",
          "4000",
          "1-3.5 deg",
          "1000",
          "4850",
          "2600",
          "2900",
          "30"
        ],
        [
          "20 x 6000",
          "20",
          "6000",
          "1-3.5 deg",
          "1000",
          "6700",
          "3000",
          "3000",
          "30"
        ],
        [
          "30 x 2500",
          "30",
          "2500",
          "1-3.5 deg",
          "1000",
          "3440",
          "1900",
          "2830",
          "37"
        ],
        [
          "30 x 3200",
          "30",
          "3200",
          "1-3.5 deg",
          "1000",
          "4200",
          "1900",
          "3000",
          "37"
        ],
        [
          "40 x 2500",
          "40",
          "2500",
          "1-3.5 deg",
          "1000",
          "3440",
          "2000",
          "3000",
          "37"
        ]
      ]
    }
  }
};
