import type { ReactNode } from "react";

type TableShellProps = {
  caption: string;
  children: ReactNode;
  className?: string;
};

export function TableShell({ caption, children, className = "" }: TableShellProps) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={`overflow-auto rounded-admin border border-admin-border bg-white admin-focus ${className}`.trim()}
    >
      <table
        className="admin-data-table w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm [&_tbody_td]:border-t [&_tbody_td]:border-admin-border [&_tbody_td]:px-4 [&_tbody_td]:py-3.5 [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-admin [&_tbody_tr:hover]:bg-neutral-50/80 [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:border-b [&_thead_th]:border-admin-border [&_thead_th]:bg-neutral-50/95 [&_thead_th]:px-4 [&_thead_th]:py-3 [&_thead_th]:text-[11px] [&_thead_th]:font-semibold [&_thead_th]:uppercase [&_thead_th]:tracking-[0.08em] [&_thead_th]:text-admin-muted [&_thead_th]:backdrop-blur"
      >
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
