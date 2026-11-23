import Image from "next/image";
import Link from "next/link";

export type HomeHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  image: string;
  alt: string;
};

export function HomeHeroSection({ content }: { content: HomeHeroContent }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B0D10] text-white">
      <div className="relative lg:min-h-[min(800px,calc(100vh-84px))]">
        <div className="relative h-[230px] w-full sm:h-[420px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src={content.image}
            alt={content.alt}
            fill
            priority
            sizes="100vw"
            className="object-contain object-center lg:object-cover lg:object-[58%_center]"
          />
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(11,13,16,0.96)_0%,rgba(11,13,16,0.82)_32%,rgba(11,13,16,0.12)_68%,rgba(11,13,16,0.04)_100%)] lg:block" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-[1440px] items-center px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12 lg:min-h-[min(800px,calc(100vh-84px))] lg:py-24">
          <div className="max-w-[610px]">
            <p data-page-text="eyebrow" className="text-xs font-semibold uppercase tracking-[0.2em] text-[#80C900] sm:text-sm">
              {content.eyebrow}
            </p>
            <h1 data-page-text="title" className="mt-5 text-4xl font-semibold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {content.title}
            </h1>
            <p data-page-text="description" className="mt-6 max-w-xl text-base leading-8 text-white/72 sm:text-lg">
              {content.description}
            </p>
            <Link
              data-page-text="primaryLabel"
              href={content.primaryHref}
              className="mt-9 inline-flex min-h-12 items-center rounded-sm bg-[#80C900] px-6 py-3 text-sm font-semibold text-[#11160C] transition-colors hover:bg-[#92DC14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80C900]"
            >
              {content.primaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
