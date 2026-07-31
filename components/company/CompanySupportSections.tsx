import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import {
  certificates,
  companyFaqs,
  companyIdentity,
  factoryGallery,
  globalServices,
  packingProcess,
  serviceFlow,
  whyZyron,
} from "@/data/company";
import { productCategories } from "@/data/products";
import { CompanyFaq } from "./CompanyFaq";
import { CompanyInquiryForm } from "./CompanyInquiryForm";
import { CompanyMediaDialog } from "./CompanyMediaDialog";

const productOptions = productCategories.map((category) => ({
  value: category.id,
  label: category.navLabel,
}));

export function CompanySupportSections() {
  return (
    <>
      <section
        id="certificates"
        data-company-section="certificates"
        className="scroll-mt-24 bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
              CERTIFICATES
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              Documents Supporting International Procurement
            </h2>
            <p className="mt-7 text-base leading-8 text-zinc-400">
              Machine procurement requires more than product images. Company
              qualification, quality-management documentation, machinery
              compliance records, brand registration, technical documents, and
              export-related information help buyers complete internal reviews
              and purchasing procedures.
            </p>
            <ul className="mt-7 divide-y divide-white/10 border-y border-white/10">
              {certificates.items.map((item) => (
                <li key={item} className="flex gap-3 py-3.5 text-sm text-zinc-300">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-[#76B900]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-zinc-400">
              Certification scope and applicable machine documentation should be
              confirmed according to the selected product, model, configuration,
              and destination market.
            </p>
          </div>
          <CompanyMediaDialog items={[certificates.media]} variant="certificate" />
        </div>
      </section>

      <section
        id="factory-gallery"
        data-company-section="factory-gallery"
        className="scroll-mt-24 bg-[#111417] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
                FACTORY GALLERY
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
                Real Images From ZYRON
              </h2>
            </div>
            <div className="max-w-2xl text-base leading-8 text-zinc-400 lg:justify-self-end">
              <p>
                Existing factory, machine-detail, control-cabinet, adjustment, and
                exhibition images provide visible context without substituting
                competitor or AI-generated factory evidence.
              </p>
              <Link
                href="/cases"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#8DDB00]"
              >
                View Customer Cases
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <CompanyMediaDialog items={factoryGallery} />
          </div>
        </div>
      </section>

      <section
        data-company-section="packing"
        className="bg-[#F4F6F8] px-5 py-20 text-[#101214] sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
                PACKING &amp; DELIVERY
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
                Prepared for Long-Distance Industrial Equipment Transport
              </h2>
              <p className="mt-7 text-base leading-8 text-neutral-600">
                Industrial machinery requires packing and loading methods that
                consider machine weight, dimensions, exposed components, moisture,
                movement during transportation, unloading conditions, and
                destination requirements.
              </p>
              <p className="mt-5 text-base leading-8 text-neutral-600">
                Before delivery, machines and loose accessories are organized
                according to the confirmed packing plan.
              </p>
              <div className="relative mt-8 aspect-[4/3] overflow-hidden bg-white">
                <Image
                  src="/products/detail-front.jpg"
                  alt="Completed sheet metal machine before packing preparation"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-xs leading-6 text-neutral-500">
                Current evidence shows a finished machine before transport
                preparation. Dedicated packing and container-loading photographs
                remain listed in the project photo plan.
              </p>
            </div>
            <div>
              <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
                {packingProcess.map((step, index) => (
                  <li key={step.title} className="grid gap-4 py-6 sm:grid-cols-[64px_1fr]">
                    <span className="font-mono text-xl font-semibold text-[#4E7A00]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-neutral-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-7 border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-neutral-600">
                Packing and loading methods vary by machine size, destination,
                transport route, and contractual requirement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        data-company-section="global-support"
        className="bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
              GLOBAL SUPPORT
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              Support From Machine Selection to Long-Term Operation
            </h2>
            <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-400">
              International equipment projects require clear communication before
              and after delivery. ZYRON supports customers through machine
              selection, technical confirmation, documentation, installation
              preparation, operating guidance, troubleshooting communication,
              spare-parts identification, and future equipment planning.
            </p>
          </div>

          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
            {globalServices.map((service, index) => (
              <article key={service.title} className="bg-[#111417] p-6 sm:p-8">
                <span className="font-mono text-xs font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {service.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 border-t border-white/15 pt-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
              Service Communication Flow
            </p>
            <ol className="mt-6 grid gap-3 md:grid-cols-5">
              {serviceFlow.map((step, index) => (
                <li
                  key={step}
                  className="border-l border-white/15 pl-4 text-sm leading-6 text-zinc-300"
                >
                  <span className="mb-3 block font-mono text-xs text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        data-company-section="why-zyron"
        className="bg-white px-5 py-20 text-[#101214] sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
              WHY ZYRON
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              A Practical Partner for Industrial Machinery Projects
            </h2>
          </div>
          <ol className="mt-12 grid gap-x-10 gap-y-0 md:grid-cols-2">
            {whyZyron.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-5 border-t border-neutral-200 py-7 sm:grid-cols-[64px_1fr]"
              >
                <span className="font-mono text-2xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-7 max-w-4xl border-l-2 border-[#76B900] pl-5 text-base leading-8 text-neutral-700">
            Our objective is not simply to ship a machine. It is to help the
            customer receive equipment that matches the intended production
            process and can be supported after delivery.
          </p>
        </div>
      </section>

      <section
        id="faq"
        data-company-section="faq"
        className="scroll-mt-24 bg-[#111417] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
              FAQ
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              Frequently Asked Questions About ZYRON
            </h2>
            <p className="mt-7 text-base leading-8 text-zinc-400">
              These answers explain the information, review steps, and
              configuration limits that matter during machinery procurement.
            </p>
          </div>
          <CompanyFaq items={companyFaqs} />
        </div>
      </section>

      <section
        id="engineering-inquiry"
        data-company-section="final-cta"
        className="scroll-mt-24 bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
                VISIT ZYRON
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
                See the Factory. Review the Machines. Discuss Your Production Plan.
              </h2>
              <p className="mt-7 text-base leading-8 text-zinc-400">
                Customers, distributors, and project partners are welcome to
                communicate with the ZYRON team about machine selection, factory
                inspection, sample testing, production-line planning, OEM
                cooperation, and long-term distribution opportunities.
              </p>
              <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-[#111417]">
                <Image
                  src="/brand/factory-showcase.png"
                  alt="ZYRON industrial machinery factory exterior for visitor planning"
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <address className="mt-8 grid gap-4 not-italic text-sm leading-7 text-zinc-300">
                <a
                  href={`mailto:${companyIdentity.email}`}
                  className="flex gap-3 transition hover:text-[#8DDB00]"
                >
                  <Mail
                    size={18}
                    className="mt-1 shrink-0 text-[#76B900]"
                    aria-hidden="true"
                  />
                  {companyIdentity.email}
                </a>
                <a
                  href={`https://wa.me/${companyIdentity.telephone.replace("+", "")}`}
                  className="flex gap-3 transition hover:text-[#8DDB00]"
                >
                  <MessageCircle
                    size={18}
                    className="mt-1 shrink-0 text-[#76B900]"
                    aria-hidden="true"
                  />
                  {companyIdentity.displayTelephone}
                </a>
                <p className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-1 shrink-0 text-[#76B900]"
                    aria-hidden="true"
                  />
                  {companyIdentity.address}
                </p>
              </address>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10] transition hover:bg-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900]"
                >
                  Request a Factory Visit
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a
                  href="#engineering-inquiry-form"
                  className="inline-flex min-h-12 items-center justify-center rounded-[2px] border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8DDB00]"
                >
                  Send Your Requirements
                </a>
              </div>
              <p className="mt-5 text-xs leading-6 text-zinc-500">
                For a faster recommendation, include your material, thickness,
                working length, target output, voltage, destination country, and
                required process.
              </p>
            </div>
            <div id="engineering-inquiry-form" className="scroll-mt-24">
              <CompanyInquiryForm productOptions={productOptions} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
