import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ElectricFoldingMachineSolutionPage from "@/components/ElectricFoldingMachineSolutionPage";
import ElectroHydraulicServoCncPressBrakeSolutionPage from "@/components/ElectroHydraulicServoCncPressBrakeSolutionPage";
import EnergySavingElectricShearSolutionPage from "@/components/EnergySavingElectricShearSolutionPage";
import ExchangeTableFiberLaserCuttingMachineSolutionPage from "@/components/ExchangeTableFiberLaserCuttingMachineSolutionPage";
import FootShearSolutionPage from "@/components/FootShearSolutionPage";
import HydraulicFoldingMachineSolutionPage from "@/components/HydraulicFoldingMachineSolutionPage";
import HydraulicSwingBeamShearSolutionPage from "@/components/HydraulicSwingBeamShearSolutionPage";
import HydraulicGuillotineShearSolutionPage from "@/components/HydraulicGuillotineShearSolutionPage";
import ManualFoldingMachineSolutionPage from "@/components/ManualFoldingMachineSolutionPage";
import NcHydraulicPressBrakeSolutionPage from "@/components/NcHydraulicPressBrakeSolutionPage";
import PneumaticFoldingMachineSolutionPage from "@/components/PneumaticFoldingMachineSolutionPage";
import ProductSolutionPage from "@/components/ProductSolutionPage";
import ReelShearBeadingSolutionPage from "@/components/ReelShearBeadingSolutionPage";
import SingleTableFiberLaserCuttingMachineSolutionPage from "@/components/SingleTableFiberLaserCuttingMachineSolutionPage";
import SmallElectricShearSolutionPage from "@/components/SmallElectricShearSolutionPage";
import TorsionBarCncPressBrakeSolutionPage from "@/components/TorsionBarCncPressBrakeSolutionPage";
import { getCategoryById, products } from "@/data/products";

type ProductDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return {};
  }

  if (product.id === "exchange-table-fiber-laser-cutting-machine") {
    const title =
      "Exchange-Table Fiber Laser Cutting Machine | High-efficiency Sheet Metal Cutting Solution";
    const description =
      "Exchange-table fiber laser cutting machine for high-efficiency sheet metal cutting, batch fabrication, stainless steel products, cabinet manufacturing and workshop production. Get a suitable fiber laser cutting solution based on your material, thickness and sheet size.";

    return {
      title,
      description,
      keywords: [
        "Exchange-Table Fiber Laser Cutting Machine",
        "Exchange Platform Fiber Laser Cutting Machine",
        "Dual Table Fiber Laser Cutting Machine",
        "Shuttle Table Fiber Laser Cutting Machine",
        "Fiber Laser Cutting Machine with Exchange Table",
        "Sheet Metal Fiber Laser Cutting Machine",
        "Metal Sheet Laser Cutting Machine",
        "CNC Fiber Laser Cutting Machine",
        "Sheet Metal Cutting Solution",
        "High Efficiency Fiber Laser Cutter",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Exchange-table fiber laser cutting machine for sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "electro-hydraulic-servo-cnc-press-brake") {
    const title =
      "Electro-Hydraulic Servo CNC Press Brake | Precision Sheet Metal Bending Solution";
    const description =
      "Electro-hydraulic servo CNC press brake for high-precision sheet metal bending, cabinet manufacturing, stainless steel products and workshop fabrication. Get a suitable CNC bending solution based on your material, thickness, bending length and drawing.";

    return {
      title,
      description,
      keywords: [
        "Electro-Hydraulic Servo CNC Press Brake",
        "Electro-Hydraulic CNC Press Brake",
        "Servo Hydraulic CNC Press Brake",
        "CNC Hydraulic Press Brake",
        "CNC Press Brake Machine",
        "Sheet Metal Bending Machine",
        "Sheet Metal Bending Solution",
        "Precision Sheet Metal Bending",
        "CNC Sheet Metal Bending Machine",
        "Hydraulic CNC Bending Machine",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Electro-hydraulic servo CNC press brake for precision sheet metal bending",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "nc-hydraulic-press-brake") {
    const title = "NC Hydraulic Press Brake | Sheet Metal Bending Solution";
    const description =
      "NC hydraulic press brake for cost-effective sheet metal bending, metal fabrication, cabinet manufacturing and workshop production. Get a suitable hydraulic bending solution based on your material, thickness and bending length.";

    return {
      title,
      description,
      keywords: [
        "NC Hydraulic Press Brake",
        "NC Press Brake Machine",
        "Hydraulic Press Brake",
        "Sheet Metal Bending Machine",
        "Metal Sheet Press Brake",
        "Torsion Bar Press Brake",
        "E21 Press Brake",
        "Sheet Metal Bending Solution",
        "Hydraulic Bending Machine",
        "Steel Plate Bending Machine",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "NC hydraulic press brake for sheet metal bending",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "torsion-bar-cnc-press-brake") {
    const title =
      "Torsion Bar CNC Press Brake | Cost-effective Sheet Metal Bending Solution";
    const description =
      "Torsion bar CNC press brake for cost-effective sheet metal bending, cabinet manufacturing, HVAC duct parts and workshop fabrication. Get a suitable CNC bending solution based on your material, thickness and bending length.";

    return {
      title,
      description,
      keywords: [
        "Torsion Bar CNC Press Brake",
        "Torsion Bar Press Brake",
        "CNC Torsion Bar Press Brake",
        "Torsion Axis Press Brake",
        "Hydraulic CNC Press Brake",
        "Sheet Metal Bending Machine",
        "Metal Sheet Press Brake",
        "CNC Sheet Metal Bending Machine",
        "Sheet Metal Bending Solution",
        "Steel Plate Bending Machine",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Torsion bar CNC press brake for sheet metal bending",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "electric-sheet-metal-folding-machine") {
    const title = "Electric Folding Machine | Sheet Metal Edge Bending Solution";
    const description =
      "Electric folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable electric sheet metal folding solution.";

    return {
      title,
      description,
      keywords: [
        "Electric Folding Machine",
        "Electric Sheet Metal Folding Machine",
        "Electric Sheet Metal Bender",
        "Electric Sheet Metal Brake",
        "Motorized Folding Machine",
        "Sheet Metal Edge Bending Machine",
        "HVAC Duct Folding Machine",
        "Electric Duct Folding Machine",
        "Sheet Metal Folding Solution",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Electric folding machine for sheet metal edge bending",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "manual-sheet-metal-folding-machine") {
    const title = "Manual Folding Machine | Sheet Metal Edge Bending Solution";
    const description =
      "Manual folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable manual sheet metal folding solution.";

    return {
      title,
      description,
      keywords: [
        "Manual Folding Machine",
        "Manual Sheet Metal Folding Machine",
        "Manual Sheet Metal Bender",
        "Manual Sheet Metal Brake",
        "Sheet Metal Hand Brake",
        "Hand Operated Folding Machine",
        "Manual Metal Folding Machine",
        "HVAC Duct Folding Machine",
        "Sheet Metal Edge Bending Machine",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Manual folding machine for sheet metal edge bending",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "pneumatic-sheet-metal-folding-machine") {
    const title =
      "Pneumatic Folding Machine | HVAC Duct Sheet Metal Folding Solution";
    const description =
      "Pneumatic folding machine for thin sheet metal bending, HVAC duct panel folding, galvanized sheet forming and rectangular air duct fabrication. Get a suitable air-driven folding solution.";

    return {
      title,
      description,
      keywords: [
        "Pneumatic Folding Machine",
        "Pneumatic Sheet Metal Folding Machine",
        "Pneumatic Sheet Metal Bender",
        "Pneumatic Sheet Metal Brake",
        "Pneumatic Duct Folding Machine",
        "HVAC Duct Folding Machine",
        "Pneumatic TDF Folding Machine",
        "Sheet Metal Edge Bending Machine",
        "Air Duct Folding Machine",
        "Sheet Metal Folding Solution",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Pneumatic folding machine for HVAC duct sheet metal folding",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "hydraulic-sheet-metal-folding-machine") {
    const title =
      "Hydraulic Folding Machine | Sheet Metal & HVAC Duct Folding Solution";
    const description =
      "Hydraulic folding machine for sheet metal edge bending, HVAC duct panel folding, long edge forming and workshop production. Get a suitable hydraulic sheet metal folding solution.";

    return {
      title,
      description,
      keywords: [
        "Hydraulic Folding Machine",
        "Hydraulic Sheet Metal Folding Machine",
        "Hydraulic Sheet Metal Bender",
        "Hydraulic Sheet Metal Brake",
        "Hydraulic Duct Folding Machine",
        "Hydraulic TDF Folding Machine",
        "HVAC Duct Folding Machine",
        "Sheet Metal Edge Bending Machine",
        "Hydraulic Metal Folding Machine",
        "Sheet Metal Folding Solution",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Hydraulic folding machine for sheet metal and HVAC duct panel folding",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "reel-shear-beading-machine") {
    const title =
      "Reel Shear Beading Machine | Sheet Metal Cutting and Beading Solution";
    const description =
      "Compact reel shear beading machine for thin sheet metal cutting, plate opening and reinforcement beading. Suitable for HVAC duct fabrication, ventilation duct workshops and light sheet metal processing.";

    return {
      title,
      description,
      keywords: [
        "Reel Shear Beading Machine",
        "Rolling Shear Beading Machine",
        "Sheet Metal Beading and Cutting Machine",
        "Duct Beading Machine",
        "HVAC Duct Beading Machine",
        "Sheet Metal Reinforcement Machine",
        "Thin Sheet Cutting and Beading Machine",
        "Duct Fabrication Machine",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Reel shear beading machine for sheet metal cutting and duct beading",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "foot-shear") {
    const title = "Foot Operated Shearing Machine | Sheet Metal Foot Pedal Shear | ZYRON";
    const description =
      "Foot operated shearing machine for thin sheet metal cutting, HVAC duct workshops, roofing sheet processing and small batch fabrication. Get a practical cutting solution from ZYRON Heavy Industry.";

    return {
      title,
      description,
      keywords: [
        "foot operated shearing machine",
        "foot pedal shear",
        "sheet metal cutting machine",
        "manual sheet metal shear",
        "thin sheet cutting solution",
        "HVAC duct fabrication",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Foot operated shearing machine for sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "compact-electric-shearing-machine") {
    const title =
      "Small Electric Shearing Machine | Compact Sheet Metal Cutting Solution | ZYRON";
    const description =
      "Small electric shearing machine for thin sheet metal cutting, HVAC duct fabrication, roofing sheet processing and small batch workshop production. Get a compact cutting solution from ZYRON Heavy Industry.";

    return {
      title,
      description,
      keywords: [
        "small electric shearing machine",
        "compact electric sheet metal shear",
        "sheet metal cutting machine",
        "electric shearing machine",
        "thin sheet cutting solution",
        "HVAC duct fabrication",
        "galvanized sheet cutting",
        "small workshop sheet metal cutting",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Small electric shearing machine for thin sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "energy-saving-electric-shearing-machine") {
    const title =
      "Energy-Saving Electric Shearing Machine | Thin Sheet Cutting Solution | ZYRON";
    const description =
      "Energy-saving electric shearing machine for thin sheet metal cutting, HVAC duct fabrication, galvanized sheet processing and daily workshop production. Get a lower-cost cutting solution from ZYRON Heavy Industry.";

    return {
      title,
      description,
      keywords: [
        "energy-saving electric shearing machine",
        "energy efficient sheet metal shear",
        "electric shearing machine",
        "sheet metal cutting machine",
        "thin sheet cutting solution",
        "galvanized sheet cutting",
        "HVAC duct fabrication",
        "low energy sheet metal cutting",
        "workshop shearing solution",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Energy-saving electric shearing machine for thin sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "hydraulic-swing-beam-shear") {
    const title =
      "Hydraulic Swing Beam Shearing Machine | Sheet Metal Cutting Solution";
    const description =
      "Reliable hydraulic swing beam shearing machine for sheet metal cutting, suitable for carbon steel, stainless steel, galvanized sheet, aluminum and general fabrication workshops.";

    return {
      title,
      description,
      keywords: [
        "hydraulic swing beam shearing machine",
        "hydraulic sheet metal shear",
        "sheet metal cutting machine",
        "metal plate shearing solution",
        "swing beam shear for fabrication workshop",
        "CNC hydraulic shearing machine",
        "hydraulic guillotine shear alternative",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Hydraulic swing beam shearing machine for sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "hydraulic-guillotine-shear") {
    const title =
      "Hydraulic Guillotine Shearing Machine | Sheet Metal Cutting Solution";
    const description =
      "Heavy-duty hydraulic guillotine shearing machine for straight cutting of mild steel, stainless steel, galvanized sheet and aluminum plate. Get a suitable sheet metal cutting solution for your workshop.";

    return {
      title,
      description,
      keywords: [
        "hydraulic guillotine shearing machine",
        "hydraulic guillotine shear",
        "CNC hydraulic guillotine shear",
        "sheet metal shearing machine",
        "metal plate cutting machine",
        "steel plate cutting solution",
        "sheet metal cutting solution",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Hydraulic guillotine shearing machine for sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  if (product.id === "single-table-fiber-laser-cutting-machine") {
    const title =
      "Single-Table Fiber Laser Cutting Machine | Sheet Metal Cutting Solution";
    const description =
      "Single-table fiber laser cutting machine for cost-effective sheet metal cutting, metal fabrication, stainless steel products, cabinet manufacturing and workshop production. Get a suitable fiber laser cutting solution based on your material, thickness and sheet size.";

    return {
      title,
      description,
      keywords: [
        "Single-Table Fiber Laser Cutting Machine",
        "Single Platform Fiber Laser Cutting Machine",
        "Open Type Fiber Laser Cutting Machine",
        "Sheet Metal Fiber Laser Cutting Machine",
        "Metal Sheet Laser Cutting Machine",
        "Fiber Laser Cutter for Metal Sheet",
        "CNC Fiber Laser Cutting Machine",
        "Sheet Metal Cutting Solution",
        "Steel Plate Laser Cutting Machine",
        "Stainless Steel Laser Cutting Machine",
      ],
      alternates: {
        canonical: `/products/${product.id}`,
      },
      openGraph: {
        title,
        description,
        url: `/products/${product.id}`,
        images: [
          {
            url: product.image,
            alt: "Single-table fiber laser cutting machine for sheet metal cutting",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [product.image],
      },
    };
  }

  return {
    title: `${product.name} | ZYRON Heavy Industry`,
    description: product.performanceFeatures ?? product.tagline,
    keywords: [product.name, product.categoryName, ...(product.seoTerms ?? [])],
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | ZYRON Heavy Industry`,
      description: product.performanceFeatures ?? product.tagline,
      url: `/products/${product.id}`,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ZYRON Heavy Industry`,
      description: product.performanceFeatures ?? product.tagline,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  if (product.id === "electric-sheet-metal-folding-machine") {
    return <ElectricFoldingMachineSolutionPage product={product} />;
  }

  if (product.id === "manual-sheet-metal-folding-machine") {
    return <ManualFoldingMachineSolutionPage product={product} />;
  }

  if (product.id === "pneumatic-sheet-metal-folding-machine") {
    return <PneumaticFoldingMachineSolutionPage product={product} />;
  }

  if (product.id === "hydraulic-sheet-metal-folding-machine") {
    return <HydraulicFoldingMachineSolutionPage product={product} />;
  }

  if (product.id === "electro-hydraulic-servo-cnc-press-brake") {
    return <ElectroHydraulicServoCncPressBrakeSolutionPage product={product} />;
  }

  if (product.id === "exchange-table-fiber-laser-cutting-machine") {
    return <ExchangeTableFiberLaserCuttingMachineSolutionPage product={product} />;
  }

  if (product.id === "nc-hydraulic-press-brake") {
    return <NcHydraulicPressBrakeSolutionPage product={product} />;
  }

  if (product.id === "torsion-bar-cnc-press-brake") {
    return <TorsionBarCncPressBrakeSolutionPage product={product} />;
  }

  if (product.id === "foot-shear") {
    return <FootShearSolutionPage product={product} />;
  }

  if (product.id === "compact-electric-shearing-machine") {
    return <SmallElectricShearSolutionPage product={product} />;
  }

  if (product.id === "energy-saving-electric-shearing-machine") {
    return <EnergySavingElectricShearSolutionPage product={product} />;
  }

  if (product.id === "hydraulic-swing-beam-shear") {
    return <HydraulicSwingBeamShearSolutionPage product={product} />;
  }

  if (product.id === "hydraulic-guillotine-shear") {
    return <HydraulicGuillotineShearSolutionPage product={product} />;
  }

  if (product.id === "reel-shear-beading-machine") {
    return <ReelShearBeadingSolutionPage product={product} />;
  }

  if (product.id === "single-table-fiber-laser-cutting-machine") {
    return <SingleTableFiberLaserCuttingMachineSolutionPage product={product} />;
  }

  const category = getCategoryById(product.categoryId);
  const relatedProducts = products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 3);

  if (!category) {
    notFound();
  }

  return (
    <ProductSolutionPage
      product={product}
      category={category}
      relatedProducts={relatedProducts}
    />
  );
}
