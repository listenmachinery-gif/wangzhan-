import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gauge,
  Layers3,
  MoveHorizontal,
  MoveRight,
  Ruler,
  Settings2,
  Wrench,
} from "lucide-react";
import {
  torsionBarCncPressBrakePage as page,
  type ApplicationPhoto,
  type ComparisonRow,
  type ContentCard,
  type FaqItem,
  type SolutionCard,
  type WorkflowItem,
} from "@/data/torsion-bar-cnc-press-brake-page";
import type { Product } from "@/data/products";

type TorsionBarCncPressBrakeSolutionPageProps = {
  product: Product;
};

const sectionLabelClass = "text-xs font-semibold uppercase tracking-[0.18em] text-[#76B900]";
const lightHeadingClass = "mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-[#101214] sm:text-5xl";
const darkHeadingClass = "mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-white sm:text-5xl";
const motionClass =
  "transition duration-200 hover:-translate-y-0.5 hover:border-[#76B900]/70 motion-reduce:transform-none motion-reduce:transition-none";

const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;
const dimensionSeparatorPattern = /\bx\b/g;

const splitSpecificationHeading = (column: string) => {
  const normalized = column
    .replace("DimensionsL", "Dimensions L")
    .replace(dimensionSeparatorPattern, "×")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(specificationUnitPattern);

  return match ? { label: match[1].trim(), unit: match[2] } : { label: normalized, unit: "" };
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
      <p className={sectionLabelClass}>{label}</p>
      <h2 className={dark ? darkHeadingClass : lightHeadingClass}>{title}</h2>
      {text ? (
        <p className={`mt-6 max-w-3xl text-base leading-8 ${dark ? "text-zinc-300" : "text-neutral-600"}`}>
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

function SecondaryLink({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
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

function PainPointRow({ item, index }: { item: ContentCard; index: number }) {
  return (
    <article className="group grid gap-5 border-b border-neutral-300 py-7 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-8">
      <p className="font-mono text-3xl font-medium text-[#76B900]">{String(index + 1).padStart(2, "0")}</p>
      <div>
        <h3 className="text-lg font-semibold leading-7 text-[#101214] sm:text-xl">{item.title}</h3>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-neutral-600">{item.text}</p>
      </div>
      <MoveRight
        size={22}
        className="hidden text-neutral-400 transition group-hover:translate-x-1 group-hover:text-[#5B8F00] motion-reduce:transform-none motion-reduce:transition-none sm:block"
        aria-hidden="true"
      />
    </article>
  );
}

function SolutionPosition({ item, index }: { item: SolutionCard; index: number }) {
  return (
    <article className={`border border-white/15 bg-[#12161A] p-7 lg:min-h-[30rem] ${motionClass}`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <span className="font-mono text-sm text-[#76B900]">0{index + 1}</span>
        <MoveRight className="text-zinc-600" size={21} aria-hidden="true" />
      </div>
      <h3 className="mt-8 text-2xl font-semibold leading-snug text-white">{item.title}</h3>
      <dl className="mt-8 space-y-7">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">Suitable for</dt>
          <dd className="mt-3 text-sm leading-7 text-zinc-300">{item.suitableFor}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">Recommended use</dt>
          <dd className="mt-3 text-sm leading-7 text-zinc-300">{item.text}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">Production value</dt>
          <dd className="mt-3 text-sm leading-7 text-zinc-300">{item.productionValue}</dd>
        </div>
      </dl>
    </article>
  );
}

function ApplicationCard({ item }: { item: ApplicationPhoto }) {
  return (
    <article className={`group overflow-hidden rounded-[4px] border border-neutral-200 bg-[#0B0D10] ${motionClass}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-lg font-semibold leading-6 text-white">{item.title}</h3>
        </div>
      </div>
      <p className="min-h-32 p-5 text-sm leading-7 text-zinc-400">{item.text}</p>
    </article>
  );
}

function ProcessStep({ item, index }: { item: ContentCard; index: number }) {
  return (
    <article className="relative border-b border-neutral-200 py-6 lg:border-b-0 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
      <div className="flex items-center gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#76B900] font-mono text-sm font-semibold text-[#0B0D10]">
          {index + 1}
        </span>
        {index < page.processSteps.length - 1 ? <MoveRight size={19} className="hidden text-neutral-300 lg:block" aria-hidden="true" /> : null}
      </div>
      <h3 className="mt-6 text-base font-semibold leading-6 text-[#101214]">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{item.text}</p>
    </article>
  );
}

function SynchronizationMotif() {
  return (
    <div className="relative min-h-[24rem] overflow-hidden border border-neutral-200 bg-white p-6 sm:p-10" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,18,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,18,20,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative flex min-h-[19rem] items-center justify-between gap-8">
        {["L", "R"].map((side) => (
          <div key={side} className="flex w-28 flex-col items-center sm:w-36">
            <div className="h-24 w-14 border border-neutral-400 bg-[#F4F6F8]" />
            <div className="h-16 w-24 border border-neutral-400 bg-white sm:w-32" />
            <div className="mt-3 font-mono text-xs font-semibold text-neutral-500">SIDE {side}</div>
          </div>
        ))}
        <div className="absolute left-[18%] right-[18%] top-1/2 h-px bg-[#76B900]" />
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center bg-white px-4 py-3">
          <MoveHorizontal className="text-[#5B8F00]" size={34} strokeWidth={1.5} />
          <span className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">Synchronized movement</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ rows }: { rows: readonly ComparisonRow[] }) {
  return (
    <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
      <table className="min-w-[1080px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="bg-[#0B0D10] px-5 py-5 font-semibold text-white">Comparison Item</th>
            <th className="border-x border-[#76B900]/50 bg-[#0B0D10] px-5 py-5 font-semibold text-[#8DDB00]">Torsion Bar CNC Press Brake</th>
            <th className="bg-[#0B0D10] px-5 py-5 font-semibold text-white">Electro-hydraulic CNC Press Brake</th>
            <th className="bg-[#0B0D10] px-5 py-5 font-semibold text-white">NC Press Brake</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-neutral-200 last:border-0 align-top even:bg-neutral-50">
              <th scope="row" className="w-48 px-5 py-5 font-semibold text-[#101214]">{row.label}</th>
              <td className="border-x border-[#76B900]/30 px-5 py-5 leading-7 text-neutral-700">{row.torsion}</td>
              <td className="px-5 py-5 leading-7 text-neutral-600">{row.electroHydraulic}</td>
              <td className="px-5 py-5 leading-7 text-neutral-600">{row.nc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkflowStep({ item, index }: { item: WorkflowItem; index: number }) {
  const body = (
    <>
      <div className="flex items-center justify-between border-b border-current/15 pb-4">
        <span className="font-mono text-xs font-semibold text-[#76B900]">{String(index + 1).padStart(2, "0")}</span>
        {index < page.workflowEquipment.length - 1 ? <MoveRight size={17} className="text-zinc-600" aria-hidden="true" /> : null}
      </div>
      <h3 className="mt-5 text-base font-semibold leading-6">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
    </>
  );
  const className = `min-h-60 border p-5 ${
    item.title === "Torsion Bar CNC Press Brake"
      ? "border-[#76B900] bg-[#171C21] text-white"
      : "border-white/15 bg-[#12161A] text-white"
  } ${motionClass}`;

  return item.href ? <Link href={item.href} className={className}>{body}</Link> : <article className={className}>{body}</article>;
}

function ProductFaq({ item, index }: { item: FaqItem; index: number }) {
  return (
    <details className="group border-b border-neutral-300">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] [&::-webkit-details-marker]:hidden">
        <span className="flex items-start gap-4">
          <span className="mt-0.5 font-mono text-xs font-semibold text-[#5B8F00]">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-base font-semibold leading-7 text-[#101214] sm:text-lg">{item.question}</span>
        </span>
        <ChevronDown size={19} className="shrink-0 text-neutral-500 transition group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <p className="pb-7 pl-10 pr-8 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">{item.answer}</p>
    </details>
  );
}

export default function TorsionBarCncPressBrakeSolutionPage({
  product,
}: TorsionBarCncPressBrakeSolutionPageProps) {
  const technicalParameters = product.technicalParameters;
  const productUrl = `https://www.zyroncnc.com/products/${product.id}`;
  const productImage = `https://www.zyroncnc.com${product.image}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: page.hero.description,
    image: productImage,
    url: productUrl,
    category: product.categoryName,
    brand: { "@type": "Brand", name: "ZYRON" },
    manufacturer: { "@type": "Organization", name: "ZYRON Heavy Industry", url: "https://www.zyroncnc.com" },
    additionalProperty: product.specs.map((specification) => ({
      "@type": "PropertyValue",
      name: specification.label,
      value: specification.value,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "Bending Machines",
        item: "https://www.zyroncnc.com/products/series/bending-machines",
      },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main data-torsion-bar-cnc-press-brake-page data-product-solution-page={product.id} className="overflow-x-hidden bg-white text-[#101214]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <section data-section="hero" className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-12 text-white sm:px-8 lg:py-20">
        <div className="industrial-grid absolute inset-0 -z-30 opacity-40" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_79%_38%,rgba(118,185,0,0.16),transparent_27%),linear-gradient(120deg,rgba(11,13,16,0.72)_0%,rgba(11,13,16,0.97)_53%,rgba(23,28,33,0.78)_100%)]" />
        <div className="mx-auto max-w-7xl">
          <Link href="/products/series/bending-machines" className="text-sm text-zinc-400 transition hover:text-[#8DDB00] motion-reduce:transition-none">
            Bending Machines / {product.name}
          </Link>
          <div className="mt-10 grid gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-16">
            <div className="relative z-10">
              <h1 className="max-w-3xl text-[2.65rem] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-6xl lg:text-[4rem]">
                {page.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-zinc-100 sm:text-xl">{page.hero.subtitle}</p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">{page.hero.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink>{page.hero.primaryCta}</PrimaryLink>
                <SecondaryLink dark>{page.hero.secondaryCta}</SecondaryLink>
              </div>
              <div className="mt-10 grid gap-px border-y border-white/15 bg-white/15 sm:grid-cols-2">
                {page.hero.values.map((value) => (
                  <div key={value} className="bg-[#0B0D10]/90 px-4 py-4 text-sm font-medium leading-6 text-zinc-200">{value}</div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[30rem] sm:min-h-[38rem] lg:min-h-[44rem]">
              <div className="absolute inset-x-[2%] bottom-[3%] h-[13%] rounded-[50%] bg-black/75 blur-2xl" />
              <div className="absolute inset-x-[6%] bottom-[5%] h-[15%] rounded-[50%] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.14),rgba(255,255,255,0.02)_55%,rgba(0,0,0,0.32)_76%)] shadow-[0_30px_65px_rgba(0,0,0,0.55)]" />
              <Image
                src={product.image}
                alt="Torsion bar CNC press brake for sheet metal bending"
                fill
                priority
                sizes="(min-width: 1024px) 53vw, 100vw"
                className="relative z-10 object-contain object-center p-1 sm:p-4"
              />
            </div>
          </div>
        </div>
      </section>

      <section data-section="pain-points" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Production Challenges" title={page.painPointHeading} text="Start with repeatability, control, workpiece complexity and investment level before selecting the bending platform." />
          <div className="mt-10 border-t border-neutral-300">
            {page.painPoints.map((item, index) => <PainPointRow key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="solutions" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro dark label="Solution Positioning" title={page.solutionHeading} text="Three common production contexts show where torsion-bar synchronization and practical CNC control create value." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {page.solutions.map((item, index) => <SolutionPosition key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="applications" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Real Workshop Context" title={page.applicationHeading} text="Real industrial scenes show the workshops and fabricated products where CNC press-brake bending can form part of the production flow." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {page.applications.map((item) => <ApplicationCard key={item.title} item={item} />)}
          </div>
        </div>
      </section>

      <section data-section="materials" className="border-y border-white/10 bg-[#171C21] px-5 py-14 text-white sm:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1.58fr] lg:items-end">
            <div>
              <p className={sectionLabelClass}>Bending Materials</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{page.materialHeading}</h2>
            </div>
            <div className="grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
              {page.materials.map((material, index) => (
                <div key={material} className="flex items-center gap-4 bg-[#171C21] px-5 py-5">
                  <span className="font-mono text-xs font-semibold text-[#76B900]">0{index + 1}</span>
                  <span className="text-sm font-semibold text-zinc-100">{material}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 max-w-5xl text-sm leading-7 text-zinc-400">{page.materialNote}</p>
        </div>
      </section>

      <section data-section="process" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro label="Bending Process" title={page.processHeading} text="A practical six-step view from prepared sheet to a checked component ready for downstream manufacturing." />
          <div className="mt-12 grid lg:grid-cols-6">
            {page.processSteps.map((item, index) => <ProcessStep key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="torsion-synchronization" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20">
          <div>
            <p className={sectionLabelClass}>Mechanical Synchronization</p>
            <h2 className={lightHeadingClass}>{page.torsionHeading}</h2>
            <p className="mt-6 text-base leading-8 text-neutral-600">{page.torsionIntro}</p>
            <ul className="mt-8 border-t border-neutral-300">
              {page.torsionPoints.map((point) => (
                <li key={point} className="flex gap-4 border-b border-neutral-300 py-5 text-sm leading-7 text-neutral-700">
                  <Check className="mt-1 shrink-0 text-[#5B8F00]" size={17} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SynchronizationMotif />
            <div className="mt-4 grid gap-px bg-neutral-300 sm:grid-cols-2">
              {page.torsionConfigurations.map((configuration) => (
                <div key={configuration} className="bg-white px-4 py-4 text-sm leading-6 text-neutral-700">{configuration}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="cnc-control" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <p className={sectionLabelClass}>Controller Positioning</p>
            <h2 className={darkHeadingClass}>{page.controlHeading}</h2>
            <p className="mt-6 text-base leading-8 text-zinc-300">{page.controlIntro}</p>
            <ul className="mt-8 border-t border-white/15">
              {page.controlPoints.map((item) => (
                <li key={item} className="flex gap-4 border-b border-white/15 py-5 text-sm leading-7 text-zinc-300">
                  <Check className="mt-1 shrink-0 text-[#76B900]" size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="border border-white/15 bg-[#12161A] p-7 sm:p-9">
            <div className="flex items-center justify-between border-b border-white/15 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76B900]">Available configuration</p>
                <p className="mt-3 text-2xl font-semibold">CNC control functions</p>
              </div>
              <Gauge size={30} strokeWidth={1.5} className="text-[#76B900]" aria-hidden="true" />
            </div>
            <div className="mt-7 grid gap-3">
              {page.controllerFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-3 border border-white/10 bg-white/[0.035] px-4 py-4 text-sm leading-6 text-zinc-200">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#76B900]" aria-hidden="true" />
                  {feature}
                </div>
              ))}
            </div>
            <p className="mt-7 text-xs leading-6 text-zinc-500">Controller model, controllable axes and functions depend on the final machine configuration.</p>
          </aside>
        </div>
      </section>

      <section data-section="advantages" className="bg-[#171C21] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-20">
          <div className="relative min-h-[31rem] border border-white/10 bg-[radial-gradient(circle_at_50%_42%,rgba(118,185,0,0.13),transparent_45%),linear-gradient(145deg,#171C21,#0B0D10)] sm:min-h-[40rem]">
            <Image
              src={product.image}
              alt="Torsion bar CNC press brake machine for standard sheet metal bending"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-contain p-7"
            />
          </div>
          <div>
            <p className={sectionLabelClass}>Practical Machine Value</p>
            <h2 className={darkHeadingClass}>{page.advantageHeading}</h2>
            <div className="mt-9 grid gap-x-8 sm:grid-cols-2">
              {page.advantages.map((advantage, index) => (
                <div key={advantage} className="flex gap-4 border-t border-white/15 py-5">
                  <span className="font-mono text-xs font-semibold text-[#76B900]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-medium leading-6 text-zinc-200">{advantage}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 border-l-2 border-[#76B900] bg-white/[0.035] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Verified or configuration-dependent structure</p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{page.verifiedStructure.join(" · ")}</p>
            </div>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro label="Objective Selection" title={page.comparisonHeading} text="Each machine type serves a different production need. Compare synchronization, control, part complexity and investment before selecting the platform." />
          <ComparisonTable rows={page.comparisonRows} />
        </div>
      </section>

      <section data-section="workflow" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro dark label="Connected Production" title={page.workflowHeading} text={page.workflowSummary} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {page.workflowEquipment.map((item, index) => <WorkflowStep key={item.title} item={item} index={index} />)}
          </div>
        </div>
      </section>

      <section data-section="selection" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionIntro label="Configuration Guide" title={page.selectionHeading} text="Provide the real workpiece and production requirements so tonnage, length, synchronization, controller, tooling and options can be reviewed together." />
            <div className="mt-9 grid border-t border-neutral-300 sm:grid-cols-2">
              {page.selectionQuestions.map((question, index) => (
                <div key={question} className={`flex gap-3 border-b border-neutral-300 py-4 text-sm font-medium leading-6 text-neutral-700 sm:px-4 ${index % 2 === 0 ? "sm:pl-0" : "sm:border-l"}`}>
                  <Check size={16} className="mt-1 shrink-0 text-[#5B8F00]" aria-hidden="true" />
                  {question}
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start border border-neutral-800 bg-[#0B0D10] p-7 text-white shadow-[0_18px_55px_rgba(0,0,0,0.13)] sm:p-10 lg:sticky lg:top-24">
            <Settings2 size={32} strokeWidth={1.5} className="text-[#76B900]" aria-hidden="true" />
            <h3 className="mt-8 text-3xl font-semibold leading-tight">{page.selectionCta.title}</h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">{page.selectionCta.text}</p>
            <div className="mt-8"><PrimaryLink>{page.selectionCta.label}</PrimaryLink></div>
          </aside>
        </div>
      </section>

      <section data-section="technical" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionIntro label="Original Product Data" title={page.specificationHeading} />
            <p className="max-w-xl text-sm leading-7 text-neutral-600">All values below come from the existing torsion-bar CNC press-brake product data.</p>
          </div>
          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
            {technicalParameters ? (
              <table className="min-w-[1220px] border-collapse text-center text-xs sm:text-sm">
                <thead>
                  <tr>
                    {technicalParameters.columns.map((column) => {
                      const heading = splitSpecificationHeading(column);
                      return (
                        <th key={column} scope="col" className="bg-[#0B0D10] px-4 py-4 text-center font-semibold leading-5 text-white">
                          <span className="block whitespace-nowrap">{heading.label}</span>
                          {heading.unit ? <span className="mt-1 block text-center text-[0.7rem] font-medium text-zinc-400">{heading.unit}</span> : null}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {technicalParameters.rows.map((row, rowIndex) => (
                    <tr key={`${row[0]}-${rowIndex}`} className="border-b border-neutral-200 last:border-0 even:bg-neutral-50">
                      {row.map((cell, cellIndex) => (
                        <td key={`${row[0]}-${cellIndex}`} className={`whitespace-nowrap px-4 py-4 leading-6 ${cellIndex === 0 ? "font-semibold text-[#101214]" : "text-neutral-600"}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-sm text-neutral-600">Please confirm the final technical configuration with our sales engineer.</p>
            )}
          </div>
          <p className="mt-5 text-sm leading-7 text-neutral-600">{page.specificationNote}</p>
        </div>
      </section>

      <section data-section="tooling" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <Ruler size={34} strokeWidth={1.5} className="text-[#5B8F00]" aria-hidden="true" />
            <h2 className={lightHeadingClass}>{page.toolingHeading}</h2>
            <p className="mt-6 text-base leading-8 text-neutral-600">Tooling, V-die opening and material strength must be reviewed together with the required part geometry.</p>
            <div className="mt-8"><SecondaryLink>{page.toolingCta}</SecondaryLink></div>
          </div>
          <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
            {page.toolingPoints.map((point, index) => (
              <article key={point} className={`min-h-48 bg-[#F7F8F9] p-6 ${index === page.toolingPoints.length - 1 ? "sm:col-span-2" : ""}`}>
                <div className="flex items-center justify-between">
                  {index % 2 === 0 ? <Wrench size={20} className="text-[#5B8F00]" aria-hidden="true" /> : <Layers3 size={20} className="text-[#5B8F00]" aria-hidden="true" />}
                  <span className="font-mono text-xs text-neutral-400">0{index + 1}</span>
                </div>
                <p className="mt-8 text-base font-semibold leading-7 text-neutral-800">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="faq" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <div>
            <p className={sectionLabelClass}>Buyer Questions</p>
            <h2 className={lightHeadingClass}>{page.faqHeading}</h2>
            <p className="mt-6 text-base leading-8 text-neutral-600">Answers use current product information and keep configuration-dependent details conditional.</p>
          </div>
          <div>{page.faqs.map((item, index) => <ProductFaq key={item.question} item={item} index={index} />)}</div>
        </div>
      </section>

      <section data-section="internal-links" className="border-t border-neutral-200 bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={sectionLabelClass}>Explore Related Equipment</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#101214]">Continue planning the fabrication line.</h2>
            </div>
            <nav aria-label="Related product links" className="flex max-w-4xl flex-wrap gap-x-6 gap-y-3">
              {page.internalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 transition hover:text-[#5B8F00] motion-reduce:transition-none">
                  {link.label}<ArrowRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section data-section="cta" className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="industrial-grid absolute inset-0 -z-20 opacity-30" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_50%,rgba(118,185,0,0.13),transparent_31%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:items-end">
          <div>
            <p className={sectionLabelClass}>Talk to an Engineer</p>
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
