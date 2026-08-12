import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleGauge,
  GitCompareArrows,
  HardHat,
  Layers3,
  MoveRight,
  RotateCw,
  Ruler,
  ShieldCheck,
  Workflow,
  Wrench,
} from "lucide-react";
import {
  applicationPhotos,
  confirmationValue,
  semiAutomaticThreeRollPlateRollingMachinePage as page,
  type ContentCard,
  type SpecificationField,
} from "@/data/semi-automatic-three-roll-plate-rolling-machine-page";
import type { Product } from "@/data/products";

type Props = { product: Product };

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";
const headingClass =
  "mt-4 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl";
const motionClass =
  "transition duration-200 hover:-translate-y-0.5 hover:border-[#76B900]/55 motion-reduce:transform-none motion-reduce:transition-none";

const expectedSpecLabels = [
  "Rolling capacity",
  "Roll structure",
  "Operation",
  "Workpiece",
] as const;

const resolveSpecification = (product: Product, field: SpecificationField) => {
  if (field.source === "name") return product.name;
  if (field.source === "spec" && field.sourceIndex !== undefined) {
    const spec = product.specs[field.sourceIndex];
    if (spec?.label !== expectedSpecLabels[field.sourceIndex]) {
      throw new Error(`Unexpected plate rolling specification at index ${field.sourceIndex}`);
    }
    return spec.value;
  }
  return confirmationValue;
};

const jsonLd = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");

function SectionIntro({
  label,
  title,
  text,
  align = "left",
}: {
  label: string;
  title: string;
  text?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto text-center" : undefined}>
      <p className={labelClass}>{label}</p>
      <h2 className={`${headingClass} ${centered ? "mx-auto" : ""}`}>{title}</h2>
      {text ? (
        <p
          className={`mt-6 max-w-3xl text-base leading-8 text-zinc-400 ${
            centered ? "mx-auto" : ""
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function ContentGrid({
  items,
  columns = "lg:grid-cols-3",
}: {
  items: readonly ContentCard[];
  columns?: string;
}) {
  return (
    <div className={`mt-12 grid gap-4 sm:grid-cols-2 ${columns}`}>
      {items.map((item, index) => (
        <article
          key={item.title}
          className={`group border border-white/10 bg-white/[0.035] p-6 ${motionClass}`}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs text-[#76B900]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <MoveRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-[#76B900]" />
          </div>
          <h3 className="mt-8 text-xl font-semibold tracking-[-0.02em] text-white">
            {item.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export default function SemiAutomaticThreeRollPlateRollingMachineSolutionPage({
  product,
}: Props) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: product.name,
    description: page.hero.description,
    image: product.image,
    category: product.categoryName,
    url: `/products/${product.id}`,
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "/products" },
      { "@type": "ListItem", position: 3, name: product.name, item: `/products/${product.id}` },
    ],
  };

  return (
    <main
      data-semi-automatic-three-roll-plate-rolling-machine-page
      className="overflow-hidden bg-[#090b0d] text-white"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <section
        data-section="hero"
        className="relative isolate border-b border-white/10 px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:px-12"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_42%,rgba(118,185,0,0.12),transparent_28%),linear-gradient(135deg,#0b0e11_0%,#11161b_55%,#080a0c_100%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              {page.hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-zinc-200">{page.hero.subtitle}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">{page.hero.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#76B900] px-6 text-sm font-semibold text-[#0a0c0d] transition hover:bg-[#8bd20a]"
              >
                {page.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#76B900]"
              >
                {page.hero.secondaryCta}
              </Link>
            </div>
            <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {page.hero.values.map((value) => (
                <div key={value} className="flex items-center gap-3 bg-[#0c0f12] px-4 py-3 text-xs font-medium text-zinc-300">
                  <Check className="h-4 w-4 text-[#76B900]" />
                  {value}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[370px] border border-white/10 bg-white/[0.025] sm:min-h-[520px]">
            <div className="absolute inset-x-[12%] bottom-[8%] h-[12%] rounded-full bg-black/70 blur-2xl" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.055)_45%,transparent_70%)]" />
            <Image
              src={product.image}
              alt="Semi-automatic three-roll plate rolling machine for cylinder and cone forming"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-contain p-6 sm:p-10"
            />
            <div className="absolute bottom-5 left-5 border-l-2 border-[#76B900] pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">Three-roll platform</p>
              <p className="mt-1 text-xs text-zinc-500">Final configuration subject to confirmation</p>
            </div>
          </div>
        </div>
      </section>

      <section data-section="pain-points" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Rolling problems" title="What makes curved forming difficult in real workshops?" text="Successful rolling depends on more than machine size. Edge condition, springback, support and the pass plan all affect the finished part." />
          <ContentGrid items={page.painPoints} columns="lg:grid-cols-5" />
        </div>
      </section>

      <section data-section="solutions" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Rolling solutions" title="One platform, three practical forming directions" text="Choose the process around the part geometry instead of forcing every job into the same rolling method." />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {page.solutions.map((item, index) => (
              <article key={item.title} className={`border border-white/10 bg-black/20 p-7 ${motionClass}`}>
                <span className="font-mono text-sm text-[#76B900]">0{index + 1}</span>
                <h3 className="mt-8 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-5 text-sm leading-7 text-zinc-400">{item.text}</p>
                <dl className="mt-8 space-y-5 border-t border-white/10 pt-6">
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Suitable for</dt><dd className="mt-2 text-sm leading-6 text-zinc-200">{item.suitableFor}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Recommended use</dt><dd className="mt-2 text-sm leading-6 text-zinc-200">{item.recommendedUse}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Real applications" title="Where rolled cylinders, arcs and shells go next" text="These real photographs show representative downstream parts and industries. Final machine suitability is confirmed from your drawings and material." />
          <div className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {applicationPhotos.map((item) => (
              <article key={item.title} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                  <Image src={item.image} alt={item.alt} fill loading="lazy" sizes="(min-width: 1024px) 18vw, (min-width: 640px) 46vw, 92vw" className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="materials" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionIntro label="Materials" title="Confirm the grade before confirming the machine" text="Nominal thickness alone is not a complete capacity input. Strength, temper, coating and surface protection matter." />
          <div className="divide-y divide-white/10 border-y border-white/10">
            {page.materials.map((item, index) => (
              <div key={item.title} className="grid gap-3 py-5 sm:grid-cols-[48px_180px_1fr] sm:items-center">
                <span className="font-mono text-xs text-[#76B900]">0{index + 1}</span><h3 className="font-semibold text-white">{item.title}</h3><p className="text-sm leading-6 text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="formed-shapes" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Formed shapes" title="From complete cylinders to controlled open arcs" />
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {page.shapes.map((item, index) => (
              <article key={item.title} className="bg-[#090b0d] p-7">
                <div className="relative h-24 overflow-hidden border border-white/10 bg-white/[0.025]">
                  <div className={`absolute left-1/2 top-1/2 h-14 w-20 -translate-x-1/2 -translate-y-1/2 border-2 border-[#76B900]/80 ${index === 0 ? "rounded-[50%]" : index === 1 ? "rounded-t-full border-b-0" : index === 2 ? "skew-x-[-12deg] rounded-[50%]" : "rounded-[45%_55%_50%_50%]"}`} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="rolling-process" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Rolling process" title="A measured path from flat plate to finished curve" text="Progressive checks help the operator respond to springback and avoid unnecessary correction at the joining stage." />
          <div className="mt-14 grid gap-0 lg:grid-cols-6">
            {page.rollingProcess.map((item, index) => (
              <article key={item.title} className="relative border-l border-white/15 pb-10 pl-7 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-7 lg:pt-8">
                <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full border-2 border-[#0d1115] bg-[#76B900] lg:-top-[7px] lg:left-0" />
                <p className="font-mono text-xs text-[#76B900]">0{index + 1}</p><h3 className="mt-4 font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="pre-bending" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div><p className={labelClass}>Pre-bending</p><h2 className={headingClass}>{page.preBending.title}</h2><p className="mt-6 text-base leading-8 text-zinc-400">{page.preBending.text}</p></div>
          <div className="border border-white/10 bg-[linear-gradient(145deg,#11161a,#090b0d)] p-7 sm:p-10">
            <div className="relative h-44 overflow-hidden border-b border-white/10">
              <div className="absolute bottom-8 left-[8%] h-3 w-[84%] bg-zinc-500" />
              <div className="absolute bottom-4 left-[21%] h-16 w-16 rounded-full border-[10px] border-zinc-700" />
              <div className="absolute bottom-4 right-[21%] h-16 w-16 rounded-full border-[10px] border-zinc-700" />
              <div className="absolute bottom-[74px] left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border-[12px] border-[#76B900]/75" />
              <div className="absolute bottom-[72px] left-[12%] h-10 w-[76%] rounded-t-[50%] border-t-2 border-[#76B900]" />
            </div>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">{page.preBending.checks.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300"><Check className="mt-1 h-4 w-4 shrink-0 text-[#76B900]" />{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section data-section="three-roll-structure" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Three-roll structure" title="A simple forming principle with configuration-led details" text="The existing product photograph remains the source of truth for visible machine structure. Optional functions require confirmation." /><ContentGrid items={page.structure} columns="lg:grid-cols-4" /></div>
      </section>

      <section data-section="semi-automatic-operation" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Semi-automatic operation" title="Operator judgment supported by a repeatable sequence" text="The selected drive and controls assist movement while setup, support and geometry checks remain part of the workshop process." /><div className="mt-12 grid gap-4 lg:grid-cols-5">{page.operation.map((item, index) => <article key={item.title} className="border-t-2 border-[#76B900] bg-white/[0.035] p-6"><span className="font-mono text-xs text-zinc-500">STEP 0{index + 1}</span><h3 className="mt-7 text-xl font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p></article>)}</div></div>
      </section>

      <section data-section="advantages" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Machine advantages" title="Balanced for flexible workshop production" /><ContentGrid items={page.advantages} /></div>
      </section>

      <section data-section="comparison" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Machine comparison" title="Choose the operating model that fits the workload" text="The table is a selection guide, not a substitute for a technical configuration review." />
          <div className="mt-12 overflow-x-auto border border-white/10"><table className="min-w-[920px] w-full border-collapse text-left"><thead><tr className="bg-white/[0.05]"><th className="p-5 text-xs uppercase tracking-wider text-zinc-500">Selection point</th><th className="p-5 text-sm font-semibold text-white">Manual three-roll</th><th className="border-x border-[#76B900]/25 bg-[#76B900]/[0.07] p-5 text-sm font-semibold text-[#92d82a]">Semi-automatic three-roll</th><th className="p-5 text-sm font-semibold text-white">Four-roll</th></tr></thead><tbody>{page.comparison.map((row) => <tr key={row.label} className="border-t border-white/10"><th className="p-5 text-sm font-medium text-zinc-200">{row.label}</th><td className="p-5 text-sm leading-6 text-zinc-400">{row.manualThreeRoll}</td><td className="border-x border-[#76B900]/20 bg-[#76B900]/[0.035] p-5 text-sm leading-6 text-zinc-200">{row.semiAutomaticThreeRoll}</td><td className="p-5 text-sm leading-6 text-zinc-400">{row.fourRoll}</td></tr>)}</tbody></table></div>
        </div>
      </section>

      <section data-section="fabrication-workflow" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Fabrication workflow" title="Connect rolling to the complete production route" />
          <div className="mt-12 grid gap-px bg-white/10 lg:grid-cols-5">{page.workflow.map((item, index) => { const content = <><div className="flex items-center justify-between"><Workflow className="h-5 w-5 text-[#76B900]" /><span className="font-mono text-xs text-zinc-600">0{index + 1}</span></div><h3 className="mt-10 text-lg font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p></>; return item.href ? <Link key={item.title} href={item.href} className="group bg-[#0d1115] p-6 transition hover:bg-white/[0.04]">{content}</Link> : <article key={item.title} className="bg-[#0d1115] p-6">{content}</article>; })}</div>
        </div>
      </section>

      <section data-section="selection-guide" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Selection guide" title="Six inputs define a useful configuration request" text="Send these details with a drawing or representative part so the engineering discussion starts from real production needs." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{page.selectionGuide.map((item, index) => <article key={item.title} className={`flex gap-5 border border-white/10 p-6 ${motionClass}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#76B900]/40 font-mono text-xs text-[#76B900]">0{index + 1}</span><div><h3 className="font-semibold text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p></div></article>)}</div>
        </div>
      </section>

      <section data-section="technical-specifications" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Technical specifications" title="Original project data, clearly separated from fields to confirm" text="The four original values are shown unchanged. Every added field remains customizable and must be confirmed with our sales engineer." />
          <div className="mt-12 overflow-x-auto border border-white/10"><table className="min-w-max border-collapse text-center"><thead><tr className="bg-white/[0.055]">{page.specificationFields.map((field) => <th key={field.heading} className="border-r border-white/10 px-5 py-4 text-center align-bottom last:border-r-0"><span className="block whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-zinc-200">{field.heading}</span>{field.unit ? <span className="mt-2 block text-center font-mono text-[11px] font-normal normal-case tracking-normal text-[#76B900]">{field.unit}</span> : <span className="mt-2 block h-[16px]" aria-hidden="true" />}</th>)}</tr></thead><tbody><tr className="border-t border-white/10">{page.specificationFields.map((field) => <td key={field.heading} className="max-w-[280px] border-r border-white/10 px-5 py-5 text-center text-sm leading-6 text-zinc-300 last:border-r-0">{resolveSpecification(product, field)}</td>)}</tr></tbody></table></div>
          <p className="mt-4 text-xs leading-6 text-zinc-500">Scroll the table horizontally on smaller screens. Configuration-dependent values are intentionally not replaced with unverified numeric data.</p>
        </div>
      </section>

      <section data-section="workshop-notes" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl"><SectionIntro label="Workshop notes" title="Prepare the space, support and operating method" /><div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{page.workshopNotes.map((item, index) => { const Icon = [HardHat, Ruler, CircleGauge, ShieldCheck, Layers3, Wrench][index]; return <article key={item.title} className="bg-[#090b0d] p-7"><Icon className="h-6 w-6 text-[#76B900]" /><h3 className="mt-8 text-lg font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p></article>; })}</div></div>
      </section>

      <section data-section="faq" className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl"><SectionIntro label="FAQ" title="Questions before selecting a three-roll machine" />
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">{page.faq.map((item) => <details key={item.question} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-base font-semibold text-white marker:content-none"><span>{item.question}</span><ChevronDown className="h-5 w-5 shrink-0 text-[#76B900] transition group-open:rotate-180" /></summary><p className="max-w-3xl pb-7 pr-10 text-sm leading-7 text-zinc-400">{item.answer}</p></details>)}</div>
        </div>
      </section>

      <section data-section="final-cta" className="relative isolate px-5 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(118,185,0,0.16),transparent_42%)]" />
        <div className="mx-auto max-w-5xl border border-white/10 bg-white/[0.035] px-6 py-14 text-center sm:px-12 sm:py-16">
          <RotateCw className="mx-auto h-9 w-9 text-[#76B900]" /><h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">{page.finalCta.title}</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">{page.finalCta.text}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#76B900] px-6 text-sm font-semibold text-[#0a0c0d] transition hover:bg-[#8bd20a]">{page.finalCta.primaryCta}<ArrowRight className="h-4 w-4" /></Link><Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#76B900]">{page.finalCta.secondaryCta}<GitCompareArrows className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </main>
  );
}
