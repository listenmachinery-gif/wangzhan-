"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

type ProductOption = {
  value: string;
  label: string;
};

type CompanyInquiryFormProps = {
  productOptions: ProductOption[];
};

type SubmitState = "idle" | "sending" | "success" | "error";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildMailto(formData: FormData) {
  const fields = [
    ["Name", getText(formData, "name")],
    ["Company", getText(formData, "company") || "-"],
    ["Email", getText(formData, "email")],
    ["WhatsApp / Phone", getText(formData, "whatsapp") || "-"],
    ["Country / Region", getText(formData, "country") || "-"],
    ["Product Interest", getText(formData, "productInterest") || "-"],
    ["Material", getText(formData, "material") || "-"],
    ["Thickness Range", getText(formData, "thicknessRange") || "-"],
    ["Working Length", getText(formData, "workingLength") || "-"],
    ["Target Output", getText(formData, "targetOutput") || "-"],
    ["Message", getText(formData, "requirement")],
  ];
  const name = getText(formData, "name") || "website visitor";
  const subject = `New ZYRON engineering inquiry from ${name}`;
  const body = fields.map(([label, value]) => `${label}: ${value}`).join("\n");

  return `mailto:info@zyroncnc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const inputClass =
  "min-h-12 w-full rounded-[2px] border border-white/15 bg-[#0B0D10] px-3 py-3 text-base font-normal text-white outline-none transition placeholder:text-zinc-600 focus:border-[#76B900] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76B900]";

export function CompanyInquiryForm({
  productOptions,
}: CompanyInquiryFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const fallbackMailto = buildMailto(formData);

    setSubmitState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Inquiry could not be sent.");
      }

      setSubmitState("success");
      setMessage(result.message || "Inquiry sent successfully. Our team will reply soon.");
      form.reset();
    } catch {
      setSubmitState("error");
      setMessage(
        "Direct delivery is currently unavailable. Your email app has been opened with the inquiry details; you can also email info@zyroncnc.com.",
      );
      window.location.href = fallbackMailto;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate={false}
      className="border border-white/10 bg-[#111417] p-5 sm:p-7 lg:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required>
          <input
            name="name"
            autoComplete="name"
            required
            className={inputClass}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Company">
          <input
            name="company"
            autoComplete="organization"
            className={inputClass}
            placeholder="Company name"
          />
        </Field>
        <Field label="Email" required>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="name@company.com"
          />
        </Field>
        <Field label="WhatsApp / Phone">
          <input
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+86 156 5553 7083"
          />
        </Field>
        <Field label="Country / Region">
          <input
            name="country"
            autoComplete="country-name"
            className={inputClass}
            placeholder="Country or region"
          />
        </Field>
        <Field label="Product Interest">
          <select name="productInterest" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a product series
            </option>
            {productOptions.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Material">
          <input
            name="material"
            className={inputClass}
            placeholder="e.g. carbon steel"
          />
        </Field>
        <Field label="Thickness Range">
          <input
            name="thicknessRange"
            className={inputClass}
            placeholder="e.g. 1–6 mm"
          />
        </Field>
        <Field label="Working Length">
          <input
            name="workingLength"
            className={inputClass}
            placeholder="e.g. 3200 mm"
          />
        </Field>
        <Field label="Target Output">
          <input
            name="targetOutput"
            className={inputClass}
            placeholder="Daily or hourly output"
          />
        </Field>
        <Field label="Message" required className="sm:col-span-2">
          <textarea
            name="requirement"
            required
            className={`${inputClass} min-h-36 resize-y`}
            placeholder="Required process, part shape, accuracy, voltage, destination, layout, and other project details."
          />
        </Field>
      </div>

      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="mt-5 text-xs leading-6 text-zinc-500">
        Required fields are marked with an asterisk. Your project information is
        used only to evaluate and respond to this inquiry.
      </p>
      <button
        type="submit"
        disabled={submitState === "sending"}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10] transition hover:bg-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitState === "sending" ? "Sending..." : "Send Engineering Inquiry"}
        <Send size={17} aria-hidden="true" />
      </button>
      <p
        aria-live="polite"
        className={`mt-4 min-h-6 text-sm leading-6 ${
          submitState === "success" ? "text-[#8DDB00]" : "text-amber-300"
        }`}
      >
        {message}
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-zinc-200 ${className}`}>
      <span>
        {label}
        {required ? <span className="ml-1 text-[#8DDB00]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
