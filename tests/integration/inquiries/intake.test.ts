import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db/client";
import { resetTestDatabase } from "@/lib/db/test-database";
import { InquiryRateLimiter } from "@/lib/services/inquiry-rate-limit";
import {
  InquiryService,
  type InquiryNotifier,
  type InquiryRateLimit,
} from "@/lib/services/inquiry-service";

const validInquiry = {
  name: "Alex Buyer",
  company: "Acme Fabrication",
  email: "alex@example.com",
  whatsapp: "+1 202 555 0123",
  country: "United States",
  productInterest: "Hydraulic Shears",
  requirement: "Please quote a 3200 mm machine for 6 mm mild steel.",
  website: "",
};

class RecordingNotifier implements InquiryNotifier {
  readonly leadIds: string[] = [];

  constructor(
    private readonly beforeResult?: (leadId: string) => Promise<void>,
    private readonly failure?: Error,
  ) {}

  async send(lead: { id: string }) {
    this.leadIds.push(lead.id);
    await this.beforeResult?.(lead.id);
    if (this.failure) throw this.failure;
  }
}

const allowEveryAttempt: InquiryRateLimit = {
  async consume() {
    return { limited: false };
  },
};

describe("durable inquiry intake", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(() => db.$disconnect());

  it("commits the lead and pending notification attempt before invoking SMTP", async () => {
    const notifier = new RecordingNotifier(async (leadId) => {
      await expect(db.lead.findUnique({ where: { id: leadId } })).resolves.toMatchObject({
        email: "alex@example.com",
        status: "NEW",
      });
      await expect(db.leadNotificationAttempt.findFirst({ where: { leadId } })).resolves.toMatchObject({
        status: "PENDING",
      });
    });
    const service = new InquiryService(db, notifier, allowEveryAttempt);

    const receipt = await service.acceptInquiry(validInquiry, { networkKey: "203.0.113.10" });

    expect(receipt).toMatchObject({ accepted: true, stored: true, leadId: expect.any(String) });
    if (!receipt.stored) throw new Error("Expected the valid inquiry to be stored.");
    expect(notifier.leadIds).toEqual([receipt.leadId]);
    await expect(db.leadNotificationAttempt.findFirstOrThrow({ where: { leadId: receipt.leadId } })).resolves.toMatchObject({
      status: "SENT",
      errorCode: null,
    });
  });

  it("keeps a durable receipt and records failure when SMTP fails", async () => {
    const notifier = new RecordingNotifier(undefined, new Error("mailbox password was rejected"));
    const service = new InquiryService(db, notifier, allowEveryAttempt);

    await expect(service.acceptInquiry(validInquiry, { networkKey: "203.0.113.11" })).resolves.toMatchObject({
      accepted: true,
      stored: true,
      leadId: expect.any(String),
    });
    await expect(db.lead.count()).resolves.toBe(1);
    await expect(db.leadNotificationAttempt.findFirstOrThrow()).resolves.toMatchObject({
      status: "FAILED",
      errorCode: "DELIVERY_FAILED",
    });
  });

  it("does not mislabel delivered mail when notification bookkeeping fails", async () => {
    const notifier = new RecordingNotifier();
    const service = new InquiryService(db, notifier, allowEveryAttempt);
    const update = vi.spyOn(db.leadNotificationAttempt, "update").mockRejectedValueOnce(new Error("write unavailable"));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const receipt = await service.acceptInquiry(validInquiry, { networkKey: "203.0.113.18" });

    expect(receipt).toMatchObject({ accepted: true, stored: true });
    expect(notifier.leadIds).toHaveLength(1);
    await expect(db.leadNotificationAttempt.findFirstOrThrow()).resolves.toMatchObject({
      status: "PENDING",
      errorCode: null,
    });
    expect(log).toHaveBeenCalledWith("Inquiry notification bookkeeping failed.", "Error");
    update.mockRestore();
    log.mockRestore();
  });

  it("never sends mail when the lead transaction fails", async () => {
    const notifier = new RecordingNotifier();
    const service = new InquiryService(db, notifier, allowEveryAttempt);
    const transaction = vi.spyOn(db, "$transaction").mockRejectedValueOnce(new Error("database unavailable"));

    await expect(service.acceptInquiry(validInquiry, { networkKey: "203.0.113.12" })).rejects.toThrow("database unavailable");
    expect(notifier.leadIds).toEqual([]);
    await expect(db.lead.count()).resolves.toBe(0);
    transaction.mockRestore();
  });

  it("marks a recent same-email submission as a duplicate without dropping it", async () => {
    const service = new InquiryService(db, new RecordingNotifier(), allowEveryAttempt);
    const first = await service.acceptInquiry(validInquiry, { networkKey: "203.0.113.13" });
    const second = await service.acceptInquiry(
      { ...validInquiry, requirement: "Following up with a drawing." },
      { networkKey: "203.0.113.13" },
    );
    if (!first.stored || !second.stored) throw new Error("Expected both valid inquiries to be stored.");

    await expect(db.lead.findUniqueOrThrow({ where: { id: second.leadId } })).resolves.toMatchObject({
      duplicateOfId: first.leadId,
    });
    await expect(db.lead.count()).resolves.toBe(2);
  });

  it("returns a generic receipt but creates no lead for honeypots and limited clients", async () => {
    const notifier = new RecordingNotifier();
    const blocked: InquiryRateLimit = { async consume() { return { limited: true }; } };
    const service = new InquiryService(db, notifier, blocked);

    const limited = await service.acceptInquiry(validInquiry, { networkKey: "203.0.113.14" });
    const honeypot = await new InquiryService(db, notifier, allowEveryAttempt).acceptInquiry(
      { ...validInquiry, website: "https://spam.example" },
      { networkKey: "203.0.113.15" },
    );

    expect(limited).toMatchObject({ accepted: true, stored: false, leadId: null });
    expect(honeypot).toMatchObject({ accepted: true, stored: false, leadId: null });
    expect(limited.reference).toMatch(/^inq_[a-f0-9]{24}$/);
    expect(honeypot.reference).toMatch(/^inq_[a-f0-9]{24}$/);
    await expect(db.lead.count()).resolves.toBe(0);
    expect(notifier.leadIds).toEqual([]);
  });

  it("accepts a honeypot-only payload without revealing validation details", async () => {
    const notifier = new RecordingNotifier();
    const receipt = await new InquiryService(db, notifier, allowEveryAttempt).acceptInquiry(
      { website: "https://automated-submitter.example" },
      { networkKey: "203.0.113.17" },
    );

    expect(receipt).toMatchObject({ accepted: true, stored: false, leadId: null });
    await expect(db.lead.count()).resolves.toBe(0);
    expect(notifier.leadIds).toEqual([]);
  });

  it("stores suspicious but plausible submissions as SPAM for review", async () => {
    const service = new InquiryService(db, new RecordingNotifier(), allowEveryAttempt);
    const receipt = await service.acceptInquiry({
      ...validInquiry,
      requirement: "See https://one.example https://two.example https://three.example https://four.example",
    }, { networkKey: "203.0.113.16" });
    if (!receipt.stored) throw new Error("Expected the suspicious inquiry to be stored for review.");

    await expect(db.lead.findUniqueOrThrow({ where: { id: receipt.leadId } })).resolves.toMatchObject({
      status: "SPAM",
    });
  });

  it("persists rate-limit attempts so a new limiter instance still blocks the client", async () => {
    const first = new InquiryRateLimiter(db, { maximum: 2, windowMs: 60_000 });
    await expect(first.consume("198.51.100.5", new Date("2026-11-15T10:00:00.000Z"))).resolves.toEqual({ limited: false });
    await expect(first.consume("198.51.100.5", new Date("2026-11-15T10:00:01.000Z"))).resolves.toEqual({ limited: false });

    const afterRestart = new InquiryRateLimiter(db, { maximum: 2, windowMs: 60_000 });
    await expect(afterRestart.consume("198.51.100.5", new Date("2026-11-15T10:00:02.000Z"))).resolves.toEqual({ limited: true });
    await expect(db.auditLog.count({ where: { action: "inquiry.attempt" } })).resolves.toBe(3);
  });

  it("serializes concurrent rate-limit consumption without exceeding the allowance", async () => {
    const limiter = new InquiryRateLimiter(db, { maximum: 3, windowMs: 60_000 });
    const results = await Promise.all(Array.from({ length: 6 }, (_, index) => limiter.consume(
      "198.51.100.9",
      new Date(`2026-11-15T10:00:0${index}.000Z`),
    )));
    expect(results.filter(({ limited }) => !limited)).toHaveLength(3);
    expect(results.filter(({ limited }) => limited)).toHaveLength(3);
  });

  it("marks every concurrent same-email submission after the first as a duplicate", async () => {
    const service = new InquiryService(db, new RecordingNotifier(), allowEveryAttempt);
    const receipts = await Promise.all(Array.from({ length: 6 }, (_, index) => service.acceptInquiry(
      { ...validInquiry, requirement: `Concurrent request ${index}` },
      { networkKey: `203.0.113.${30 + index}` },
    )));
    expect(receipts.every(({ stored }) => stored)).toBe(true);
    const leads = await db.lead.findMany({ where: { email: validInquiry.email } });
    expect(leads.filter(({ duplicateOfId }) => duplicateOfId === null)).toHaveLength(1);
    expect(leads.filter(({ duplicateOfId }) => duplicateOfId !== null)).toHaveLength(5);
  });
});
