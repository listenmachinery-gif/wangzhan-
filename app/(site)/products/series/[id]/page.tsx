import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getCategoryById, getCategoryDirectory, getCategoryHref, productCategories, products } from "@/data/products";

type ProductSeriesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function usesProductCutout(image: string) {
  return (
    image.includes("/products/shearing/") ||
    image.includes("/products/bending/") ||
    image.includes("/products/home-categories/") ||
    image.includes("/products/catalog/")
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
          url: category.heroImage,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | ZYRON Heavy Industry`,
      description: category.description,
      images: [category.heroImage],
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
  const directory = getCategoryDirectory(category.id);

  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section
        data-series-hero
        className="relative isolate min-h-[700px] overflow-hidden bg-[#0B0D10] px-5 py-14 text-white sm:px-8 lg:py-20"
      >
        <Image
          src={category.heroImage}
          alt={`${category.name} production process`}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-30 object-cover object-center"
        />
        <div className="absolute inset-0 -z-20 bg-black/40" />
        <div
          data-series-hero-mask
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,9,0.96)_0%,rgba(5,7,9,0.9)_32%,rgba(5,7,9,0.66)_58%,rgba(5,7,9,0.2)_100%)]"
        />
        <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-black/82 to-transparent" />
        <div className="mx-auto max-w-[1440px]">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white">
            <ArrowLeft size={16} />
            Back to All Products
          </Link>

          <div className="mt-20 max-w-2xl lg:mt-28">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">{category.capability}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)] sm:text-6xl">{category.name}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-zinc-200 drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)]">{category.description}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">
                  Get Series Advice
                </Link>
                <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
                  Compare All Series
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ignition">Series Directory</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-neutral-950">Product hierarchy at a glance.</h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-neutral-600">
                Direct machines and grouped variants follow the category structure used by ZYRON for quotations and product selection.
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
              {directory.map((group) => (
                <div key={group.id} id={group.id} className="scroll-mt-28 border-t border-neutral-200 pt-4">
                  {group.isDirectProduct ? (
                    <Link href={`/products/${group.products[0].id}`} className="group flex items-start justify-between gap-3 text-sm font-semibold leading-6 text-neutral-950 transition hover:text-ignition">
                      {group.name}
                      <ArrowRight size={15} className="mt-1 shrink-0 transition group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold leading-6 text-neutral-950">{group.name}</h3>
                      <div className="mt-3 grid gap-2 border-l-2 border-ignition pl-4">
                        {group.products.map((product) => (
                          <Link key={product.id} href={`/products/${product.id}`} className="text-xs leading-5 text-neutral-600 transition hover:text-ignition">
                            {product.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
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

          <div className="mt-12 grid gap-6">
            {categoryProducts.map((product) => (
              <article
                key={product.id}
                data-series-product-card
                className="group grid overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm transition hover:border-ignition hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)] lg:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)]"
              >
                <div className="relative min-h-[300px] bg-[#eef1f3] sm:min-h-[360px] lg:min-h-[420px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 44vw, 100vw"
                    className={`${usesProductCutout(product.image) ? "object-contain p-5 sm:p-8" : "object-cover"} transition duration-700 group-hover:scale-[1.025]`}
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ignition">
                    {product.parentName ?? product.categoryName}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-neutral-950 sm:text-3xl">{product.name}</h3>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">{product.tagline}</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {product.highlights.slice(0, 3).map((item) => (
                      <span key={item} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <CheckCircle2 size={15} className="shrink-0 text-ignition" />
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex h-11 items-center justify-center rounded-sm border border-neutral-300 px-5 text-sm font-semibold text-neutral-950 transition hover:border-ignition hover:text-ignition"
                    >
                      Consult an Engineer
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
