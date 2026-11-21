import { ModuleRenderer } from "@/components/products/modules/ModuleRenderer";
import { PageRenderer } from "@/components/page-builder/PageRenderer";
import SmallElectricShearSelector from "@/components/SmallElectricShearSelector";
import { SMALL_ELECTRIC_PRODUCT_LAYOUT_GROUPS } from "@/lib/product-modules/small-electric-template";
import type { ProductModule, ProductModuleType } from "@/lib/product-modules/types";
import type { PageNode, ProductPageSlotPlacement } from "@/lib/page-builder/schema";

export function StandardProductPage({ product, cmsSlots = {} }: { product: {
  slug: string;
  name: string;
  summary: string;
  modules: ProductModule<unknown>[];
  registeredWidget: string | null;
}; cmsSlots?: Partial<Record<ProductPageSlotPlacement, PageNode[]>> }) {
  const productUrl = `https://www.zyroncnc.com/products/${product.slug}`;
  const serialize = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");
  const visibleModules = product.modules.filter((item) => item.visible);
  return (
    <main data-standard-product={product.slug}>
      <script type="application/ld+json" data-product-schema dangerouslySetInnerHTML={{ __html: serialize({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.summary,
        url: productUrl,
        brand: { "@type": "Brand", name: "ZYRON" },
      }) }} />
      <script type="application/ld+json" data-breadcrumb-schema dangerouslySetInnerHTML={{ __html: serialize({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.zyroncnc.com/" },
          { "@type": "ListItem", position: 2, name: "Products", item: "https://www.zyroncnc.com/products" },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      }) }} />
      {SMALL_ELECTRIC_PRODUCT_LAYOUT_GROUPS.map((group) => {
        const moduleTypes: readonly ProductModuleType[] = group.moduleTypes;
        const modules = visibleModules
          .filter((item) => moduleTypes.includes(item.type))
          .sort((left, right) => left.position - right.position);
        const includesRegisteredWidget = group.id === "selection"
          && product.registeredWidget === "small-electric-selector";
        const slotName = group.id === "inquiry"
          ? "PRODUCT_BEFORE_INQUIRY"
          : `PRODUCT_AFTER_${group.id.toUpperCase()}` as ProductPageSlotPlacement;
        const slotNodes = cmsSlots[slotName] ?? [];

        if (modules.length === 0 && !includesRegisteredWidget && slotNodes.length === 0) return null;

        return (
          <section
            key={group.id}
            id={group.id}
            aria-label={group.label}
            data-product-layout-group={group.id}
          >
            {group.id === "inquiry" && slotNodes.length ? (
              <PageRenderer document={{ schemaVersion: 1, nodes: slotNodes }} />
            ) : null}
            {modules.map((productModule) => (
              <ModuleRenderer key={`${productModule.type}-${productModule.position}`} productModule={productModule} />
            ))}
            {includesRegisteredWidget ? (
              <section aria-label="Product configuration tool" className="bg-neutral-50 px-5 py-16 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-[1440px]"><SmallElectricShearSelector /></div>
              </section>
            ) : null}
            {group.id !== "inquiry" && slotNodes.length ? (
              <PageRenderer document={{ schemaVersion: 1, nodes: slotNodes }} />
            ) : null}
          </section>
        );
      })}
    </main>
  );
}
