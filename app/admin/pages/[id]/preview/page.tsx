import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { requirePermission } from "@/lib/auth/guards";
import { parsePageDocument, PageNotFoundError, PageService } from "@/lib/services/page-service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PageDraftPreview({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("page.read");
  const { id } = await params;
  try { const page = await new PageService().get(principal, id); return <div className="-m-4 bg-white sm:-m-6 lg:-m-8"><div className="border-b bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900">草稿预览 · 不会被搜索引擎收录 · {page.name} v{page.version}</div><PageRenderer document={parsePageDocument(page.draftContent)} /></div>; }
  catch (error) { if (error instanceof PageNotFoundError) notFound(); throw error; }
}
