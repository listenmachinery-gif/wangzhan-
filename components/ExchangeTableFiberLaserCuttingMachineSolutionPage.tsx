import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  FileInput,
  PackageOpen,
  Repeat2,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  applicationPhotos,
  confirmationPlaceholder,
  exchangeTableFiberLaserCuttingMachinePage as page,
  technicalSpecificationFields,
  type ComparisonRow,
  type ContentCard,
  type FaqItem,
  type SolutionCard,
  type SpecificationField,
} from "@/data/exchange-table-fiber-laser-cutting-machine-page";
import type { Product } from "@/data/products";

type ExchangeTableFiberLaserCuttingMachineSolutionPageProps = {
  product: Product;
};

const sectionLabelClass =
  "text-xs font-bold uppercase tracking-[0.18em] text-[#5B8F00]";
const lightHeadingClass =
  "mt-4 max-w-5xl text-3xl font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-6xl";
const darkHeadingClass =
  "mt-4 max-w-5xl text-3xl font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl";
const cardMotionClass =
  "transition duration-200 hover:-translate-y-0.5 hover:border-[#76B900]/70 motion-reduce:transform-none motion-reduce:transition-none";
const clippedButtonStyle = {
  clipPath:
    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
};

const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;

const splitSpecificationHeading = (heading: string) => {
  const normalized = heading.replace(/\s+/g, " ").trim();
  const match = normalized.match(specificationUnitPattern);

  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const jsonLd = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");

const processIcons = [
  FileInput,
  PackageOpen,
  SlidersHorizontal,
  ScanLine,
  Repeat2,
  Boxes,
  ArrowRight,
] as const;

function SectionIntro({
  index,
  title,
  text,
  dark = false,
}: {
  index: string;
  title: string;
  text?: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p className={dark ? "text-xs font-bold tracking-[0.18em] text-[#8DDB00]" : sectionLabelClass}>
        {index}
      </p>
      <h2 className={dark ? darkHeadingClass : lightHeadingClass}>{title}</h2>
      {text ? (
        <p
          className={`mt-6 max-w-3xl text-base leading-8 ${
            dark ? "text-zinc-300" : "text-neutral-600"
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
      style={clippedButtonStyle}
      className="inline-flex min-h-14 items-center justify-center gap-2 bg-[#76B900] px-7 py-4 text-sm font-bold text-[#0B0D10] transition hover:bg-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] motion-reduce:transition-none max-sm:w-full"
    >
      {children}
      <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}

function SecondaryLink({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href="/contact"
      style={clippedButtonStyle}
      className={`inline-flex min-h-14 items-center justify-center gap-2 border px-7 py-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] motion-reduce:transition-none max-sm:w-full ${
        dark
          ? "border-white/30 text-white hover:border-[#76B900] hover:text-[#8DDB00]"
          : "border-[#111315] text-[#111315] hover:border-[#76B900] hover:text-[#5B8F00]"
      }`}
    >
      {children}
      <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}

function PainPoint({ item, index }: { item: ContentCard; index: number }) {
  return (
    <article className="grid gap-4 border-t border-white/20 py-6 sm:grid-cols-[3rem_1fr]">
      <span className="font-mono text-sm font-semibold text-[#8DDB00]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <h3 className="text-lg font-semibold leading-snug text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{item.text}</p>
      </div>
    </article>
  );
}

function SolutionColumn({ item, index }: { item: SolutionCard; index: number }) {
  return (
    <article
      className={`border-t-2 border-[#111315] py-7 lg:px-7 lg:first:pl-0 ${cardMotionClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-[#5B8F00]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ArrowRight size={19} className="text-[#76B900]" aria-hidden="true" />
      </div>
      <h3 className="mt-7 text-2xl font-bold uppercase leading-tight text-[#111315]">
        {item.title}
      </h3>
      <dl className="mt-7 space-y-5 border-t border-neutral-200 pt-6">
        {[
          ["Suitable for", item.suitableFor],
          ["Recommended use", item.recommendedUse],
          ["Production value", item.productionValue],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#5B8F00]">
              {label}
            </dt>
            <dd className="mt-2 text-sm leading-7 text-neutral-600">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function ComparisonTable({ rows }: { rows: readonly ComparisonRow[] }) {
  return (
    <div className="mt-10 max-w-full overflow-x-auto border border-white/15">
      <table className="min-w-[1120px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="w-52 bg-black/35 px-5 py-5 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
              Compare by
            </th>
            <th className="bg-black/35 px-5 py-5 font-semibold text-white">
              Single-table fiber laser
            </th>
            <th className="bg-[#1B2809] px-5 py-5 font-semibold text-[#A5E93A]">
              Exchange-table fiber laser
            </th>
            <th className="bg-black/35 px-5 py-5 font-semibold text-white">
              Material-handling laser line
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-white/10">
              <th scope="row" className="bg-white/[0.035] px-5 py-5 font-semibold text-white">
                {row.label}
              </th>
              <td className="border-l border-white/10 px-5 py-5 leading-7 text-zinc-400">
                {row.singleTable}
              </td>
              <td className="border-l border-[#76B900]/30 bg-[#76B900]/[0.055] px-5 py-5 leading-7 text-zinc-200">
                {row.exchangeTable}
              </td>
              <td className="border-l border-white/10 px-5 py-5 leading-7 text-zinc-400">
                {row.automaticLine}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductFaq({ item, index }: { item: FaqItem; index: number }) {
  return (
    <details className="group border-b border-neutral-300 first:border-t">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] [&::-webkit-details-marker]:hidden">
        <span className="flex items-start gap-4">
          <span className="mt-1 font-mono text-xs font-bold text-[#5B8F00]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold leading-7 text-[#111315] sm:text-lg">
            {item.question}
          </span>
        </span>
        <ChevronDown
          size={19}
          className="shrink-0 text-neutral-500 transition group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <p className="pb-7 pl-10 pr-8 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
        {item.answer}
      </p>
    </details>
  );
}

export default function ExchangeTableFiberLaserCuttingMachineSolutionPage({
  product,
}: ExchangeTableFiberLaserCuttingMachineSolutionPageProps) {
  const resolveSpecificationValue = (field: SpecificationField) => {
    if (field.source === "name") return product.name;
    if (field.source === "spec" && field.sourceIndex !== undefined) {
      return product.specs[field.sourceIndex]?.value ?? confirmationPlaceholder;
    }
    if (field.source === "application") {
      return product.applications.join(", ");
    }
    return field.confirmedValue ?? confirmationPlaceholder;
  };

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
    manufacturer: {
      "@type": "Organization",
      name: "ZYRON Heavy Industry",
      url: "https://www.zyroncnc.com",
    },
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Products",
        item: "https://www.zyroncnc.com/products",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Fiber Laser Cutting Machines",
        item: "https://www.zyroncnc.com/products/series/laser-cutting-machines",
      },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main
      data-exchange-table-fiber-laser-cutting-machine-page
      data-product-solution-page={product.id}
      className="max-w-full overflow-x-clip bg-white text-[#111315]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />

      <section data-section="hero" className="relative overflow-hidden bg-white px-5 py-10 sm:px-8 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-neutral-200" />
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products/series/laser-cutting-machines"
            className="text-xs font-semibold text-neutral-500 transition hover:text-[#5B8F00] motion-reduce:transition-none"
          >
            Fiber Laser Cutting Machines / {product.name}
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.93fr_1.07fr] lg:items-center lg:gap-10">
            <div className="relative z-10">
              <h1 className="max-w-3xl text-[2.55rem] font-black uppercase leading-[0.96] tracking-[-0.045em] text-[#0B0D10] sm:text-6xl lg:text-[4.35rem]">
                {page.hero.H1}
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#26292C] sm:text-xl">
                {page.hero.subtitle}
              </p>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {page.hero.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink>{page.hero.primaryCta}</PrimaryLink>
                <SecondaryLink>{page.hero.secondaryCta}</SecondaryLink>
              </div>
            </div>
            <div className="relative min-h-[19rem] sm:min-h-[30rem] lg:min-h-[36rem]">
              <div className="absolute inset-x-[10%] bottom-[6%] h-[12%] rounded-[50%] bg-black/20 blur-2xl" />
              <Image
                src={product.image}
                alt="Exchange-table fiber laser cutting machine for sheet metal cutting"
                fill
                priority
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="relative z-10 object-contain object-center"
              />
            </div>
          </div>
          <div className="mt-8 grid border border-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            {page.hero.values.map((value) => (
              <div
                key={value}
                className="flex min-h-16 items-center gap-3 border-b border-neutral-300 px-4 py-4 text-xs font-bold uppercase leading-5 text-[#111315] last:border-b-0 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="h-4 w-0.5 rotate-45 bg-[#76B900]" aria-hidden="true" />
                {value}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="pain-points" className="bg-[#15181B] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro
            index="01 / PRODUCTION CHALLENGES"
            title="What Cutting Problems Can It Solve?"
            text="Evaluate the production bottleneck before selecting power, working area or optional equipment."
            dark
          />
          <div>
            {page.painPoints.map((item, index) => (
              <PainPoint key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="solutions" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="02 / SOLUTION POSITIONING"
            title="Exchange-table Sheet Metal Laser Cutting Solution"
            text="Three common production contexts show where alternating tables bring practical workflow value."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-neutral-200">
            {page.solutions.map((item, index) => (
              <SolutionColumn key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="bg-[#F5F5F7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionIntro index="03 / REAL INDUSTRY CONTEXT" title="Applications" />
            <p className="max-w-xl text-sm leading-7 text-neutral-600">
              Ten real production scenes show where exchange-table sheet cutting can support a broader fabrication process.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {applicationPhotos.map((item, index) => (
              <article key={item.image} className={`group border border-neutral-300 bg-white ${cardMotionClass}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </div>
                <div className="border-t-4 border-[#15181B] p-4">
                  <span className="font-mono text-xs font-bold text-[#5B8F00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-sm font-bold uppercase leading-5 text-[#111315]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-neutral-600">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="materials" className="border-y border-neutral-300 bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.38fr_1fr] lg:items-center">
            <SectionIntro index="04" title="Materials" />
            <div>
              <div className="grid border-l border-t border-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
                {page.materials.map((material) => (
                  <div key={material} className="border-b border-r border-neutral-300 px-5 py-5 text-sm font-semibold text-[#111315]">
                    {material}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-6 text-neutral-500">{page.materialNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section data-section="process" className="bg-[#15181B] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="05 / CUTTING PROCESS"
            title="From Sheet Metal to Cut Parts"
            text="A practical seven-stage route from drawing preparation to the next fabrication process."
            dark
          />
          <div className="mt-12 grid gap-px bg-white/15 lg:grid-cols-7">
            {page.cuttingProcess.map((item, index) => {
              const Icon = processIcons[index] ?? ArrowRight;
              return (
                <article key={item.title} className="relative bg-[#15181B] p-5 lg:min-h-72">
                  <div className="flex items-center justify-between">
                    <Icon size={25} strokeWidth={1.8} className="text-[#8DDB00]" aria-hidden="true" />
                    <span className="font-mono text-xs text-zinc-500">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-base font-semibold leading-6 text-white">{item.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-zinc-400">{item.text}</p>
                  {index < page.cuttingProcess.length - 1 ? (
                    <ArrowRight className="absolute -right-3 top-8 z-10 hidden text-[#76B900] lg:block" size={18} aria-hidden="true" />
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section data-section="exchange-table-design" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <SectionIntro
              index="06 / DUAL-PLATFORM PRINCIPLE"
              title="Why Exchange-table Design?"
              text="The exchange mechanism organizes cutting and preparation as two alternating positions. It does not by itself mean that a separate material-loading system is included."
            />
            <ul className="mt-8 border-t border-neutral-300">
              {page.exchangeTablePoints.map((point) => (
                <li key={point} className="flex gap-4 border-b border-neutral-300 py-4 text-sm leading-7 text-neutral-700">
                  <Check size={17} className="mt-1 shrink-0 text-[#5B8F00]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-neutral-300 bg-[#F5F5F7] p-5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              {["Standby table", "Cutting table"].map((label, index) => (
                <div key={label} className={index === 1 ? "sm:col-start-3" : ""}>
                  <div className="relative aspect-[5/3] border-2 border-[#15181B] bg-white p-3 shadow-[inset_0_0_0_1px_#D7D9DC]">
                    <div className="grid h-full grid-cols-6 gap-1">
                      {Array.from({ length: 24 }).map((_, cell) => (
                        <span key={cell} className="border border-neutral-300 bg-neutral-100" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#111315]">{label}</p>
                </div>
              ))}
              <div className="flex items-center justify-center gap-1 text-[#76B900] sm:col-start-2 sm:row-start-1 sm:flex-col">
                <ArrowRight size={30} aria-hidden="true" />
                <ArrowRight size={30} className="rotate-180" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-7 grid gap-3 border-t border-neutral-300 pt-5 sm:grid-cols-2">
              <p className="text-sm leading-7 text-neutral-600">One platform can be prepared outside the cutting zone.</p>
              <p className="text-sm leading-7 text-neutral-600">The second platform supports the active cutting cycle.</p>
            </div>
            <p className="mt-5 border-l-2 border-[#76B900] pl-4 text-xs leading-6 text-neutral-500">
              Exchange time: Please confirm with our sales engineer
            </p>
          </div>
        </div>
      </section>

      <section data-section="laser-power" className="bg-[#F5F5F7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <SectionIntro
            index="07 / CONFIGURATION LOGIC"
            title="Choose the Right Laser Power"
            text={`Laser power: ${confirmationPlaceholder}`}
          />
          <div className="border-t border-neutral-400">
            {page.powerGuide.map((point, index) => (
              <div key={point} className="grid gap-4 border-b border-neutral-300 py-5 sm:grid-cols-[3rem_1fr]">
                <span className="font-mono text-sm font-bold text-[#5B8F00]">0{index + 1}</span>
                <p className="text-sm leading-7 text-neutral-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="assist-gas" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="08 / PROCESS SELECTION"
            title="Cutting Gas and Edge Quality"
            text="Final gas selection should balance material, thickness, edge requirement, machine configuration and operating cost."
          />
          <div className="mt-10 border-t border-[#111315]">
            {page.gasGuide.map((item, index) => (
              <article key={item.title} className="grid gap-5 border-b border-neutral-300 py-6 sm:grid-cols-[3rem_11rem_1fr] sm:items-start">
                <span className="font-mono text-sm font-bold text-[#5B8F00]">0{index + 1}</span>
                <h3 className="text-lg font-bold uppercase text-[#111315]">{item.title}</h3>
                <p className="text-sm leading-7 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="advantages" className="border-y border-neutral-300 bg-[#F5F5F7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <SectionIntro
              index="09 / MACHINE VALUE"
              title="Why Choose This Exchange-Table Fiber Laser Cutting Machine?"
            />
            <div className="mt-8 flex items-center gap-4 border border-neutral-300 bg-white p-5">
              <Repeat2 className="shrink-0 text-[#5B8F00]" size={34} aria-hidden="true" />
              <p className="text-sm leading-7 text-neutral-600">
                Dual platforms coordinate preparation and cutting without introducing unsupported machine-detail claims.
              </p>
            </div>
          </div>
          <div className="grid border-l border-t border-neutral-300 sm:grid-cols-2">
            {page.advantages.map((advantage, index) => (
              <div key={advantage} className="border-b border-r border-neutral-300 bg-white p-5">
                <span className="font-mono text-xs font-bold text-[#5B8F00]">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#111315]">{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="comparison" className="bg-[#15181B] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="10 / OBJECTIVE COMPARISON"
            title="Exchange-table vs Single-table vs Material-handling Line"
            text="Each structure has a valid place. Select by output, space, material flow and integration needs."
            dark
          />
          <ComparisonTable rows={page.comparison} />
        </div>
      </section>

      <section data-section="workflow" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="11 / COMPLETE PRODUCTION ROUTE"
            title="Build a Complete Sheet Metal Fabrication Workflow"
            text="The exchange-table fiber laser is a high-efficiency front-end cutting machine that can feed an organized sequence of forming, joining and finishing operations."
          />
          <div className="mt-10 grid gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            {page.workflow.map((item, index) => (
              <article key={item.title} className="relative min-h-56 bg-[#F5F5F7] p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#5B8F00]">{String(index + 1).padStart(2, "0")}</span>
                  {index < page.workflow.length - 1 ? <ArrowRight size={17} className="text-[#76B900]" aria-hidden="true" /> : null}
                </div>
                <h3 className="mt-8 text-lg font-bold uppercase leading-6 text-[#111315]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="selection" className="border-y border-neutral-300 bg-[#F5F5F7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
          <div>
            <SectionIntro
              index="12 / REQUIREMENT CHECKLIST"
              title="How to Choose the Right Exchange-Table Fiber Laser Cutting Machine?"
              text="Prepare these inputs so the machine, process and workshop layout can be evaluated together."
            />
            <div className="mt-10 grid border-l border-t border-neutral-300 sm:grid-cols-2">
              {page.selectionInputs.map((input) => (
                <div key={input} className="flex gap-3 border-b border-r border-neutral-300 bg-white px-4 py-4 text-sm font-medium leading-6 text-[#111315]">
                  <Check size={16} className="mt-1 shrink-0 text-[#5B8F00]" aria-hidden="true" />
                  {input}
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start border border-[#15181B] bg-[#15181B] p-7 text-white lg:sticky lg:top-28">
            <Settings2 size={32} className="text-[#8DDB00]" aria-hidden="true" />
            <h3 className="mt-8 text-3xl font-black uppercase leading-tight tracking-[-0.03em]">
              Send Your Sheet Metal Cutting Requirement
            </h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Include material, maximum thickness, common sheet size, daily quantity and the next fabrication process.
            </p>
            <div className="mt-8"><PrimaryLink>Request Recommendation</PrimaryLink></div>
          </aside>
        </div>
      </section>

      <section data-section="technical" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="13 / ORIGINAL DATA + CONFIRMATION POLICY"
            title="Technical Specifications"
            text="Confirmed qualitative values come from the existing product record. Fields without a verified model-specific value stay clearly marked for engineering confirmation."
          />
          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300" data-technical-table-scroll>
            <table className="min-w-[2860px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#15181B] text-white">
                  {technicalSpecificationFields.map((field) => {
                    const heading = splitSpecificationHeading(field.heading);
                    return (
                      <th key={field.heading} scope="col" className="min-w-44 border-r border-white/15 px-5 py-5 align-bottom last:border-r-0">
                        <span className="block whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em]">
                          {heading.label}
                        </span>
                        {heading.unit ? (
                          <span className="mt-1 block text-center text-[11px] font-medium normal-case tracking-normal text-zinc-400">
                            {heading.unit}
                          </span>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white align-top">
                  {technicalSpecificationFields.map((field) => (
                    <td key={field.heading} className="border-r border-neutral-300 px-5 py-6 text-sm leading-7 text-neutral-700 last:border-r-0">
                      {resolveSpecificationValue(field)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-6 text-neutral-500">
            Final specifications depend on sheet material, thickness, working area, laser power, cutting gas, exchange table system, control system and selected machine configuration.
          </p>
          <div className="mt-8 grid border-l border-t border-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            {product.specs.map((specification) => (
              <div key={specification.label} className="border-b border-r border-neutral-300 bg-[#F5F5F7] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5B8F00]">{specification.label}</p>
                <p className="mt-3 text-sm leading-7 text-neutral-700">{specification.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="safety" className="bg-[#15181B] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <ShieldCheck size={34} className="text-[#8DDB00]" aria-hidden="true" />
            <SectionIntro index="14 / INSTALLATION READINESS" title="Workshop Preparation and Safety" dark />
          </div>
          <div className="border-t border-white/20">
            {page.safety.map((point, index) => (
              <div key={point} className="grid gap-4 border-b border-white/15 py-5 sm:grid-cols-[3rem_1fr]">
                <span className="font-mono text-sm font-bold text-[#8DDB00]">0{index + 1}</span>
                <p className="text-sm leading-7 text-zinc-300">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="faq" className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.58fr_1.42fr] lg:gap-20">
          <div>
            <SectionIntro index="15 / FAQ" title="Frequently Asked Questions" />
            <p className="mt-6 text-sm leading-7 text-neutral-600">
              Configuration-dependent answers remain conditional until material, thickness and production requirements are confirmed.
            </p>
          </div>
          <div>
            {page.faqs.map((item, index) => (
              <ProductFaq key={item.question} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="internal-links" className="border-y border-neutral-300 bg-[#F5F5F7] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.34fr_1fr] lg:items-start">
            <div>
              <p className={sectionLabelClass}>16 / RELATED EQUIPMENT</p>
              <h2 className="mt-3 text-2xl font-extrabold uppercase leading-tight tracking-[-0.03em]">Explore the workflow</h2>
            </div>
            <nav aria-label="Related sheet metal equipment" className="grid border-l border-t border-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
              {page.internalLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex min-h-20 items-center justify-between gap-4 border-b border-r border-neutral-300 bg-white px-5 py-4 text-sm font-semibold text-[#111315] transition hover:text-[#5B8F00] motion-reduce:transition-none"
                >
                  {item.title}
                  <ArrowRight size={16} className="shrink-0 text-[#76B900]" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section data-section="cta" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 border-l-4 border-[#76B900] pl-6 sm:pl-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8DDB00]">17 / NEXT STEP</p>
            <h2 className="mt-5 max-w-4xl text-3xl font-black uppercase leading-[1] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {page.finalCta.title}
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">{page.finalCta.text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <PrimaryLink>{page.finalCta.primary}</PrimaryLink>
            <SecondaryLink dark>{page.finalCta.secondary}</SecondaryLink>
          </div>
        </div>
      </section>
    </main>
  );
}
