import { ConnectionStatus } from "@/components/admin/ConnectionStatus";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, publishedProducts, newLeads] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.lead.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-[#5F9500]">运营概览</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">数据总览</h1>
        <p className="mt-2 text-sm text-neutral-600">这里只显示数据库中的真实运营数据。</p>
      </div>
      <section aria-label="内容统计" className="grid gap-4 sm:grid-cols-3">
        {[
          ["产品总数", products],
          ["已发布产品", publishedProducts],
          ["新询盘", newLeads],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
      <section aria-label="外部数据连接" className="grid gap-4 sm:grid-cols-2">
        <ConnectionStatus service="Google Analytics 4" connected={false} />
        <ConnectionStatus service="Google Search Console" connected={false} />
      </section>
    </div>
  );
}
