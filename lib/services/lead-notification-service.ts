import "server-only";

import type { Lead } from "@prisma/client";
import nodemailer from "nodemailer";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function smtpConfiguration() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user, pass },
  };
}

export class LeadNotificationService {
  async send(lead: Lead) {
    const configuration = smtpConfiguration();
    if (!configuration) throw new Error("SMTP_NOT_CONFIGURED");

    const rows = [
      ["Reference", lead.id],
      ["Name", lead.name ?? "-"],
      ["Company", lead.company ?? "-"],
      ["Email", lead.email],
      ["WhatsApp / Phone", lead.whatsapp ?? lead.phone ?? "-"],
      ["Destination Country", lead.country ?? "-"],
      ["Material", lead.material ?? "-"],
      ["Thickness", lead.thickness ?? "-"],
      ["Working Length", lead.workingLength ?? "-"],
      ["Target Output", lead.quantity ?? "-"],
      ["Requirement", lead.message],
    ];
    const transporter = nodemailer.createTransport(configuration);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || configuration.auth.user,
      to: process.env.INQUIRY_TO_EMAIL || "info@zyroncnc.com",
      replyTo: lead.email,
      subject: `New ZYRON inquiry — ${lead.name ?? lead.email}`,
      text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
      html: `<div style="font-family:Arial,sans-serif;color:#111827"><h2>New ZYRON Website Inquiry</h2><table style="border-collapse:collapse;width:100%;max-width:760px;font-size:14px">${rows.map(([label, value]) => `<tr><th style="text-align:left;padding:10px 12px;border:1px solid #e5e7eb;background:#f8fafc;width:190px">${escapeHtml(label)}</th><td style="padding:10px 12px;border:1px solid #e5e7eb">${escapeHtml(value).replaceAll("\n", "<br />")}</td></tr>`).join("")}</table></div>`,
    });
  }
}
