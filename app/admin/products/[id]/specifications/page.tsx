import { notFound } from "next/navigation";

import { SpecificationGrid } from "@/components/admin/specifications/SpecificationGrid";
import { requirePermission } from "@/lib/auth/guards";
import { SpecificationNotFoundError, SpecificationService } from "@/lib/services/specification-service";

export const dynamic = "force-dynamic";

export default async function ProductSpecificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("specification.read");
  const { id } = await params;
  const service = new SpecificationService();
  try {
    const grid = await service.getProductGrid(principal, id);
    const templates = await service.listTemplates(principal, grid.product.categoryId);
    const selected = grid.template ?? templates[0] ?? null;
    const models = selected ? grid.product.models.map((model) => ({
      id: model.id,
      name: model.name,
      sku: model.sku,
      active: model.active,
      position: model.position,
      values: Object.fromEntries(model.values.map(({ fieldId, value }) => [fieldId, value])),
    })) : [];
    return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">产品型号</p><h1 className="mt-2 text-3xl font-semibold">型号参数</h1><p className="mt-2 text-sm text-neutral-600">{grid.product.name} · 数据保存后同步“小型电动剪板机”布局中的技术参数模块，不改变公开 URL。</p></div><SpecificationGrid productId={id} initialVersion={grid.product.version} templates={JSON.parse(JSON.stringify(templates))} initialTemplateId={selected?.id ?? ""} initialModels={models} /></div>;
  } catch (error) {
    if (error instanceof SpecificationNotFoundError) notFound();
    throw error;
  }
}
