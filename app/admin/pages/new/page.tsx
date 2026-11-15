import { PageCreateForm } from "@/components/admin/pages/PageCreateForm";
import { requirePermission } from "@/lib/auth/guards";

export default async function NewPagePage() {
  await requirePermission("page.write");
  return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">页面设计</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">新建页面</h1><p className="mt-2 text-sm text-neutral-600">选择模板后进入可视化编辑器。</p></div><PageCreateForm /></div>;
}
