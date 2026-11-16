import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import { shouldRunProductionPasswordReset } from "@/lib/deployment/production-password-reset-gate";

async function main() {
  if (!shouldRunProductionPasswordReset(process.env)) {
    throw new Error("Production administrator password reset gate is closed.");
  }
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.TARGET_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.TARGET_ADMIN_PASSWORD;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  if (!email || !password || password.length < 16) throw new Error("A target administrator and 16+ character password are required.");

  const database = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const user = await database.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    const passwordHash = await hashPassword(password);
    const now = new Date();
    const result = await database.$transaction(async (transaction) => {
      await transaction.user.update({ where: { id: user.id }, data: { passwordHash, isActive: true } });
      const revoked = await transaction.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } });
      await transaction.auditLog.create({
        data: {
          action: "security.admin_password_reset",
          entityType: "User",
          entityId: user.id,
          after: { sessionsRevoked: revoked.count, resetAt: now.toISOString() },
        },
      });
      return revoked.count;
    });
    console.log(`Administrator password reset completed for ${email}; revoked sessions: ${result}.`);
  } finally {
    await database.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Administrator password reset failed.");
  process.exitCode = 1;
});
