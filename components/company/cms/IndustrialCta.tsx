import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import styles from "./about-sections.module.css";

export function IndustrialCta({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.industrialCta}>
      <span>{label}</span>
      <ArrowUpRight aria-hidden="true" size={20} strokeWidth={2} />
    </Link>
  );
}
