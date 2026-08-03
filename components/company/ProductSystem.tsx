import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { productSystem } from "@/data/company";
import { getCategoryHref, productCategories } from "@/data/products";

const categoryMap = new Map(
  productCategories.map((category) => [category.id, category]),
);

export function ProductSystem() {
  return (
    <section
      id="product-system"
      data-company-section="product-system"
      className="scroll-mt-24 bg-[#F4F6F8] px-5 py-20 text-[#101214] sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]">
            PRODUCT SYSTEM
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
            One Manufacturing Partner for Multiple Production Processes
          </h2>
          <p className="mt-7 max-w-3xl text-base leading-8 text-neutral-600">
            ZYRON’s product system covers connected stages of metal processing
            and duct production. This allows customers to evaluate individual
            machines as well as the relationship between upstream and downstream
            processes.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-neutral-200 bg-neutral-200 sm:grid-cols-2 xl:grid-cols-4">
          {productSystem.map((item, index) => {
            const category = categoryMap.get(item.categoryId);

            if (!category) {
              return null;
            }

            return (
              <article key={item.categoryId} className="group flex min-h-full flex-col bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eef1f3]">
                  <Image
                    src={category.image}
                    alt={`${item.title} manufactured for sheet metal production`}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4 transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-xs font-semibold text-[#4E7A00]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-neutral-600">
                    {item.description}
                  </p>
                  <Link
                    href={getCategoryHref(item.categoryId)}
                    aria-label={`View ${item.title} product series`}
                    className="mt-6 inline-flex items-center justify-between border-t border-neutral-200 pt-4 text-sm font-semibold text-neutral-950 transition hover:text-[#4E7A00]"
                  >
                    View Product Series
                    <ArrowUpRight
                      size={17}
                      className="text-[#76B900] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
