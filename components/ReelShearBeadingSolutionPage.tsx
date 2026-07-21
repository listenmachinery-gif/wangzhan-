import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Factory,
  Layers3,
  Ruler,
  Scissors,
  Settings2,
  Wrench,
} from "lucide-react";
import { reelShearBeadingPageContent } from "@/data/reel-shear-beading-page";
import type { Product } from "@/data/products";

type ReelShearBeadingSolutionPageProps = {
  product: Product;
};

const sectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";
const applicationIcons = [Factory, Wrench, Layers3, Ruler, Settings2, Scissors];

const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);

  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const jsonLd = (value: object) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

function SectionIntro({
  label,
  title,
  text,
  light = false,
}: {
  label: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-4xl">
      <p className={sectionLabelClass}>{label}</p>
      <h2
        className={`mt-4 text-3xl font-semibold leading-tight sm:text-5xl ${
          light ? "text-white" : "text-neutral-950"
        }`}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-6 max-w-3xl text-base leading-8 ${
            light ? "text-zinc-400" : "text-neutral-600"
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function CuttingBeadingDiagram() {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#111417] p-6 sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(118,185,0,0.12),transparent_32%)]" />
      <svg
        viewBox="0 0 640 420"
        role="img"
        aria-label="Thin sheet cutting and reinforcement beading process diagram"
        className="relative h-auto w-full text-[#76B900]"
      >
        <defs>
          <linearGradient id="reel-sheet" x1="0" x2="1">
            <stop offset="0" stopColor="#2A3036" />
            <stop offset="1" stopColor="#161A1E" />
          </linearGradient>
        </defs>
        <path
          d="M78 105H562V318H78Z"
          fill="url(#reel-sheet)"
          stroke="#5C6670"
          strokeWidth="2"
        />
        <path
          d="M116 151H516"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M116 193C150 169 184 169 218 193S286 217 320 193 388 169 422 193 490 217 524 193"
          fill="none"
          stroke="#E6E8EA"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M116 244C150 220 184 220 218 244S286 268 320 244 388 220 422 244 490 268 524 244"
          fill="none"
          stroke="#8A949E"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M116 286H516"
          fill="none"
          stroke="#5C6670"
          strokeWidth="2"
          strokeDasharray="10 12"
        />
        <circle cx="116" cy="151" r="10" fill="#76B900" />
        <circle cx="516" cy="151" r="10" fill="#76B900" />
        <path
          d="M290 74L320 104 350 74"
          fill="none"
          stroke="#76B900"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="78" y="360" fill="#A1A1AA" fontSize="18" fontFamily="Arial, sans-serif">
          CUT
        </text>
        <text x="266" y="360" fill="#FFFFFF" fontSize="18" fontFamily="Arial, sans-serif">
          REINFORCE
        </text>
        <text x="493" y="360" fill="#A1A1AA" fontSize="18" fontFamily="Arial, sans-serif">
          FORM
        </text>
      </svg>
    </div>
  );
}

export default function ReelShearBeadingSolutionPage({
  product,
}: ReelShearBeadingSolutionPageProps) {
  const content = reelShearBeadingPageContent;
  const technicalParameters = product.technicalParameters;
  const productUrl = "https://www.zyroncnc.com/products/reel-shear-beading-machine";
  const productImage = `https://www.zyroncnc.com${product.image}`;

  if (!technicalParameters) {
    throw new Error("Reel Shear Beading Machine technical parameters are required");
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: product.name,
    description: content.hero.description,
    image: productImage,
    url: productUrl,
    category: "Sheet Metal Cutting and Beading Machine",
    brand: {
      "@type": "Brand",
      name: "ZYRON",
    },
    manufacturer: {
      "@type": "Organization",
      name: "ZYRON Heavy Industry",
      url: "https://www.zyroncnc.com",
    },
    additionalProperty: technicalParameters.columns.map((column, index) => ({
      "@type": "PropertyValue",
      name: column,
      value: technicalParameters.rows[0]?.[index] ?? "",
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
        name: "Shearing Machines",
        item: "https://www.zyroncnc.com/products/series/shearing-machines",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main
      data-reel-shear-solution-page
      className="overflow-x-hidden bg-white text-[#101214]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      <section
        data-section="hero"
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-12 text-white sm:px-8 lg:py-20"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_28%,rgba(118,185,0,0.14),transparent_29%),linear-gradient(135deg,#0B0D10_0%,#15191d_58%,#08090b_100%)]" />
        <div className="mx-auto max-w-[1440px]">
          <Link
            href="/products/series/shearing-machines"
            className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Shearing Machines
          </Link>

          <div className="mt-10 grid min-w-0 gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center xl:gap-20">
            <div className="min-w-0">
              <p className={sectionLabelClass}>{content.hero.eyebrow}</p>
              <h1 className="mt-5 max-w-4xl break-words text-4xl font-semibold leading-[1.06] text-white sm:text-5xl xl:text-6xl">
                {content.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-zinc-200 sm:text-2xl sm:leading-9">
                {content.hero.subtitle}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
                {content.hero.description}
              </p>

              <div className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {content.hero.valuePoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-200">
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-[#76B900]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#76B900] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8ddb00]"
                >
                  Get Cutting &amp; Beading Solution
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8ddb00]"
                >
                  Request Machine Configuration
                </Link>
              </div>
            </div>

            <div className="relative min-w-0">
              <div className="absolute -inset-4 bg-[radial-gradient(circle,rgba(118,185,0,0.17),transparent_64%)] blur-2xl" />
              <div className="relative aspect-[1.28] overflow-hidden border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01))] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-x-[10%] bottom-[9%] h-[10%] rounded-[50%] bg-black/55 blur-xl" />
                <Image
                  src={product.image}
                  alt="Reel shear beading machine for sheet metal cutting and duct beading"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1280px) 52vw, (min-width: 1024px) 50vw, 100vw"
                  className="object-contain p-5 sm:p-8"
                />
              </div>
              <div className="grid border-x border-b border-white/10 bg-black/20 sm:grid-cols-3">
                {[
                  ["Model", technicalParameters.rows[0]?.[0] ?? "—"],
                  ["Functions", "Cutting + Beading"],
                  ["Workshop", "HVAC / Thin Sheet"],
                ].map(([label, value]) => (
                  <div key={label} className="border-white/10 px-5 py-4 sm:border-l sm:first:border-l-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#76B900]">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section="problems" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <SectionIntro
              label="What Problems Can It Solve?"
              title="Practical answers to common thin-sheet preparation gaps."
              text="The machine is most useful when a workshop needs flexible cutting and reinforcement beading without adding a large production system."
            />
            <div className="grid border-t border-neutral-200 md:grid-cols-2">
              {content.problems.map((problem, index) => (
                <article
                  key={problem.title}
                  className={`border-b border-neutral-200 py-7 md:px-7 ${
                    index % 2 === 1 ? "md:border-l" : "md:pl-0"
                  } ${index === content.problems.length - 1 ? "md:col-span-2" : ""}`}
                >
                  <p className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug text-neutral-950">
                    {problem.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{problem.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="solutions"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Thin Sheet Cutting & Beading Solution"
            title="Choose the role this machine should play in your workshop."
            text="The same compact machine can support different production environments, but its value depends on how it connects to the surrounding duct process."
            light
          />
          <div className="mt-12 grid gap-px bg-white/10 lg:grid-cols-3">
            {content.solutions.map((solution, index) => (
              <article
                key={solution.title}
                className="min-h-full bg-[#111417] p-7 transition duration-300 hover:-translate-y-1 hover:bg-[#15191D] sm:p-9"
              >
                <p className="text-4xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 text-2xl font-semibold leading-tight text-white">
                  {solution.title}
                </h3>
                <dl className="mt-8 grid gap-6">
                  {[
                    ["Suitable for", solution.suitableFor],
                    ["Recommended use", solution.recommendedUse],
                    ["Production value", solution.productionValue],
                  ].map(([label, value]) => (
                    <div key={label} className="border-t border-white/10 pt-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76B900]">
                        {label}
                      </dt>
                      <dd className="mt-2 text-sm leading-7 text-zinc-400">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Applications"
            title="Where compact cutting and beading support makes sense."
            text="These use cases describe production fit, not guaranteed capacity. Material and process details still need to be confirmed before model selection."
          />
          <div className="mt-10 grid border-y border-neutral-200 md:grid-cols-2 xl:grid-cols-3">
            {content.applications.map((application, index) => {
              const Icon = applicationIcons[index];

              return (
                <article
                  key={application.title}
                  className="border-b border-neutral-200 py-8 transition hover:bg-neutral-50 md:px-8 md:[&:nth-child(even)]:border-l xl:border-l xl:[&:nth-child(3n+1)]:border-l-0 xl:[&:nth-child(3n+1)]:pl-0"
                >
                  <Icon size={24} strokeWidth={1.6} className="text-[#76B900]" aria-hidden="true" />
                  <h3 className="mt-6 text-xl font-semibold text-neutral-950">
                    {application.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {application.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section data-section="materials" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:gap-16">
            <SectionIntro
              label="Materials"
              title="Confirm material behavior before confirming capacity."
              text={content.materialsNote}
            />
            <div className="grid gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
              {content.materials.map((material, index) => (
                <div key={material} className="bg-white p-6 sm:min-h-40">
                  <p className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-8 text-lg font-semibold text-neutral-950">{material}</p>
                  <p className="mt-2 text-xs leading-6 text-neutral-500">
                    Subject to thickness, strength and tooling review.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="workflow"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="From Sheet to Reinforced Duct Panel"
            title="See the machine in the complete duct workflow."
            text="Cutting and beading are preparation steps. Folding, lock forming, assembly and installation remain separate stages in the finished duct process."
            light
          />
          <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-6">
            {content.workflow.map((step, index) => (
              <article key={step.title} className="relative min-h-64 bg-[#111417] p-6">
                <p className="text-4xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 text-lg font-semibold leading-snug text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{step.text}</p>
                {index < content.workflow.length - 1 ? (
                  <ChevronRight
                    size={18}
                    className="absolute bottom-6 right-5 hidden text-zinc-600 xl:block"
                    aria-hidden="true"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="advantages" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20">
          <CuttingBeadingDiagram />
          <div>
            <SectionIntro
              label="Why Choose This Reel Shear Beading Machine?"
              title="Focused functions for practical duct preparation."
              text="The advantages below stay within the machine's confirmed cutting-and-beading role and do not imply CNC or fully automatic operation."
            />
            <div className="mt-9 grid border-t border-neutral-200 sm:grid-cols-2">
              {content.advantages.map((advantage, index) => (
                <div
                  key={advantage}
                  className={`flex gap-3 border-b border-neutral-200 py-5 sm:px-5 ${
                    index % 2 === 1 ? "sm:border-l" : "sm:pl-0"
                  }`}
                >
                  <Check size={18} className="mt-1 shrink-0 text-[#76B900]" aria-hidden="true" />
                  <p className="text-sm font-medium leading-7 text-neutral-800">{advantage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Machine Comparison"
            title="Reel shear beading machine or multi-line beading machine?"
            text="Neither machine is universally better. Select the one that matches the required operation and production pattern."
          />
          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
            <table className="min-w-[860px] w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="w-1/5 bg-neutral-950 px-5 py-5 font-semibold text-white">
                    Comparison item
                  </th>
                  <th className="w-2/5 bg-[#171A1D] px-5 py-5 font-semibold text-white">
                    Reel Shear Beading Machine
                  </th>
                  <th className="w-2/5 bg-[#202428] px-5 py-5 font-semibold text-white">
                    Multi-Line Duct Beading Machine
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.comparison.map((row) => (
                  <tr key={row.label} className="border-b border-neutral-200 last:border-0">
                    <th scope="row" className="px-5 py-5 font-semibold text-neutral-950">
                      {row.label}
                    </th>
                    <td className="px-5 py-5 leading-7 text-neutral-700">{row.reelShear}</td>
                    <td className="px-5 py-5 leading-7 text-neutral-600">{row.multiLine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section data-section="selection" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div>
            <SectionIntro
              label="How to Choose the Right Machine"
              title="Send the workpiece facts before selecting the configuration."
              text="These inputs help distinguish a workable configuration from a machine selected only by product name."
            />
            <div className="mt-9 grid border-t border-neutral-200 sm:grid-cols-2">
              {content.selectionQuestions.map((question, index) => (
                <div
                  key={question}
                  className={`flex gap-4 border-b border-neutral-200 py-5 sm:px-5 ${
                    index % 2 === 1 ? "sm:border-l" : "sm:pl-0"
                  }`}
                >
                  <span className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-medium leading-7 text-neutral-800">{question}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start border-t-2 border-[#76B900] bg-[#0B0D10] p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-10 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#76B900]">
              Send Your Sheet Metal Requirement
            </p>
            <h3 className="mt-5 text-3xl font-semibold leading-tight">
              Let the workpiece define the recommendation.
            </h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Send material, thickness, sheet width, cutting need, bead shape, daily quantity,
              voltage and destination for engineering review.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8ddb00]"
            >
              Request Recommendation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <section data-section="technical" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Technical Specifications"
            title="Verified Reel Shear Beading Machine parameters."
            text="Use the confirmed model data below as the starting point for workpiece and configuration review."
            light
          />
          <div className="mt-10 max-w-full overflow-x-auto border border-white/15 bg-[#111417]">
            <table className="min-w-[1040px] w-full border-collapse text-sm">
              <thead>
                <tr>
                  {technicalParameters.columns.map((column) => {
                    const heading = splitColumnHeading(column);

                    return (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap bg-[#111315] px-4 py-4 text-center font-semibold leading-5 text-white"
                      >
                        <span className="block">{heading.label}</span>
                        {heading.unit ? (
                          <span className="mt-1 block text-[0.72rem] font-medium text-zinc-400">
                            {heading.unit}
                          </span>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {technicalParameters.rows.map((row, rowIndex) => (
                  <tr key={`${row[0]}-${rowIndex}`} className="border-t border-white/10">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${row[0]}-${cellIndex}`}
                        className={`whitespace-nowrap px-4 py-5 text-center leading-6 ${
                          cellIndex === 0 ? "font-semibold text-white" : "text-zinc-300"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm leading-7 text-zinc-400">
            Final specifications depend on sheet material, thickness, working width and
            selected tooling.
          </p>
        </div>
      </section>

      <section data-section="faq" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <SectionIntro
            label="FAQ"
            title="Questions to settle before quotation."
            text="Use these answers as selection guidance. Final machine suitability still depends on engineering confirmation of the workpiece and process."
          />
          <div className="border-t border-neutral-200">
            {content.faqs.map((faq, index) => (
              <details key={faq.question} className="group border-b border-neutral-200">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left">
                  <span className="flex gap-4">
                    <span className="text-sm font-semibold text-[#76B900]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-semibold leading-7 text-neutral-950">
                      {faq.question}
                    </span>
                  </span>
                  <span className="mt-1 shrink-0 text-2xl font-light text-neutral-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-7 pl-10 pr-8 text-sm leading-7 text-neutral-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section data-section="related" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Connected Duct Workflow"
            title="Continue building the surrounding production process."
            text="Compare supporting equipment according to the next operation required after cutting and beading."
          />
          <div className="mt-9 grid gap-px bg-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
            {content.relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-24 items-center justify-between gap-4 bg-white px-6 py-5 text-base font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
              >
                {item.label}
                <ArrowRight
                  size={17}
                  className="shrink-0 text-[#76B900] transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section="cta" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
          <div>
            <p className={sectionLabelClass}>Talk to a ZYRON Engineer</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
              {content.finalCta.text}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#8ddb00]"
            >
              Request a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/25 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8ddb00]"
            >
              Contact Engineer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
