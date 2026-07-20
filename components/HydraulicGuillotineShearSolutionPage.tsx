import ShearingSolutionPage from "@/components/ShearingSolutionPage";
import { hydraulicGuillotineShearPageContent } from "@/data/hydraulic-guillotine-shear-page";
import type { Product } from "@/data/products";

type HydraulicGuillotineShearSolutionPageProps = {
  product: Product;
};

export default function HydraulicGuillotineShearSolutionPage({
  product,
}: HydraulicGuillotineShearSolutionPageProps) {
  return (
    <ShearingSolutionPage
      product={product}
      content={hydraulicGuillotineShearPageContent}
    />
  );
}
