import ShearingSolutionPage from "@/components/ShearingSolutionPage";
import { hydraulicSwingBeamShearPageContent } from "@/data/hydraulic-swing-beam-shear-page";
import type { Product } from "@/data/products";

type HydraulicSwingBeamShearSolutionPageProps = {
  product: Product;
};

export default function HydraulicSwingBeamShearSolutionPage({
  product,
}: HydraulicSwingBeamShearSolutionPageProps) {
  return (
    <ShearingSolutionPage
      product={product}
      content={hydraulicSwingBeamShearPageContent}
    />
  );
}
