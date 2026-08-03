import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  customizationOptions,
  engineeringInputs,
  engineeringProcess,
  qualityProcess,
} from "@/data/company";

export function EngineeringQualitySections() {
  return (
    <>
      <section
        data-company-section="engineering"
        className="bg-white px-5 py-20 text-[#101214] sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-7 border-b border-neutral-200 pb-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
                ENGINEERING SUPPORT
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
                Machine Selection Starts With Your Production Conditions
              </h2>
            </div>
            <div className="space-y-4 text-base leading-8 text-neutral-600">
              <p>
                A machine should not be selected only by its name or price. The
                same machine type can require different structures, controls,
                tooling, power configurations, feeding systems, safety options,
                and automation levels depending on the application.
              </p>
              <p>
                ZYRON’s technical communication process reviews the customer’s
                requirements before the final configuration is prepared.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <div className="grid gap-px border border-neutral-200 bg-neutral-200">
              {engineeringInputs.map((group) => (
                <article key={group.title} className="bg-[#F4F6F8] p-7">
                  <h3 className="text-xl font-semibold">{group.title}</h3>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-sm leading-6 text-neutral-600"
                      >
                        <Check
                          size={15}
                          className="mt-1 shrink-0 text-[#76B900]"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
                Technical Process
              </p>
              <ol className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                {engineeringProcess.map((step, index) => (
                  <li key={step.title} className="grid gap-4 py-6 sm:grid-cols-[68px_1fr]">
                    <span className="font-mono text-2xl font-semibold text-[#76B900]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-neutral-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href="#engineering-inquiry"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[2px] bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10] transition hover:bg-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900]"
              >
                Send Your Production Requirements
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        data-company-section="customization"
        className="bg-[#111417] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.83fr_1.17fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
              CUSTOMIZATION
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              Configured Around the Machine, Process and Market
            </h2>
            <p className="mt-7 text-base leading-8 text-zinc-400">
              Standard machines are suitable for many common applications, but
              international projects often require adjustments for material,
              dimensions, production flow, electrical standards, operating habits,
              transportation, branding, or downstream integration.
            </p>
            <p className="mt-5 text-base leading-8 text-zinc-400">
              Depending on the product and technical feasibility, ZYRON can support
              configuration adjustments and project coordination in the following
              areas.
            </p>
          </div>
          <div>
            <ul className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {customizationOptions.map((item, index) => (
                <li
                  key={item}
                  className="flex min-h-24 gap-4 bg-[#12161A] p-5 text-sm leading-6 text-zinc-300"
                >
                  <span className="font-mono text-xs font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-zinc-400">
              Customization availability depends on the machine type, application,
              technical assessment, order requirements, and destination market.
              Final specifications must be confirmed in the technical agreement.
            </p>
          </div>
        </div>
      </section>

      <section
        data-company-section="quality"
        className="bg-[#F4F6F8] px-5 py-20 text-[#101214] sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
              QUALITY CONTROL
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              Inspection Through the Entire Manufacturing Process
            </h2>
            <p className="mt-7 max-w-3xl text-base leading-8 text-neutral-600">
              Quality control is not limited to a final appearance check. Each
              machine should be reviewed through a sequence of structural,
              mechanical, electrical, operational, and documentation checks before
              shipment.
            </p>
          </div>

          <ol className="mt-12 grid gap-px overflow-hidden border border-neutral-200 bg-neutral-200 md:grid-cols-2">
            {qualityProcess.map((step, index) => (
              <li key={step.title} className="bg-white p-6 sm:p-8">
                <div className="flex items-start gap-5">
                  <span className="font-mono text-sm font-semibold text-[#4E7A00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-7 max-w-4xl border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-neutral-600">
            Specific inspection items vary by machine type and configuration. The
            sequence above does not imply that every machine uses an identical
            test standard.
          </p>
        </div>
      </section>

    </>
  );
}
