import "server-only";

type EnvironmentVariable =
  | "NEXT_PUBLIC_GA4_MEASUREMENT_ID"
  | "GOOGLE_ANALYTICS_PROPERTY_ID"
  | "GOOGLE_SEARCH_CONSOLE_SITE_URL"
  | "GOOGLE_SERVICE_ACCOUNT_EMAIL"
  | "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY";

export type GoogleConfigIssue = {
  code: "MISSING_ENV" | "INVALID_ENV";
  variable: EnvironmentVariable;
};

export type GoogleConfigSection<T> =
  | { state: "configured"; value: T }
  | { state: "not_configured" | "invalid"; issues: GoogleConfigIssue[] };

export type GoogleIntegrationConfig = {
  tracking: GoogleConfigSection<{ measurementId: string }>;
  ga4: GoogleConfigSection<{ propertyId: string }>;
  searchConsole: GoogleConfigSection<{ siteUrl: string }>;
  credentials: GoogleConfigSection<{ clientEmail: string; privateKey: string }>;
};

function singleValueSection<T>(
  environment: NodeJS.ProcessEnv,
  variable: EnvironmentVariable,
  validate: (value: string) => T | null,
): GoogleConfigSection<T> {
  const rawValue = environment[variable]?.trim();
  if (!rawValue) {
    return { state: "not_configured", issues: [{ code: "MISSING_ENV", variable }] };
  }
  const value = validate(rawValue);
  return value === null
    ? { state: "invalid", issues: [{ code: "INVALID_ENV", variable }] }
    : { state: "configured", value };
}

function credentialsSection(environment: NodeJS.ProcessEnv): GoogleIntegrationConfig["credentials"] {
  const clientEmail = environment.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = environment.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  const missing: GoogleConfigIssue[] = [];
  if (!clientEmail) missing.push({ code: "MISSING_ENV", variable: "GOOGLE_SERVICE_ACCOUNT_EMAIL" });
  if (!rawPrivateKey) missing.push({ code: "MISSING_ENV", variable: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" });
  if (missing.length > 0) return { state: "not_configured", issues: missing };

  if (!/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/i.test(clientEmail!)) {
    return {
      state: "invalid",
      issues: [{ code: "INVALID_ENV", variable: "GOOGLE_SERVICE_ACCOUNT_EMAIL" }],
    };
  }

  const privateKey = rawPrivateKey!.replaceAll("\\n", "\n");
  if (!/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/.test(privateKey)) {
    return {
      state: "invalid",
      issues: [{ code: "INVALID_ENV", variable: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" }],
    };
  }

  return { state: "configured", value: { clientEmail: clientEmail!, privateKey } };
}

export function readGoogleIntegrationConfig(
  environment: NodeJS.ProcessEnv = process.env,
): GoogleIntegrationConfig {
  return {
    tracking: singleValueSection(environment, "NEXT_PUBLIC_GA4_MEASUREMENT_ID", (measurementId) =>
      /^G-[A-Z0-9]+$/.test(measurementId) ? { measurementId } : null),
    ga4: singleValueSection(environment, "GOOGLE_ANALYTICS_PROPERTY_ID", (propertyId) =>
      /^\d+$/.test(propertyId) ? { propertyId } : null),
    searchConsole: singleValueSection(environment, "GOOGLE_SEARCH_CONSOLE_SITE_URL", (siteUrl) =>
      siteUrl === "sc-domain:zyroncnc.com" ? { siteUrl } : null),
    credentials: credentialsSection(environment),
  };
}
