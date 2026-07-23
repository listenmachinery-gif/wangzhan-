import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleGauge,
  Crosshair,
  GitCompareArrows,
  Layers3,
  MoveRight,
  ScanLine,
  Settings2,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import {
  sheetAndTubeFiberLaserCuttingMachinePage as page,
  type ApplicationPhoto,
  type ContentCard,
  type FaqItem,
  type SolutionCard,
  type SpecificationField,
  type WorkflowItem,
} from "@/data/sheet-and-tube-fiber-laser-cutting-machine-page";
import type { Product } from "@/data/products";

type Props = { product: Product };

const confirmationValue = "Customizable / Please confirm with our sales engineer";
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[#76B900]";
const headingClass =
  "mt-4 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl";
const motionClass =
  "transition duration-200 hover:-translate-y-0.5 hover:border-[#76B900]/65 motion-reduce:transform-none motion-reduce:transition-none";

const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;

const splitSpecificationHeading = (heading: string) => {
  const normalized = heading.replace(/\s+/g, " ").trim();
  const match = normalized.match(specificationUnitPattern);
  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const resolveSpecification = (product: Product, field: SpecificationField) => {
  if (field.source === "name") return product.name;
  if (field.source === "spec" && field.sourceIndex !== undefined) {
    return product.specs[field.sourceIndex]?.value ?? confirmationValue;
  }
  return field.confirmedValue ?? confirmationValue;
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
  return (
    <div className={align === "center" ? "mx-auto text-center" : undefined}>
      <p className={labelClass}>{label}</p>
      <h2 className={`${headingClass} ${align === "center" ? "mx-auto" : ""}`}>
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-6 max-w-3xl text-base leading-8 text-zinc-400 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/contact"
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10] transition hover:bg-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] motion-reduce:transition-none max-sm:w-full"
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

function SecondaryLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/contact"
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] motion-reduce:transition-none max-sm:w-full"
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

function NumberedCard({ item, index }: { item: ContentCard; index: number }) {
  return (
    <article
      className={`border border-white/10 bg-[#12161A] p-6 sm:p-7 ${motionClass} ${
        index === 0 ? "lg:col-span-2" : ""
      }`}
    >
      <p className="font-mono text-xs font-semibold text-[#76B900]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-7 text-xl font-semibold leading-snug text-white">
        {item.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-zinc-400">{item.text}</p>
    </article>
  );
}

function SolutionCardView({ item, index }: { item: SolutionCard; index: number }) {
  return (
    <article
      className={`border border-white/15 bg-gradient-to-b from-[#1B2024] to-[#12161A] p-7 lg:min-h-[32rem] ${motionClass}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <span className="font-mono text-sm text-[#76B900]">0{index + 1}</span>
        <MoveRight className="text-zinc-600" size={21} aria-hidden="true" />
      </div>
      <h3 className="mt-8 text-2xl font-semibold leading-snug text-white">
        {item.title}
      </h3>
      <dl className="mt-8 space-y-6">
        {[
          ["Suitable for", item.suitableFor],
          ["Recommended use", item.recommendedUse],
          ["Production value", item.productionValue],
        ].map(([term, value]) => (
          <div key={term}>
            <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">
              {term}
            </dt>
            <dd className="mt-3 text-sm leading-7 text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-7 border-t border-white/10 pt-6 text-xs leading-6 text-zinc-500">
        {item.text}
      </p>
    </article>
  );
}

function ApplicationCard({ item, index }: { item: ApplicationPhoto; index: number }) {
  return (
    <article
      className={`group overflow-hidden border border-white/10 bg-[#12161A] ${motionClass}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1B2024]">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          loading="lazy"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-4 left-4 font-mono text-xs font-semibold text-white/90">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold leading-snug text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{item.text}</p>
      </div>
    </article>
  );
}

function ProcessRail({ items, mode }: { items: readonly ContentCard[]; mode: "sheet" | "tube" }) {
  return (
    <ol className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-6">
      {items.map((item, index) => (
        <li key={item.title} className="relative bg-[#12161A] p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#76B900]">
              STEP {String(index + 1).padStart(2, "0")}
            </span>
            {mode === "sheet" ? (
              <ScanLine size={19} className="text-zinc-600" aria-hidden="true" />
            ) : (
              <CircleGauge size={19} className="text-zinc-600" aria-hidden="true" />
            )}
          </div>
          <h3 className="mt-7 text-base font-semibold leading-snug text-white">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

function WorkflowCard({ item, index }: { item: WorkflowItem; index: number }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-[#76B900]">
          {String(index + 1).padStart(2, "0")}
        </span>
        {item.href ? <ArrowRight size={16} className="text-zinc-600" aria-hidden="true" /> : null}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{item.text}</p>
    </>
  );

  return item.href ? (
    <Link
      href={item.href}
      className={`block border border-white/10 bg-[#12161A] p-6 ${motionClass}`}
    >
      {content}
    </Link>
  ) : (
    <article className={`border border-white/10 bg-[#12161A] p-6 ${motionClass}`}>
      {content}
    </article>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-7 text-zinc-300">
      <Check className="mt-1 shrink-0 text-[#76B900]" size={16} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  return (
    <details className="group border-b border-white/10 py-1 first:border-t">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] [&::-webkit-details-marker]:hidden">
        <span>{item.question}</span>
        <ChevronDown
          size={18}
          className="shrink-0 text-[#76B900] transition group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <p className="max-w-4xl pb-6 pr-8 text-sm leading-7 text-zinc-400">{item.answer}</p>
    </details>
  );
}

export default function SheetAndTubeFiberLaserCuttingMachineSolutionPage({
  product,
}: Props) {
  const canonicalUrl =
    "https://www.zyroncnc.com/products/sheet-and-tube-fiber-laser-cutting-machine";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: product.name,
    description: page.hero.description,
    image: `https://www.zyroncnc.com${product.image}`,
    category: product.categoryName,
    url: canonicalUrl,
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.zyroncnc.com" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.zyroncnc.com/products" },
      { "@type": "ListItem", position: 3, name: product.name, item: canonicalUrl },
    ],
  };

  return (
    <main
      className="overflow-hidden bg-[#0B0D10] text-white"
      data-sheet-and-tube-fiber-laser-cutting-machine-page
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <section
        data-section="hero"
        className="relative border-b border-white/10 bg-[radial-gradient(circle_at_78%_38%,rgba(118,185,0,0.08),transparent_30%),linear-gradient(135deg,#0B0D10_0%,#12161A_58%,#0B0D10_100%)]"
      >
        <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-12 lg:pb-0">
          <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span className="px-2">/</span>
            <Link href="/products" className="transition hover:text-white">Products</Link>
            <span className="px-2">/</span>
            <span className="text-zinc-300">{product.name}</span>
          </nav>

          <div className="grid items-center gap-12 py-14 lg:min-h-[690px] lg:grid-cols-[0.86fr_1.14fr] lg:gap-8 lg:py-10">
            <div className="relative z-10">
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl xl:text-7xl">
                {page.hero.title}
              </h1>
              <p className="mt-7 max-w-xl text-xl font-medium leading-8 text-zinc-200">
                {page.hero.subtitle}
              </p>
              <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
                {page.hero.description}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink>{page.hero.primaryCta}</PrimaryLink>
                <SecondaryLink>{page.hero.secondaryCta}</SecondaryLink>
              </div>
            </div>

            <div className="relative min-h-[380px] sm:min-h-[500px] lg:min-h-[620px]">
              <div className="absolute inset-x-[8%] bottom-[12%] h-[24%] rounded-[50%] bg-black/60 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_72%,rgba(11,13,16,0.65)_100%)]" />
              <Image
                src={product.image}
                alt="Sheet and tube fiber laser cutting machine for metal sheet and pipe cutting"
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-contain object-center drop-shadow-[0_35px_45px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>

          <ul className="grid border border-white/10 bg-[#0B0D10]/80 sm:grid-cols-2 lg:grid-cols-4 lg:translate-y-1/2">
            {page.hero.values.map((value, index) => (
              <li
                key={value}
                className="flex min-h-24 items-center gap-4 border-white/10 px-5 py-5 max-sm:border-b sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0"
              >
                <span className="font-mono text-xs text-[#76B900]">0{index + 1}</span>
                <span className="text-sm font-semibold leading-6 text-zinc-200">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-section="pain-points" className="px-5 pb-24 pt-32 sm:px-8 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro label="Cutting problems" title="What Cutting Problems Can It Solve?" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.painPoints.map((item, index) => (
              <NumberedCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="solutions" className="border-y border-white/10 bg-[#101418] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro
            label="Integrated solution"
            title="Sheet and Tube Integrated Cutting Solution"
            text="Match the machine to the real mix of sheet parts, tube structures, order volume and downstream fabrication work."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {page.solutions.map((item, index) => (
              <SolutionCardView key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro label="Real industries" title="Applications" text={page.applicationIntro} />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.applications.map((item, index) => (
              <ApplicationCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="sheet-materials" className="border-y border-white/10 bg-[#12161A] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px] lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionIntro label="Flat material path" title="Sheet Materials" text={page.sheetMaterialNote} />
          <ul className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-0">
            {page.sheetMaterials.map((material, index) => (
              <li key={material} className="flex min-h-24 items-center gap-4 bg-[#0B0D10] px-6 py-5">
                <span className="font-mono text-xs text-[#76B900]">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-semibold text-zinc-200">{material}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-section="tube-types" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px] lg:grid lg:grid-cols-[1.28fr_0.72fr] lg:gap-16">
          <ul className="order-1 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
            {page.tubeTypes.map((tube, index) => (
              <li key={tube} className="flex min-h-24 items-center gap-4 bg-[#12161A] px-6 py-5">
                <CircleGauge size={21} className="shrink-0 text-[#76B900]" aria-hidden="true" />
                <div>
                  <span className="font-mono text-[10px] text-zinc-600">TYPE {String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-1 font-semibold text-zinc-200">{tube}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="order-2 mt-10 lg:mt-0">
            <SectionIntro label="Rotary material path" title="Tube and Pipe Types" text={page.tubeTypeNote} />
          </div>
        </div>
      </section>

      <section data-section="sheet-cutting-process" className="border-y border-white/10 bg-[#101418] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro label="Process 01" title="Sheet Cutting Process" />
          <ProcessRail items={page.sheetProcessSteps} mode="sheet" />
        </div>
      </section>

      <section data-section="tube-cutting-process" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro label="Process 02" title="Tube Cutting Process" />
          <ProcessRail items={page.tubeProcessSteps} mode="tube" />
        </div>
      </section>

      <section data-section="dual-use-design" className="border-y border-white/10 bg-[#12161A] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
          <div>
            <SectionIntro label="One integrated layout" title="Why Sheet and Tube Dual-use Design?" />
            <ul className="mt-9 space-y-4">
              {page.dualUsePoints.map((point) => <CheckItem key={point}>{point}</CheckItem>)}
            </ul>
            <p className="mt-8 border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-zinc-400">
              {page.dualUseNote}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="border border-white/10 bg-[#0B0D10] p-8 text-center">
              <ScanLine className="mx-auto text-[#76B900]" size={44} strokeWidth={1.4} aria-hidden="true" />
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Flat material</p>
              <p className="mt-2 text-2xl font-semibold text-white">Sheet Cutting</p>
            </div>
            <GitCompareArrows className="mx-auto rotate-90 text-[#76B900] sm:rotate-0" size={30} aria-hidden="true" />
            <div className="border border-white/10 bg-[#0B0D10] p-8 text-center">
              <CircleGauge className="mx-auto text-[#76B900]" size={44} strokeWidth={1.4} aria-hidden="true" />
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Rotary material</p>
              <p className="mt-2 text-2xl font-semibold text-white">Tube Cutting</p>
            </div>
          </div>
        </div>
      </section>

      <section data-section="laser-power" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionIntro label="Selection logic" title="Choose the Right Laser Power" text={page.powerNote} />
            <div className="border border-[#76B900]/40 bg-[#76B900]/[0.06] px-5 py-4 text-sm text-zinc-200">
              <span className="mr-2 font-semibold text-[#76B900]">Laser power:</span>
              {page.laserPowerValue}
            </div>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {page.powerGuide.map((item, index) => (
              <article key={item.title} className={`border border-white/10 bg-[#12161A] p-6 ${motionClass}`}>
                <Crosshair size={22} className="text-[#76B900]" aria-hidden="true" />
                <h3 className="mt-8 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{item.text}</p>
                <p className="mt-8 font-mono text-xs text-zinc-600">0{index + 1}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="cutting-gas" className="border-y border-white/10 bg-[#101418] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro label="Process variables" title="Cutting Gas and Edge Quality" text={page.gasNote} />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {page.gasOptions.map((item, index) => (
              <article key={item.title} className={`border border-white/10 bg-[#0B0D10] p-7 ${motionClass}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#76B900]">GAS 0{index + 1}</span>
                  <CircleGauge size={20} className="text-zinc-600" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-5 text-sm leading-7 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="advantages" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:gap-20">
          <div>
            <SectionIntro label="Practical value" title="Why Choose This Sheet and Tube Fiber Laser Cutting Machine?" />
            <ul className="mt-9 space-y-4">
              {page.advantages.map((item) => <CheckItem key={item}>{item}</CheckItem>)}
            </ul>
          </div>
          <div className="border border-white/10 bg-[#12161A] p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <Settings2 size={22} className="text-[#76B900]" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Confirmed configuration context</h3>
            </div>
            <dl className="divide-y divide-white/10">
              {product.specs.map((spec, index) => (
                <div key={spec.label} className="grid gap-2 py-6 sm:grid-cols-[0.42fr_1fr] sm:gap-8">
                  <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.13em] text-[#76B900]">
                    <span className="font-mono text-zinc-600">0{index + 1}</span>
                    {spec.label}
                  </dt>
                  <dd className="text-sm leading-7 text-zinc-300">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="border-y border-white/10 bg-[#12161A] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Objective comparison"
            title="Sheet Laser vs Sheet-and-Tube Laser vs Dedicated Tube Laser"
            text="Choose the architecture around your dominant material path, product mix, tube complexity and expected workload."
          />
          <div className="mt-12 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="bg-[#0B0D10] text-white">
                <tr>
                  <th className="whitespace-nowrap border-b border-r border-white/10 px-5 py-5 font-semibold">Comparison</th>
                  <th className="whitespace-nowrap border-b border-r border-white/10 px-5 py-5 font-semibold">Sheet Fiber Laser</th>
                  <th className="whitespace-nowrap border-b border-r border-[#76B900]/40 bg-[#76B900]/[0.06] px-5 py-5 font-semibold text-[#8DDB00]">Sheet and Tube Fiber Laser</th>
                  <th className="whitespace-nowrap border-b border-white/10 px-5 py-5 font-semibold">Dedicated Tube Laser</th>
                </tr>
              </thead>
              <tbody>
                {page.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-white/10 last:border-b-0">
                    <th scope="row" className="border-r border-white/10 bg-[#0B0D10] px-5 py-5 font-semibold text-white">{row.label}</th>
                    <td className="border-r border-white/10 px-5 py-5 leading-7 text-zinc-400">{row.sheetLaser}</td>
                    <td className="border-r border-[#76B900]/30 bg-[#76B900]/[0.035] px-5 py-5 leading-7 text-zinc-200">{row.sheetAndTubeLaser}</td>
                    <td className="px-5 py-5 leading-7 text-zinc-400">{row.tubeLaser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section data-section="fabrication-workflow" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro label="Connected equipment" title="Build a Complete Metal Fabrication Workflow" text={page.workflowNote} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.workflow.map((item, index) => (
              <WorkflowCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="selection-guide" className="border-y border-white/10 bg-[#101418] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionIntro label="Before quotation" title="How to Choose the Right Sheet and Tube Fiber Laser Cutting Machine?" />
            <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {page.selectionInputs.map((input) => <CheckItem key={input}>{input}</CheckItem>)}
            </ul>
          </div>
          <aside className="self-start border border-[#76B900]/45 bg-[#0B0D10] p-7 sm:p-9">
            <Workflow size={30} className="text-[#76B900]" aria-hidden="true" />
            <h3 className="mt-8 text-3xl font-semibold leading-tight">{page.selectionCta.title}</h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">{page.selectionCta.text}</p>
            <div className="mt-8"><PrimaryLink>{page.selectionCta.button}</PrimaryLink></div>
          </aside>
        </div>
      </section>

      <section data-section="technical-specifications" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro label="Configuration table" title="Technical Specifications" text="Original compatible specifications are retained; unavailable product-specific values remain subject to engineering confirmation." />
          <div className="mt-12 overflow-x-auto border border-white/10">
            <table className="min-w-max border-collapse text-sm">
              <thead className="bg-[#12161A]">
                <tr>
                  {page.specificationFields.map((field) => {
                    const { label, unit } = splitSpecificationHeading(field.heading);
                    return (
                      <th key={field.heading} className="min-w-44 border-b border-r border-white/10 px-5 py-4 text-center align-bottom last:border-r-0">
                        <span className="block whitespace-nowrap text-xs font-semibold text-white">{label}</span>
                        {unit ? <span className="mt-1 block text-center text-[11px] font-normal text-[#76B900]">{unit}</span> : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#0B0D10]">
                  {page.specificationFields.map((field) => (
                    <td key={field.heading} className="max-w-64 border-r border-white/10 px-5 py-6 text-center align-top text-sm leading-6 text-zinc-300 last:border-r-0">
                      {resolveSpecification(product, field)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-5xl text-sm leading-7 text-zinc-500">{page.specificationNote}</p>
        </div>
      </section>

      <section data-section="workshop-safety" className="border-y border-white/10 bg-[#12161A] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro label="Installation planning" title="Workshop Preparation and Safety" />
          <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {page.safetyPoints.map((point, index) => (
              <article key={point} className="bg-[#0B0D10] p-6">
                <ShieldCheck size={21} className="text-[#76B900]" aria-hidden="true" />
                <p className="mt-6 text-sm leading-7 text-zinc-300">{point}</p>
                <p className="mt-7 font-mono text-xs text-zinc-600">SAFE {String(index + 1).padStart(2, "0")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="faq" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1080px]">
          <SectionIntro label="Buyer questions" title="Frequently Asked Questions" align="center" />
          <div className="mt-12">
            {page.faqs.map((item) => <FaqRow key={item.question} item={item} />)}
          </div>
        </div>
      </section>

      <section data-section="internal-links" className="border-y border-white/10 bg-[#101418] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <SectionIntro label="Continue comparing" title="Related Equipment and Cutting Paths" />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.internalLinks.map((item, index) => (
              <WorkflowCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="final-cta" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(118,185,0,0.12),transparent_46%),#12161A] px-6 py-16 text-center sm:px-10 lg:py-20">
          <Layers3 className="mx-auto text-[#76B900]" size={34} aria-hidden="true" />
          <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
            {page.finalCta.title}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-400">{page.finalCta.text}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryLink>{page.finalCta.primary}</PrimaryLink>
            <SecondaryLink>{page.finalCta.secondary}</SecondaryLink>
          </div>
        </div>
      </section>
    </main>
  );
}
