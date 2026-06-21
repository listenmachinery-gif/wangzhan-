import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getCategoryById, products } from "@/data/products";

type ProductDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

function splitAdvantage(item: string) {
  const separatorIndex = item.indexOf(":");

  if (separatorIndex === -1) {
    return {
      title: item,
      body: "",
    };
  }

  return {
    title: item.slice(0, separatorIndex).trim(),
    body: item.slice(separatorIndex + 1).trim(),
  };
}

function AdvantageItem({ item }: { item: string }) {
  const { title, body } = splitAdvantage(item);

  return (
    <div className="border-b border-neutral-200 py-7">
      <div className="flex min-w-0 items-start gap-5">
        <span className="mt-2 h-4 w-4 shrink-0 bg-[#76B900]" />
        <p className="min-w-0 text-base leading-8 text-neutral-600">
          <strong className="font-semibold text-neutral-950">{title}</strong>
          {body ? <>: {body}</> : null}
        </p>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | ZYRON Heavy Industry`,
    description: product.performanceFeatures ?? product.tagline,
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | ZYRON Heavy Industry`,
      description: product.performanceFeatures ?? product.tagline,
      url: `/products/${product.id}`,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ZYRON Heavy Industry`,
      description: product.performanceFeatures ?? product.tagline,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const category = getCategoryById(product.categoryId);
  const relatedProducts = products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, 3);
  const advantages = product.advantages ?? product.highlights;
  const technicalParameters = product.technicalParameters;

  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="bg-graphite-950 px-4 py-12 text-white sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white">
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center xl:gap-12">
            <div className="relative aspect-[1.25] min-w-0 overflow-hidden bg-graphite-950 sm:aspect-[1.36] lg:aspect-[1.16]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 60vw, 100vw"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ignition">{product.categoryName}</p>
              <h1 className="mt-5 break-words text-4xl font-semibold leading-tight text-white sm:text-6xl">{product.name}</h1>
              {product.performanceFeatures ? (
                <div className="mt-6 border-l-2 border-ignition pl-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ignition">Performance and Features</p>
                  <p className="mt-3 min-w-0 text-base leading-8 text-zinc-300">{product.performanceFeatures}</p>
                </div>
              ) : (
                <p className="mt-6 text-base leading-8 text-zinc-300">{product.tagline}</p>
              )}
              {category && !product.performanceFeatures ? <p className="mt-4 text-sm leading-6 text-zinc-400">{category.description}</p> : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon">
                  Get a Quote
                </Link>
                <Link href="/products" className="rounded-sm border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
                  Compare Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-md bg-white p-5 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Advantages</p>
            <h2 className="mt-3 text-3xl font-semibold text-neutral-950">Built for efficient, repeatable cutting.</h2>
            <div className="mt-6 grid gap-x-12 md:grid-cols-2">
              {advantages.map((item) => (
                <AdvantageItem key={item} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md bg-white p-5 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">
              {technicalParameters ? "Technical Parameters" : "Technical Specifications"}
            </p>
            <div className="mt-6 max-w-full overflow-x-auto rounded-md border border-neutral-200">
              {technicalParameters ? (
                <table className="min-w-[760px] border-collapse text-left text-[10px] sm:w-full sm:table-fixed sm:text-xs lg:text-sm">
                  <thead>
                    <tr>
                      {technicalParameters.columns.map((column) => (
                        <th key={column} className="whitespace-nowrap bg-neutral-950 px-2 py-3 font-semibold leading-5 text-white sm:px-3 sm:py-4 sm:[overflow-wrap:anywhere]">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {technicalParameters.rows.map((row, rowIndex) => (
                      <tr key={`${row[0]}-${rowIndex}`} className="border-b border-neutral-200 last:border-0">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${row[0]}-${cellIndex}`}
                            className={`${cellIndex === 0 ? "font-semibold text-neutral-950" : "text-neutral-600"} whitespace-nowrap px-2 py-3 leading-5 sm:px-3 sm:py-4 sm:[overflow-wrap:anywhere]`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-[560px] border-collapse text-left text-xs sm:w-full sm:table-fixed sm:text-sm">
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.label} className="border-b border-neutral-200 last:border-0">
                        <th className="w-1/3 whitespace-nowrap bg-neutral-50 px-3 py-3 font-semibold text-neutral-950 sm:px-4 sm:py-4 sm:[overflow-wrap:anywhere]">{spec.label}</th>
                        <td className="whitespace-nowrap px-3 py-3 text-neutral-600 sm:px-4 sm:py-4 sm:[overflow-wrap:anywhere]">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Applications</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-neutral-950">Where this machine is used.</h2>
          </div>
          <div className="grid gap-3 lg:col-span-2 md:grid-cols-2">
            {product.applications.map((item) => (
              <div key={item} className="rounded-md border border-neutral-200 p-5 text-sm font-semibold text-neutral-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-md bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Optional Configurations</p>
            <div className="mt-6 grid gap-3">
              {product.options.map((option) => (
                <span key={option} className="flex items-center gap-3 text-sm text-neutral-700">
                  <CheckCircle2 size={16} className="text-ignition" />
                  {option}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-graphite-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Inquiry Support</p>
            <h2 className="mt-3 text-3xl font-semibold">Need a matched configuration?</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              Send material type, thickness, working length, production quantity, voltage, and destination. We will
              recommend the right model, tooling, and optional systems.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon">
              Request a Quote
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold text-neutral-950">Related Products</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/products/${related.id}`} className="group overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="relative aspect-[1.32] overflow-hidden">
                    <Image
                      src={related.image}
                      alt={related.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={`${related.image.includes("/products/shearing/") || related.image.includes("/products/bending/") ? "object-contain p-4" : "object-cover"} transition duration-700 group-hover:scale-105`}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-neutral-950">{related.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{related.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
