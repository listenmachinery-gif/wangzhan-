import type { DeploymentEnvironment } from "@/lib/deployment/production-migration-gate";

export function shouldRunProductionPasswordReset(environment: DeploymentEnvironment) {
  return environment.VERCEL_ENV === "production"
    && environment.ZYRON_PRODUCTION_CHANGE_AUTHORIZED === "true"
    && environment.ALLOW_PRODUCTION_PASSWORD_RESET === "approved-once";
}
