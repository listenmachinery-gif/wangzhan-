import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Gauge,
  Layers3,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Target,
  Wrench,
} from "lucide-react";
import {
  buildProductSolutionViewModel,
  type SolutionCard,
} from "@/data/product-solution-profiles";
import type { Product, ProductCategory } from "@/data/products";

type ProductSolutionPageProps = {
  product: Product;
  category: ProductCategory;
  relatedProducts: Product[];
};

const sectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";

const applicationIcons = [Factory, Layers3, Target, Gauge];
const selectionIcons = [ClipboardCheck, Settings2, Wrench, ShieldCheck];

const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);

  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const jsonLd = (value: object) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

function AdvantageRow({ item, index }: { item: SolutionCard; index: number }) {
  return (
    <article className="grid grid-cols-[3.25rem_1fr] gap-4 border-t border-neutral-200 py-7 sm:grid-cols-[4rem_1fr] sm:gap-6">
      <p className="text-2xl font-semibold text-[#76B900]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <div>
        <h3 className="text-lg font-semibold leading-snug text-neutral-950">
          {item.title}
        </h3>
        {item.text ? (
          <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
        ) : null}
      </div>
    </article>
  );
}

export default function ProductSolutionPage({
  product,
  category,
  relatedProducts,
}: ProductSolutionPageProps) {
  const content = buildProductSolutionViewModel(product, category);
  const technicalParameters = product.technicalParameters;
  const productUrl = `https://www.zyroncnc.com/products/${product.id}`;
  const productImage = `https://www.zyroncnc.com${product.image}`;
  const categoryUrl = `https://www.zyroncnc.com/products/series/${category.id}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: product.name,
    description: product.performanceFeatures ?? product.tagline,
    image: productImage,
    url: productUrl,
    category: product.categoryName,
    brand: {
      "@type": "Brand",
      name: "ZYRON",
    },
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
        name: category.name,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <main
      data-product-solution-page={product.id}
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

      <section
        data-section="hero"
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-12 text-white sm:px-8 lg:py-20"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_28%,rgba(118,185,0,0.15),transparent_31%),linear-gradient(135deg,#0B0D10_0%,#14181d_58%,#08090b_100%)]" />
        <div className="mx-auto max-w-[1440px]">
          <Link
            href={`/products/series/${category.id}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to {category.navLabel}
          </Link>

          <div className="mt-10 grid min-w-0 gap-10 md:grid-cols-[1.08fr_0.92fr] md:items-center xl:gap-16">
            <div className="relative aspect-[1.42] min-w-0 overflow-hidden sm:aspect-[1.28] md:aspect-[1.14]">
              <Image
                src={product.image}
                alt={`${product.name} for ${content.profile.applicationContext}`}
                fill
                priority
                sizes="(min-width: 1280px) 54vw, (min-width: 1024px) 52vw, 100vw"
                className="object-contain p-2 sm:p-0"
              />
            </div>

            <div className="min-w-0">
              <p className={sectionLabelClass}>{content.profile.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl break-words text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                {content.intro}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {content.outcomes.map((outcome) => (
                  <div
                    key={outcome}
                    className="border-l border-white/20 pl-4 text-sm font-medium leading-6 text-zinc-200"
                  >
                    {outcome}
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-sm bg-[#76B900] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8ddb00]"
                >
                  Request a Solution
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href={`/products/series/${category.id}`}
                  className="inline-flex items-center rounded-sm border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8ddb00]"
                >
                  Compare {category.navLabel}
                </Link>
              </div>
            </div>
          </div>

          <dl className="mt-12 grid border-y border-white/15 sm:grid-cols-2 xl:grid-cols-4">
            {content.decisionSnapshot.map((item) => (
              <div
                key={item.label}
                className="border-white/15 py-5 sm:px-5 sm:first:pl-0 sm:[&:nth-child(even)]:border-l xl:border-l xl:first:border-l-0"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76B900]">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-zinc-300">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section data-section="challenges" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <p className={sectionLabelClass}>Customer Challenges</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                Start with the production problem, not only the machine name.
              </h2>
            </div>
            <div className="grid border-t border-neutral-200 md:grid-cols-2">
              {content.profile.challenges.map((challenge, index) => (
                <article
                  key={challenge.title}
                  className={`border-b border-neutral-200 py-7 md:px-7 ${
                    index % 2 === 1 ? "md:border-l" : "md:pl-0"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug text-neutral-950">
                    {challenge.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {challenge.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="fit" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div>
            <p className={sectionLabelClass}>Solution Positioning</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              Where {product.name} fits in the production process.
            </h2>
            <p className="mt-7 text-base leading-8 text-neutral-600">{content.detail}</p>
          </div>
          <aside className="border-t-2 border-[#76B900] bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Selection principle
            </p>
            <p className="mt-4 text-xl font-semibold leading-8 text-neutral-950">
              {content.profile.buyerOutcome}
            </p>
            <div className="mt-7 grid gap-4">
              {content.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-[#76B900]"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-7 text-neutral-600">{outcome}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section
        data-section="workflow"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className={sectionLabelClass}>Production Workflow</p>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2 className="max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              From requirement to the next production stage.
            </h2>
            <p className="max-w-md text-sm leading-7 text-zinc-400">
              A clear process view helps confirm whether the machine, configuration,
              and surrounding workflow belong together.
            </p>
          </div>

          <div
            className={`mt-12 grid gap-px bg-white/10 ${
              content.profile.workflow.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"
            }`}
          >
            {content.profile.workflow.map((step, index) => (
              <article
                key={step.title}
                className="relative min-h-60 bg-[#101316] p-6 transition-colors hover:bg-[#15191d]"
              >
                <p className="text-4xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-7 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{step.text}</p>
                {index < content.profile.workflow.length - 1 ? (
                  <ArrowRight
                    size={18}
                    className="absolute bottom-6 right-6 hidden text-zinc-600 lg:block"
                    aria-hidden="true"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="advantages" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
            <div>
              <p className={sectionLabelClass}>Operational Value</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                What this machine contributes to daily production.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-neutral-600">
                The points below come from the current product information and are
                presented as practical production considerations.
              </p>
            </div>
            <div className="grid gap-x-12 md:grid-cols-2">
              {content.advantages.map((advantage, index) => (
                <AdvantageRow key={`${advantage.title}-${index}`} item={advantage} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="applications" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className={sectionLabelClass}>Application Scenarios</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
            Production environments this solution can support.
          </h2>
          <div className="mt-10 grid border-y border-neutral-300 md:grid-cols-2 xl:grid-cols-4">
            {content.applications.map((application, index) => {
              const Icon = applicationIcons[index % applicationIcons.length];

              return (
                <article
                  key={application.title}
                  className="border-b border-neutral-300 py-7 md:px-7 md:[&:nth-child(even)]:border-l xl:border-b-0 xl:border-l xl:first:border-l-0 xl:first:pl-0"
                >
                  <Icon size={23} strokeWidth={1.7} className="text-[#76B900]" aria-hidden="true" />
                  <h3 className="mt-6 text-lg font-semibold leading-snug text-neutral-950">
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

      <section data-section="selection" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className={sectionLabelClass}>Machine Selection</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                Questions to confirm before choosing a model.
              </h2>
              <div className="mt-9 border-t border-neutral-200">
                {content.profile.selectionQuestions.map((question, index) => {
                  const Icon = selectionIcons[index % selectionIcons.length];

                  return (
                    <div key={question} className="flex gap-4 border-b border-neutral-200 py-6">
                      <Icon
                        size={20}
                        strokeWidth={1.7}
                        className="mt-1 shrink-0 text-[#76B900]"
                        aria-hidden="true"
                      />
                      <p className="text-base font-medium leading-7 text-neutral-800">{question}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className={sectionLabelClass}>Configuration Review</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-4xl">
                Match options to the process instead of adding them by default.
              </h2>
              <div className="mt-8 grid gap-px bg-neutral-200 sm:grid-cols-2">
                {content.configurations.map((configuration) => (
                  <article key={configuration.title} className="bg-[#F7F8F9] p-6">
                    <h3 className="text-lg font-semibold text-neutral-950">
                      {configuration.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {configuration.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section="technical" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className={sectionLabelClass}>
                {technicalParameters ? "Technical Parameters" : "Technical Specification Basis"}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                Confirm the model against the real workpiece.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-neutral-600">
              Final selection depends on the material, workpiece, process, production
              frequency, options, and local utility requirements.
            </p>
          </div>

          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-300 bg-white">
            {technicalParameters ? (
              <table className="min-w-[820px] border-collapse text-left text-xs sm:w-full sm:text-sm">
                <thead>
                  <tr>
                    {technicalParameters.columns.map((column) => {
                      const heading = splitColumnHeading(column);

                      return (
                        <th
                          key={column}
                          scope="col"
                          className="whitespace-nowrap bg-neutral-950 px-3 py-4 text-center font-semibold leading-5 text-white"
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
                    <tr
                      key={`${row[0]}-${rowIndex}`}
                      className="border-b border-neutral-200 last:border-0 even:bg-neutral-50"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${row[0]}-${cellIndex}`}
                          className={`whitespace-nowrap px-3 py-4 text-center leading-6 ${
                            cellIndex === 0
                              ? "font-semibold text-neutral-950"
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
              <table className="min-w-[640px] border-collapse text-left text-sm sm:w-full sm:table-fixed">
                <tbody>
                  {product.specs.map((specification) => (
                    <tr key={specification.label} className="border-b border-neutral-200 last:border-0">
                      <th
                        scope="row"
                        className="w-1/3 bg-neutral-950 px-5 py-5 font-semibold text-white"
                      >
                        {specification.label}
                      </th>
                      <td className="px-5 py-5 leading-7 text-neutral-600">
                        {specification.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section data-section="support" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className={sectionLabelClass}>Project Support</p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              From requirement review to production preparation.
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition hover:text-[#76B900]"
            >
              Discuss your project
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-px bg-neutral-200 lg:grid-cols-4">
            {content.profile.supportSteps.map((step, index) => (
              <article key={step.title} className="min-h-56 bg-white p-6">
                <p className="text-3xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 text-lg font-semibold text-neutral-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section data-section="related" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className={sectionLabelClass}>Related Products</p>
                <h2 className="mt-4 text-3xl font-semibold text-neutral-950 sm:text-5xl">
                  Compare nearby solutions.
                </h2>
              </div>
              <Link
                href={`/products/series/${category.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition hover:text-[#76B900]"
              >
                View {category.navLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/products/${related.id}`}
                  className="group overflow-hidden border border-neutral-200 bg-white transition hover:border-[#76B900] hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                >
                  <div className="relative aspect-[1.35] overflow-hidden bg-white">
                    <Image
                      src={related.image}
                      alt={related.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-contain p-5 transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="border-t border-neutral-200 p-6">
                    <h3 className="text-xl font-semibold leading-snug text-neutral-950">
                      {related.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{related.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section data-section="related" className="sr-only" aria-label="Related products" />
      )}

      <section data-section="cta" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className={sectionLabelClass}>Talk to a ZYRON Engineer</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              Need a {product.name} solution for your production?
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
              Send the core workpiece and production information. ZYRON will use it
              to review the suitable model and configuration with you.
            </p>
          </div>
          <div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {content.profile.inquiryFields.map((field) => (
                <li key={field} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle2 size={17} className="shrink-0 text-[#76B900]" aria-hidden="true" />
                  {field}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8ddb00]"
            >
              Request a Machine Recommendation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
