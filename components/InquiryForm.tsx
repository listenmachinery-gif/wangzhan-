"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import type { ProductCategory } from "@/data/products";

type InquiryFormProps = {
  productCategories: ProductCategory[];
};

type SubmitState = "idle" | "sending" | "success" | "error";

export function InquiryForm({ productCategories }: InquiryFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

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
      form.reset();
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Inquiry could not be sent.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md bg-white p-7 shadow-sm lg:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Inquiry Form</p>
      <h2 className="mt-3 text-3xl font-semibold text-neutral-950">Tell us what you need.</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          Name
          <input
            name="name"
            required
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          Email
          <input
            name="email"
            type="email"
            required
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
            placeholder="name@company.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          WhatsApp / Phone
          <input
            name="whatsapp"
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
            placeholder="+86 156 5553 7083"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-700">
          Product Interest
          <select
            name="productInterest"
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
          >
            {productCategories.map((category) => (
              <option key={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-700 md:col-span-2">
          Destination Country
          <input
            name="destinationCountry"
            className="h-11 rounded-sm border border-neutral-200 px-3 font-normal outline-none transition focus:border-ignition"
            placeholder="Country / region"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-700 md:col-span-2">
          Production Requirement
          <textarea
            name="requirement"
            required
            className="min-h-32 rounded-sm border border-neutral-200 px-3 py-3 font-normal outline-none transition focus:border-ignition"
            placeholder="Material, thickness, working length, daily output, voltage, and any optional configuration."
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitState === "sending"}
        className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon disabled:cursor-not-allowed disabled:opacity-65"
      >
        {submitState === "sending" ? "Sending..." : "Send Inquiry"}
        <Send size={16} />
      </button>
      {message ? (
        <p className={`mt-4 text-sm leading-6 ${submitState === "success" ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
