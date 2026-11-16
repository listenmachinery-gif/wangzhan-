import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions, meta }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-admin-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ignition">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-admin-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-muted sm:text-base">{description}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-admin-muted">{meta}</div> : null}
      </div>
      {actions ? (
        <div
          role="group"
          aria-label="页面操作"
          className="flex shrink-0 flex-wrap items-center gap-2 [&_a]:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-ignition [&_button]:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-ignition"
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}
