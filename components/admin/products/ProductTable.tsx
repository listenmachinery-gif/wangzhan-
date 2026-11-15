import Link from "next/link";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  version: number;
  category: { name: string };
  _count: { sections: number; models: number };
};

export function ProductTable({ items }: { items: ProductRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr><th className="px-4 py-3">产品</th><th className="px-4 py-3">分类</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">模块 / 型号</th><th className="px-4 py-3">操作</th></tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {items.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-4"><p className="font-medium text-neutral-900">{product.name}</p><p className="mt-1 text-xs text-neutral-500">/products/{product.slug}</p></td>
              <td className="px-4 py-4 text-neutral-700">{product.category.name}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{product.status}</span></td>
              <td className="px-4 py-4 text-neutral-600">{product._count.sections} / {product._count.models}</td>
              <td className="px-4 py-4"><Link className="font-medium text-[#5F9500] hover:underline" href={`/admin/products/${product.id}`}>编辑</Link></td>
            </tr>
          ))}
          {items.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">没有符合条件的产品。</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
