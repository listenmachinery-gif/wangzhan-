"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import {
  SMALL_ELECTRIC_SHEAR_BACKGAUGES,
  SMALL_ELECTRIC_SHEAR_MATERIALS,
  recommendSmallElectricShear,
} from "@/data/small-electric-shear-selector";

type SubmitState = "idle" | "sending" | "success" | "error";

function buildFallbackMailto(fields: {
  material: string;
  thickness: string;
  width: string;
  recommendedModel: string;
  backgauge: string;
  email: string;
  whatsapp: string;
  destinationCountry: string;
}) {
  const subject = `Small Electric Shear Selection — ${fields.recommendedModel}`;
  const body = [
    `Cutting Material: ${fields.material}`,
    `Cutting Thickness: ${fields.thickness} mm`,
    `Cutting Width: ${fields.width} mm`,
    `Recommended Model: ${fields.recommendedModel}`,
    `Backgauge Type: ${fields.backgauge}`,
    `Email: ${fields.email}`,
    `WhatsApp / Phone: ${fields.whatsapp || "-"}`,
    `Destination Country: ${fields.destinationCountry || "-"}`,
  ].join("\n");

  return `mailto:info@zyroncnc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SmallElectricShearSelector() {
  const [material, setMaterial] = useState<string>(SMALL_ELECTRIC_SHEAR_MATERIALS[0]);
  const [thicknessInput, setThicknessInput] = useState("");
  const [widthInput, setWidthInput] = useState("");
  const [backgauge, setBackgauge] = useState<string>(SMALL_ELECTRIC_SHEAR_BACKGAUGES[0]);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const thickness = Number(thicknessInput);
  const width = Number(widthInput);
  const hasValidDimensions =
    thicknessInput !== "" && widthInput !== "" && thickness > 0 && width > 0;
  const recommendation = recommendSmallElectricShear(material, thickness, width);
  const recommendedModel = recommendation?.model ?? "Custom selection required";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("sending");
    setSubmitMessage("");

    const fields = {
      material,
      thickness: thicknessInput,
      width: widthInput,
      recommendedModel,
      backgauge,
      email,
      whatsapp,
      destinationCountry,
    };
    const fallbackMailto = buildFallbackMailto(fields);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "small-electric-shear-selector",
          material,
          cuttingThickness: thicknessInput,
          cuttingWidth: widthInput,
          recommendedModel,
          backgauge,
          email,
          whatsapp,
          destinationCountry,
          website: "",
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Inquiry could not be sent.");
      }

      setSubmitState("success");
      setSubmitMessage(result.message || "Inquiry sent successfully. Our team will reply soon.");
      setEmail("");
      setWhatsapp("");
      setDestinationCountry("");
    } catch {
      setSubmitState("error");
      setSubmitMessage(
        "Direct delivery is temporarily unavailable. Your email app has been opened with all selection details.",
      );
      window.location.href = fallbackMailto;
    }
  }

  const fieldClass =
    "h-12 w-full border border-neutral-300 bg-white px-4 text-base font-normal text-neutral-950 outline-none transition focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/20";
  const labelClass = "grid gap-2 text-sm font-semibold text-neutral-800";

  return (
    <section
      id="small-electric-shear-selector"
      data-small-electric-selector
      className="mt-10 scroll-mt-24 border border-neutral-200 bg-[#f3f5f6] p-6 sm:p-8 lg:p-10"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">Model Selector</p>
        <h3 className="mt-3 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Find the right small electric shear.
        </h3>
        <p className="mt-3 text-base leading-7 text-neutral-600">
          Enter your sheet specification to receive an instant model recommendation and send it to our sales team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-3xl gap-5">
        <label className={labelClass}>
          Cutting Material
          <select
            name="material"
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className={fieldClass}
          >
            {SMALL_ELECTRIC_SHEAR_MATERIALS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Cutting Thickness
          <span className="relative">
            <input
              name="cuttingThickness"
              type="number"
              min="0.1"
              step="0.1"
              inputMode="decimal"
              required
              value={thicknessInput}
              onChange={(event) => setThicknessInput(event.target.value)}
              className={`${fieldClass} pr-14`}
              placeholder="e.g. 1.5"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-neutral-500">mm</span>
          </span>
        </label>

        <label className={labelClass}>
          Cutting Width
          <span className="relative">
            <input
              name="cuttingWidth"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              required
              value={widthInput}
              onChange={(event) => setWidthInput(event.target.value)}
              className={`${fieldClass} pr-14`}
              placeholder="e.g. 1300"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-neutral-500">mm</span>
          </span>
        </label>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Recommended Model</p>
          <div
            aria-live="polite"
            className={`mt-2 border px-5 py-4 ${
              recommendation
                ? "border-[#76B900] bg-[#76B900]/10"
                : "border-neutral-300 bg-white"
            }`}
          >
            <p className="text-xl font-semibold text-neutral-950">
              {hasValidDimensions ? recommendedModel : "Enter thickness and width to calculate."}
            </p>
            {recommendation ? (
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Capacity for {material}: up to {recommendation.maxThickness} mm thick and {recommendation.maxWidth} mm wide.
              </p>
            ) : hasValidDimensions ? (
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Send the inquiry and our team will recommend a suitable custom configuration.
              </p>
            ) : null}
          </div>
        </div>

        <label className={labelClass}>
          Backgauge Type
          <select
            name="backgauge"
            value={backgauge}
            onChange={(event) => setBackgauge(event.target.value)}
            className={fieldClass}
          >
            {SMALL_ELECTRIC_SHEAR_BACKGAUGES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            placeholder="name@company.com"
          />
        </label>

        <label className={labelClass}>
          WhatsApp / Phone
          <input
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            className={fieldClass}
            placeholder="+86 156 5553 7083"
          />
        </label>

        <label className={labelClass}>
          Destination Country
          <input
            name="destinationCountry"
            autoComplete="country-name"
            value={destinationCountry}
            onChange={(event) => setDestinationCountry(event.target.value)}
            className={fieldClass}
            placeholder="Country / region"
          />
        </label>

        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div>
          <button
            type="submit"
            disabled={submitState === "sending" || !hasValidDimensions}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#76B900] hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            {submitState === "sending" ? "Sending..." : "Send Inquiry"}
            <Send size={17} aria-hidden="true" />
          </button>
          {submitMessage ? (
            <p
              role="status"
              className={`mt-4 text-sm leading-6 ${submitState === "success" ? "text-green-700" : "text-red-700"}`}
            >
              {submitMessage}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
