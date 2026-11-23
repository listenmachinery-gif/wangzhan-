"use client";

import Link from "next/link";
import { useRef } from "react";

import { InquiryForm } from "@/components/InquiryForm";

export type HomeContactContent = {
  eyebrow: string;
  title: string;
  description: string;
  emphasis: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  formTitle: string;
  formDescription: string;
  privacyText: string;
  machineOptions: string[];
};

export function HomeContactSection({ content }: { content: HomeContactContent }) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  function focusQuoteForm() {
    nameInputRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    nameInputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section className="bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:items-center lg:gap-20">
        <div>
          <p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#80C900]">{content.eyebrow}</p>
          <h2 data-page-text="title" className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{content.title}</h2>
          <p data-page-text="description" className="mt-6 max-w-2xl text-base leading-[1.75] text-white/62">{content.description}</p>
          <p data-page-text="emphasis" className="mt-7 text-lg font-semibold text-white">{content.emphasis}</p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button type="button" onClick={focusQuoteForm} className="inline-flex min-h-12 items-center rounded-sm bg-[#80C900] px-6 py-3 text-sm font-semibold text-[#11160C] transition-colors hover:bg-[#92DC14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80C900]">
              {content.primaryLabel}
            </button>
            <Link data-page-text="secondaryLabel" href={content.secondaryHref} className="border-b border-white/35 pb-1 text-sm font-semibold transition-colors hover:border-[#80C900] hover:text-[#80C900]">{content.secondaryLabel}</Link>
          </div>
        </div>
        <InquiryForm
          variant="homepage"
          productCategories={[]}
          productOptions={content.machineOptions}
          eyebrow=""
          heading={content.formTitle}
          description={content.formDescription}
          privacyText={content.privacyText}
          firstInputRef={nameInputRef}
          headingLevel="h3"
          submitLabel="Send Inquiry →"
        />
      </div>
    </section>
  );
}
