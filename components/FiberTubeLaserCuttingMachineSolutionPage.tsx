import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileInput,
  GripHorizontal,
  PackageCheck,
  PackageOpen,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import {
  applicationPhotos,
  confirmationPlaceholder,
  fiberTubeLaserCuttingMachinePage as page,
  technicalSpecificationFields,
  type ComparisonRow,
  type ContentCard,
  type FaqItem,
  type SolutionCard,
  type SpecificationField,
  type TubeProfile,
} from "@/data/fiber-tube-laser-cutting-machine-page";
import type { Product } from "@/data/products";

type FiberTubeLaserCuttingMachineSolutionPageProps = {
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
  GripHorizontal,
  SlidersHorizontal,
  ScanLine,
  PackageCheck,
  Wrench,
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
      <p
        className={
          dark
            ? "text-xs font-bold tracking-[0.18em] text-[#8DDB00]"
            : sectionLabelClass
        }
      >
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
        <h3 className="text-lg font-semibold leading-snug text-white">
          {item.title}
        </h3>
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
      <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
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

function TubeShape({ profile }: { profile: TubeProfile }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const shape = {
    round: <circle cx="60" cy="60" r="32" {...common} />,
    square: <rect x="28" y="28" width="64" height="64" rx="2" {...common} />,
    rectangle: <rect x="20" y="34" width="80" height="52" rx="2" {...common} />,
    oval: <ellipse cx="60" cy="60" rx="42" ry="28" {...common} />,
    waist: (
      <path
        d="M32 35c11 7 18 7 28 0 10 7 17 7 28 0 6 6 10 15 10 25s-4 19-10 25c-11-7-18-7-28 0-10-7-17-7-28 0-6-6-10-15-10-25s4-19 10-25Z"
        {...common}
      />
    ),
    angle: <path d="M30 24v66h62M30 24h25v41h37v25" {...common} />,
    channel: <path d="M88 26H32v68h56M88 26v22H55v24h33v22" {...common} />,
    profile: (
      <path d="M22 32h30l8 12 8-12h30v56H68l-8-12-8 12H22Z" {...common} />
    ),
  }[profile.shape];

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-24 w-24 text-[#8DDB00]"
      aria-hidden="true"
    >
      {shape}
    </svg>
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
            <th className="bg-[#1B2809] px-5 py-5 font-semibold text-[#A5E93A]">
              Fiber Tube Laser Cutting Machine
            </th>
            <th className="bg-black/35 px-5 py-5 font-semibold text-white">
              Sheet and Tube Fiber Laser Cutting Machine
            </th>
            <th className="bg-black/35 px-5 py-5 font-semibold text-white">
              Traditional Sawing / Drilling / Punching
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-white/10">
              <th
                scope="row"
                className="bg-white/[0.035] px-5 py-5 font-semibold text-white"
              >
                {row.label}
              </th>
              <td className="border-l border-[#76B900]/30 bg-[#76B900]/[0.055] px-5 py-5 leading-7 text-zinc-200">
                {row.tubeLaser}
              </td>
              <td className="border-l border-white/10 px-5 py-5 leading-7 text-zinc-400">
                {row.sheetAndTube}
              </td>
              <td className="border-l border-white/10 px-5 py-5 leading-7 text-zinc-400">
                {row.traditional}
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

export default function FiberTubeLaserCuttingMachineSolutionPage({
  product,
}: FiberTubeLaserCuttingMachineSolutionPageProps) {
  const resolveSpecificationValue = (field: SpecificationField) => {
    if (field.source === "name") return product.name;
    if (field.source === "spec" && field.sourceIndex !== undefined) {
      return product.specs[field.sourceIndex]?.value ?? confirmationPlaceholder;
    }
    if (field.source === "application") {
      return product.applications
        .filter((application) => application !== "Sheet metal processing")
        .join(", ");
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
      data-fiber-tube-laser-cutting-machine-page
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

      <section
        data-section="hero"
        className="relative overflow-hidden bg-[#0B0D10] px-5 pb-0 pt-10 text-white sm:px-8 lg:pt-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_77%_24%,rgba(118,185,0,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/products/series/laser-cutting-machines"
            className="text-xs font-semibold text-zinc-400 transition hover:text-[#8DDB00] motion-reduce:transition-none"
          >
            Fiber Laser Cutting Machines / {product.name}
          </Link>
          <div className="grid items-center gap-10 pb-12 pt-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8 lg:pb-16">
            <div className="relative z-10">
              <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.65rem]">
                {page.hero.H1}
              </h1>
              <p className="mt-7 max-w-2xl text-xl font-semibold leading-8 text-[#8DDB00]">
                {page.hero.subtitle}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
                {page.hero.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 max-sm:flex-col">
                <PrimaryLink>{page.hero.primaryCta}</PrimaryLink>
                <SecondaryLink dark>{page.hero.secondaryCta}</SecondaryLink>
              </div>
            </div>
            <div className="relative min-h-[340px] overflow-hidden border border-white/10 bg-[linear-gradient(150deg,#1B1F23_0%,#111417_66%,#0B0D10_100%)] sm:min-h-[470px] lg:min-h-[590px]">
              <div className="absolute inset-x-[8%] bottom-[8%] h-8 rounded-[50%] bg-black/70 blur-xl" />
              <Image
                src={product.image}
                alt="Fiber tube laser cutting machine for metal pipe and profile cutting"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-contain p-3 sm:p-7"
              />
            </div>
          </div>
          <div className="grid border-t border-white/20 sm:grid-cols-2 xl:grid-cols-4">
            {page.hero.values.map((value, index) => (
              <div
                key={value}
                className="flex min-h-24 items-center gap-4 border-b border-white/15 py-5 sm:px-5 sm:even:border-l xl:border-b-0 xl:border-l xl:first:border-l-0"
              >
                <span className="font-mono text-sm font-bold text-[#8DDB00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold uppercase leading-6 text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="pain-points" className="bg-[#15181B] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <SectionIntro
            index="01 / PROBLEM"
            title="What Tube Cutting Problems Can It Solve?"
            text="A dedicated tube workflow reduces the number of disconnected setups needed to turn raw tube into weld-ready structural parts."
            dark
          />
          <div>
            {page.painPoints.map((item, index) => (
              <PainPoint key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="solutions" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="02 / SOLUTION"
            title="Professional Tube Laser Cutting Solution"
            text="Choose the machine around the parts your workshop actually produces, then match the tube format, chuck, power and material-handling configuration."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-neutral-200">
            {page.solutions.map((item, index) => (
              <SolutionColumn key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="03 / REAL APPLICATIONS"
            title="Applicable Industries"
            text="Representative real-world production scenes and downstream products show where programmed tube cutting can support the fabrication workflow."
          />
          <div className="mt-12 grid gap-px bg-neutral-300 sm:grid-cols-2 xl:grid-cols-4">
            {applicationPhotos.map((item) => (
              <article
                key={item.title}
                className={`group bg-white ${cardMotionClass}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </div>
                <div className="min-h-48 border-t-2 border-[#76B900] p-6">
                  <h3 className="text-lg font-bold uppercase leading-tight text-[#111315]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="tube-types" className="bg-[#0B0D10] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="04 / PROFILE RANGE"
            title="Tube and Profile Types"
            text="Tube cutting capability depends on chuck structure, tube diameter, tube length, wall thickness, material type and machine configuration. Please confirm your tube drawing and processing requirement before quotation."
            dark
          />
          <div className="mt-12 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {page.tubeTypes.map((profile) => (
              <article
                key={profile.title}
                className={`min-h-72 bg-[#15181B] p-7 ${cardMotionClass}`}
              >
                <TubeShape profile={profile} />
                <h3 className="mt-5 text-lg font-bold uppercase text-white">
                  {profile.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{profile.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="materials" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="05 / MATERIAL"
            title="Tube Materials"
            text="The suitable tube wall thickness depends on laser power, material type, tube diameter, cutting gas, cutting speed and cutting quality requirement. Confirm material, size and wall thickness before quotation."
          />
          <div className="mt-12 grid gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            {page.materials.map((item, index) => (
              <article
                key={item.title}
                className={`min-h-60 bg-white p-7 ${cardMotionClass}`}
              >
                <span className="font-mono text-sm font-bold text-[#5B8F00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 text-xl font-bold uppercase leading-tight">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="process" className="bg-[#15181B] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="06 / PROCESS"
            title="From Raw Tube to Finished Tube Part"
            text="A clear programmed path connects the part drawing with loading, clamping, cutting and downstream assembly."
            dark
          />
          <ol className="mt-12 grid gap-px bg-white/15 md:grid-cols-2 xl:grid-cols-7">
            {page.process.map((item, index) => {
              const Icon = processIcons[index];
              return (
                <li key={item.title} className="relative min-h-64 bg-[#0B0D10] p-6">
                  <Icon size={28} className="text-[#8DDB00]" aria-hidden="true" />
                  <span className="mt-8 block font-mono text-xs font-bold text-[#8DDB00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-base font-bold uppercase leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{item.text}</p>
                  {index < page.process.length - 1 ? (
                    <ArrowRight
                      size={18}
                      className="absolute right-4 top-6 text-white/25"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section data-section="chuck-system" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <SectionIntro
              index="07 / CLAMPING"
              title="Chuck System for Tube Processing"
              text="The chuck is a key difference between a dedicated tube laser and a flat-sheet cutting platform. Final chuck structure is selected around the actual tube range and process."
            />
            <div
              className="mt-10 border border-neutral-300 bg-[#F5F5F7] p-6 sm:p-10"
              aria-label="Code-native diagram showing optional front chuck, tube support and rear chuck relationship"
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-5">
                <div className="flex h-28 w-20 items-center justify-center border-4 border-[#111315] bg-white text-center text-[10px] font-bold uppercase sm:w-28">
                  Front
                  <br />
                  chuck
                </div>
                <div className="relative h-10 border-y-8 border-[#5F6368] bg-neutral-300">
                  <div className="absolute left-1/2 top-full h-16 w-3 -translate-x-1/2 bg-[#111315]" />
                  <div className="absolute left-1/2 top-[calc(100%+4rem)] h-3 w-24 -translate-x-1/2 bg-[#111315]" />
                </div>
                <div className="flex h-28 w-20 items-center justify-center border-4 border-dashed border-[#76B900] bg-white text-center text-[10px] font-bold uppercase text-[#5B8F00] sm:w-28">
                  Optional
                  <br />
                  rear chuck
                </div>
              </div>
              <div className="mt-20 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                <span>Clamping & rotation</span>
                <span className="text-center text-[#5B8F00]">Long-tube support</span>
                <span className="text-right">Optional configuration</span>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-[#111315]">
            {page.chuckPoints.map((item, index) => (
              <article key={item.title} className="grid gap-4 border-b border-neutral-300 py-6 sm:grid-cols-[2.5rem_1fr]">
                <span className="font-mono text-xs font-bold text-[#5B8F00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-bold uppercase text-[#111315]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-neutral-600">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="loading-unloading" className="bg-[#0B0D10] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="08 / MATERIAL HANDLING"
            title="Loading and Unloading Options"
            text="Confirm tube length, tube weight, daily quantity, available floor space and automation requirements before selecting a material-handling approach."
            dark
          />
          <div className="mt-12 grid gap-px bg-white/15 lg:grid-cols-3">
            {page.loadingOptions.map((item, index) => (
              <article key={item.title} className={`min-h-72 bg-[#15181B] p-8 ${cardMotionClass}`}>
                <div className="flex h-20 items-end gap-2" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, barIndex) => (
                    <span
                      key={barIndex}
                      className="h-5 w-full border-y-2 border-[#8DDB00] bg-[#76B900]/10"
                    />
                  ))}
                </div>
                <span className="mt-7 block font-mono text-xs font-bold text-[#8DDB00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-bold uppercase text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="laser-power" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionIntro
                index="09 / POWER SELECTION"
                title="Choose the Right Laser Power"
                text="Power selection starts with the tube wall, material and geometry rather than a single headline number."
              />
              <p className="mt-8 border-l-4 border-[#76B900] bg-[#F5F5F7] p-6 text-sm font-bold uppercase leading-7 text-[#111315]">
                Laser power: {confirmationPlaceholder}
              </p>
            </div>
            <div className="grid gap-px bg-neutral-300 sm:grid-cols-2">
              {page.powerFactors.map((item, index) => (
                <article key={item.title} className={`bg-white p-7 ${cardMotionClass}`}>
                  <span className="font-mono text-xs font-bold text-[#5B8F00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-lg font-bold uppercase">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="cutting-gas" className="bg-[#15181B] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="10 / PROCESS GAS"
            title="Cutting Gas and Tube Edge Quality"
            text="Gas selection remains conditional on material, wall thickness, edge-quality target, hole pattern and operating cost."
            dark
          />
          <div className="mt-12 grid gap-px bg-white/15 lg:grid-cols-3">
            {page.gases.map((item, index) => (
              <article key={item.title} className={`bg-[#0B0D10] p-8 ${cardMotionClass}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8DDB00]">
                    0{index + 1}
                  </span>
                  <span className="h-3 w-20 border-y border-[#76B900]" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-2xl font-bold uppercase text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="advantages" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[380px] border border-neutral-300 bg-[#F5F5F7] sm:min-h-[520px]">
            <Image
              src={product.image}
              alt="Fiber tube laser cutting machine for metal pipe and profile cutting"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-contain p-5 sm:p-10"
            />
          </div>
          <div>
            <SectionIntro index="11 / ADVANTAGES" title="Why Choose This Fiber Tube Laser Cutting Machine?" />
            <ul className="mt-10 border-t-2 border-[#111315]">
              {page.advantages.map((advantage) => (
                <li key={advantage} className="flex gap-4 border-b border-neutral-300 py-4 text-sm font-semibold leading-7">
                  <Check size={19} className="mt-1 shrink-0 text-[#5B8F00]" aria-hidden="true" />
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="bg-[#0B0D10] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="12 / OBJECTIVE COMPARISON"
            title="Fiber Tube Laser vs Sheet and Tube Laser vs Traditional Tube Cutting"
            text="Each approach can be appropriate. The right choice depends on your material mix, part complexity, tube volume, available space and investment plan."
            dark
          />
          <ComparisonTable rows={page.comparison} />
        </div>
      </section>

      <section data-section="workflow" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="13 / COMPLETE WORKFLOW"
            title="Build a Complete Tube Fabrication Workflow"
            text="The fiber tube laser is a front-end tube-processing machine that can feed bending, welding, complementary sheet work and finishing."
          />
          <div className="mt-12 grid gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
            {page.workflow.map((item, index) => {
              const content = (
                <>
                  <span className="font-mono text-xs font-bold text-[#5B8F00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-7 text-lg font-bold uppercase leading-tight">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
                  {item.href ? (
                    <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5B8F00]">
                      View equipment <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              );
              return item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`min-h-64 bg-white p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#76B900] ${cardMotionClass}`}
                >
                  {content}
                </Link>
              ) : (
                <article key={item.title} className={`min-h-64 bg-white p-7 ${cardMotionClass}`}>
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section data-section="selection" className="bg-[#15181B] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <SectionIntro
              index="14 / CONFIGURATION"
              title="How to Choose the Right Fiber Tube Laser Cutting Machine?"
              text="Share the actual tube and production requirement so the configuration can be selected from evidence rather than assumptions."
              dark
            />
            <ol className="mt-10 grid gap-x-8 gap-y-0 sm:grid-cols-2 xl:grid-cols-3">
              {page.selectionQuestions.map((question, index) => (
                <li key={question} className="grid grid-cols-[2.25rem_1fr] gap-2 border-t border-white/15 py-4 text-sm leading-6 text-zinc-300">
                  <span className="font-mono text-xs font-bold text-[#8DDB00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {question}
                </li>
              ))}
            </ol>
          </div>
          <aside className="self-end border border-white/20 bg-[linear-gradient(145deg,#24282C,#111417)] p-8 sm:p-10">
            <Settings2 size={34} className="text-[#8DDB00]" aria-hidden="true" />
            <h3 className="mt-8 text-3xl font-extrabold uppercase leading-tight text-white">
              Send Your Tube Cutting Requirement
            </h3>
            <p className="mt-5 text-sm leading-7 text-zinc-300">
              Send the material, tube type, section, length, wall thickness, drawing and daily quantity. Our team will review a suitable configuration.
            </p>
            <div className="mt-8">
              <PrimaryLink>Request Recommendation</PrimaryLink>
            </div>
          </aside>
        </div>
      </section>

      <section data-section="technical" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="15 / ORIGINAL PARAMETERS"
            title="Technical Specifications"
            text="Original qualitative product specifications are preserved. Product-specific values that are not confirmed remain clearly marked for engineering confirmation."
          />
          <div
            data-technical-specification-table
            className="mt-10 max-w-full overflow-x-auto border border-neutral-300"
          >
            <table className="min-w-[3440px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#111315] text-white">
                  {technicalSpecificationFields.map((field) => {
                    const heading = splitSpecificationHeading(field.heading);
                    return (
                      <th
                        key={field.heading}
                        scope="col"
                        className="min-w-48 border-r border-white/15 px-5 py-5 text-center align-bottom text-xs font-bold uppercase tracking-[0.08em] last:border-r-0"
                      >
                        <span className="block whitespace-nowrap">{heading.label}</span>
                        {heading.unit ? (
                          <span className="mt-2 block text-center font-mono text-[11px] normal-case tracking-normal text-[#A5E93A]">
                            {heading.unit}
                          </span>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {technicalSpecificationFields.map((field) => (
                    <td
                      key={field.heading}
                      className="min-w-48 border-r border-neutral-300 px-5 py-6 text-center align-top text-sm leading-7 text-neutral-700 last:border-r-0"
                    >
                      {resolveSpecificationValue(field)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 border-l-4 border-[#76B900] bg-[#F5F5F7] p-5 text-sm leading-7 text-neutral-700">
            Final specifications depend on tube material, tube type, tube diameter, wall thickness, tube length, laser power, chuck system, loading method, cutting gas and selected machine configuration.
          </p>
        </div>
      </section>

      <section data-section="safety" className="bg-[#0B0D10] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <ShieldCheck size={36} className="text-[#8DDB00]" aria-hidden="true" />
            <SectionIntro
              index="16 / INSTALLATION"
              title="Workshop Preparation and Safety"
              text="Machine safety depends on the final configuration, installation, training, maintenance and applicable local rules."
              dark
            />
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {page.safety.map((item, index) => (
              <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 border-t border-white/15 py-5 text-sm leading-7 text-zinc-300">
                <span className="font-mono text-xs font-bold text-[#8DDB00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-section="faq" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionIntro
            index="17 / FAQ"
            title="Fiber Tube Laser Cutting Machine FAQ"
            text="Practical answers for machine selection, materials, tube profiles, loading, power and cutting gas."
          />
          <div>
            {page.faqs.map((item, index) => (
              <ProductFaq key={item.question} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section data-section="internal-links" className="border-t border-neutral-300 bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            index="18 / RELATED EQUIPMENT"
            title="Continue Building Your Fabrication Line"
            text="Compare related cutting and forming equipment already available in the ZYRON product range."
          />
          <div className="mt-10 grid gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
            {page.internalLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href ?? "/products"}
                className={`group min-h-56 bg-white p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#76B900] ${cardMotionClass}`}
              >
                <ArrowRight
                  size={19}
                  className="text-[#76B900] transition group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
                <h3 className="mt-8 text-lg font-bold uppercase leading-tight">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section="cta" className="bg-[#76B900] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1B2809]">
              19 / ENGINEERING SUPPORT
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.96] tracking-[-0.04em] text-[#0B0D10] sm:text-6xl">
              Need a Professional Tube Laser Cutting Solution?
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#18220B]">
              Send your tube material, tube type, diameter, length, wall thickness and drawing. We will recommend a suitable fiber tube laser cutting machine configuration for your workshop.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 max-sm:flex-col lg:justify-end">
            <Link
              href="/contact"
              style={clippedButtonStyle}
              className="inline-flex min-h-14 items-center justify-center gap-2 bg-[#0B0D10] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#24282C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B0D10] motion-reduce:transition-none max-sm:w-full"
            >
              Request a Quote
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              style={clippedButtonStyle}
              className="inline-flex min-h-14 items-center justify-center gap-2 border border-[#0B0D10] px-7 py-4 text-sm font-bold text-[#0B0D10] transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B0D10] motion-reduce:transition-none max-sm:w-full"
            >
              Contact Engineer
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
