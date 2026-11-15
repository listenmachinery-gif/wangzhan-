import Image from "next/image";

import { SectionShell } from "@/components/products/modules/SectionShell";
import type { CardCollectionData } from "@/components/products/modules/types";
import type { ProductModuleType } from "@/lib/product-modules/types";

export function CardCollectionModule({ type, data }: { type: ProductModuleType; data: CardCollectionData }) {
  return (
    <SectionShell type={type} eyebrow={data.eyebrow} title={data.title} paragraphs={data.paragraphs} dark={type === "PROBLEMS" || type === "MANUFACTURER_SUPPORT"}>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {data.items.map((item) => <article key={item.title} className="border border-current/15 p-6">{item.image ? <Image src={item.image} alt={item.alt ?? item.title} width={720} height={480} className="mb-5 aspect-[3/2] w-full object-cover" /> : null}<h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-3 leading-7 opacity-75">{item.text}</p></article>)}
      </div>
    </SectionShell>
  );
}
