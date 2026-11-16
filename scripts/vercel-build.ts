import { spawnSync } from "node:child_process";

import { shouldRunProductionMigrations } from "@/lib/deployment/production-migration-gate";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (shouldRunProductionMigrations(process.env)) {
  console.log("Approved one-time Production migration gate is active.");
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npx", ["tsx", "prisma/seed-rbac.ts"]);
}

run("npm", ["run", "build"]);
