export function ConnectionStatus({ service, connected }: { service: string; connected: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-medium text-neutral-900">{service}</p>
      <p className={`mt-2 text-sm ${connected ? "text-emerald-700" : "text-amber-700"}`}>
        {connected ? "已连接" : "尚未连接"}
      </p>
    </div>
  );
}
