import { AlertTriangle, Database, LoaderCircle } from "lucide-react";

type DataStateProps = {
  kind: "empty" | "error" | "loading";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const stateIcon = {
  empty: Database,
  error: AlertTriangle,
  loading: LoaderCircle,
};

export function DataState({ kind, title, description, actionLabel, onAction }: DataStateProps) {
  const Icon = stateIcon[kind];
  const role = kind === "error" ? "alert" : "status";

  return (
    <div role={role} aria-live={kind === "error" ? "assertive" : "polite"} className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className={`grid size-11 place-items-center rounded-full ${kind === "error" ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-500"}`}>
        <Icon aria-hidden="true" className={`size-5 ${kind === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-admin-ink">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-sm leading-6 text-admin-muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="admin-focus mt-5 rounded-admin-sm bg-admin-ink px-4 py-2 text-sm font-semibold text-white transition duration-admin hover:bg-graphite-700 focus-visible:ring-2 focus-visible:ring-ignition focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
