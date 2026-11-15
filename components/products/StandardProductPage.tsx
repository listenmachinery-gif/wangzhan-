import { ModuleRenderer } from "@/components/products/modules/ModuleRenderer";
import SmallElectricShearSelector from "@/components/SmallElectricShearSelector";
import type { ProductModule } from "@/lib/product-modules/types";

export function StandardProductPage({ product }: { product: {
  slug: string;
  name: string;
  summary: string;
  modules: ProductModule<unknown>[];
  registeredWidget: string | null;
} }) {
  return (
    <main data-standard-product={product.slug}>
      {[...product.modules]
        .filter((item) => item.visible)
        .sort((left, right) => left.position - right.position)
        .map((productModule) => <ModuleRenderer key={productModule.type} productModule={productModule} />)}
      {product.registeredWidget === "small-electric-selector" ? (
        <section aria-label="Product configuration tool" className="bg-neutral-50 px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[1440px]"><SmallElectricShearSelector /></div>
        </section>
      ) : null}
    </main>
  );
}
