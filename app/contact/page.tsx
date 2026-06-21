import Link from "next/link";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { productCategories } from "@/data/products";

export const metadata = {
  title: "Contact | ZYRON Heavy Industry",
  description: "Contact ZYRON Heavy Industry for machine selection, quotations, catalogs, and engineering support.",
  alternates: {
    canonical: "/contact",
  },
};

const contactItems = [
  { icon: Mail, title: "Email", value: "sales@zhuoyao-industry.com" },
  { icon: MessageCircle, title: "WhatsApp", value: "+86 400 888 2026" },
  { icon: MapPin, title: "Factory Location", value: "China Machinery Manufacturing Base" },
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

          <form className="rounded-md bg-white p-7 shadow-sm lg:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Inquiry Form</p>
            <h2 className="mt-3 text-3xl font-semibold text-neutral-950">Tell us what you need.</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Name
                <input className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition" placeholder="Your name" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Email
                <input className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition" placeholder="name@company.com" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Product Interest
                <select className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition">
                  {productCategories.map((category) => (
                    <option key={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Destination Country
                <input className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition" placeholder="Country / region" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-neutral-700 md:col-span-2">
                Production Requirement
                <textarea
                  className="min-h-32 rounded-sm border border-neutral-200 px-3 py-3 font-normal outline-none transition focus:border-ignition"
                  placeholder="Material, thickness, working length, daily output, voltage, and any optional configuration."
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon"
            >
              Send Inquiry
              <Send size={16} />
            </button>
          </form>
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
