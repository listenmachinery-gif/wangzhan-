"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ComponentPropsWithoutRef, type FormEvent, type ReactNode } from "react";

import { inquiryCustomerLevels, inquirySourceLabels, type InquiryAssignee } from "@/components/admin/crm/inquiry-options";
import type { CustomerDuplicateCandidates } from "@/lib/services/customer-service";

const control = "admin-focus block min-h-11 w-full min-w-0 rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink";
const checkbox = "size-4 shrink-0 rounded border-admin-border accent-admin-ink admin-focus";
const submitFailure = "无法确认创建结果，请先返回询盘列表核对，再重试。";

type Feedback =
  | { kind: "error"; message: string }
  | { kind: "duplicates"; candidates: CustomerDuplicateCandidates };

type InquiryResponse = {
  code?: string;
  inquiry?: { id?: string };
  duplicateCandidates?: CustomerDuplicateCandidates;
};

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-sm font-medium text-admin-ink">
        {label}{required ? <span aria-hidden="true" className="ml-1 text-red-700">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function TextField({ label, required, ...input }: ComponentPropsWithoutRef<"input"> & { label: string }) {
  return (
    <Field label={label} required={required}>
      <input {...input} required={required} className={control} />
    </Field>
  );
}

function FormSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-admin border border-admin-border bg-white px-4 pb-5 sm:px-5">
      <legend className="px-1 text-sm font-semibold text-admin-ink">{label}</legend>
      <div className="mt-2 grid min-w-0 gap-x-4 gap-y-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function focusNotice(element: HTMLDivElement | null) {
  element?.focus();
}

function DuplicateWarning({ candidates }: { candidates: CustomerDuplicateCandidates }) {
  return (
    <div role="alert" tabIndex={-1} ref={focusNotice} className="admin-focus rounded-admin border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">发现可能重复的客户记录</p>
      <p className="mt-1">请核对候选记录。可修改表单中的新建选项，或确认创建独立记录后再次提交。</p>
      {candidates.contacts.length > 0 ? (
        <div className="mt-3">
          <p className="font-medium">联系人</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 [overflow-wrap:anywhere]">
            {candidates.contacts.map(({ id, fullName, customerCode }) => <li key={id}>{fullName} · {customerCode}</li>)}
          </ul>
        </div>
      ) : null}
      {candidates.companies.length > 0 ? (
        <div className="mt-3">
          <p className="font-medium">公司</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 [overflow-wrap:anywhere]">
            {candidates.companies.map(({ id, name, companyCode }) => <li key={id}>{name} · {companyCode}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function responseError(status: number, code?: string) {
  if (status === 400) return "请检查输入格式、跟进时间及所选负责人后重试。";
  if (status === 401) return "登录已过期，请重新登录后重试。";
  if (status === 403) return code === "UNTRUSTED_ORIGIN" ? "页面验证失败，请重新打开新增询盘页面。" : "当前账号无权创建此询盘或分配给所选负责人。";
  if (status === 409) return "创建发生冲突，请核对询盘列表中的最新记录后重试。";
  return submitFailure;
}

export function ManualInquiryForm({ assignees, assigneeRequired }: {
  assignees: InquiryAssignee[];
  assigneeRequired: boolean;
}) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const noAssignableSales = assigneeRequired && assignees.length === 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || noAssignableSales || (feedback?.kind === "duplicates" && !confirmed)) return;

    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim() || undefined;
    const name = field("name");
    const email = field("email");
    const phone = field("phone");
    const whatsapp = field("whatsapp");
    const companyName = field("companyName");
    const message = field("message");
    const followUp = field("nextFollowUpAt");
    const nextFollowUpAt = followUp ? new Date(followUp) : undefined;
    const createCompany = form.has("createCompany");

    if (!name || !email || !message) {
      setFeedback({ kind: "error", message: "请填写客户姓名、电子邮箱和需求描述。" });
      return;
    }
    if (createCompany && !companyName) {
      setFeedback({ kind: "error", message: "同时新建公司时，请填写公司名称。" });
      return;
    }
    if (nextFollowUpAt && !Number.isFinite(nextFollowUpAt.getTime())) {
      setFeedback({ kind: "error", message: "请填写有效的下次跟进时间。" });
      return;
    }

    const input = {
      name, email, phone, whatsapp, companyName, message,
      country: field("country"),
      sourceChannel: field("sourceChannel"),
      customerLevel: field("customerLevel"),
      assigneeId: field("assigneeId"),
      nextFollowUpAt: nextFollowUpAt?.toISOString(),
      contact: form.has("createContact") ? { fullName: name, email, phone, whatsapp } : undefined,
      company: createCompany ? { name: companyName } : undefined,
      confirmDuplicateCreation: feedback?.kind === "duplicates" && confirmed,
    };
    requestInFlight.current = true;
    setSubmitting(true);
    setFeedback(null);
    setConfirmed(false);
    let navigating = false;

    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body: InquiryResponse | null = await response.json().catch(() => null);
      if (response.status === 201 && typeof body?.inquiry?.id === "string" && body.inquiry.id) {
        router.push(`/admin/leads/${encodeURIComponent(body.inquiry.id)}`);
        navigating = true;
      } else if (response.status === 409 && body?.code === "DUPLICATE_CONFIRMATION_REQUIRED" && body.duplicateCandidates) {
        setFeedback({ kind: "duplicates", candidates: body.duplicateCandidates });
      } else {
        setFeedback({ kind: "error", message: responseError(response.status, body?.code) });
      }
    } catch {
      setFeedback({ kind: "error", message: submitFailure });
    } finally {
      if (!navigating) {
        requestInFlight.current = false;
        setSubmitting(false);
      }
    }
  }

  return (
    <form action="/api/admin/inquiries" method="post" onSubmit={submit} aria-busy={submitting} className="space-y-4">
      <p className="text-sm text-admin-muted">标有 <span className="text-red-700">*</span> 的字段为必填项。</p>
      <fieldset disabled={submitting} className="min-w-0 space-y-4" onChange={() => {
        if (feedback) setFeedback(null);
        if (confirmed) setConfirmed(false);
      }}>
        <FormSection label="客户信息">
          <TextField label="客户姓名" name="name" autoComplete="name" maxLength={160} required />
          <TextField label="电子邮箱" name="email" type="email" autoComplete="email" maxLength={254} required />
          <TextField label="电话" name="phone" type="tel" autoComplete="tel" maxLength={40} />
          <TextField label="WhatsApp" name="whatsapp" type="tel" maxLength={40} />
          <TextField label="国家或地区" name="country" autoComplete="country-name" maxLength={100} />
          <label className="inline-flex min-h-11 items-center gap-2 self-end text-sm text-admin-ink">
            <input name="createContact" type="checkbox" className={checkbox} />同时新建联系人
          </label>
        </FormSection>
        <FormSection label="公司信息">
          <TextField label="公司名称" name="companyName" autoComplete="organization" maxLength={200} />
          <label className="inline-flex min-h-11 items-center gap-2 self-end text-sm text-admin-ink">
            <input name="createCompany" type="checkbox" className={checkbox} />同时新建公司
          </label>
        </FormSection>
        <FormSection label="需求信息">
          <div className="sm:col-span-2">
            <Field label="需求描述" required>
              <textarea name="message" rows={5} maxLength={10_000} required className={`${control} resize-y py-2.5`} />
            </Field>
          </div>
          <Field label="来源渠道">
            <select name="sourceChannel" defaultValue="OTHER" className={control}>
              {Object.entries(inquirySourceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
        </FormSection>
        <FormSection label="归属与跟进">
          <Field label="负责人" required={assigneeRequired}>
            <select name="assigneeId" required={assigneeRequired} aria-describedby={noAssignableSales ? "inquiry-assignee-notice" : undefined}
              className={control} defaultValue="">
              <option value="">{assigneeRequired ? "选择负责人" : "暂不分配"}</option>
              {assignees.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          </Field>
          <Field label="客户等级">
            <select name="customerLevel" defaultValue="" className={control}>
              <option value="">未定级</option>
              {inquiryCustomerLevels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </Field>
          <div className="min-w-0">
            <TextField label="下次跟进时间" name="nextFollowUpAt" type="datetime-local" aria-describedby="inquiry-follow-up-time" />
            <p id="inquiry-follow-up-time" className="mt-1.5 text-xs text-admin-muted">使用当前设备的本地时间。</p>
          </div>
          {noAssignableSales ? <p id="inquiry-assignee-notice" className="self-center text-sm text-amber-800">当前范围内暂无可分配的销售人员。</p> : null}
        </FormSection>
      </fieldset>
      {feedback?.kind === "duplicates" ? (
        <div className="space-y-1">
          <DuplicateWarning candidates={feedback.candidates} />
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-admin-ink">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className={checkbox} />
            确认继续创建独立记录
          </label>
        </div>
      ) : null}
      {feedback?.kind === "error" ? (
        <div role="alert" tabIndex={-1} ref={focusNotice} className="admin-focus rounded-admin-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {feedback.message}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-admin-border pt-4">
        <Link href="/admin/inquiries" className="admin-focus inline-flex min-h-11 items-center rounded-admin-sm border border-admin-border bg-white px-4 text-sm font-semibold text-admin-ink hover:bg-neutral-50">返回询盘列表</Link>
        <button type="submit" disabled={submitting || noAssignableSales || (feedback?.kind === "duplicates" && !confirmed)}
          className="admin-focus min-h-11 rounded-admin-sm bg-admin-ink px-4 text-sm font-semibold text-white hover:bg-graphite-700 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? "正在创建…" : "创建询盘"}
        </button>
      </div>
    </form>
  );
}
