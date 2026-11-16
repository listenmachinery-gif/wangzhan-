import { MessageSquareText } from "lucide-react";
import { redirect } from "next/navigation";

import { ChatWorkspace } from "@/components/admin/chat/ChatWorkspace";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { can } from "@/lib/auth/permissions";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/admin/login");
  const assigned = can(principal, "chat.read.assigned", { chatAssigneeId: principal.id, chatAssignmentActive: true });
  if (!can(principal, "chat.read.all") && !assigned) redirect("/admin");
  const agents = await db.user.findMany({
    where: {
      isActive: true,
      roles: { some: { role: { key: { in: ["SUPPORT_AGENT", "SUPPORT_SUPERVISOR"] } } } },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="客户增长"
        title="在线客服"
        description="统一处理网站访客会话、分配客服并关联询盘客户。消息先安全落库，再进行实时投递。"
        actions={<span className="inline-flex items-center gap-2 rounded-full border border-ignition/30 bg-ignition/10 px-3 py-1.5 text-xs font-semibold text-[#558900]"><MessageSquareText className="size-4" />客服工作台</span>}
      />
      <ChatWorkspace principal={principal} agents={agents} />
    </div>
  );
}
