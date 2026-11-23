import { HomepageAdmin } from "@/components/admin/pages/HomepageAdmin";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { PageService, parsePageDocument } from "@/lib/services/page-service";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const principal = await requirePermission("page.read");
  const page = await new PageService().getBySlug(principal, "home");

  return (
    <HomepageAdmin
      page={page ? {
        id: page.id,
        name: page.name,
        slug: page.slug,
        status: page.status,
        version: page.version,
        document: parsePageDocument(page.draftContent),
      } : null}
      canWrite={can(principal, "page.write")}
      canPublish={can(principal, "page.publish")}
    />
  );
}
