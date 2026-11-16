"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  customerCreateSchema,
  customerUpdateSchema,
} from "@/lib/validation/crm";
import type { CustomerDuplicateCandidates } from "@/lib/services/customer-service";

export type CustomerEditValue = {
  id: string;
  version: number;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  countryCode?: string | null;
  city?: string | null;
  jobTitle?: string | null;
  internalNotes?: string | null;
  company?: { name: string; version: number };
};
const control =
  "admin-focus block min-h-11 w-full min-w-0 rounded-admin-sm border border-admin-border bg-white px-3 text-sm";
const button =
  "admin-focus inline-flex min-h-11 items-center justify-center rounded-admin-sm border border-admin-border px-4 text-sm font-semibold disabled:opacity-50";
export function CustomerForm({ customer }: { customer?: CustomerEditValue }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [duplicates, setDuplicates] =
    useState<CustomerDuplicateCandidates | null>(null);
  const fields = [
    ["fullName", "客户姓名", "text", 200],
    ["email", "电子邮箱", "email", 254],
    ["phone", "电话", "tel", 40],
    ["whatsapp", "WhatsApp", "tel", 40],
    ["countryCode", "国家代码", "text", 2],
    ["city", "城市", "text", 100],
    ["jobTitle", "职位", "text", 200],
  ] as const;
  const disabled = busy || saved || conflict;
  async function submit(confirmDuplicateCreation: boolean) {
    if (disabled || !formRef.current?.reportValidity()) return;
    const data = new FormData(formRef.current);
    const input: Record<string, unknown> = Object.fromEntries(
      fields.map(([name]) => [name, data.get(name)]),
    );
    if (data.has("internalNotes"))
      input.internalNotes = data.get("internalNotes");
    const companyName = String(data.get("companyName") ?? "").trim();
    if (companyName)
      input.company = {
        name: companyName,
        ...(customer?.company ? { version: customer.company.version } : {}),
      };
    if (customer) input.version = customer.version;
    else if (confirmDuplicateCreation) input.confirmDuplicateCreation = true;
    const parsed = (
      customer ? customerUpdateSchema : customerCreateSchema
    ).safeParse(input);
    if (!parsed.success) {
      setError(
        "请检查客户信息：填写姓名，并提供有效的邮箱、电话或 WhatsApp；国家代码请使用两位字母。",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        customer
          ? `/api/admin/customers/${customer.id}`
          : "/api/admin/customers",
        {
          method: customer ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const result = await response.json();
      if (
        !customer &&
        response.status === 409 &&
        result.code === "DUPLICATE_CONFIRMATION_REQUIRED" &&
        Array.isArray(result.duplicateCandidates?.contacts) &&
        Array.isArray(result.duplicateCandidates?.companies)
      ) {
        setDuplicates(result.duplicateCandidates);
        return;
      }
      if (response.status === 409) {
        setConflict(true);
        setError("记录发生版本冲突。请重新加载后再保存。");
        return;
      }
      if (!response.ok) {
        setError(
          response.status === 403
            ? "无权保存此客户，请重新加载核对权限。"
            : "保存失败，请检查输入后重试。",
        );
        return;
      }
      if (
        !customer &&
        (response.status !== 201 ||
          typeof result.customer?.id !== "string" ||
          !result.customer.id)
      ) {
        setError("无法确认创建结果，请返回客户列表核对后重试。");
        return;
      }
      setSaved(true);
      if (customer) router.refresh();
      else
        router.push(
          `/admin/customers/${encodeURIComponent(result.customer.id)}`,
        );
    } catch {
      setError("网络异常，无法确认保存结果。请先核对客户列表后重试。");
    } finally {
      setBusy(false);
    }
  }
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!duplicates) void submit(false);
  }
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={() => {
        setDuplicates(null);
        setError("");
      }}
      className="space-y-5"
    >
      <fieldset
        disabled={disabled}
        className="min-w-0 space-y-4 rounded-admin border border-admin-border bg-white p-5"
      >
        <legend className="px-1 text-sm font-semibold">客户信息</legend>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {fields.map(([name, label, type, maxLength]) => (
            <label
              key={name}
              className="block min-w-0 space-y-2 text-sm font-medium"
            >
              <span>{label}</span>
              <input
                name={name}
                type={type}
                maxLength={maxLength}
                required={name === "fullName"}
                defaultValue={customer?.[name] ?? ""}
                className={control}
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-admin-muted">
          姓名必填；邮箱、电话和 WhatsApp 至少填写一项。国家代码示例：CN、US。
        </p>
        {!customer || customer.company ? (
          <label className="block space-y-2 text-sm font-medium">
            <span>公司名称</span>
            <input
              name="companyName"
              required={Boolean(customer?.company)}
              maxLength={200}
              defaultValue={customer?.company?.name ?? ""}
              className={control}
            />
          </label>
        ) : null}
        {!customer || Object.hasOwn(customer, "internalNotes") ? (
          <label className="block space-y-2 text-sm font-medium">
            <span>内部备注</span>
            <textarea
              name="internalNotes"
              rows={4}
              maxLength={5000}
              defaultValue={customer?.internalNotes ?? ""}
              className={`${control} py-3`}
            />
          </label>
        ) : null}
      </fieldset>
      {duplicates ? (
        <div
          role="alert"
          tabIndex={-1}
          ref={(node) => node?.focus()}
          className="admin-focus rounded-admin border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <p className="font-semibold">发现可能重复的客户记录</p>
          <p className="mt-1">
            请核对以下记录，确认需要创建独立客户后再次提交。
          </p>
          <ul className="mt-3 space-y-2">
            {duplicates.contacts.map((item) => (
              <li key={item.id}>
                {item.fullName} · {item.customerCode}
              </li>
            ))}
            {duplicates.companies.map((item) => (
              <li key={item.id}>
                {item.name} · {item.companyCode}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void submit(true)}
            className={`${button} mt-4`}
          >
            确认创建独立客户
          </button>
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          tabIndex={-1}
          ref={(node) => node?.focus()}
          className="admin-focus rounded-admin border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <p>{error}</p>
          {conflict ? (
            <button
              type="button"
              onClick={() => router.refresh()}
              className={`${button} mt-3`}
            >
              重新加载
            </button>
          ) : null}
        </div>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm">
          已保存，正在打开最新记录。
        </p>
      ) : null}
      <button
        disabled={disabled || Boolean(duplicates)}
        className={`${button} bg-admin-ink text-white`}
      >
        {customer ? "保存客户" : "创建客户"}
      </button>
    </form>
  );
}
