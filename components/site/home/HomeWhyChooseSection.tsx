import Image from "next/image";
import Link from "next/link";

export type HomeWhyChooseContent = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  items: Array<{ number: string; title: string; body: string }>;
  ctaLabel: string;
  ctaHref: string;
};

export function HomeWhyChooseSection({ content }: { content: HomeWhyChooseContent }) {
  return (
    <section className="bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-center lg:gap-16">
        <div>
          <p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#80C900]">{content.eyebrow}</p>
          <h2 data-page-text="title" className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-5xl">{content.title}</h2>
          <p data-page-text="description" className="mt-6 max-w-2xl text-base leading-[1.75] text-white/62">{content.description}</p>
          <div className="mt-8">
            {content.items.map((item) => (
              <article key={item.number} className="grid grid-cols-[42px_1fr] gap-3 border-t border-white/12 py-5">
                <span className="text-sm font-semibold text-[#80C900]">{item.number}</span>
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/55">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
          <Link data-page-text="ctaLabel" href={content.ctaHref} className="mt-4 inline-flex border-b border-[#80C900] pb-2 text-sm font-semibold transition-colors hover:text-[#80C900]">
            {content.ctaLabel}
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#13171C]">
          <Image src={content.image} alt={content.imageAlt} fill sizes="(max-width: 1023px) 100vw, 52vw" className="object-contain" />
        </div>
      </div>
    </section>
  );
}
