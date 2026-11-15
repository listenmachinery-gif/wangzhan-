import { db } from "@/lib/db/client";

function assertTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl || !testDatabaseUrl || databaseUrl !== testDatabaseUrl) {
    throw new Error("Test reset requires DATABASE_URL to exactly match TEST_DATABASE_URL.");
  }

  const databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");

  if (!databaseName.endsWith("_test")) {
    throw new Error("Refusing to reset a database whose name does not end with _test.");
  }
}

export async function resetTestDatabase() {
  assertTestDatabase();

  await db.$transaction([
    db.leadNotificationAttempt.deleteMany(),
    db.leadActivity.deleteMany(),
    db.leadAssignment.deleteMany(),
    db.lead.deleteMany(),
    db.seoRecord.deleteMany(),
    db.banner.deleteMany(),
    db.mediaReference.deleteMany(),
    db.mediaAsset.deleteMany(),
    db.specificationValue.deleteMany(),
    db.specificationField.deleteMany(),
    db.specificationTemplate.deleteMany(),
    db.productModel.deleteMany(),
    db.productSection.deleteMany(),
    db.product.deleteMany(),
    db.productCategory.deleteMany(),
    db.siteSetting.deleteMany(),
    db.auditLog.deleteMany(),
    db.loginAttempt.deleteMany(),
    db.session.deleteMany(),
    db.rolePermission.deleteMany(),
    db.userRole.deleteMany(),
    db.permission.deleteMany(),
    db.role.deleteMany(),
    db.user.deleteMany(),
  ]);
}
