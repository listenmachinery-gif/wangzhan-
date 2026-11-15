import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { seedRbac } from "@/prisma/seed-rbac";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "ZYRON Administrator";

  if (!connectionString) throw new Error("DATABASE_URL is required.");
  if (!email || !password || password.length < 12) {
    throw new Error("Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (minimum 12 characters). ");
  }
  if (process.env.NODE_ENV === "production" && (
    process.env.ALLOW_PRODUCTION_BOOTSTRAP !== "true"
    || process.env.ZYRON_PRODUCTION_CHANGE_AUTHORIZED !== "true"
  )) {
    throw new Error("Production bootstrap requires both explicit production authorization gates.");
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await seedRbac(db);
    const role = await db.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
    const passwordHash = await hashPassword(password);
    const user = await db.user.upsert({
      where: { email },
      update: { name, passwordHash, isActive: true },
      create: { email, name, passwordHash },
    });
    await db.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
    console.log(`Bootstrapped Super Admin: ${email}`);
  } finally {
    await db.$disconnect();
  }
}

main();
