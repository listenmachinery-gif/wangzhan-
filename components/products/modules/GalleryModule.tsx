import Image from "next/image";

import { SectionShell } from "@/components/products/modules/SectionShell";
import type { GalleryData } from "@/components/products/modules/types";
import type { ProductModuleType } from "@/lib/product-modules/types";

export function GalleryModule({ type, data }: { type: ProductModuleType; data: GalleryData }) {
  return (
    <SectionShell type={type} eyebrow={data.eyebrow} title={data.title} paragraphs={data.paragraphs}>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.items.map((item) => (
          <figure key={`${item.image}:${item.title}`} className="overflow-hidden border border-neutral-200 bg-neutral-50">
            <Image src={item.image} alt={item.alt} width={960} height={640} className="aspect-[3/2] h-auto w-full object-cover" />
            <figcaption className="p-5"><h3 className="text-xl font-semibold">{item.title}</h3>{item.text ? <p className="mt-2 leading-7 text-neutral-600">{item.text}</p> : null}</figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
