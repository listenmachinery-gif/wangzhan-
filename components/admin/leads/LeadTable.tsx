import Link from "next/link";
import { formatAdminEnum, formatCountryName } from "@/lib/admin/localization";

type LeadRow = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  country: string | null;
  status: string;
  createdAt: Date;
  assignments: Array<{ assignee: { name: string; email: string } }>;
};

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-600"><tr><th className="px-4 py-3">客户</th><th className="px-4 py-3">国家/地区</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">负责人</th><th className="px-4 py-3">提交时间</th><th className="px-4 py-3">操作</th></tr></thead>
        <tbody>{leads.map((lead) => <tr key={lead.id} className="border-t border-neutral-100"><td className="px-4 py-3"><p className="font-semibold text-neutral-950">{lead.name || "未填写姓名"}</p><p className="mt-1 text-neutral-500">{lead.company || lead.email}</p></td><td className="px-4 py-3">{formatCountryName(lead.country, "—")}</td><td className="px-4 py-3"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold">{formatAdminEnum(lead.status)}</span></td><td className="px-4 py-3">{lead.assignments[0]?.assignee.name || "待分配"}</td><td className="whitespace-nowrap px-4 py-3 text-neutral-600">{lead.createdAt.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</td><td className="px-4 py-3"><Link href={`/admin/leads/${lead.id}`} className="font-semibold text-[#5F9500]">查看</Link></td></tr>)}</tbody>
      </table>
      {leads.length === 0 ? <p className="p-8 text-center text-neutral-500">没有符合条件的询盘。</p> : null}
    </div>
  );
}
