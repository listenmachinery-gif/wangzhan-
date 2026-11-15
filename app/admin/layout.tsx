import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentPrincipal } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");

  return <AdminShell principal={principal}>{children}</AdminShell>;
}
