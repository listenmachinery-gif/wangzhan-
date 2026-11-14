import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { db?: PrismaClient };

function createClient() {
  // Prisma constructs its adapter while Next.js collects route modules during
  // `next build`. An unreachable placeholder keeps credential-free builds
  // possible; any runtime query still fails visibly until DATABASE_URL exists.
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://invalid:invalid@127.0.0.1:1/zyron_cms_unconfigured";

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const db = globalForPrisma.db ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
