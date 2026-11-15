import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { requirePermission } from "@/lib/auth/guards";
import { SettingsService } from "@/lib/services/settings-service";
export const dynamic = "force-dynamic";
export default async function SettingsPage() { const principal = await requirePermission("settings.write"); const settings = await new SettingsService().list(principal); return <div className="space-y-6"><div><p className="text-sm font-semibold text-[#5F9500]">站点配置</p><h1 className="mt-2 text-3xl font-semibold">系统设置</h1><p className="mt-2 text-sm text-neutral-600">这里只保存非敏感配置。数据库、Session、存储和 SMTP 密钥必须保存在平台环境变量中。</p></div><SettingsForm initialSettings={settings} /></div>; }
