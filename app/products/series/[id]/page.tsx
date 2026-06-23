import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getCategoryById, getCategoryHref, productCategories, products } from "@/data/products";

type ProductSeriesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function usesProductCutout(image: string) {
  return (
    image.includes("/products/shearing/") ||
    image.includes("/products/bending/") ||
    image.includes("/products/home-categories/")
  );
}

export function generateStaticParams() {
  return productCategories.map((category) => ({ id: category.id }));
}

export async function generateMetadata({ params }: ProductSeriesPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = getCategoryById(id);

  if (!category) {
    return {};
  }

  return {
    title: `${category.name} | ZYRON Heavy Industry`,
    description: category.description,
    alternates: {
      canonical: getCategoryHref(category.id),
    },
    openGraph: {
      title: `${category.name} | ZYRON Heavy Industry`,
      description: category.description,
      url: getCategoryHref(category.id),
      images: [
        {
          url: category.image,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | ZYRON Heavy Industry`,
      description: category.description,
      images: [category.image],
    },
  };
}

export default async function ProductSeriesPage({ params }: ProductSeriesPageProps) {
  const { id } = await params;
  const category = getCategoryById(id);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter((product) => product.categoryId === category.id);

  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-14 text-white sm:px-8 lg:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_20%,rgba(118,185,0,0.2),transparent_30%),linear-gradient(135deg,#0B0D10_0%,#171b22_52%,#08090b_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-black/84 to-transparent" />
        <div className="mx-auto max-w-[1440px]">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white">
            <ArrowLeft size={16} />
            Back to All Products
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">{category.capability}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">{category.name}</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">{category.description}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">
                  Get Series Advice
                </Link>
                <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
                  Compare All Series
                </Link>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden rounded-sm border border-white/10 bg-white/[0.04] sm:min-h-[440px]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className={`${usesProductCutout(category.image) ? "object-contain p-4" : "object-cover"} drop-shadow-[0_22px_50px_rgba(0,0,0,0.36)]`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ignition">Machines in this series</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                Choose the matched machine for your production process.
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-neutral-600 lg:justify-self-end">
              Open each machine page to review performance, advantages, applications, optional configurations, and
              technical parameters before sending your quotation request.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categoryProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm transition hover:border-ignition hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
              >
                <div className="relative aspect-[1.28] bg-[#f4f6f8]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className={`${usesProductCutout(product.image) ? "object-contain p-4" : "object-cover"} transition duration-700 group-hover:scale-[1.03]`}
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ignition">{product.categoryName}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-neutral-950">{product.name}</h3>
                  <p className="mt-4 text-sm leading-6 text-neutral-600">{product.tagline}</p>
                  <div className="mt-6 grid gap-2">
                    {product.highlights.slice(0, 3).map((item) => (
                      <span key={item} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <CheckCircle2 size={15} className="shrink-0 text-ignition" />
                        {item}
                      </span>
                    ))}
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
                    View Product Details
                    <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
