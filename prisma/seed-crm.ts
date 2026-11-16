import { pathToFileURL } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const defaultStages = [
  { code: "NEW_INQUIRY", name: "新询盘", color: "#2563EB" },
  { code: "TO_CONTACT", name: "待联系", color: "#7C3AED" },
  { code: "CONTACTED", name: "已联系", color: "#0891B2" },
  { code: "REQUIREMENT_CONFIRMED", name: "需求已确认", color: "#0D9488" },
  { code: "SOLUTION_PREPARATION", name: "方案准备中", color: "#4F46E5" },
  { code: "QUOTATION_SENT", name: "已发送报价", color: "#D97706" },
  { code: "NEGOTIATION", name: "商务谈判", color: "#EA580C" },
  { code: "AWAITING_DECISION", name: "等待客户决策", color: "#CA8A04" },
  { code: "ORDER_CONFIRMED", name: "订单已确认", color: "#65A30D" },
  { code: "WON", name: "已成交", color: "#16A34A", isTerminal: true },
  { code: "LOST", name: "已流失", color: "#DC2626", isTerminal: true, requiresReason: true },
  { code: "ON_HOLD", name: "暂缓跟进", color: "#64748B" },
];

export async function seedCrmStages(database: PrismaClient): Promise<void> {
  await database.$transaction(defaultStages.map(({ code, name, color, isTerminal, requiresReason }, index) => {
    const settings = {
      name,
      position: index + 1,
      color,
      isActive: true,
      isTerminal: isTerminal ?? false,
      requiresReason: requiresReason ?? false,
    };

    return database.crmStage.upsert({
      where: { code },
      update: settings,
      create: { id: `crm_stage_${code.toLowerCase()}`, code, ...settings },
    });
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  seedCrmStages(database).finally(() => database.$disconnect());
}
