import { db } from "@/lib/db/client";
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "@/lib/auth/permissions";

export async function seedRbac() {
  for (const permission of PERMISSIONS) {
    await db.permission.upsert({
      where: { key: permission },
      update: { description: permission },
      create: { key: permission, description: permission },
    });
  }

  for (const roleKey of ROLES) {
    const role = await db.role.upsert({
      where: { key: roleKey },
      update: { name: roleKey.replaceAll("_", " ") },
      create: { key: roleKey, name: roleKey.replaceAll("_", " ") },
    });
    const keys = Object.keys(ROLE_PERMISSIONS[roleKey]);
    const permissions = await db.permission.findMany({ where: { key: { in: keys } } });
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    await db.rolePermission.createMany({
      data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
      skipDuplicates: true,
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRbac().finally(() => db.$disconnect());
}
