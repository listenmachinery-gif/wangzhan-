"use client";

import { FormEvent, useState, type Ref } from "react";
import { Send } from "lucide-react";
import { useInquiryTracking } from "@/components/analytics/useInquiryTracking";
import type { ProductCategory } from "@/data/products";

type InquiryFormProps = {
  productCategories: ProductCategory[];
  productOptions?: string[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  privacyText?: string;
  variant?: "default" | "homepage";
  firstInputRef?: Ref<HTMLInputElement>;
  headingLevel?: "h2" | "h3";
  submitLabel?: string;
};

type SubmitState = "idle" | "sending" | "success" | "error";

function getText(value: FormDataEntryValue | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function buildMailto(formData: FormData) {
  const name = getText(formData.get("name") ?? undefined);
  const email = getText(formData.get("email") ?? undefined);
  const whatsapp = getText(formData.get("whatsapp") ?? undefined);
  const productInterest = getText(formData.get("productInterest") ?? undefined);
  const destinationCountry = getText(formData.get("destinationCountry") ?? undefined);
  const requirement = getText(formData.get("requirement") ?? undefined);
  const subject = `New ZYRON inquiry from ${name || "website visitor"}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `WhatsApp / Phone: ${whatsapp || "-"}`,
    `Product Interest: ${productInterest || "-"}`,
    `Destination Country: ${destinationCountry || "-"}`,
    "",
    "Production Requirement:",
    requirement,
  ].join("\n");

  return `mailto:info@zyroncnc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function InquiryForm({
  productCategories,
  productOptions,
  eyebrow = "Inquiry Form",
  heading = "Tell us what you need.",
  description,
  privacyText,
  variant = "default",
  firstInputRef,
  headingLevel = "h2",
  submitLabel = "Send Inquiry",
}: InquiryFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const { trackStart, trackSuccessfulSubmit } = useInquiryTracking("general-inquiry");
  const homepage = variant === "homepage";
  const Heading = headingLevel;
  const options = productOptions ?? productCategories.map((category) => category.name);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const fallbackMailto = buildMailto(formData);
    const honeypot = getText(formData.get("website") ?? undefined);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Inquiry could not be sent.");
      }

      setSubmitState("success");
      setMessage(result.message || "Inquiry sent successfully. Our team will reply soon.");
      trackSuccessfulSubmit(honeypot);
      form.reset();
    } catch {
      setSubmitState("error");
      setMessage(
        "Direct email delivery is being configured. Your email app has been opened with the inquiry details, or you can send them to info@zyroncnc.com.",
      );
      window.location.href = fallbackMailto;
    }
  }

  return (
    <form onSubmit={handleSubmit} onFocusCapture={trackStart} className={`rounded-md bg-white p-7 text-neutral-950 shadow-sm lg:p-9 ${homepage ? "border border-white/10" : ""}`}>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">{eyebrow}</p> : null}
      <Heading className={`${eyebrow ? "mt-3" : ""} text-3xl font-semibold text-neutral-950`}>{heading}</Heading>
      {description ? <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p> : null}
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          {homepage ? "Your Name *" : "Name"}
          <input
            ref={firstInputRef}
            name="name"
            required
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
            placeholder={homepage ? "Enter your name" : "Your name"}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          {homepage ? "Business Email *" : "Email"}
          <input
            name="email"
            type="email"
            required
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
            placeholder="name@company.com"
          />
        </label>
        {!homepage ? (
          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            WhatsApp / Phone
            <input
              name="whatsapp"
              className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
              placeholder="+86 156 5553 7083"
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          {homepage ? "Machine Interest *" : "Product Interest"}
          <select
            name="productInterest"
            required={homepage}
            defaultValue={homepage ? "" : undefined}
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
          >
            {homepage ? <option value="" disabled>Select a machine category</option> : null}
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        {!homepage ? (
          <label className="grid gap-2 text-sm font-semibold text-neutral-700 md:col-span-2">
            Destination Country
            <input
              name="destinationCountry"
              className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
              placeholder="Country / region"
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold text-neutral-700 md:col-span-2">
          {homepage ? "Your Requirements *" : "Production Requirement"}
          <textarea
            name="requirement"
            required
            maxLength={homepage ? 3000 : 10000}
            className="min-h-32 rounded-sm border border-neutral-200 px-3 py-3 font-normal outline-none transition focus:border-ignition"
            placeholder={homepage ? "Tell us about your materials, thickness, working length, production capacity, or other requirements." : "Material, thickness, working length, daily output, voltage, and any optional configuration."}
          />
        </label>
      </div>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button
        type="submit"
        disabled={submitState === "sending"}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon disabled:cursor-not-allowed disabled:opacity-65"
      >
        {submitState === "sending" ? "Sending..." : submitLabel}
        <Send size={16} />
      </button>
      {privacyText ? <p className="mt-4 text-xs leading-5 text-neutral-500">{privacyText}</p> : null}
      {message ? (
        <p className={`mt-4 text-sm leading-6 ${submitState === "success" ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
