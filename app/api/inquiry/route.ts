import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  SMALL_ELECTRIC_SHEAR_BACKGAUGES,
  recommendSmallElectricShear,
} from "@/data/small-electric-shear-selector";

export const runtime = "nodejs";

type InquiryPayload = {
  inquiryType?: unknown;
  name?: unknown;
  company?: unknown;
  email?: unknown;
  whatsapp?: unknown;
  productInterest?: unknown;
  destinationCountry?: unknown;
  country?: unknown;
  material?: unknown;
  thicknessRange?: unknown;
  workingLength?: unknown;
  targetOutput?: unknown;
  requirement?: unknown;
  cuttingThickness?: unknown;
  cuttingWidth?: unknown;
  recommendedModel?: unknown;
  backgauge?: unknown;
  website?: unknown;
};

const recipientEmail = process.env.INQUIRY_TO_EMAIL || "info@zyroncnc.com";

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  };
}

export async function POST(request: Request) {
  let payload: InquiryPayload;

  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ message: "Invalid inquiry data." }, { status: 400 });
  }

  const inquiryType = cleanValue(payload.inquiryType);
  const isSmallElectricSelector = inquiryType === "small-electric-shear-selector";
  const name = cleanValue(payload.name);
  const company = cleanValue(payload.company);
  const email = cleanValue(payload.email);
  const whatsapp = cleanValue(payload.whatsapp);
  const productInterest = cleanValue(payload.productInterest);
  const destinationCountry =
    cleanValue(payload.country) || cleanValue(payload.destinationCountry);
  const material = cleanValue(payload.material);
  const thicknessRange = cleanValue(payload.thicknessRange);
  const workingLength = cleanValue(payload.workingLength);
  const targetOutput = cleanValue(payload.targetOutput);
  const requirement = cleanValue(payload.requirement);
  const cuttingThicknessValue = cleanValue(payload.cuttingThickness);
  const cuttingWidthValue = cleanValue(payload.cuttingWidth);
  const cuttingThickness = Number(cuttingThicknessValue);
  const cuttingWidth = Number(cuttingWidthValue);
  const backgauge = cleanValue(payload.backgauge);
  const website = cleanValue(payload.website);

  if (website) {
    return NextResponse.json(
      { message: "Thank you. Your inquiry has been received." },
      { status: 400 },
    );
  }

  const selectorRecommendation = isSmallElectricSelector
    ? recommendSmallElectricShear(material, cuttingThickness, cuttingWidth)
    : null;
  const recommendedModel = selectorRecommendation?.model || "Custom selection required";
  const validBackgauge = SMALL_ELECTRIC_SHEAR_BACKGAUGES.includes(
    backgauge as (typeof SMALL_ELECTRIC_SHEAR_BACKGAUGES)[number],
  );
  const validSelectorDimensions =
    Number.isFinite(cuttingThickness) &&
    Number.isFinite(cuttingWidth) &&
    cuttingThickness > 0 &&
    cuttingWidth > 0;

  if (
    isSmallElectricSelector &&
    (!email || !material || !validSelectorDimensions || !validBackgauge)
  ) {
    return NextResponse.json(
      { message: "Please provide valid material, thickness, width, backgauge, and email details." },
      { status: 400 },
    );
  }

  if (!isSmallElectricSelector && (!name || !email || !requirement)) {
    return NextResponse.json({ message: "Please provide name, email, and production requirement." }, { status: 400 });
  }

  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    return NextResponse.json(
      { message: "Email service is not configured yet. Please set SMTP environment variables in Vercel." },
      { status: 503 },
    );
  }

  const transporter = nodemailer.createTransport(smtpConfig);
  const subject = isSmallElectricSelector
    ? `New ZYRON Small Electric Shear Selection — ${recommendedModel}`
    : `New ZYRON inquiry from ${name}`;
  const rows = isSmallElectricSelector
    ? [
        ["Inquiry Type", "Small Electric Shear Selection"],
        ["Email", email],
        ["WhatsApp / Phone", whatsapp || "-"],
        ["Destination Country", destinationCountry || "-"],
        ["Cutting Material", material],
        ["Cutting Thickness", `${cuttingThicknessValue} mm`],
        ["Cutting Width", `${cuttingWidthValue} mm`],
        ["Recommended Model", recommendedModel],
        ["Backgauge Type", backgauge],
      ]
    : [
        ["Name", name],
        ["Company", company || "-"],
        ["Email", email],
        ["WhatsApp / Phone", whatsapp || "-"],
        ["Product Interest", productInterest || "-"],
        ["Destination Country", destinationCountry || "-"],
        ["Material", material || "-"],
        ["Thickness Range", thicknessRange || "-"],
        ["Working Length", workingLength || "-"],
        ["Target Output", targetOutput || "-"],
        ["Production Requirement", requirement],
      ];
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th style="text-align:left;padding:10px 12px;border:1px solid #e5e7eb;background:#f8fafc;width:190px;">${escapeHtml(label)}</th>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;">${escapeHtml(value).replaceAll("\n", "<br />")}</td>
        </tr>
      `,
    )
    .join("");

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpConfig.auth.user,
      to: recipientEmail,
      replyTo: email,
      subject,
      text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;color:#111827;">
          <h2 style="margin:0 0 16px;">New ZYRON Website Inquiry</h2>
          <table style="border-collapse:collapse;width:100%;max-width:760px;font-size:14px;">
            ${htmlRows}
          </table>
        </div>
      `,
    });
  } catch {
    return NextResponse.json(
      { message: "Email could not be sent. Please check SMTP settings in Vercel." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "Inquiry sent successfully. Our team will reply soon." });
}
