import Image from "next/image";

import { IndustrialCta } from "./IndustrialCta";
import styles from "./about-sections.module.css";

export type AboutHeroContent = {
  enabled: boolean;
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  eyebrow: string;
  titleLineOne: string;
  titleLineTwo: string;
  highlight: string;
  description: string;
  values: Array<{ title: string }>;
  ctaLabel: string;
  ctaHref: string;
  showCta: boolean;
  imagePosition: string;
  overlayOpacity: number;
  showDiagonal: boolean;
  showMetalDecoration: boolean;
};

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<span>{highlight}</span>{text.slice(index + highlight.length)}</>;
}

export function AboutHeroSection({ content }: { content: AboutHeroContent }) {
  if (!content.enabled) return null;
  return (
    <section className={styles.hero} data-company-section="about-cms-hero">
      <div className={styles.heroMediaDesktop}>
        <Image
          src={content.desktopImage}
          alt={content.imageAlt}
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: content.imagePosition }}
          className={styles.heroImage}
        />
      </div>
      <div className={styles.heroMediaMobile}>
        <Image
          src={content.mobileImage || content.desktopImage}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: content.imagePosition }}
          className={styles.heroImage}
        />
      </div>
      {content.showDiagonal ? (
        <>
          <div
            aria-hidden="true"
            data-about-decoration
            className={styles.heroOverlay}
            style={{ "--overlay-alpha": content.overlayOpacity / 100 } as React.CSSProperties}
          />
          <svg aria-hidden="true" data-about-decoration className={styles.heroEdge} viewBox="0 0 1920 880" preserveAspectRatio="none">
            <defs>
              <linearGradient id="about-edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#80C900" stopOpacity="0" />
                <stop offset="0.22" stopColor="#80C900" stopOpacity="0.8" />
                <stop offset="0.65" stopColor="#80C900" stopOpacity="1" />
                <stop offset="1" stopColor="#80C900" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="1152" y1="0" x2="576" y2="880" stroke="url(#about-edge)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </>
      ) : null}
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.darkEyebrow} data-page-text="eyebrow"><span>{content.eyebrow}</span><i aria-hidden="true" /></p>
          <h1 data-page-text="titleLineOne" className={styles.heroTitle}>
            <span>{content.titleLineOne}</span>
            {" "}
            <span data-page-text="titleLineTwo"><Highlight text={content.titleLineTwo} highlight={content.highlight} /></span>
          </h1>
          <p data-page-text="description" className={styles.heroDescription}>{content.description}</p>
          <ul className={styles.valueStrip} aria-label="ZYRON brand values">
            {content.values.map((value) => <li key={value.title}>{value.title}</li>)}
          </ul>
          {content.showCta && content.ctaLabel ? <IndustrialCta href={content.ctaHref} label={content.ctaLabel} /> : null}
        </div>
      </div>
      {content.showMetalDecoration ? <div aria-hidden="true" data-about-decoration className={styles.heroMetal} /> : null}
    </section>
  );
}
