import ShearingSolutionPage from "@/components/ShearingSolutionPage";
import { energySavingElectricShearPageContent } from "@/data/energy-saving-electric-shear-page";
import type { Product } from "@/data/products";

type EnergySavingElectricShearSolutionPageProps = {
  product: Product;
};

export default function EnergySavingElectricShearSolutionPage({
  product,
}: EnergySavingElectricShearSolutionPageProps) {
  return (
    <ShearingSolutionPage
      product={product}
      content={energySavingElectricShearPageContent}
    />
  );
}
