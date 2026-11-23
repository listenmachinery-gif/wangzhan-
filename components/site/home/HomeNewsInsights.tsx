import Image from "next/image";
import Link from "next/link";

export type HomeNewsItem = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  href: string;
  status: "draft" | "published";
  featured: boolean;
};

export type HomeNewsInsightsContent = {
  eyebrow: string;
  heading: string;
  description: string;
  viewAllLabel: string;
  viewAllHref: string;
  items: HomeNewsItem[];
};

function ArticleCard({ item, featured = false }: { item: HomeNewsItem; featured?: boolean }) {
  return (
    <Link href={item.href} aria-label={`${item.title} — Read Article`} className={`group grid overflow-hidden rounded-xl bg-white ${featured ? "h-full" : "sm:grid-cols-[42%_1fr]"}`}>
      <div className={`relative overflow-hidden bg-neutral-100 ${featured ? "aspect-[16/9]" : "aspect-[16/9] sm:aspect-auto sm:min-h-52"}`}>
        <Image src={item.image} alt={item.imageAlt} fill sizes={featured ? "(max-width: 1023px) 100vw, 58vw" : "(max-width: 1023px) 100vw, 20vw"} className="object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#699F08]">{item.category}</p>
        <h3 className={`${featured ? "mt-3 text-2xl sm:text-3xl" : "mt-3 text-xl"} font-semibold leading-tight text-[#1A1D21]`}>{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#61666D]">{item.excerpt}</p>
        <span className="mt-5 inline-flex border-b border-[#76B900] pb-1 text-sm font-semibold text-[#1A1D21]">Read Article →</span>
      </div>
    </Link>
  );
}

export function HomeNewsInsights({ content }: { content: HomeNewsInsightsContent }) {
  const published = content.items.filter((item) => item.status === "published" && item.href.startsWith("/") && !item.href.startsWith("//"));
  const featured = published.find((item) => item.featured) ?? published[0];
  const secondary = published.filter((item) => item.id !== featured?.id).slice(0, 2);

  return (
    <section className="bg-[#F5F6F7] px-5 py-20 text-[#1A1D21] sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#76B900]">{content.eyebrow}</p>
            <h2 data-page-text="heading" className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{content.heading}</h2>
            <p data-page-text="description" className="mt-5 max-w-3xl text-base leading-8 text-[#656A70]">{content.description}</p>
          </div>
          <Link data-page-text="viewAllLabel" href={content.viewAllHref} className="inline-flex border-b border-[#76B900] pb-1 text-sm font-semibold">{content.viewAllLabel}</Link>
        </div>

        {featured ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.38fr_1fr]">
            <ArticleCard item={featured} featured />
            <div className="grid gap-6">{secondary.map((item) => <ArticleCard key={item.id} item={item} />)}</div>
          </div>
        ) : (
          <div className="mt-12 border-t border-black/10 py-10 text-sm text-[#656A70]">New verified insights are being prepared.</div>
        )}
      </div>
    </section>
  );
}
