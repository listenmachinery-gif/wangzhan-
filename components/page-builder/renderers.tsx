import Link from "next/link";
import type { ReactNode } from "react";
import { Factory, Headphones, PackageCheck, Settings, Wrench } from "lucide-react";

import type { PageComponentType } from "@/lib/page-builder/schema";
import { InquiryForm } from "@/components/InquiryForm";
import { HomeAboutSection, type HomeAboutContent } from "@/components/site/home/HomeAboutSection";
import { HomeContactSection, type HomeContactContent } from "@/components/site/home/HomeContactSection";
import { HomeHeroSection, type HomeHeroContent } from "@/components/site/home/HomeHeroSection";
import { HomeNewsInsights, type HomeNewsInsightsContent } from "@/components/site/home/HomeNewsInsights";
import { HomeProductShowcase, type HomeProductShowcaseContent } from "@/components/site/home/HomeProductShowcase";
import { HomeWhyChooseSection, type HomeWhyChooseContent } from "@/components/site/home/HomeWhyChooseSection";
import { AboutHeroSection, type AboutHeroContent } from "@/components/company/cms/AboutHeroSection";
import { AboutCompanyOverviewSection, type AboutCompanyOverviewContent } from "@/components/company/cms/AboutCompanyOverviewSection";
import { AboutManufacturingSection, type AboutManufacturingContent } from "@/components/company/cms/AboutManufacturingSection";
import { productCategories } from "@/data/products";

type Content = Record<string, unknown>;
type Item = { title: string; body?: string; description?: string; image?: string; href?: string };

const string = (value: unknown) => typeof value === "string" ? value : "";
const number = (value: unknown) => typeof value === "number" ? value : 0;
const items = (value: unknown) => Array.isArray(value) ? value as Item[] : [];

function SafeImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

function Cards({ heading, cards }: { heading: string; cards: Item[] }) {
  return <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8"><h2 data-page-text="heading" className="text-3xl font-semibold">{heading}</h2><div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map((card, index) => <article key={`${card.title}-${index}`} className="overflow-hidden rounded-sm border border-neutral-200 bg-white">{card.image ? <SafeImage src={card.image} alt={card.title} className="h-52 w-full object-cover" /> : null}<div className="p-5"><h3 className="text-xl font-semibold">{card.title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{card.description ?? card.body}</p>{card.href ? <Link href={card.href} className="mt-4 inline-flex text-sm font-semibold text-[#5F9500]">View details</Link> : null}</div></article>)}</div></section>;
}

function Table({ content }: { content: Content }) {
  const columns = Array.isArray(content.columns) ? content.columns.map(string) : [];
  const rows = Array.isArray(content.rows) ? content.rows as unknown[][] : [];
  return <section className="mx-auto max-w-[1440px] overflow-x-auto px-5 py-12 sm:px-8"><h2 data-page-text="heading" className="text-3xl font-semibold">{string(content.heading)}</h2><table className="mt-6 min-w-full border-collapse text-left text-sm"><thead><tr>{columns.map((column) => <th key={column} className="border border-neutral-300 bg-neutral-100 p-3">{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border border-neutral-300 p-3">{string(cell)}</td>)}</tr>)}</tbody></table></section>;
}

function FactoryStats({ content }: { content: Content }) {
  const stats = Array.isArray(content.stats) ? content.stats as Array<{ value: string; label: string }> : [];
  return <section className="relative min-h-screen overflow-hidden bg-[#0B0D10] px-5 text-white sm:px-8"><SafeImage src={string(content.image)} alt={string(content.imageAlt)} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" /><div className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:py-24"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#76B900]">{string(content.eyebrow)}</p><h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">{string(content.heading)}</h2><p className="mt-5 max-w-xl leading-8 text-zinc-100">{string(content.description)}</p><Link href={string(content.ctaHref)} className="mt-8 inline-flex border border-white/30 px-5 py-3 text-sm font-semibold">{string(content.ctaLabel)}</Link></div><div className="grid gap-6 self-end sm:grid-cols-2">{stats.map((stat) => <div key={stat.label} className="border-t border-white/25 pt-5"><p className="text-5xl font-semibold">{stat.value}</p><p className="mt-2 text-sm uppercase tracking-[0.14em]">{stat.label}</p></div>)}</div></div></section>;
}

function Advantages({ content }: { content: Content }) {
  return <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"><div className="mx-auto max-w-[1440px]"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#76B900]">{string(content.eyebrow)}</p><div className="mt-4 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"><h2 className="text-4xl font-semibold leading-tight sm:text-6xl">{string(content.heading)}</h2><p className="leading-8 text-zinc-400">{string(content.description)}</p></div><div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{items(content.items).map((item, index) => { const Icon = [Settings, Wrench, PackageCheck, Headphones][index % 4]; return <article key={`${item.title}-${index}`} className="border border-white/10 bg-white/[0.04] p-7"><Icon className="text-[#76B900]" /><h3 className="mt-5 text-2xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{item.body}</p></article>; })}</div><div className="mt-10 flex gap-3"><Link href={string(content.primaryHref)} className="bg-[#76B900] px-5 py-3 text-sm font-semibold">{string(content.primaryLabel)}</Link><Link href={string(content.secondaryHref)} className="border border-white/25 px-5 py-3 text-sm font-semibold">{string(content.secondaryLabel)}</Link></div></div></section>;
}

export function renderNodeContent(type: PageComponentType, content: Content, children: ReactNode) {
  switch (type) {
    case "ABOUT_HERO": return <AboutHeroSection content={content as AboutHeroContent} />;
    case "ABOUT_COMPANY_OVERVIEW": return <AboutCompanyOverviewSection content={content as AboutCompanyOverviewContent} />;
    case "ABOUT_MANUFACTURING": return <AboutManufacturingSection content={content as AboutManufacturingContent} />;
    case "HOME_HERO": return <HomeHeroSection content={content as HomeHeroContent} />;
    case "HOME_ABOUT": return <HomeAboutSection content={content as HomeAboutContent} />;
    case "HOME_PRODUCT_SHOWCASE": return <HomeProductShowcase content={content as HomeProductShowcaseContent} />;
    case "HOME_WHY_CHOOSE": return <HomeWhyChooseSection content={content as HomeWhyChooseContent} />;
    case "HOME_NEWS_INSIGHTS": return <HomeNewsInsights content={content as HomeNewsInsightsContent} />;
    case "HOME_CONTACT_CTA": return <HomeContactSection content={content as HomeContactContent} />;
    case "HEADING": { const level = Math.min(6, Math.max(1, number(content.level))) as 1 | 2 | 3 | 4 | 5 | 6; const Tag = `h${level}` as keyof React.JSX.IntrinsicElements; return <Tag data-page-text="text" className="font-semibold">{string(content.text)}</Tag>; }
    case "PARAGRAPH": return <p data-page-text="text">{string(content.text)}</p>;
    case "IMAGE": return <figure><SafeImage src={string(content.src)} alt={string(content.alt)} className="h-auto w-full" />{content.caption ? <figcaption>{string(content.caption)}</figcaption> : null}</figure>;
    case "VIDEO": return <video src={string(content.src)} poster={string(content.poster)} aria-label={string(content.title)} controls className="h-auto w-full" />;
    case "BUTTON": return <Link data-page-text="label" href={string(content.href)} className="inline-flex bg-[#76B900] px-5 py-3 font-semibold text-white">{string(content.label)}</Link>;
    case "DIVIDER": return <hr aria-label={string(content.label)} className="border-neutral-300" />;
    case "SPACER": return <div aria-hidden style={{ height: number(content.size) }} />;
    case "ICON": { const Icon = content.name === "factory" ? Factory : content.name === "support" ? Headphones : content.name === "product" ? PackageCheck : Settings; return <span className="inline-flex items-center gap-2"><Icon aria-hidden />{string(content.label)}</span>; }
    case "RICH_TEXT": return <div className="space-y-4">{(content.blocks as string[]).map((block, index) => <p key={index}>{block}</p>)}</div>;
    case "SECTION": return <section aria-label={string(content.label)}>{children}</section>;
    case "ROW": return <div aria-label={string(content.label)} className="flex flex-wrap gap-6">{children}</div>;
    case "COLUMNS":
    case "GRID": return <div aria-label={string(content.label)} className="grid gap-6" style={{ gridTemplateColumns: `repeat(${number(content.columns)}, minmax(0, 1fr))` }}>{children}</div>;
    case "TABS": return <section className="grid gap-3">{items(content.items).map((item, index) => <article key={`${item.title}-${index}`}><h3 className="font-semibold">{item.title}</h3><p>{item.body}</p></article>)}</section>;
    case "ACCORDION": return <section>{items(content.items).map((item, index) => <details key={`${item.title}-${index}`}><summary className="font-semibold">{item.title}</summary><p className="py-3">{item.body}</p></details>)}</section>;
    case "HERO": return <section className="relative min-h-[560px] overflow-hidden bg-black text-white"><SafeImage src={string(content.image)} alt={string(content.alt)} className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="relative mx-auto max-w-[1440px] px-5 py-32"><p data-page-text="eyebrow" className="text-[#76B900]">{string(content.eyebrow)}</p><h1 data-page-text="title" className="mt-4 max-w-4xl text-5xl font-semibold">{string(content.title)}</h1><p data-page-text="description" className="mt-5 max-w-2xl leading-8">{string(content.description)}</p><Link data-page-text="primaryLabel" href={string(content.primaryHref)} className="mt-8 inline-flex bg-[#76B900] px-5 py-3 font-semibold">{string(content.primaryLabel)}</Link></div></section>;
    case "PRODUCT_CARDS":
    case "CATEGORY_CARDS":
    case "PRODUCT_CAROUSEL":
    case "CUSTOMER_CASES": return <Cards heading={string(content.heading)} cards={items(content.items)} />;
    case "SPECIFICATION_TABLE":
    case "MODEL_COMPARISON": return <Table content={content} />;
    case "PRODUCT_GALLERY": return <section className="mx-auto max-w-[1440px] px-5 py-12"><h2 className="text-3xl font-semibold">{string(content.heading)}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{(content.images as Array<{ src: string; alt: string }>).map((image) => <SafeImage key={image.src} src={image.src} alt={image.alt} className="h-72 w-full object-cover" />)}</div></section>;
    case "FACTORY_STATS": return <FactoryStats content={content} />;
    case "ADVANTAGES": return <Advantages content={content} />;
    case "CERTIFICATES": return <section className="mx-auto max-w-[1440px] px-5 py-12"><h2 className="text-3xl font-semibold">{string(content.heading)}</h2><ul className="mt-6 grid gap-3">{(content.items as string[]).map((item) => <li key={item} className="border-l-2 border-[#76B900] pl-4">{item}</li>)}</ul></section>;
    case "APPLICATIONS": return <section className="mx-auto max-w-[1440px] px-5 py-12"><h2 className="text-3xl font-semibold">{string(content.heading)}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{items(content.items).map((item, index) => <article key={`${item.title}-${index}`} className="border p-5"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm">{item.body}</p></article>)}</div></section>;
    case "FAQ": return <section className="mx-auto max-w-4xl px-5 py-12"><h2 data-page-text="heading" className="text-3xl font-semibold">{string(content.heading)}</h2>{items(content.items).map((item, index) => <details key={`${item.title}-${index}`} className="border-b py-4"><summary className="font-semibold">{item.title}</summary><p className="pt-3">{item.body}</p></details>)}</section>;
    case "INQUIRY_CTA":
    case "DOWNLOAD_CATALOG": return <section className="mx-auto my-12 max-w-[1440px] bg-[#0B0D10] px-8 py-12 text-white"><h2 data-page-text="heading" className="text-3xl font-semibold">{string(content.heading)}</h2><p data-page-text="description" className="mt-3">{string(content.description)}</p><Link data-page-text="label" href={string(content.href)} className="mt-6 inline-flex bg-[#76B900] px-5 py-3 font-semibold">{string(content.label)}</Link></section>;
    case "SPLIT_FEATURE": return <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24"><div className={content.reverse ? "lg:order-2" : ""}><p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#76B900]">{string(content.eyebrow)}</p><h2 data-page-text="title" className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">{string(content.title)}</h2><p data-page-text="body" className="mt-6 max-w-xl whitespace-pre-line text-base leading-8 text-neutral-600">{string(content.body)}</p><Link data-page-text="ctaLabel" href={string(content.ctaHref)} className="mt-8 inline-flex border-b-2 border-[#76B900] pb-2 font-semibold">{string(content.ctaLabel)}</Link></div><SafeImage src={string(content.image)} alt={string(content.imageAlt)} className="aspect-[4/3] w-full bg-neutral-100 object-contain" /></section>;
    case "TIMELINE": return <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8"><h2 className="text-4xl font-semibold">{string(content.heading)}</h2><div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{(Array.isArray(content.items) ? content.items : []).map((item: { year: string; title: string; body: string }, index: number) => <article key={index} className="border-t-2 border-[#76B900] pt-5"><p className="text-3xl font-semibold text-[#76B900]">{item.year}</p><h3 className="mt-4 text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.body}</p></article>)}</div></section>;
    case "RESOURCE_LINKS": return <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8"><h2 className="text-4xl font-semibold">{string(content.heading)}</h2><p className="mt-4 max-w-2xl leading-7 text-neutral-600">{string(content.description)}</p><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items(content.items).map((item, index) => <Link key={index} href={item.href ?? "/contact"} className="group border border-neutral-200 bg-white p-7 transition hover:border-[#76B900]"><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.description}</p><span className="mt-6 inline-flex border-b border-[#76B900] pb-1 text-sm font-semibold">Explore resource</span></Link>)}</div></section>;
    case "MEDIA_HERO": {
      const split = content.layout === "split";
      const hasVideo = content.mediaKind === "video" && Boolean(string(content.videoSrc));
      const media = hasVideo ? (
        <video className="h-full w-full object-cover" src={string(content.videoSrc)} poster={string(content.poster) || string(content.image)} autoPlay muted loop playsInline preload="metadata" aria-label={string(content.alt)} />
      ) : <SafeImage src={string(content.image)} alt={string(content.alt)} className="h-full w-full object-cover" />;
      const copy = <div className={split ? "flex max-w-2xl flex-col justify-center px-5 py-16 sm:px-10 lg:px-16 lg:py-24" : "relative z-10 flex min-h-[640px] max-w-[1440px] flex-col justify-center px-5 py-20 text-white sm:px-8 lg:min-h-[740px]"}>
        <p data-page-text="eyebrow" className={split ? "text-sm font-semibold uppercase tracking-[0.2em] text-[#76B900]" : "text-sm font-semibold uppercase tracking-[0.2em] text-[#80C900]"}>{string(content.eyebrow)}</p>
        <h1 data-page-text="title" className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl xl:text-7xl">{string(content.title)}</h1>
        <p data-page-text="description" className={split ? "mt-6 max-w-2xl text-lg leading-8 text-neutral-600" : "mt-6 max-w-2xl text-lg leading-8 text-white/85"}>{string(content.description)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {string(content.primaryLabel) ? <Link data-page-text="primaryLabel" href={string(content.primaryHref)} className="inline-flex min-h-12 items-center justify-center bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10]">{string(content.primaryLabel)}</Link> : null}
          {string(content.secondaryLabel) ? <Link data-page-text="secondaryLabel" href={string(content.secondaryHref)} className={split ? "inline-flex min-h-12 items-center justify-center border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-950" : "inline-flex min-h-12 items-center justify-center border border-white/50 px-6 py-3 text-sm font-semibold text-white"}>{string(content.secondaryLabel)}</Link> : null}
        </div>
      </div>;
      return split ? <section className="grid min-h-[590px] bg-white text-[#16191d] lg:grid-cols-2">
        <div className={content.mediaSide === "left" ? "lg:order-2" : ""}>{copy}</div>
        <div className={"relative min-h-[380px] bg-neutral-100 " + (content.mediaSide === "left" ? "lg:order-1" : "")}>{media}</div>
      </section> : <section className="relative isolate overflow-hidden bg-[#0B0D10]">
        <div className="absolute inset-0 -z-20">{media}</div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
        <div className="mx-auto max-w-[1440px]">{copy}</div>
      </section>;
    }
    case "MEDIA_SHOWCASE": return <section className="bg-[#F5F5F7] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <p data-page-text="eyebrow" className="text-sm font-semibold uppercase tracking-[0.2em] text-[#76B900]">{string(content.eyebrow)}</p>
        <h2 data-page-text="heading" className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{string(content.heading)}</h2>
        <p data-page-text="description" className="mt-5 max-w-3xl leading-8 text-neutral-600">{string(content.description)}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(Array.isArray(content.items) ? content.items : []).map((item: {title:string;description:string;src:string;mediaKind:"image"|"video";alt:string}, index: number) => <article key={index} className="overflow-hidden bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
              {item.mediaKind === "video" ? <video className="h-full w-full object-cover" src={item.src} controls preload="metadata" aria-label={item.alt || item.title} playsInline /> : <SafeImage src={item.src} alt={item.alt || item.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-6"><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-neutral-600">{item.description}</p></div>
          </article>)}
        </div>
      </div>
    </section>;
    case "INQUIRY_FORM": return <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8"><InquiryForm productCategories={productCategories} eyebrow={string(content.eyebrow)} heading={string(content.heading)} description={string(content.description)} /></section>;
    case "WHATSAPP_CTA": return <section className="mx-auto my-12 max-w-[1440px] border px-8 py-10"><h2 className="text-3xl font-semibold">{string(content.heading)}</h2><a href={string(content.href)} rel="noreferrer" target="_blank" className="mt-6 inline-flex bg-[#25D366] px-5 py-3 font-semibold text-white">{string(content.label)}</a></section>;
  }
}
