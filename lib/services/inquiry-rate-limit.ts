import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";

import { db } from "@/lib/db/client";

const DEFAULT_WINDOW_MS = 15 * 60 * 1_000;
const DEFAULT_MAXIMUM = 5;

function networkHash(networkKey: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters for inquiry throttling.");
  }
  return createHmac("sha256", secret).update(networkKey.trim().toLowerCase()).digest("hex");
}

export class InquiryRateLimiter {
  private readonly maximum: number;
  private readonly windowMs: number;

  constructor(
    private readonly database: PrismaClient = db,
    options: { maximum?: number; windowMs?: number } = {},
  ) {
    this.maximum = options.maximum ?? DEFAULT_MAXIMUM;
    this.windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  }

  async consume(networkKey: string, now = new Date()) {
    const ipHash = networkHash(networkKey);
    const since = new Date(now.getTime() - this.windowMs);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        return await this.database.$transaction(async (transaction) => {
          const attempts = await transaction.auditLog.count({
            where: { action: "inquiry.attempt", ipHash, createdAt: { gte: since } },
          });
          const limited = attempts >= this.maximum;
          await transaction.auditLog.create({
            data: {
              action: "inquiry.attempt",
              entityType: "InquiryAttempt",
              entityId: randomUUID(),
              ipHash,
              after: { limited },
              createdAt: now,
            },
          });
          return { limited };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const retryable = (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
          || (error instanceof Error && error.message.includes("TransactionWriteConflict"));
        if (!retryable || attempt === 7) throw error;
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 5));
      }
    }
    throw new Error("Serializable rate-limit transaction exhausted retries.");
  }
}
