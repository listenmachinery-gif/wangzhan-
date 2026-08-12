import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  CircleGauge,
  Factory,
  Gauge,
  Hammer,
  Layers3,
  Link2,
  PackageCheck,
  Ruler,
  ScanLine,
  ShieldCheck,
  Wrench,
  ZapOff,
} from "lucide-react";
import { footShearPageContent as content } from "@/data/foot-shear-page";
import type { Product } from "@/data/products";

type FootShearSolutionPageProps = {
  product: Product;
};

const siteUrl = "https://www.zyroncnc.com";
const sectionLabel = "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";
const cardIcons = [ScanLine, ZapOff, Layers3, Gauge, Wrench, ShieldCheck, Ruler, Factory];

function splitHeading(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);
  return match ? { label: match[1].trim(), unit: match[2] } : { label: normalized, unit: "" };
}

export default function FootShearSolutionPage({ product }: FootShearSolutionPageProps) {
  const parameters = product.technicalParameters;
  const rows = parameters?.rows ?? [];
  const productUrl = `${siteUrl}/products/${product.id}`;
  const organizationId = `${siteUrl}/#organization`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: content.title,
    description: content.hero.intro,
    image: [`${siteUrl}${product.image}`],
    url: productUrl,
    category: "Manual Sheet Metal Shearing Machine",
    model: "Q11 Series",
    brand: { "@type": "Brand", name: "ZYRON" },
    manufacturer: { "@id": organizationId },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Shearing Machines", item: `${siteUrl}/products/series/shearing-machines` },
      { "@type": "ListItem", position: 3, name: content.title, item: productUrl },
    ],
  };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: "ZYRON Heavy Industry",
    url: siteUrl,
    logo: `${siteUrl}/brand/zyron-logo.png`,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main data-foot-operated-shearing-machine-page className="max-w-full overflow-x-clip bg-white text-[#111315]">
      {[productSchema, breadcrumbSchema, organizationSchema, faqSchema].map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section data-section="hero" className="relative overflow-hidden bg-[#0B0D10] px-5 pb-16 pt-8 text-white sm:px-8 lg:pb-24 lg:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(118,185,0,0.16),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Link href="/products" className="transition hover:text-white">Products</Link>
            <span>/</span>
            <Link href="/products/series/shearing-machines" className="transition hover:text-white">Shearing Machines</Link>
            <span>/</span>
            <span className="text-zinc-300">Foot Shear</span>
          </nav>
          <div className="mt-10 grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <p className={sectionLabel}>{content.hero.eyebrow}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">{content.title}</h1>
              <h2 className="mt-6 max-w-xl text-xl font-semibold leading-snug text-[#A5E93A] sm:text-2xl">
                {content.hero.subtitle}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">{content.hero.intro}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {content.hero.valuePoints.map((point) => (
                  <div key={point} className="border-l-2 border-[#76B900] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-200">
                    {point}
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10] transition hover:bg-[#A5E93A]">
                  {content.hero.primaryCta}<ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a href="#available-models" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#A5E93A]">
                  {content.hero.secondaryCta}<ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="relative border border-white/10 bg-[#111519] p-5 sm:p-8">
              <div className="relative aspect-[1.46]">
                <Image src={product.image} alt={content.hero.imageAlt} fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-contain" />
              </div>
              <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-5 text-center">
                <div><p className="text-lg font-semibold">Q11</p><p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">Series</p></div>
                <div><p className="text-lg font-semibold">1.0 mm</p><p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">Nominal table value</p></div>
                <div><p className="text-lg font-semibold">1500 mm</p><p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">Max listed width</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section="overview" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className={sectionLabel}>{content.overview.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.overview.title}</h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-neutral-600">
              {content.overview.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
          <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
            {content.overview.facts.map((fact, index) => {
              const Icon = cardIcons[index];
              return <article key={fact.title} className="min-h-52 bg-[#F5F5F7] p-7"><Icon size={22} className="text-[#76B900]" aria-hidden="true" /><p className="mt-8 text-xs font-semibold uppercase tracking-widest text-neutral-500">{fact.title}</p><p className="mt-3 text-xl font-semibold">{fact.text}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section data-section="manual-cutting" className="bg-[#101316] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
            <div><p className={sectionLabel}>{content.noElectricity.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.noElectricity.title}</h2></div>
            <p className="max-w-2xl text-base leading-8 text-zinc-400 lg:justify-self-end">{content.noElectricity.intro}</p>
          </div>
          <div className="mt-12 grid gap-px bg-white/10 lg:grid-cols-4">
            {content.noElectricity.steps.map((step, index) => <article key={step.title} className="min-h-64 bg-[#101316] p-7"><p className="font-mono text-4xl text-[#76B900]">0{index + 1}</p><h3 className="mt-8 text-xl font-semibold">{step.title}</h3><p className="mt-4 text-sm leading-7 text-zinc-400">{step.text}</p></article>)}
          </div>
        </div>
      </section>

      <section data-section="problems" className="bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><p className={sectionLabel}>{content.problems.eyebrow}</p><h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">{content.problems.title}</h2><div className="mt-10 grid gap-px bg-neutral-200 md:grid-cols-2 xl:grid-cols-4">{content.problems.items.map((item,index)=>{const Icon=cardIcons[index];return <article key={item.title} className="min-h-64 bg-white p-7"><Icon size={23} className="text-[#76B900]" aria-hidden="true"/><h3 className="mt-8 text-xl font-semibold">{item.title}</h3><p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p></article>})}</div></div>
      </section>

      <section data-section="reasons" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]"><div><p className={sectionLabel}>{content.reasons.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.reasons.title}</h2><p className="mt-5 text-base leading-8 text-neutral-600">{content.reasons.intro}</p></div><div className="grid gap-px bg-neutral-200 sm:grid-cols-2">{content.reasons.items.map((item,index)=>{const Icon=cardIcons[index];return <article key={item.title} className="bg-white p-7"><Icon size={22} className="text-[#76B900]" aria-hidden="true"/><h3 className="mt-6 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p></article>})}</div></div></div>
      </section>

      <section data-section="materials" className="bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"><div><p className={sectionLabel}>{content.materials.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.materials.title}</h2></div><p className="border-l-4 border-[#76B900] bg-white p-5 text-sm leading-7 text-neutral-600">{content.materials.note}</p></div><div className="mt-10 grid gap-px bg-neutral-200 md:grid-cols-2 lg:grid-cols-4">{content.materials.items.map((item,index)=><article key={item.title} className="min-h-60 bg-white p-7"><span className="font-mono text-sm text-[#76B900]">0{index+1}</span><h3 className="mt-8 text-xl font-semibold">{item.title}</h3><p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p></article>)}</div></div>
      </section>

      <section data-section="features" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><p className={sectionLabel}>{content.features.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.features.title}</h2><div className="mt-10 grid gap-px bg-neutral-200 md:grid-cols-2 lg:grid-cols-3">{content.features.items.map((item,index)=>{const Icon=cardIcons[(index+2)%cardIcons.length];return <article key={item.title} className="min-h-56 bg-[#F5F5F7] p-7"><Icon size={22} className="text-[#76B900]" aria-hidden="true"/><h3 className="mt-7 text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p></article>})}</div></div>
      </section>

      <section data-section="mechanism" className="bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center"><div><p className={sectionLabel}>{content.mechanism.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.mechanism.title}</h2><div className="relative mt-9 aspect-[1.48] border border-white/10 bg-[#111519] p-6"><Image src="/products/shearing/foot-operated-shearing-machine-main.png" alt={content.mechanism.imageAlt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain p-5"/></div></div><div><div className="space-y-5 text-base leading-8 text-zinc-300">{content.mechanism.paragraphs.map(p=><p key={p}>{p}</p>)}</div><div className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">{content.mechanism.labels.map((label,index)=><div key={label} className="flex items-center gap-3 bg-[#0B0D10] px-4 py-4 text-sm font-semibold"><span className="font-mono text-[#76B900]">0{index+1}</span>{label}</div>)}</div></div></div>
      </section>

      <section data-section="technical" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-end"><div><p className={sectionLabel}>{content.technical.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.technical.title}</h2></div><p className="max-w-2xl text-sm leading-7 text-neutral-600 lg:justify-self-end">{content.technical.note}</p></div><div className="mt-10 max-w-full overflow-x-auto border border-neutral-200">{parameters?<table className="min-w-[980px] w-full border-collapse text-sm"><thead><tr>{parameters.columns.map(column=>{const heading=splitHeading(column);return <th key={column} className="bg-[#111315] px-5 py-5 text-center font-semibold text-white"><span className="block whitespace-nowrap">{heading.label}</span>{heading.unit?<span className="mt-1 block text-center text-[11px] text-[#A5E93A]">{heading.unit}</span>:null}</th>})}</tr></thead><tbody>{rows.map(row=><tr key={row[0]} className="border-b border-neutral-200 last:border-0">{row.map((cell,index)=><td key={`${row[0]}-${index}`} className={`whitespace-nowrap px-5 py-5 text-center ${index===0?"font-semibold text-neutral-950":"text-neutral-600"}`}>{cell}</td>)}</tr>)}</tbody></table>:<p className="p-6 text-neutral-600">Contact ZYRON for confirmed model specifications.</p>}</div></div>
      </section>

      <section id="available-models" data-section="models" className="scroll-mt-24 bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><p className={sectionLabel}>{content.models.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.models.title}</h2><p className="mt-5 max-w-3xl text-base leading-8 text-neutral-600">{content.models.intro}</p><div className="mt-10 grid gap-px bg-neutral-200 lg:grid-cols-3">{rows.map(row=><article key={row[0]} className="bg-white p-7"><p className="text-xs font-semibold uppercase tracking-widest text-[#76B900]">Q11 Series</p><h3 className="mt-4 text-2xl font-semibold">{row[0]}</h3><dl className="mt-7 divide-y divide-neutral-200">{parameters?.columns.slice(1).map((column,index)=><div key={column} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm"><dt className="text-neutral-500">{splitHeading(column).label}</dt><dd className="font-semibold text-neutral-950">{row[index+1]} {splitHeading(column).unit}</dd></div>)}</dl></article>)}</div></div>
      </section>

      <section data-section="applications" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><p className={sectionLabel}>{content.applications.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.applications.title}</h2><div className="mt-10 grid gap-px bg-neutral-200 md:grid-cols-2 lg:grid-cols-3">{content.applications.items.map((item,index)=>{const Icon=cardIcons[index];return <article key={item.title} className="min-h-56 bg-white p-7"><Icon size={22} className="text-[#76B900]" aria-hidden="true"/><h3 className="mt-7 text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p></article>})}</div></div>
      </section>

      <section data-section="comparison" className="bg-[#101316] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><p className={sectionLabel}>{content.comparison.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.comparison.title}</h2><p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">{content.comparison.intro}</p><div className="mt-10 max-w-full overflow-x-auto border border-white/10"><table className="min-w-[820px] w-full border-collapse text-sm"><thead><tr><th className="bg-[#15191D] px-5 py-5 text-left">Selection factor</th><th className="bg-[#76B900] px-5 py-5 text-left text-[#0B0D10]">Foot Operated Shear</th><th className="bg-[#15191D] px-5 py-5 text-left">Electric Shearing Machine</th></tr></thead><tbody>{content.comparison.rows.map(row=><tr key={row.label} className="border-b border-white/10 last:border-0"><th className="whitespace-nowrap px-5 py-5 text-left font-semibold text-white">{row.label}</th><td className="px-5 py-5 leading-7 text-zinc-200">{row.foot}</td><td className="px-5 py-5 leading-7 text-zinc-400">{row.electric}</td></tr>)}</tbody></table></div><Link href={content.comparison.linkHref} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#A5E93A] hover:text-white">{content.comparison.linkText}<ArrowRight size={16} aria-hidden="true"/></Link></div>
      </section>

      <section data-section="selection" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]"><div><p className={sectionLabel}>{content.selection.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.selection.title}</h2><p className="mt-5 text-base leading-8 text-neutral-600">{content.selection.intro}</p></div><div className="grid gap-px bg-neutral-200 sm:grid-cols-2">{content.selection.items.map((item,index)=><article key={item.title} className="bg-[#F5F5F7] p-7"><span className="font-mono text-[#76B900]">0{index+1}</span><h3 className="mt-6 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p></article>)}</div></div><div className="mt-10 flex flex-col gap-4 border-l-4 border-[#76B900] bg-[#F5F5F7] p-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-4xl text-sm leading-7 text-neutral-700">{content.selection.hydraulicIntro}</p><Link href="/products/hydraulic-swing-beam-shear" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-neutral-950 hover:text-[#568600]">Compare hydraulic shearing machine<ArrowRight size={16} aria-hidden="true"/></Link></div></div>
      </section>

      <section data-section="quality" className="bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl"><div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"><div><p className={sectionLabel}>{content.quality.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.quality.title}</h2><p className="mt-5 text-base leading-8 text-neutral-600">{content.quality.intro}</p></div><div className="grid gap-px bg-neutral-200 sm:grid-cols-2">{content.quality.items.map((item,index)=>{const icons=[Factory,ScanLine,Hammer,CircleGauge,PackageCheck,ShieldCheck];const Icon=icons[index];return <article key={item.title} className="bg-white p-7"><Icon size={22} className="text-[#76B900]" aria-hidden="true"/><h3 className="mt-6 text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p></article>})}</div></div></div>
      </section>

      <section data-section="faq" data-foot-shear-faq className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl"><p className={`${sectionLabel} text-center`}>{content.faqs.eyebrow}</p><h2 className="mt-4 text-center text-3xl font-semibold leading-tight sm:text-5xl">{content.faqs.title}</h2><div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">{content.faqs.items.map((item,index)=><details key={item.question} className="group py-6"><summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-left font-semibold"><span className="flex gap-4"><span className="font-mono text-[#76B900]">{String(index+1).padStart(2,"0")}</span>{item.question}</span><ChevronDown size={20} className="shrink-0 text-[#76B900] transition group-open:rotate-180" aria-hidden="true"/></summary><p className="max-w-4xl pt-4 pl-10 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">{item.answer}</p></details>)}</div></div>
      </section>

      <section data-section="related" className="border-t border-neutral-200 bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl"><p className={sectionLabel}>{content.related.eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{content.related.title}</h2><div className="mt-10 grid gap-px bg-neutral-200 md:grid-cols-2 lg:grid-cols-4">{content.related.items.map(item=><article key={item.href} className="flex min-h-64 flex-col bg-white p-7"><Link2 size={22} className="text-[#76B900]" aria-hidden="true"/><h3 className="mt-7 text-xl font-semibold">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-7 text-neutral-600">{item.text}</p><Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 hover:text-[#568600]">{item.anchor}<ArrowRight size={15} aria-hidden="true"/></Link></article>)}</div></div>
      </section>

      <section data-section="cta" className="bg-[#76B900] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#223500]">{content.cta.eyebrow}</p><h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[#0B0D10] sm:text-5xl">{content.cta.title}</h2><p className="mt-5 max-w-4xl text-base leading-8 text-[#213000]">{content.cta.intro}</p><p className="mt-4 max-w-4xl text-sm font-semibold leading-7 text-[#213000]">{content.cta.note}</p></div><Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#0B0D10] px-7 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#0B0D10]">Request a Quote<ArrowRight size={16} aria-hidden="true"/></Link></div>
      </section>
    </main>
  );
}
