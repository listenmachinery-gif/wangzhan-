import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { seedRbac } from "@/prisma/seed-rbac";

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "ZYRON Administrator";

  if (!email || !password || password.length < 12) {
    throw new Error("Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (minimum 12 characters). ");
  }
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_BOOTSTRAP !== "true") {
    throw new Error("Production bootstrap requires explicit ALLOW_PRODUCTION_BOOTSTRAP=true authorization.");
  }

  await seedRbac();
  const role = await db.role.findUniqueOrThrow({ where: { key: "SUPER_ADMIN" } });
  const user = await db.user.upsert({
    where: { email },
    update: { name, passwordHash: await hashPassword(password), isActive: true },
    create: { email, name, passwordHash: await hashPassword(password) },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  console.log(`Bootstrapped Super Admin: ${email}`);
}

main().finally(() => db.$disconnect());
