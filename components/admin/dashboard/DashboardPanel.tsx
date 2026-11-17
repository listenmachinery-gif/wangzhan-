import type { ReactNode } from "react";

export function DashboardPanel({
  title,
  description,
  action,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className={`overflow-hidden rounded-xl border border-white/[0.09] bg-[#161A20] ${className}`}>
      <header className="flex min-h-14 items-start justify-between gap-4 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1 text-[11px] leading-4 text-[#89939E]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}
