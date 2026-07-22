import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleGauge,
  Crosshair,
  MoveRight,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import {
  singleTableFiberLaserCuttingMachinePage as page,
  type ApplicationPhoto,
  type ContentCard,
  type FaqItem,
  type SolutionCard,
  type SpecificationField,
  type WorkflowItem,
} from "@/data/single-table-fiber-laser-cutting-machine-page";
import type { Product } from "@/data/products";

type Props = { product: Product };

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[#76B900]";
const lightHeadingClass =
  "mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-[#101214] sm:text-5xl";
const darkHeadingClass =
  "mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-white sm:text-5xl";
const motionClass =
  "transition duration-200 hover:-translate-y-0.5 hover:border-[#76B900]/70 motion-reduce:transform-none motion-reduce:transition-none";

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
    return (
      product.specs[field.sourceIndex]?.value ??
      "Customizable / Please confirm with our sales engineer"
    );
  }
  return (
    field.confirmedValue ??
    "Customizable / Please confirm with our sales engineer"
  );
};

const jsonLd = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");

function SectionIntro({
  label,
  title,
  text,
  dark = false,
}: {
  label: string;
  title: string;
  text?: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <h2 className={dark ? darkHeadingClass : lightHeadingClass}>{title}</h2>
      {text ? (
        <p
          className={`mt-6 max-w-3xl text-base leading-8 ${dark ? "text-zinc-300" : "text-neutral-600"}`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryLink({ children }: { children: React.ReactNode }) {
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

function SecondaryLink({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href="/contact"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] border px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] motion-reduce:transition-none max-sm:w-full ${
        dark
          ? "border-white/25 text-white hover:border-[#76B900] hover:text-[#8DDB00]"
          : "border-neutral-300 text-[#101214] hover:border-[#76B900] hover:text-[#5B8F00]"
      }`}
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

function NumberedCard({ item, index }: { item: ContentCard; index: number }) {
  return (
    <article
      className={`border border-neutral-200 bg-white p-6 sm:p-7 ${motionClass} ${index === 0 ? "lg:col-span-2" : ""}`}
    >
      <p className="font-mono text-sm font-semibold text-[#5B8F00]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-7 text-xl font-semibold leading-snug text-[#101214]">
        {item.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
    </article>
  );
}

function SolutionCardView({ item, index }: { item: SolutionCard; index: number }) {
  return (
    <article
      className={`border border-white/15 bg-[#12161A] p-7 lg:min-h-[34rem] ${motionClass}`}
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
      className={`group overflow-hidden border border-neutral-200 bg-white ${motionClass}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          loading="lazy"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />
        <span className="absolute bottom-4 left-4 font-mono text-xs font-semibold text-white/90">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold leading-snug text-[#101214]">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
      </div>
    </article>
  );
}

function WorkflowCard({ item, index }: { item: WorkflowItem; index: number }) {
  const content = (
    <>
      <p className="font-mono text-xs font-semibold text-[#76B900]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-6 text-lg font-semibold text-[#101214]">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
    </>
  );
  return item.href ? (
    <Link
      href={item.href}
      className={`block border border-neutral-200 bg-white p-6 ${motionClass}`}
    >
      {content}
    </Link>
  ) : (
    <article className={`border border-neutral-200 bg-white p-6 ${motionClass}`}>
      {content}
    </article>
  );
}

function ProductFaq({ item, index }: { item: FaqItem; index: number }) {
  return (
    <details className="group border-t border-neutral-300 last:border-b">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900]">
        <span className="flex gap-4">
          <span className="mt-0.5 font-mono text-xs font-semibold text-[#5B8F00]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold leading-7 text-[#101214]">
            {item.question}
          </span>
        </span>
        <ChevronDown
          className="mt-1 shrink-0 text-neutral-500 transition group-open:rotate-180 motion-reduce:transition-none"
          size={19}
          aria-hidden="true"
        />
      </summary>
      <p className="pb-7 pl-10 pr-10 text-sm leading-7 text-neutral-600">
        {item.answer}
      </p>
    </details>
  );
}

export default function SingleTableFiberLaserCuttingMachineSolutionPage({
  product,
}: Props) {
  const specificationValues = page.specificationFields.map((field) => ({
    field,
    value: resolveSpecification(product, field),
  }));
  const productUrl = `https://www.zyroncnc.com/products/${product.id}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: product.name,
    description: page.hero.description,
    image: `https://www.zyroncnc.com${product.image}`,
    url: productUrl,
    category: product.categoryName,
    brand: { "@type": "Brand", name: "ZYRON" },
    manufacturer: {
      "@type": "Organization",
      name: "ZYRON Heavy Industry",
      url: "https://www.zyroncnc.com",
    },
    additionalProperty: specificationValues.map(({ field, value }) => ({
      "@type": "PropertyValue",
      name: field.heading,
      value,
    })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Products", item: "https://www.zyroncnc.com/products" },
      { "@type": "ListItem", position: 2, name: "Fiber Laser Cutting", item: "https://www.zyroncnc.com/products/series/laser-cutting-machines" },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main
      data-single-table-fiber-laser-cutting-machine-page
      data-product-solution-page={product.id}
      className="overflow-x-hidden bg-white text-[#101214]"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <section
        data-section="hero"
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-12 text-white sm:px-8 lg:py-20"
      >
        <div className="industrial-grid absolute inset-0 -z-30 opacity-45" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_38%,rgba(118,185,0,0.17),transparent_26%),linear-gradient(120deg,rgba(11,13,16,0.72)_0%,rgba(11,13,16,0.96)_53%,rgba(21,26,31,0.78)_100%)]" />
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products/series/laser-cutting-machines"
            className="text-sm text-zinc-400 transition hover:text-[#8DDB00]"
          >
            Fiber Laser Cutting / {product.name}
          </Link>
          <div className="mt-10 grid gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:gap-16">
            <div className="relative z-10">
              <h1 className="max-w-3xl text-[2.55rem] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-6xl lg:text-[3.85rem]">
                {page.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-zinc-100 sm:text-xl">
                {page.hero.subtitle}
              </p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
                {page.hero.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink>{page.hero.primaryCta}</PrimaryLink>
                <SecondaryLink dark>{page.hero.secondaryCta}</SecondaryLink>
              </div>
              <div className="mt-10 grid gap-px border-y border-white/15 bg-white/15 sm:grid-cols-2">
                {page.hero.values.map((value) => (
                  <div key={value} className="bg-[#0B0D10]/90 px-4 py-4 text-sm font-medium text-zinc-200">
                    {value}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[27rem] sm:min-h-[34rem] lg:min-h-[40rem]">
              <div className="absolute inset-x-[4%] bottom-[3%] h-[14%] rounded-[50%] bg-black/75 blur-2xl" />
              <div className="absolute inset-x-[8%] bottom-[5%] h-[15%] rounded-[50%] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),rgba(255,255,255,0.025)_53%,rgba(0,0,0,0.3)_75%)] shadow-[0_30px_65px_rgba(0,0,0,0.55)]" />
              <Image
                src={product.image}
                alt="Single-table fiber laser cutting machine for sheet metal cutting"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="relative z-10 object-contain object-center p-1 sm:p-4"
              />
            </div>
          </div>
        </div>
      </section>

      <section data-section="pain-points" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Cutting Challenges" title="What Cutting Problems Can It Solve?" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.painPoints.map((item, index) => <NumberedCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="solutions" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro dark label="Workshop Positions" title="Single-table Sheet Metal Laser Cutting Solution" text="Choose the machine position around actual production goals, not a generic model label." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {page.solutions.map((item, index) => <SolutionCardView key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="applications" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Real Industry Environments" title="Applications" text={page.applicationIntro} />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.applications.map((item, index) => <ApplicationCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="materials" className="border-y border-neutral-200 bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Configured Material Capability" title="Materials" />
          <div className="mt-10 grid gap-px border border-neutral-300 bg-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            {page.materials.map((material, index) => (
              <div key={material} className="bg-white p-6">
                <span className="font-mono text-xs text-[#5B8F00]">M{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-lg font-semibold">{material}</h3>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-7 text-neutral-600">{page.materialNote}</p>
        </div>
      </section>

      <section data-section="cutting-process" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Production Sequence" title="From Sheet Metal to Cut Parts" />
          <div className="mt-12 grid lg:grid-cols-6">
            {page.processSteps.map((item, index) => (
              <article key={item.title} className="border-t border-neutral-300 py-6 lg:border-l lg:border-t-0 lg:px-5 lg:py-0 lg:first:border-l-0 lg:first:pl-0">
                <p className="font-mono text-3xl font-semibold text-[#76B900]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-6 text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="single-table-design" className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="industrial-grid absolute inset-0 -z-20 opacity-30" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
          <SectionIntro dark label="Platform Position" title="Why Single-table Design?" text="A direct, open platform for flexible flat-sheet production and straightforward daily workflow." />
          <div className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2">
            {page.singleTablePoints.map((point, index) => (
              <article key={point} className={`bg-[#12161A] p-6 ${index === 4 ? "sm:col-span-2" : ""}`}>
                <CircleGauge className="text-[#76B900]" size={22} aria-hidden="true" />
                <p className="mt-5 text-sm leading-7 text-zinc-300">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="laser-power" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Configuration Guide" title="Choose the Right Laser Power" text="Material, thickness, output and edge expectations determine the suitable source configuration." />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {page.laserPowerCards.map((item) => (
              <article key={item.title} className={`border border-neutral-200 bg-white p-7 ${motionClass}`}>
                <Crosshair className="text-[#5B8F00]" size={23} aria-hidden="true" />
                <h3 className="mt-8 text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 border-l-4 border-[#76B900] bg-[#101214] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">Laser power</p>
            <p className="mt-3 text-base font-semibold sm:mt-0">{page.laserPowerValue}</p>
          </div>
        </div>
      </section>

      <section data-section="cutting-gas" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Process Selection" title="Cutting Gas and Edge Quality" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {page.gasCards.map((item, index) => (
              <article key={item.title} className={`border border-neutral-200 p-7 ${motionClass}`}>
                <span className="font-mono text-xs font-semibold text-[#5B8F00]">G0{index + 1}</span>
                <h3 className="mt-7 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-7 text-neutral-600">{page.gasNote}</p>
        </div>
      </section>

      <section data-section="advantages" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div className="relative min-h-[27rem] overflow-hidden border border-white/15 bg-[radial-gradient(circle_at_50%_45%,rgba(118,185,0,0.15),transparent_36%),linear-gradient(145deg,#171B20,#090B0E)] sm:min-h-[36rem]">
            <div className="industrial-grid absolute inset-0 opacity-30" />
            <Image src={product.image} alt="Single-table fiber laser cutting machine for sheet metal cutting" fill loading="lazy" sizes="(min-width: 1024px) 45vw, 100vw" className="relative object-contain p-8" />
          </div>
          <div>
            <SectionIntro dark label="Practical Capability" title="Why Choose This Single-Table Fiber Laser Cutting Machine?" />
            <ul className="mt-9 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {page.advantages.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-zinc-300">
                  <Check className="mt-1 shrink-0 text-[#76B900]" size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 border-t border-white/15 pt-7">
              <p className={labelClass}>Applicable original product data</p>
              <ul className="mt-5 space-y-3">
                {page.configuredSystems.map((item) => <li key={item} className="text-sm leading-7 text-zinc-400">{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Objective Selection" title="Single-table Fiber Laser vs Exchange-table Fiber Laser vs Plasma Cutting" text="Each process has a useful production position. Select according to output, handling, quality and investment priorities." />
          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
            <table className="min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[#0B0D10] text-white">
                <tr>
                  {[
                    "Comparison item",
                    "Single-table Fiber Laser",
                    "Exchange-table Fiber Laser",
                    "Plasma Cutting",
                  ].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {page.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-neutral-200 last:border-0 even:bg-neutral-50">
                    <th scope="row" className="px-5 py-4 font-semibold text-[#101214]">{row.label}</th>
                    <td className="px-5 py-4 leading-7 text-neutral-600">{row.singleTable}</td>
                    <td className="px-5 py-4 leading-7 text-neutral-600">{row.exchangeTable}</td>
                    <td className="px-5 py-4 leading-7 text-neutral-600">{row.plasma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section data-section="fabrication-workflow" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Connected Production" title="Build a Complete Sheet Metal Fabrication Workflow" text={page.workflowNote} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.workflow.map((item, index) => <WorkflowCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="selection-guide" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionIntro dark label="Before Configuration" title="How to Choose the Right Single-Table Fiber Laser Cutting Machine?" />
            <div className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {page.selectionItems.map((item) => (
                <div key={item} className="flex gap-3 border-b border-white/10 pb-4 text-sm text-zinc-300">
                  <Check className="shrink-0 text-[#76B900]" size={17} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <aside className="border border-[#76B900]/50 bg-[#14191D] p-7 sm:p-9 lg:self-center">
            <Settings2 className="text-[#76B900]" size={28} aria-hidden="true" />
            <h3 className="mt-8 text-2xl font-semibold">{page.selectionCta.title}</h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">{page.selectionCta.text}</p>
            <div className="mt-8"><PrimaryLink>{page.selectionCta.label}</PrimaryLink></div>
          </aside>
        </div>
      </section>

      <section data-section="technical-specifications" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionIntro label="Original Product Data" title="Technical Specifications" />
            <p className="max-w-xl text-sm leading-7 text-neutral-600">Applicable values below resolve from product.specs. Unavailable values remain explicitly subject to confirmation.</p>
          </div>
          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
            <table className="min-w-[2360px] border-collapse text-center text-xs sm:text-sm">
              <thead>
                <tr>
                  {specificationValues.map(({ field }) => {
                    const heading = splitSpecificationHeading(field.heading);
                    return (
                      <th key={field.heading} scope="col" className="bg-[#0B0D10] px-4 py-4 text-center font-semibold leading-5 text-white">
                        <span className="block whitespace-nowrap">{heading.label}</span>
                        {heading.unit ? <span className="mt-2 block text-center text-[0.7rem] font-medium text-zinc-400">{heading.unit}</span> : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {specificationValues.map(({ field, value }, index) => (
                    <td key={field.heading} className={`px-4 py-5 leading-6 ${index === 0 ? "font-semibold text-[#101214]" : "text-neutral-600"}`}>{value}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm leading-7 text-neutral-600">{page.specificationNote}</p>
        </div>
      </section>

      <section data-section="workshop-safety" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <SectionIntro label="Installation Readiness" title="Workshop Preparation and Safety" text="Site planning, operator training and local rules remain part of the final installation plan." />
          <div className="grid gap-4 sm:grid-cols-2">
            {page.safetyPoints.map((item, index) => (
              <article key={item} className={`border border-neutral-200 bg-[#F4F6F8] p-6 ${motionClass}`}>
                <ShieldCheck className="text-[#5B8F00]" size={22} aria-hidden="true" />
                <p className="mt-5 text-sm leading-7 text-neutral-700">{item}</p>
                <span className="mt-5 block font-mono text-xs text-neutral-400">S0{index + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="faq" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <div>
            <SectionIntro label="Buyer Questions" title="Single-table Fiber Laser Cutting Machine FAQ" text="Final cutting capability and equipment configuration are confirmed from the actual production requirement." />
          </div>
          <div>{page.faqs.map((item, index) => <ProductFaq key={item.question} item={item} index={index} />)}</div>
        </div>
      </section>

      <section data-section="internal-links" className="border-t border-neutral-200 bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={labelClass}>Explore Related Equipment</p>
              <h2 className="mt-3 text-2xl font-semibold">Continue planning the fabrication line.</h2>
            </div>
            <nav aria-label="Related product links" className="flex max-w-4xl flex-wrap gap-x-6 gap-y-3">
              {page.internalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 transition hover:text-[#5B8F00]">
                  {link.label}<ArrowRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section data-section="final-cta" className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="industrial-grid absolute inset-0 -z-20 opacity-35" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_50%,rgba(118,185,0,0.14),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:items-end">
          <div>
            <p className={labelClass}>Talk to an Engineer</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-white sm:text-5xl">{page.finalCta.title}</h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">{page.finalCta.text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <PrimaryLink>{page.finalCta.primary}</PrimaryLink>
            <SecondaryLink dark>{page.finalCta.secondary}</SecondaryLink>
          </div>
        </div>
      </section>
    </main>
  );
}
