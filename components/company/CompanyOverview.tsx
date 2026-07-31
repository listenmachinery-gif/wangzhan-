import { Check } from "lucide-react";
import { companyFocus } from "@/data/company";

export function CompanyOverview() {
  return (
    <section
      data-company-section="overview"
      className="bg-white px-5 py-20 text-[#101214] sm:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
            WHO WE ARE
          </p>
          <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
            A Machinery Manufacturer Focused on Real Production Needs
          </h2>
          <div className="mt-8 space-y-5 text-base leading-8 text-neutral-600">
            <p>
              ZYRON Heavy Industry is a machinery manufacturing and solution-support
              company located in Ma’anshan, Anhui Province, China. We serve
              manufacturers working with sheet metal cutting, bending, rolling,
              punching, pressing, HVAC duct forming, laser processing, and
              industrial material reduction.
            </p>
            <p>
              Our work begins with the customer’s production requirement rather
              than a fixed machine model. Material type, thickness, working length,
              target output, required accuracy, labor conditions, factory layout,
              local voltage, shipping destination, and future expansion plans are
              reviewed before a machine configuration is proposed.
            </p>
            <p>
              This application-driven approach supports both individual machine
              purchases and coordinated production-line requirements. Customers
              can source different stages of their manufacturing process through
              one communication and support system, reducing the difficulty of
              matching machines from unrelated suppliers.
            </p>
            <p>
              From standard workshop machines to CNC-controlled production
              equipment, our goal is to provide practical configurations,
              understandable technical information, dependable manufacturing
              control, and long-term support throughout the equipment life cycle.
            </p>
          </div>
        </div>

        <aside className="self-start border-t-2 border-[#76B900] bg-[#F4F6F8] p-7 sm:p-9 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
            Company Focus
          </p>
          <ul className="mt-6 divide-y divide-neutral-200">
            {companyFocus.map((item) => (
              <li key={item} className="flex gap-3 py-4 text-sm font-medium leading-6 text-neutral-800">
                <Check
                  size={17}
                  strokeWidth={2}
                  className="mt-1 shrink-0 text-[#76B900]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-7 border-l-2 border-[#76B900] pl-4 text-sm leading-7 text-neutral-600">
            Company statistics are meaningful when supported by visible
            manufacturing stages, documented checks, and machines that can be
            reviewed before delivery.
          </p>
        </aside>
      </div>
    </section>
  );
}
