import { pathToFileURL } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "@/lib/auth/permissions";

export async function seedRbac(db: PrismaClient) {
  for (const permission of PERMISSIONS) {
    await db.permission.upsert({
      where: { key: permission },
      update: { description: permission },
      create: { key: permission, description: permission },
    });
  }

  for (const roleKey of ROLES) {
    const keys = Object.keys(ROLE_PERMISSIONS[roleKey]);
    const permissions = await db.permission.findMany({
      where: { key: { in: keys } },
      select: { id: true },
    });
    if (permissions.length !== keys.length) {
      throw new Error(`Cannot seed role ${roleKey} without all required permissions.`);
    }

    const roleData = {
      name: roleKey.replaceAll("_", " "),
      permissions: {
        createMany: {
          data: permissions.map(({ id }) => ({ permissionId: id })),
          skipDuplicates: true,
        },
      },
    };
    await db.role.upsert({
      where: { key: roleKey },
      update: roleData,
      create: { key: roleKey, ...roleData },
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const cliDb = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  seedRbac(cliDb).finally(() => cliDb.$disconnect());
}
