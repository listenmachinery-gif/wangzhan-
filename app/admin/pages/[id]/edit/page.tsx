import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/admin/pages/PageBuilder";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { parsePageDocument, PageNotFoundError, PageService } from "@/lib/services/page-service";

export const dynamic = "force-dynamic";

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const principal = await requirePermission("page.read");
  const { id } = await params;
  try {
    const page = await new PageService().get(principal, id);
    return <PageBuilder page={{ id: page.id, name: page.name, slug: page.slug, status: page.status, version: page.version, document: parsePageDocument(page.draftContent) }} canPublish={can(principal, "page.publish")} />;
  } catch (error) { if (error instanceof PageNotFoundError) notFound(); throw error; }
}
