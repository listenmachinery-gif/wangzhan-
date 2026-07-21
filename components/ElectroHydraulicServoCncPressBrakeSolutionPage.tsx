import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleGauge,
  Crosshair,
  Layers3,
  MoveRight,
  Settings2,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import {
  electroHydraulicServoCncPressBrakePage as page,
  type ApplicationPhoto,
  type ComparisonRow,
  type ContentCard,
  type FaqItem,
  type SolutionCard,
  type SystemSection,
  type WorkflowItem,
} from "@/data/electro-hydraulic-servo-cnc-press-brake-page";
import type { Product } from "@/data/products";

type ElectroHydraulicServoCncPressBrakeSolutionPageProps = {
  product: Product;
};

const sectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[#76B900]";
const lightSectionHeadingClass =
  "mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-[#101214] sm:text-5xl";
const darkSectionHeadingClass =
  "mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-white sm:text-5xl";
const cardMotionClass =
  "transition duration-200 hover:-translate-y-0.5 hover:border-[#76B900]/70 motion-reduce:transform-none motion-reduce:transition-none";

const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;

const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(specificationUnitPattern);

  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
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
      <h2
        className={dark ? darkSectionHeadingClass : lightSectionHeadingClass}
      >
        {title}
      </h2>
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

function PainPointCard({ item, index }: { item: ContentCard; index: number }) {
  return (
    <article
      className={`border border-neutral-200 bg-white p-6 sm:p-7 ${cardMotionClass} ${
        index === 0 ? "lg:col-span-2" : ""
      }`}
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

function SolutionPosition({ item, index }: { item: SolutionCard; index: number }) {
  return (
    <article
      className={`border border-white/15 bg-[#12161A] p-7 lg:min-h-[34rem] ${cardMotionClass}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <span className="font-mono text-sm text-[#76B900]">0{index + 1}</span>
        <MoveRight className="text-zinc-600" size={21} aria-hidden="true" />
      </div>
      <h3 className="mt-8 text-2xl font-semibold leading-snug text-white">
        {item.title}
      </h3>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">
            Suitable for
          </dt>
          <dd className="mt-3 text-sm leading-7 text-zinc-300">
            {item.suitableFor}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">
            Recommended use
          </dt>
          <dd className="mt-3 text-sm leading-7 text-zinc-300">
            {item.recommendedUse}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[#76B900]">
            Production value
          </dt>
          <dd className="mt-3 text-sm leading-7 text-zinc-300">
            {item.productionValue}
          </dd>
        </div>
      </dl>
      <p className="mt-7 border-t border-white/10 pt-6 text-xs leading-6 text-zinc-500">
        {item.text}
      </p>
    </article>
  );
}

function ApplicationCard({
  item,
  index,
}: {
  item: ApplicationPhoto;
  index: number;
}) {
  return (
    <article
      className={`group overflow-hidden border border-neutral-200 bg-white ${cardMotionClass}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          loading="lazy"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute bottom-4 left-4 font-mono text-xs font-semibold text-white/85">
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

function ProcessStep({
  item,
  index,
  total,
}: {
  item: ContentCard;
  index: number;
  total: number;
}) {
  return (
    <article className="relative border-t border-neutral-300 py-6 lg:border-l lg:border-t-0 lg:px-5 lg:py-0 lg:first:border-l-0 lg:first:pl-0">
      <p className="font-mono text-3xl font-semibold text-[#76B900]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-5 text-lg font-semibold text-[#101214]">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
      {index < total - 1 ? (
        <ArrowRight
          size={17}
          className="absolute -right-2 top-3 hidden text-[#76B900] lg:block"
          aria-hidden="true"
        />
      ) : null}
    </article>
  );
}

function SystemFeature({
  content,
  icon,
  reverse = false,
}: {
  content: SystemSection;
  icon: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-20 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <p className={sectionLabelClass}>{content.eyebrow}</p>
        <h2 className={lightSectionHeadingClass}>{content.heading}</h2>
        <p className="mt-6 text-base leading-8 text-neutral-600">
          {content.intro}
        </p>
        <ul className="mt-8 border-t border-neutral-300">
          {content.points.map((point) => (
            <li
              key={point}
              className="flex gap-4 border-b border-neutral-300 py-5 text-sm leading-7 text-neutral-700"
            >
              <Check
                className="mt-1 shrink-0 text-[#5B8F00]"
                size={17}
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <aside className="border border-neutral-800 bg-[#0B0D10] p-7 text-white shadow-[0_18px_55px_rgba(0,0,0,0.12)] sm:p-9">
        <div className="flex items-center justify-between border-b border-white/15 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76B900]">
              Configurable system
            </p>
            <p className="mt-3 text-2xl font-semibold">Select by part drawing</p>
          </div>
          <span className="text-[#76B900]">{icon}</span>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {content.configurations.map((feature) => (
            <div
              key={feature}
              className="flex min-h-20 items-center gap-3 border border-white/10 bg-white/[0.035] px-4 py-4 text-sm text-zinc-200"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 bg-[#76B900]"
                aria-hidden="true"
              />
              {feature}
            </div>
          ))}
        </div>
        <p className="mt-7 text-xs leading-6 text-zinc-500">
          Exact functions depend on the final controller, axes and machine order.
        </p>
      </aside>
    </div>
  );
}

function ComparisonTable({ rows }: { rows: readonly ComparisonRow[] }) {
  return (
    <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
      <table className="min-w-[1120px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="w-48 bg-[#0B0D10] px-5 py-5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
              Compare by
            </th>
            <th className="bg-[#0B0D10] px-5 py-5 text-sm font-semibold text-white">
              NC Press Brake
            </th>
            <th className="bg-[#0B0D10] px-5 py-5 text-sm font-semibold text-white">
              Torsion Bar CNC Press Brake
            </th>
            <th className="bg-[#162008] px-5 py-5 text-sm font-semibold text-[#9DE12D]">
              Electro-Hydraulic Servo CNC
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-neutral-200 last:border-0 even:bg-neutral-50"
            >
              <th scope="row" className="px-5 py-5 font-semibold text-[#101214]">
                {row.label}
              </th>
              <td className="border-l border-neutral-200 px-5 py-5 leading-7 text-neutral-600">
                {row.nc}
              </td>
              <td className="border-l border-neutral-200 px-5 py-5 leading-7 text-neutral-600">
                {row.torsion}
              </td>
              <td className="border-l border-neutral-200 bg-[#76B900]/[0.055] px-5 py-5 leading-7 text-neutral-700">
                {row.servo}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkflowStep({
  item,
  index,
  total,
}: {
  item: WorkflowItem;
  index: number;
  total: number;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-[#76B900]">
          {String(index + 1).padStart(2, "0")}
        </span>
        {item.href ? (
          <ArrowRight size={16} className="text-zinc-500" aria-hidden="true" />
        ) : null}
      </div>
      <h3 className="mt-7 text-lg font-semibold text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{item.text}</p>
    </>
  );

  return (
    <div className="relative">
      {item.href ? (
        <Link
          href={item.href}
          className={`block h-full min-h-56 border border-white/15 bg-[#12161A] p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76B900] ${cardMotionClass}`}
        >
          {body}
        </Link>
      ) : (
        <article
          className={`h-full min-h-56 border border-white/15 bg-[#12161A] p-6 ${cardMotionClass}`}
        >
          {body}
        </article>
      )}
      {index < total - 1 ? (
        <ArrowRight
          size={18}
          className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 text-[#76B900] xl:block"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

function ProductFaq({ item, index }: { item: FaqItem; index: number }) {
  return (
    <details className="group border-b border-neutral-300 first:border-t">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] [&::-webkit-details-marker]:hidden">
        <span className="flex items-start gap-4">
          <span className="mt-0.5 font-mono text-xs font-semibold text-[#5B8F00]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold leading-7 text-[#101214] sm:text-lg">
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

export default function ElectroHydraulicServoCncPressBrakeSolutionPage({
  product,
}: ElectroHydraulicServoCncPressBrakeSolutionPageProps) {
  const detail = product;
  const productUrl = `https://www.zyroncnc.com/products/${product.id}`;
  const productImage = `https://www.zyroncnc.com${product.image}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
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
        name: "Bending Machines",
        item: "https://www.zyroncnc.com/products/series/bending-machines",
      },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main
      data-electro-hydraulic-servo-cnc-press-brake-page
      data-product-solution-page={product.id}
      className="overflow-x-hidden bg-white text-[#101214]"
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
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-12 text-white sm:px-8 lg:py-20"
      >
        <div className="industrial-grid absolute inset-0 -z-30 opacity-45" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_38%,rgba(118,185,0,0.17),transparent_26%),linear-gradient(120deg,rgba(11,13,16,0.72)_0%,rgba(11,13,16,0.96)_53%,rgba(21,26,31,0.78)_100%)]" />
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products/series/bending-machines"
            className="text-sm text-zinc-400 transition hover:text-[#8DDB00] motion-reduce:transition-none"
          >
            Bending Machines / {product.name}
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
                  <div
                    key={value}
                    className="bg-[#0B0D10]/90 px-4 py-4 text-sm font-medium leading-6 text-zinc-200"
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[28rem] sm:min-h-[35rem] lg:min-h-[42rem]">
              <div className="absolute inset-x-[4%] bottom-[3%] h-[14%] rounded-[50%] bg-black/75 blur-2xl" />
              <div className="absolute inset-x-[8%] bottom-[5%] h-[15%] rounded-[50%] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),rgba(255,255,255,0.025)_53%,rgba(0,0,0,0.3)_75%)] shadow-[0_30px_65px_rgba(0,0,0,0.55)]" />
              <Image
                src={product.image}
                alt="Electro-hydraulic servo CNC press brake for precision sheet metal bending"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="relative z-10 object-contain object-center p-1 sm:p-4"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="pain-points"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Production Challenges"
            title={page.painPointHeading}
            text="Start with the real workpiece, production rhythm and consistency requirement before selecting axes, controls and tooling."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.painPoints.map((item, index) => (
              <PainPointCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="solutions"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            dark
            label="Solution Positioning"
            title={page.solutionHeading}
            text="Three production contexts show how closed-loop ram control, CNC programming and configurable positioning fit different fabrication workflows."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {page.solutions.map((item, index) => (
              <SolutionPosition key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="applications"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Real Industry Context"
            title={page.applicationHeading}
            text={page.applicationIntro}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {page.applications.map((item, index) => (
              <ApplicationCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="materials"
        className="border-y border-white/10 bg-[#171C21] px-5 py-14 text-white sm:px-8 lg:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1.58fr] lg:items-end">
            <div>
              <p className={sectionLabelClass}>Bending Materials</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                {page.materialHeading}
              </h2>
            </div>
            <div className="grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
              {page.materials.map((material, index) => (
                <div
                  key={material}
                  className="flex items-center gap-4 bg-[#171C21] px-5 py-5"
                >
                  <span className="font-mono text-xs font-semibold text-[#76B900]">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-semibold text-zinc-100">
                    {material}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 max-w-5xl text-sm leading-7 text-zinc-400">
            {page.materialNote}
          </p>
        </div>
      </section>

      <section
        data-section="process"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Bending Process"
            title={page.processHeading}
            text="A seven-step process view connects prepared sheet, CNC setup, controlled forming and downstream manufacturing."
          />
          <div className="mt-12 grid lg:grid-cols-7">
            {page.processSteps.map((item, index) => (
              <ProcessStep
                key={item.title}
                item={item}
                index={index}
                total={page.processSteps.length}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="servo-synchronization"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <SystemFeature
          content={page.servoSynchronization}
          icon={<CircleGauge size={32} strokeWidth={1.5} aria-hidden="true" />}
        />
      </section>

      <section
        data-section="cnc-control"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <SystemFeature
          content={page.cncControl}
          reverse
          icon={
            <SlidersHorizontal size={32} strokeWidth={1.5} aria-hidden="true" />
          }
        />
      </section>

      <section
        data-section="back-gauge"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <SystemFeature
          content={page.backGauge}
          icon={<Crosshair size={32} strokeWidth={1.5} aria-hidden="true" />}
        />
      </section>

      <section
        data-section="crowning-tooling"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <Wrench
              size={34}
              strokeWidth={1.5}
              className="text-[#5B8F00]"
              aria-hidden="true"
            />
            <p className={`${sectionLabelClass} mt-7`}>
              {page.crowningTooling.eyebrow}
            </p>
            <h2 className={lightSectionHeadingClass}>
              {page.crowningTooling.heading}
            </h2>
            <p className="mt-6 text-base leading-8 text-neutral-600">
              {page.crowningTooling.intro}
            </p>
            <div className="mt-8">
              <SecondaryLink>{page.crowningTooling.cta}</SecondaryLink>
            </div>
          </div>
          <div>
            <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
              {page.crowningTooling.points.map((point, index) => (
                <article key={point} className="min-h-52 bg-[#F7F8F9] p-6">
                  <div className="flex items-center justify-between">
                    {index % 2 === 0 ? (
                      <Wrench
                        size={20}
                        className="text-[#5B8F00]"
                        aria-hidden="true"
                      />
                    ) : (
                      <Layers3
                        size={20}
                        className="text-[#5B8F00]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-mono text-xs text-neutral-400">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-8 text-base font-semibold leading-7 text-neutral-800">
                    {point}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-px grid gap-px bg-neutral-200 sm:grid-cols-3">
              {page.crowningTooling.configurations.map((item) => (
                <div
                  key={item}
                  className="bg-white px-4 py-5 text-center text-sm font-medium text-neutral-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="advantages"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div className="relative min-h-[29rem] border border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(118,185,0,0.12),transparent_44%),linear-gradient(145deg,#171C21,#0B0D10)] sm:min-h-[37rem]">
              <Image
                src={product.image}
                alt="Electro-hydraulic servo CNC press brake machine"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 43vw, 100vw"
                className="object-contain p-7"
              />
            </div>
            <div>
              <p className={sectionLabelClass}>Precision Machine Value</p>
              <h2 className={darkSectionHeadingClass}>{page.advantageHeading}</h2>
              <div className="mt-9 grid gap-x-8 sm:grid-cols-2">
                {page.advantages.map((advantage, index) => (
                  <div
                    key={advantage}
                    className="flex gap-4 border-t border-white/15 py-5"
                  >
                    <span className="font-mono text-xs font-semibold text-[#76B900]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-medium leading-6 text-zinc-200">
                      {advantage}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-l-2 border-[#76B900] bg-white/[0.035] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                  Verified in current product data
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {page.verifiedStructure.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="comparison"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Objective Selection"
            title={page.comparisonHeading}
            text="Each press-brake platform serves a different production need. Compare synchronization, axes, workpiece complexity and investment level before selecting."
          />
          <ComparisonTable rows={page.comparisonRows} />
        </div>
      </section>

      <section
        data-section="workflow"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            dark
            label="Connected Production"
            title={page.workflowHeading}
            text={page.workflowSummary}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.workflowEquipment.map((item, index) => (
              <WorkflowStep
                key={item.title}
                item={item}
                index={index}
                total={page.workflowEquipment.length}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="selection"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionIntro
              label="Configuration Guide"
              title={page.selectionHeading}
              text="Provide the real part and production requirement so tonnage, length, axes, controller, tooling and compensation can be reviewed as one system."
            />
            <div className="mt-9 grid border-t border-neutral-300 sm:grid-cols-2">
              {page.selectionQuestions.map((question, index) => (
                <div
                  key={question}
                  className={`flex gap-3 border-b border-neutral-300 py-4 text-sm font-medium leading-6 text-neutral-700 sm:px-4 ${
                    index % 2 === 0 ? "sm:pl-0" : "sm:border-l"
                  }`}
                >
                  <Check
                    size={16}
                    className="mt-1 shrink-0 text-[#5B8F00]"
                    aria-hidden="true"
                  />
                  {question}
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start border border-neutral-800 bg-[#0B0D10] p-7 text-white shadow-[0_18px_55px_rgba(0,0,0,0.13)] sm:p-10 lg:sticky lg:top-24">
            <Settings2
              size={32}
              strokeWidth={1.5}
              className="text-[#76B900]"
              aria-hidden="true"
            />
            <h3 className="mt-8 text-3xl font-semibold leading-tight">
              {page.selectionCta.title}
            </h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              {page.selectionCta.text}
            </p>
            <div className="mt-8">
              <PrimaryLink>{page.selectionCta.label}</PrimaryLink>
            </div>
          </aside>
        </div>
      </section>

      <section
        data-section="technical"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionIntro
              label="Original Product Data"
              title={page.specificationHeading}
            />
            <p className="max-w-xl text-sm leading-7 text-neutral-600">
              All 16 columns and 26 model rows below come directly from the existing
              electro-hydraulic servo CNC press-brake dataset.
            </p>
          </div>
          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
            {detail.technicalParameters ? (
              <table className="min-w-[2460px] border-collapse text-center text-xs sm:text-sm">
                <thead>
                  <tr>
                    {detail.technicalParameters.columns.map((column) => {
                      const heading = splitColumnHeading(column);
                      return (
                        <th
                          key={column}
                          scope="col"
                          className="bg-[#0B0D10] px-4 py-4 text-center font-semibold leading-5 text-white"
                        >
                          <span className="block whitespace-nowrap">
                            {heading.label}
                          </span>
                          {heading.unit ? (
                            <span className="mt-2 block text-center text-[0.7rem] font-medium text-zinc-400">
                              {heading.unit}
                            </span>
                          ) : null}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {detail.technicalParameters.rows.map((row, rowIndex) => (
                    <tr
                      key={`${row[0]}-${rowIndex}`}
                      className="border-b border-neutral-200 last:border-0 even:bg-neutral-50"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${row[0]}-${cellIndex}`}
                          className={`whitespace-nowrap px-4 py-4 leading-6 ${
                            cellIndex === 0
                              ? "font-semibold text-[#101214]"
                              : "text-neutral-600"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-sm text-neutral-600">
                Please confirm the final technical configuration with our sales
                engineer.
              </p>
            )}
          </div>
          <p className="mt-5 text-sm leading-7 text-neutral-600">
            {page.specificationNote}
          </p>
        </div>
      </section>

      <section
        data-section="faq"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <div>
            <p className={sectionLabelClass}>Buyer Questions</p>
            <h2 className={lightSectionHeadingClass}>{page.faqHeading}</h2>
            <p className="mt-6 text-base leading-8 text-neutral-600">
              Answers use the current product information and keep controller,
              axes, tooling and compensation details configuration-dependent.
            </p>
          </div>
          <div>
            {page.faqs.map((item, index) => (
              <ProductFaq key={item.question} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="internal-links"
        className="border-t border-neutral-200 bg-[#F4F6F8] px-5 py-12 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={sectionLabelClass}>Explore Related Equipment</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#101214]">
                Continue planning the fabrication line.
              </h2>
            </div>
            <nav
              aria-label="Related product links"
              className="flex max-w-4xl flex-wrap gap-x-6 gap-y-3"
            >
              {page.internalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 transition hover:text-[#5B8F00] motion-reduce:transition-none"
                >
                  {link.label}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section
        data-section="cta"
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="industrial-grid absolute inset-0 -z-20 opacity-35" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_50%,rgba(118,185,0,0.14),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:items-end">
          <div>
            <p className={sectionLabelClass}>Talk to an Engineer</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.12] text-white sm:text-5xl">
              {page.finalCta.title}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
              {page.finalCta.text}
            </p>
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
