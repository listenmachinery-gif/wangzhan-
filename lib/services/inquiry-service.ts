import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { Prisma, type Lead, type PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";
import { InquiryRateLimiter } from "@/lib/services/inquiry-rate-limit";
import { LeadNotificationService } from "@/lib/services/lead-notification-service";
import { hasInquiryHoneypot, parseInquiryPayload } from "@/lib/validation/inquiries";

const DUPLICATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

type InquiryReceiptBase = {
  accepted: true;
  reference: string;
};

export type InquiryReceipt = InquiryReceiptBase & (
  | { stored: true; leadId: string }
  | { stored: false; leadId: null }
);

export type InquiryNotifier = {
  send(lead: Lead): Promise<void>;
};

export type InquiryRateLimit = {
  consume(networkKey: string, now?: Date): Promise<{ limited: boolean }>;
};

function receipt(leadId: string | null): InquiryReceipt {
  const base: InquiryReceiptBase = {
    accepted: true,
    reference: `inq_${randomBytes(12).toString("hex")}`,
  };
  return leadId ? { ...base, stored: true, leadId } : { ...base, stored: false, leadId: null };
}

function looksSuspicious(message: string) {
  return (message.match(/https?:\/\//gi)?.length ?? 0) >= 4;
}

async function runSerializableWithRetry<T>(
  database: PrismaClient,
  work: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      return await database.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const retryable = (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
        || (error instanceof Error && error.message.includes("TransactionWriteConflict"));
      if (!retryable || attempt === 7) throw error;
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 5));
    }
  }
  throw new Error("Serializable inquiry transaction exhausted retries.");
}

export class InquiryService {
  constructor(
    private readonly database: PrismaClient = db,
    private readonly notifier: InquiryNotifier = new LeadNotificationService(),
    private readonly rateLimit: InquiryRateLimit = new InquiryRateLimiter(database),
  ) {}

  async acceptInquiry(
    rawPayload: unknown,
    context: { networkKey: string; now?: Date },
  ): Promise<InquiryReceipt> {
    if (hasInquiryHoneypot(rawPayload)) return receipt(null);
    const input = parseInquiryPayload(rawPayload);

    const now = context.now ?? new Date();
    if ((await this.rateLimit.consume(context.networkKey, now)).limited) return receipt(null);
    const message = input.kind === "STANDARD" && input.productInterest
      ? `Product interest: ${input.productInterest}\n\n${input.message}`
      : input.message;

    const { lead, notificationAttemptId } = await runSerializableWithRetry(this.database, async (transaction) => {
      const duplicate = await transaction.lead.findFirst({
        where: {
          email: input.email,
          createdAt: { gte: new Date(now.getTime() - DUPLICATE_WINDOW_MS) },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      const stage = await transaction.crmStage.findFirst({ where: { code: "NEW_INQUIRY", isActive: true }, select: { id: true } });
      const suspicious = looksSuspicious(message);
      const lead = await transaction.lead.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          whatsapp: input.whatsapp,
          country: input.country,
          company: input.company,
          message,
          sourcePage: input.sourcePage,
          material: input.material,
          thickness: input.thickness,
          workingLength: input.workingLength,
          quantity: input.quantity,
          inquiryNumber: `INQ-${randomUUID().toUpperCase()}`,
          recordOrigin: "WEBSITE_FORM",
          sourceChannel: "WEBSITE",
          stageId: stage?.id,
          preSpamStageId: suspicious ? stage?.id : undefined,
          status: suspicious ? "SPAM" : "NEW",
          duplicateOfId: duplicate?.id,
        },
      });
      if (stage) await transaction.leadStageHistory.create({ data: {
        leadId: lead.id, newStageId: stage.id, newStatus: lead.status, source: "SYSTEM",
      } });
      const notification = await transaction.leadNotificationAttempt.create({
        data: { leadId: lead.id, status: "PENDING" },
      });
      return { lead, notificationAttemptId: notification.id };
    });

    let notificationResult: { status: "SENT" | "FAILED"; errorCode: string | null };
    try {
      await this.notifier.send(lead);
      notificationResult = { status: "SENT", errorCode: null };
    } catch (error) {
      notificationResult = {
        status: "FAILED",
        errorCode: error instanceof Error && error.message === "SMTP_NOT_CONFIGURED"
          ? "SMTP_NOT_CONFIGURED"
          : "DELIVERY_FAILED",
      };
    }

    try {
      await this.database.leadNotificationAttempt.update({
        where: { id: notificationAttemptId },
        data: notificationResult,
      });
    } catch (error) {
      console.error("Inquiry notification bookkeeping failed.", error instanceof Error ? error.name : "UnknownError");
    }

    return receipt(lead.id);
  }
}

export async function acceptInquiry(
  payload: unknown,
  context: { networkKey: string; now?: Date },
) {
  return new InquiryService().acceptInquiry(payload, context);
}
