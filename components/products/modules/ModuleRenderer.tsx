import Link from "next/link";

import { CardCollectionModule } from "@/components/products/modules/CardCollectionModule";
import { GalleryModule } from "@/components/products/modules/GalleryModule";
import { HeroModule } from "@/components/products/modules/HeroModule";
import { SectionShell } from "@/components/products/modules/SectionShell";
import { ComparisonTableModule, TechnicalTableModule } from "@/components/products/modules/TableModule";
import type { CardCollectionData, ComparisonData, EditorialData, GalleryData, HeroData, TableData } from "@/components/products/modules/types";
import type { ProductModule } from "@/lib/product-modules/types";

const galleries = new Set(["PRODUCT_SHOWCASE", "DETAIL_GALLERY", "OPTION_CAROUSEL", "MATERIAL_GALLERY", "INDUSTRY_GALLERY"]);
const cards = new Set(["PROBLEMS", "PROCESS", "APPLICATIONS", "ADVANTAGES", "STRUCTURE", "WORKFLOW", "MANUFACTURER_SUPPORT"]);

export function ModuleRenderer({ productModule }: { productModule: ProductModule<unknown> }) {
  const { type, data } = productModule;
  if (type === "HERO") return <HeroModule data={data as HeroData} />;
  if (galleries.has(type)) return <GalleryModule type={type} data={data as GalleryData} />;
  if (cards.has(type)) return <CardCollectionModule type={type} data={data as CardCollectionData} />;
  if (type === "TECHNICAL") return <TechnicalTableModule type={type} data={data as TableData} />;
  if (type === "COMPARISON" || type === "ENERGY_COMPARISON") return <ComparisonTableModule type={type} data={data as ComparisonData} />;

  if (type === "MODEL_CARDS") {
    const modelData = data as EditorialData & { items: Array<{ name: string; description?: string; specs: Array<{ label: string; value: string; unit?: string }> }> };
    return <SectionShell type={type} eyebrow={modelData.eyebrow} title={modelData.title} paragraphs={modelData.paragraphs}><div className="mt-10 grid gap-5 lg:grid-cols-3">{modelData.items.map((item) => <article key={item.name} className="border border-neutral-200 p-6"><h3 className="text-xl font-semibold">{item.name}</h3>{item.description ? <p className="mt-3 text-neutral-600">{item.description}</p> : null}<dl className="mt-5 space-y-3">{item.specs.map((spec) => <div key={spec.label} className="flex justify-between gap-4 border-b pb-2"><dt>{spec.label}</dt><dd className="font-semibold">{spec.value}{spec.unit ? ` ${spec.unit}` : ""}</dd></div>)}</dl></article>)}</div></SectionShell>;
  }

  if (type === "FAQ") {
    const faq = data as EditorialData & { items: Array<{ question: string; answer: string }> };
    const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
    return <SectionShell type={type} eyebrow={faq.eyebrow} title={faq.title} paragraphs={faq.paragraphs}><div className="mt-10 space-y-3">{faq.items.map((item) => <details key={item.question} className="border border-neutral-200 p-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 leading-7 text-neutral-600">{item.answer}</p></details>)}</div><script data-faq-schema type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /></SectionShell>;
  }

  if (type === "RELATED_LINKS") {
    const links = data as EditorialData & { items: Array<{ label: string; href: string; description?: string }> };
    return <SectionShell type={type} eyebrow={links.eyebrow} title={links.title} paragraphs={links.paragraphs}><nav aria-label={links.title} className="mt-8 flex flex-wrap gap-3">{links.items.map((item) => <Link key={item.href} href={item.href} className="border border-neutral-300 px-5 py-3 font-semibold">{item.label}</Link>)}</nav></SectionShell>;
  }

  if (type === "CTA") {
    const cta = data as EditorialData & { primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string }; requiredInfo?: string[] };
    return <SectionShell type={type} eyebrow={cta.eyebrow} title={cta.title} paragraphs={cta.paragraphs} dark><div className="mt-8 flex flex-wrap gap-3"><Link href={cta.primaryCta.href} className="bg-ignition px-6 py-3 font-semibold">{cta.primaryCta.label}</Link>{cta.secondaryCta ? <Link href={cta.secondaryCta.href} className="border border-white/40 px-6 py-3 font-semibold">{cta.secondaryCta.label}</Link> : null}</div></SectionShell>;
  }

  const editorial = data as EditorialData & { fit?: string[]; materials?: string[]; note?: string };
  return <SectionShell type={type} eyebrow={editorial.eyebrow} title={editorial.title} paragraphs={editorial.paragraphs}>{editorial.fit?.length ? <ul className="mt-7 list-disc space-y-2 pl-5">{editorial.fit.map((item) => <li key={item}>{item}</li>)}</ul> : null}{editorial.materials?.length ? <ul className="mt-7 flex flex-wrap gap-3">{editorial.materials.map((item) => <li key={item} className="border border-neutral-200 px-4 py-2">{item}</li>)}</ul> : null}{editorial.note ? <p className="mt-5 font-medium">{editorial.note}</p> : null}</SectionShell>;
}
