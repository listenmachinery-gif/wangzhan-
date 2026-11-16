import type { ComponentPropsWithRef } from "react";

export const inquiryFilterControl = "admin-focus h-11 w-full min-w-0 rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink";

export function InquirySelectFilter({ label, placeholder, options, value, ...selectProps }: {
  name: string;
  label: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value?: string;
} & Pick<ComponentPropsWithRef<"select">, "ref" | "onChange" | "aria-describedby">) {
  return (
    <label className="block text-xs font-semibold text-admin-ink">
      <span className="mb-1.5 block">{label}</span>
      <select {...selectProps} defaultValue={value ?? ""} className={inquiryFilterControl}>
        <option value="">{placeholder}</option>
        {value && !options.some((option) => option.value === value) ? <option value={value}>当前筛选项</option> : null}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
