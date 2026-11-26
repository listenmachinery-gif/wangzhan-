import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import styles from "./about-sections.module.css";

export function IndustrialCta({ href, label, textKey = "ctaLabel" }: { href: string; label: string; textKey?: string }) {
  return (
    <Link href={href} className={styles.industrialCta}>
      <span data-page-text={textKey}>{label}</span>
      <ArrowUpRight aria-hidden="true" size={20} strokeWidth={2} />
    </Link>
  );
}
