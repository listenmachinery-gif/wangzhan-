import ShearingSolutionPage from "@/components/ShearingSolutionPage";
import type { Product } from "@/data/products";
import { smallElectricShearPageContent } from "@/data/small-electric-shear-page";

type SmallElectricShearSolutionPageProps = {
  product: Product;
};

export default function SmallElectricShearSolutionPage({
  product,
}: SmallElectricShearSolutionPageProps) {
  return <ShearingSolutionPage product={product} content={smallElectricShearPageContent} />;
}
