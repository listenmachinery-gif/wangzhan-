export type DeploymentEnvironment = Record<string, string | undefined>;

export function shouldRunProductionMigrations(environment: DeploymentEnvironment) {
  return environment.VERCEL_ENV === "production"
    && environment.ZYRON_PRODUCTION_CHANGE_AUTHORIZED === "true"
    && environment.ALLOW_PRODUCTION_MIGRATIONS === "approved-once";
}
