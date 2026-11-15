import { notFound } from "next/navigation";
import { UserEditor } from "@/components/admin/users/UserEditor";
import { requirePermission } from "@/lib/auth/guards";
import { ROLES } from "@/lib/auth/permissions";
import { UserAdminNotFoundError, UserAdminService } from "@/lib/services/user-admin-service";
export const dynamic = "force-dynamic";
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) { const principal = await requirePermission("user.manage"); const { id } = await params; try { const user = await new UserAdminService().get(principal, id); const assignableRoles = principal.roles.includes("SUPER_ADMIN") ? [...ROLES] : ROLES.filter((role) => role !== "SUPER_ADMIN"); return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">用户编辑</p><h1 className="mt-2 text-3xl font-semibold">{user.name}</h1></div><UserEditor initialUser={user} assignableRoles={assignableRoles} /></div>; } catch (error) { if (error instanceof UserAdminNotFoundError) notFound(); throw error; } }
