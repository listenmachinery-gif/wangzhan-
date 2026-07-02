import ShearingSolutionPage from "@/components/ShearingSolutionPage";
import { footShearPageContent } from "@/data/foot-shear-page";
import type { Product } from "@/data/products";

type FootShearSolutionPageProps = {
  product: Product;
};

export default function FootShearSolutionPage({ product }: FootShearSolutionPageProps) {
  return <ShearingSolutionPage product={product} content={footShearPageContent} />;
}
