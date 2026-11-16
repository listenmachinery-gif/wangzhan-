import { useId, type ReactNode } from "react";

type AdminCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminCard({ title, description, action, children, className = "" }: AdminCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={`rounded-admin border border-admin-border bg-white shadow-admin-card ${className}`.trim()}
    >
      {title || description || action ? (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-admin-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 id={titleId} className="text-base font-semibold tracking-[-0.01em] text-admin-ink">
                {title}
              </h2>
            ) : null}
            {description ? <p className="mt-1 text-sm leading-6 text-admin-muted">{description}</p> : null}
          </div>
          {action ? (
            <div
              role="group"
              aria-label="卡片操作"
              className="flex items-center gap-2 [&_a]:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-ignition [&_button]:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-ignition"
            >
              {action}
            </div>
          ) : null}
        </header>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
