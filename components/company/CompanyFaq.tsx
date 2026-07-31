"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CompanyFaq as CompanyFaqItem } from "@/data/company";

export function CompanyFaq({ items }: { items: CompanyFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const answerId = `company-faq-answer-${index}`;
        const buttonId = `company-faq-button-${index}`;

        return (
          <article key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={openIndex === index}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="group flex w-full items-start justify-between gap-5 py-6 text-left text-base font-semibold leading-7 text-white transition hover:text-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] sm:text-lg"
              >
                <span className="flex gap-4">
                  <span className="mt-0.5 font-mono text-xs text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.question}
                </span>
                <ChevronDown
                  size={19}
                  className={`mt-1 shrink-0 text-[#76B900] transition ${
                    isOpen ? "rotate-180" : ""
                  } motion-reduce:transition-none`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={answerId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-6 pl-10 pr-8 text-sm leading-7 text-zinc-400 sm:pl-12"
            >
              {item.answer}
            </div>
          </article>
        );
      })}
    </div>
  );
}
