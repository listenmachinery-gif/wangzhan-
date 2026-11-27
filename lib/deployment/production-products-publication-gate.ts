import type { DeploymentEnvironment } from "@/lib/deployment/production-migration-gate";

export function shouldRunProductionProductsPublication(environment: DeploymentEnvironment) {
  return environment.VERCEL_ENV === "production"
    && environment.ZYRON_PRODUCTION_CHANGE_AUTHORIZED === "true"
    && environment.ZYRON_PRODUCTS_RELEASE === "APPROVED_2026_11_27";
}
