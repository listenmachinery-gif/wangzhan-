import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleGauge,
  Cpu,
  GitCompareArrows,
  HardHat,
  Layers3,
  MoveRight,
  PackageOpen,
  Repeat2,
  RotateCw,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Workflow,
  Wrench,
} from "lucide-react";
import {
  applicationPhotos,
  confirmationValue,
  hydraulicFourRollPlateRollingMachinePage as page,
  type ContentCard,
  type SpecificationField,
} from "@/data/hydraulic-four-roll-plate-rolling-machine-page";
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
      throw new Error(
        `Unexpected hydraulic four-roll plate rolling specification at index ${field.sourceIndex}`,
      );
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

export default function HydraulicFourRollPlateRollingMachineSolutionPage({
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
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `/products/${product.id}`,
      },
    ],
  };

  return (
    <main
      data-hydraulic-four-roll-plate-rolling-machine-page
      className="overflow-hidden bg-[#090b0d] text-white"
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
        className="relative isolate border-b border-white/10 px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:px-12"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_40%,rgba(118,185,0,0.14),transparent_27%),linear-gradient(135deg,#0b0e11_0%,#11161b_55%,#080a0c_100%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              {page.hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-zinc-200">
              {page.hero.subtitle}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              {page.hero.description}
            </p>
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
                <div
                  key={value}
                  className="flex items-center gap-3 bg-[#0c0f12] px-4 py-3 text-xs font-medium text-zinc-300"
                >
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
              alt="Hydraulic four-roll plate rolling machine for cylinder and tank shell forming"
              fill
              priority
              fetchPriority="high"
              unoptimized
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-contain p-6 sm:p-10"
            />
            <div className="absolute bottom-5 left-5 border-l-2 border-[#76B900] pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                Hydraulic four-roll platform
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Final capacity and control subject to confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-section="pain-points" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Rolling problems"
            title="What fabrication problems can four-roll forming address?"
            text="The machine creates value when clamping, edge preparation, rolling passes, inspection and material handling are planned around the actual shell."
          />
          <ContentGrid items={page.painPoints} columns="lg:grid-cols-5" />
        </div>
      </section>

      <section
        data-section="solutions"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Four-roll solutions"
            title="Hydraulic plate rolling solutions by workpiece"
            text="Select the machine from the workpiece envelope, material strength, production quantity and handling plan."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {page.solutions.map((item, index) => (
              <article
                key={item.title}
                className={`border border-white/10 bg-black/20 p-7 ${motionClass}`}
              >
                <span className="font-mono text-sm text-[#76B900]">0{index + 1}</span>
                <h3 className="mt-8 text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-5 text-sm leading-7 text-zinc-400">{item.text}</p>
                <dl className="mt-8 space-y-5 border-t border-white/10 pt-6">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Suitable for
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-zinc-200">
                      {item.suitableFor}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Recommended use
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-zinc-200">
                      {item.recommendedUse}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Real applications"
            title="Where hydraulic four-roll forming supports production"
            text="These real photographs show representative industries and fabricated parts. Machine suitability is confirmed from your material and drawings."
          />
          <div className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {applicationPhotos.map((item) => (
              <article key={item.title} className="group">
                <div className="relative aspect-[3/2] overflow-hidden bg-zinc-900">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="materials"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionIntro
            label="Materials"
            title="Material strength defines the real rolling load"
            text="Suitable thickness depends on strength, width, diameter, pre-bending demand, roll geometry and the selected machine configuration."
          />
          <div className="divide-y divide-white/10 border-y border-white/10">
            {page.materials.map((item, index) => (
              <div
                key={item.title}
                className="grid gap-3 py-5 sm:grid-cols-[48px_190px_1fr] sm:items-center"
              >
                <span className="font-mono text-xs text-[#76B900]">0{index + 1}</span>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-6 text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="formed-shapes" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Formed workpieces"
            title="Cylinders, shells, arcs and compatible cones"
            text="Final quality depends on the material, blank, target geometry, pre-bending process, roll positions and operating setup."
          />
          <ContentGrid items={page.shapes} columns="lg:grid-cols-4" />
        </div>
      </section>

      <section
        data-section="rolling-process"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Four-roll process"
            title="From flat plate to a pre-bent rolled shell"
            text="The forming sequence belongs inside a complete route that includes blank preparation, controlled clamping, dimensional checks and downstream joining."
          />
          <div className="mt-14 grid gap-0 lg:grid-cols-8">
            {page.rollingProcess.map((item, index) => (
              <article
                key={item.title}
                className="relative border-l border-white/15 pb-10 pl-7 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-5 lg:pt-8"
              >
                <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full border-2 border-[#0d1115] bg-[#76B900] lg:-top-[7px] lg:left-0" />
                <p className="font-mono text-xs text-[#76B900]">0{index + 1}</p>
                <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="four-roll-design" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Four-roll design"
            title="Top, bottom and two side rolls work as one forming system"
            text="The existing product photograph remains the source of truth for visible structure. Final movement axes, drive and discharge details follow the confirmed machine."
          />
          <ContentGrid items={page.fourRollDesign} columns="lg:grid-cols-3" />
        </div>
      </section>

      <section
        data-section="hydraulic-system"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <CircleGauge className="h-9 w-9 text-[#76B900]" />
            <SectionIntro
              label="Hydraulic system"
              title="Controlled roll movement for the selected forming load"
              text="Hydraulic layout, pressure range, synchronization, filtration and cooling are confirmed against the proposed duty cycle."
            />
          </div>
          <ContentGrid items={page.hydraulicSystem} columns="lg:grid-cols-2" />
        </div>
      </section>

      <section data-section="pre-bending-clamping" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <p className={labelClass}>Pre-bending and clamping</p>
            <h2 className={headingClass}>{page.preBendingClamping.title}</h2>
            <p className="mt-6 text-base leading-8 text-zinc-400">
              {page.preBendingClamping.text}
            </p>
          </div>
          <div className="border border-white/10 bg-[linear-gradient(145deg,#11161a,#090b0d)] p-7 sm:p-10">
            <div className="relative h-44 overflow-hidden border-b border-white/10">
              <div className="absolute bottom-8 left-[8%] h-3 w-[84%] bg-zinc-500" />
              <div className="absolute bottom-[68px] left-[18%] h-14 w-14 rounded-full border-[9px] border-zinc-700" />
              <div className="absolute bottom-[68px] right-[18%] h-14 w-14 rounded-full border-[9px] border-zinc-700" />
              <div className="absolute bottom-[82px] left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border-[12px] border-[#76B900]/75" />
              <div className="absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-[10px] border-zinc-600" />
              <div className="absolute bottom-[80px] left-[12%] h-12 w-[76%] rounded-t-[50%] border-t-2 border-[#76B900]" />
            </div>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {page.preBendingClamping.checks.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#76B900]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        data-section="control-options"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-5">
            <Cpu className="mt-1 h-9 w-9 shrink-0 text-[#76B900]" />
            <SectionIntro
              label="Control options"
              title="Choose the control level for the actual production route"
              text="Controller, position feedback, stored programs and cycle complexity must be confirmed before quotation."
            />
          </div>
          <ContentGrid items={page.controlOptions} columns="lg:grid-cols-5" />
        </div>
      </section>

      <section data-section="feeding-unloading" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Material handling"
            title="Feeding, support and unloading options"
            text="Handling equipment must match plate dimensions, plate weight, completed-shell geometry, daily quantity and workshop access."
          />
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {page.feedingUnloading.map((item, index) => {
              const Icon = [Layers3, SlidersHorizontal, HardHat, PackageOpen, Repeat2][index];
              return (
                <article key={item.title} className="bg-[#090b0d] p-7">
                  <Icon className="h-7 w-7 text-[#76B900]" />
                  <h3 className="mt-8 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        data-section="advantages"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[420px] border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(118,185,0,0.12),transparent_36%),#090b0d]">
            <Image
              src={product.image}
              alt="Hydraulic four-roll plate rolling machine overview"
              fill
              loading="lazy"
              unoptimized
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-contain p-8"
            />
          </div>
          <div>
            <SectionIntro
              label="Machine advantages"
              title="Why select a hydraulic four-roll solution?"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {page.advantages.map((item) => (
                <article key={item.title} className="border-l border-[#76B900]/60 pl-5">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Machine comparison"
            title="Hydraulic four-roll vs three-roll configurations"
            text="Each structure serves a different workload. Final selection follows the workpiece, output, handling needs and desired control level."
          />
          <div className="mt-12 overflow-x-auto border border-white/10">
            <table className="min-w-[980px] w-full border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.05]">
                  <th className="p-5 text-xs uppercase tracking-wider text-zinc-500">Selection point</th>
                  <th className="p-5 text-sm font-semibold text-white">Semi-automatic three-roll</th>
                  <th className="p-5 text-sm font-semibold text-white">Fully automatic three-roll</th>
                  <th className="border-l border-[#76B900]/25 bg-[#76B900]/[0.07] p-5 text-sm font-semibold text-[#92d82a]">
                    Hydraulic four-roll
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.comparison.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th className="p-5 text-sm font-medium text-zinc-200">{row.label}</th>
                    <td className="p-5 text-sm leading-6 text-zinc-400">{row.semiAutomaticThreeRoll}</td>
                    <td className="p-5 text-sm leading-6 text-zinc-400">{row.fullyAutomaticThreeRoll}</td>
                    <td className="border-l border-[#76B900]/20 bg-[#76B900]/[0.035] p-5 text-sm leading-6 text-zinc-200">
                      {row.hydraulicFourRoll}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        data-section="fabrication-workflow"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Complete production route"
            title="Build a complete plate rolling workflow"
            text="The rolling machine becomes most productive when blank preparation, handling, welding, checking and finishing are designed as one cell."
          />
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {page.workflow.map((item, index) => {
              const content = (
                <>
                  <div className="flex items-center justify-between">
                    <Workflow className="h-5 w-5 text-[#76B900]" />
                    <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
                </>
              );
              return item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group bg-[#090b0d] p-6 transition hover:bg-white/[0.04]"
                >
                  {content}
                </Link>
              ) : (
                <article key={item.title} className="bg-[#090b0d] p-6">
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section data-section="selection-guide" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Configuration guide"
            title="How to choose the right hydraulic four-roll machine"
            text="Send these inputs with a workpiece drawing so the recommendation starts from the real process rather than a generic model name."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.selectionGuide.map((item, index) => (
              <article
                key={item.title}
                className={`flex gap-5 border border-white/10 p-6 ${motionClass}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#76B900]/40 font-mono text-xs text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 border border-[#76B900]/30 bg-[#76B900]/[0.05] p-7 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold text-white">Send your four-roll requirement</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Include the drawing, material, production quantity and handling plan.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#76B900] px-6 text-sm font-semibold text-[#0a0c0d] sm:w-auto"
            >
              Request Recommendation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        data-section="technical-specifications"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Technical specifications"
            title="Original data, separated from fields to confirm"
            text="The four existing project values remain unchanged. Every added field requires confirmation for the selected machine."
          />
          <div className="mt-12 overflow-x-auto border border-white/10">
            <table className="min-w-max border-collapse text-center">
              <thead>
                <tr className="bg-white/[0.055]">
                  {page.specificationFields.map((field) => (
                    <th
                      key={field.heading}
                      className="border-r border-white/10 px-5 py-4 text-center align-bottom last:border-r-0"
                    >
                      <span className="block whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-zinc-200">
                        {field.heading}
                      </span>
                      {field.unit ? (
                        <span className="mt-2 block text-center font-mono text-[11px] font-normal normal-case tracking-normal text-[#76B900]">
                          {field.unit}
                        </span>
                      ) : (
                        <span className="mt-2 block h-[16px]" aria-hidden="true" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10">
                  {page.specificationFields.map((field) => (
                    <td
                      key={field.heading}
                      className="max-w-[280px] border-r border-white/10 px-5 py-5 text-center text-sm leading-6 text-zinc-300 last:border-r-0"
                    >
                      {resolveSpecification(product, field)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-6 text-zinc-500">
            Final specifications depend on plate material, strength, thickness, rolling length,
            target diameter, pre-bending requirement, control system, supports and machine
            configuration.
          </p>
        </div>
      </section>

      <section data-section="workshop-notes" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Workshop preparation"
            title="Prepare the hydraulic rolling cell before installation"
          />
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {page.workshopNotes.map((item, index) => {
              const icons = [HardHat, Ruler, CircleGauge, ShieldCheck, Layers3, Wrench, Repeat2];
              const Icon = icons[index];
              return (
                <article key={item.title} className="bg-[#090b0d] p-7">
                  <Icon className="h-6 w-6 text-[#76B900]" />
                  <h3 className="mt-8 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        data-section="related-machines"
        className="border-y border-white/10 bg-[#0d1115] px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Related equipment"
            title="Compare rolling and blank-preparation options"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.relatedMachines.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group border border-white/10 p-6 ${motionClass}`}
              >
                <div className="flex items-center justify-between gap-5">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#76B900]" />
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section="faq" className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <SectionIntro
            label="FAQ"
            title="Questions before selecting a hydraulic four-roll machine"
          />
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {page.faq.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-base font-semibold text-white marker:content-none">
                  <span>{item.question}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#76B900] transition group-open:rotate-180" />
                </summary>
                <p className="max-w-3xl pb-7 pr-10 text-sm leading-7 text-zinc-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="final-cta"
        className="relative isolate border-t border-white/10 px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(118,185,0,0.16),transparent_42%)]" />
        <div className="mx-auto max-w-5xl border border-white/10 bg-white/[0.035] px-6 py-14 text-center sm:px-12 sm:py-16">
          <RotateCw className="mx-auto h-9 w-9 text-[#76B900]" />
          <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            {page.finalCta.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400">
            {page.finalCta.text}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#76B900] px-6 text-sm font-semibold text-[#0a0c0d] transition hover:bg-[#8bd20a]"
            >
              {page.finalCta.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#76B900]"
            >
              {page.finalCta.secondaryCta}
              <GitCompareArrows className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
