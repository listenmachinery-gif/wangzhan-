"use client";
import type { LeadStatus } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { formatAdminEnum, formatCountryName } from "@/lib/admin/localization";
import type { InquiryAssignee } from "@/components/admin/crm/inquiry-options";

export type InquiryDetailValue = {
  id: string;
  version: number;
  inquiryNumber: string | null;
  name: string | null;
  email: string;
  company: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  message: string;
  product: string | null;
  material: string | null;
  thickness: string | null;
  workingLength: string | null;
  quantity: string | null;
  voltage: string | null;
  budget: string | null;
  status: LeadStatus;
  spamRecoveryStatus: LeadStatus;
  stageCode: string;
  stageName: string;
  ownerId: string;
  ownerName: string;
  nextFollowUpAt: string | null;
  activities: Array<{
    id: string;
    type: string;
    content: string;
    createdAt: string;
    actorName: string;
  }>;
};
type Stage = { code: string; name: string; requiresReason: boolean };
const control =
  "admin-focus min-h-11 w-full min-w-0 rounded-admin-sm border border-admin-border bg-white px-3 text-sm";
const button =
  "admin-focus inline-flex min-h-11 items-center justify-center rounded-admin-sm border border-admin-border px-4 text-sm font-semibold disabled:opacity-50";

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function InquiryDetail({
  inquiry,
  stages,
  assignees,
  canEditStage,
  canUpdateFollowUp,
  canMarkSpam,
  canRestoreSpam,
  canAssign,
  canAddNote,
}: {
  inquiry: InquiryDetailValue;
  stages: Stage[];
  assignees: InquiryAssignee[];
  canEditStage: boolean;
  canUpdateFollowUp: boolean;
  canMarkSpam: boolean;
  canRestoreSpam: boolean;
  canAssign: boolean;
  canAddNote: boolean;
}) {
  const router = useRouter();
  const [stageCode, setStageCode] = useState(inquiry.stageCode);
  const [followUp, setFollowUp] = useState(() => localDateTime(inquiry.nextFollowUpAt));
  const [ownerId, setOwnerId] = useState(inquiry.ownerId);
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const disabled = busy || conflict || saved;
  const requiresReason =
    stages.find((stage) => stage.code === stageCode)?.requiresReason ||
    stageCode === "LOST";
  async function mutate(body: object, note = false) {
    if (disabled) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        note
          ? `/api/admin/leads/${inquiry.id}/activities`
          : `/api/admin/inquiries/${inquiry.id}`,
        {
          method: note ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (response.status === 409) {
        setConflict(true);
        setError("记录已更新，发生版本冲突。请重新加载后再保存。");
        return;
      }
      if (!response.ok) {
        setError(
          response.status === 403
            ? "无权执行此操作，请重新加载核对权限。"
            : "保存失败，请检查输入后重试。",
        );
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("网络异常，无法确认保存结果。请重新加载核对后重试。");
    } finally {
      setBusy(false);
    }
  }
  const details = [
    ["客户姓名", inquiry.name],
    ["公司", inquiry.company],
    ["国家或地区", formatCountryName(inquiry.country, "—")],
    ["电子邮箱", inquiry.email],
    ["电话", inquiry.phone],
    ["WhatsApp", inquiry.whatsapp],
  ];
  const requirements = [
    ["产品快照", inquiry.product],
    ["材料", inquiry.material],
    ["厚度", inquiry.thickness],
    ["工作长度", inquiry.workingLength],
    ["数量", inquiry.quantity],
    ["电压", inquiry.voltage],
    ["预算", inquiry.budget],
  ];
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(260px,0.9fr)] [&>*]:min-w-0">
      {inquiry.status === "SPAM" ? (
        <div role="status" className="rounded-admin border border-red-300 bg-red-50 p-4 text-red-900 xl:col-span-3">
          <p className="font-semibold">垃圾询盘（已隔离）</p>
          <p className="mt-1 text-sm">此询盘已移出销售流程。恢复后可继续修改销售阶段。</p>
        </div>
      ) : null}
      <div className="space-y-5">
        <AdminCard title="客户与公司">
          <dl className="space-y-4 text-sm">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-admin-muted">{label}</dt>
                <dd className="mt-1 break-words font-medium">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
        <AdminCard title="需求信息">
          <dl className="space-y-4 text-sm">
            {requirements.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-admin-muted">{label}</dt>
                <dd className="mt-1 break-words">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      </div>
      <div className="space-y-5">
        <AdminCard title="原始询盘">
          <p className="whitespace-pre-wrap break-words text-sm leading-7">
            {inquiry.message}
          </p>
        </AdminCard>
        <AdminCard title="活动时间线" description="当前授权范围内的询盘记录。">
          {inquiry.activities.length ? (
            <ol className="space-y-5">
              {inquiry.activities.map((activity) => (
                <li
                  key={activity.id}
                  className="border-l-2 border-admin-border pl-4"
                >
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-admin-muted">
                    <span>
                      {activity.type === "NOTE" ? "基础备注" : formatAdminEnum(activity.type)} ·{" "}
                      {activity.actorName}
                    </span>
                    <time dateTime={activity.createdAt}>
                      {new Date(activity.createdAt).toLocaleString("zh-CN", {
                        timeZone: "Asia/Shanghai",
                      })}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                    {activity.content}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-admin-muted">暂无活动记录</p>
          )}
        </AdminCard>
        {canAddNote ? (
          <AdminCard
            title="基础备注"
            description="记录简短沟通信息；提交后不可修改。"
          >
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void mutate(
                  {
                    type: "NOTE",
                    content: new FormData(event.currentTarget).get("content"),
                  },
                  true,
                );
              }}
            >
              <label className="block space-y-2 text-sm font-medium">
                <span>备注内容</span>
                <textarea
                  name="content"
                  required
                  maxLength={5000}
                  rows={4}
                  disabled={disabled}
                  className={`${control} py-3`}
                />
              </label>
              <button
                disabled={disabled}
                className={`${button} bg-admin-ink text-white`}
              >
                添加基础备注
              </button>
            </form>
          </AdminCard>
        ) : null}
      </div>
      <aside className="space-y-5">
        <AdminCard title="销售流程">
          <div className="space-y-5">
            {canEditStage && inquiry.status !== "SPAM" ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void mutate({
                    version: inquiry.version,
                    stageCode,
                    ...(requiresReason
                      ? {
                          reasonCode: new FormData(event.currentTarget).get(
                            "reasonCode",
                          ),
                        }
                      : {}),
                  });
                }}
              >
                <label className="block space-y-2 text-sm font-medium">
                  <span>销售阶段</span>
                  <select
                    className={control}
                    value={stageCode}
                    disabled={disabled}
                    onChange={(event) => setStageCode(event.target.value)}
                  >
                    {!stages.some(
                      (stage) => stage.code === inquiry.stageCode,
                    ) ? (
                      <option value={inquiry.stageCode}>
                        {inquiry.stageName}
                      </option>
                    ) : null}
                    {stages.map((stage) => (
                      <option key={stage.code} value={stage.code}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>
                {requiresReason ? (
                  <label className="block space-y-2 text-sm font-medium">
                    <span>阶段原因</span>
                    <input
                      name="reasonCode"
                      required
                      maxLength={200}
                      className={control}
                      disabled={disabled}
                    />
                  </label>
                ) : null}
                <button className={button} disabled={disabled}>
                  保存阶段
                </button>
              </form>
            ) : (
              <div>
                <p className="text-xs text-admin-muted">销售阶段</p>
                <p className="mt-1 text-sm">{inquiry.stageName}</p>
              </div>
            )}
            {canAssign ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void mutate({
                    version: inquiry.version,
                    action: "assign",
                    assigneeId: ownerId,
                  });
                }}
              >
                <label className="block space-y-2 text-sm font-medium">
                  <span>负责人</span>
                  <select
                    required
                    className={control}
                    value={ownerId}
                    onChange={(event) => setOwnerId(event.target.value)}
                    disabled={disabled}
                  >
                    <option value="" disabled>
                      选择负责人
                    </option>
                    {inquiry.ownerId &&
                    !assignees.some(({ id }) => id === inquiry.ownerId) ? (
                      <option value={inquiry.ownerId}>
                        {inquiry.ownerName}
                      </option>
                    ) : null}
                    {assignees.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className={button}
                  disabled={disabled || !ownerId || ownerId === inquiry.ownerId}
                >
                  保存负责人
                </button>
              </form>
            ) : (
              <div>
                <p className="text-xs text-admin-muted">负责人</p>
                <p className="mt-1 text-sm">{inquiry.ownerName}</p>
              </div>
            )}
            {canUpdateFollowUp ? (
              <form className="space-y-3" onSubmit={(event) => {
                event.preventDefault();
                const date = new Date(followUp);
                if (!followUp || !Number.isFinite(date.getTime())) {
                  setError("请填写有效的下次跟进时间。");
                  return;
                }
                void mutate({ version: inquiry.version, nextFollowUpAt: date.toISOString() });
              }}>
                <label className="block space-y-2 text-sm font-medium">
                  <span>下次跟进时间（本地时间）</span>
                  <input type="datetime-local" required value={followUp} className={control}
                    disabled={disabled} onChange={(event) => setFollowUp(event.target.value)} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className={button} disabled={disabled || !followUp}>保存跟进时间</button>
                  <button type="button" className={button} disabled={disabled || !inquiry.nextFollowUpAt}
                    onClick={() => void mutate({ version: inquiry.version, nextFollowUpAt: null })}>清除跟进时间</button>
                </div>
              </form>
            ) : inquiry.nextFollowUpAt ? (
              <div>
                <p className="text-xs text-admin-muted">下次跟进</p>
                <time className="text-sm" dateTime={inquiry.nextFollowUpAt}>
                  {new Date(inquiry.nextFollowUpAt).toLocaleString("zh-CN", {
                    timeZone: "Asia/Shanghai",
                  })}
                </time>
              </div>
            ) : <p className="text-sm text-admin-muted">下次跟进：未安排</p>}
            {!canUpdateFollowUp && !canEditStage && !canAssign && !canAddNote ? (
              <p className="text-sm text-admin-muted">
                只读：当前权限无法修改此询盘。
              </p>
            ) : null}
          </div>
        </AdminCard>
        <AdminCard title="快捷操作">
          {canMarkSpam && inquiry.status !== "SPAM" ? (
            <button type="button" className={`${button} mb-3 w-full text-red-800`} disabled={disabled}
              onClick={() => void mutate({ version: inquiry.version, status: "SPAM" })}>标记垃圾询盘</button>
          ) : null}
          {canRestoreSpam && inquiry.status === "SPAM" ? (
            <button type="button" className={`${button} mb-3 w-full`} disabled={disabled}
              onClick={() => void mutate({ version: inquiry.version, status: inquiry.spamRecoveryStatus })}>恢复询盘</button>
          ) : null}
          <a href={`mailto:${inquiry.email}`} className={`${button} w-full`}>
            发送邮件
          </a>
        </AdminCard>
        {error ? (
          <div
            role="alert"
            tabIndex={-1}
            ref={(node) => node?.focus()}
            className="admin-focus rounded-admin border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className={`${button} mt-3`}
            >
              重新加载
            </button>
          </div>
        ) : null}
        {saved ? (
          <p role="status" className="text-sm text-admin-muted">
            已保存，正在刷新记录。
          </p>
        ) : null}
      </aside>
    </div>
  );
}
