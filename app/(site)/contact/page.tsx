import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { InquiryForm } from "@/components/InquiryForm";
import { productCategories } from "@/data/products";

export const metadata = {
  title: "Contact | ZYRON Heavy Industry",
  description: "Contact ZYRON Heavy Industry for machine selection, quotations, catalogs, and engineering support.",
  alternates: {
    canonical: "/contact",
  },
};

const contactItems = [
  { icon: Mail, title: "Email", value: "info@zyroncnc.com" },
  { icon: MessageCircle, title: "WhatsApp", value: "+8615655537083" },
  {
    icon: MapPin,
    title: "Factory Location",
    value: "Dongjiao Industrial Park, Bowang Town, Bowang District, Ma'anshan City, Anhui Province, China",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="bg-graphite-950 px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Contact</p>
          <h1 className="mt-3 max-w-5xl text-5xl font-semibold leading-tight sm:text-7xl">
            Get a machine recommendation from our engineers.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            Share your material, thickness, working length, process flow, and destination. We will help select a
            practical machine configuration and quotation path.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-md bg-white p-7 shadow-sm">
                  <Icon size={24} className="text-ignition" />
                  <h2 className="mt-4 text-xl font-semibold text-neutral-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.value}</p>
                </div>
              );
            })}
          </div>

          <InquiryForm productCategories={productCategories} />
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto rounded-md bg-white p-8 shadow-sm max-w-7xl">
          <h2 className="text-3xl font-semibold text-neutral-950">What to include for a faster quotation</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {["Material type", "Thickness range", "Working length", "Daily output"].map((item) => (
              <div key={item} className="rounded-md border border-neutral-200 p-5 text-sm font-semibold text-neutral-700">
                {item}
              </div>
            ))}
          </div>
          <Link href="/products" className="mt-7 inline-flex text-sm font-semibold text-ignition">
            Browse machine categories
          </Link>
        </div>
      </section>
    </main>
  );
}
