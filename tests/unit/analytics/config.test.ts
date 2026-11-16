import { describe, expect, it } from "vitest";

import { readGoogleIntegrationConfig } from "@/lib/analytics/config";

const privateKey = [
  "-----BEGIN PRIVATE KEY-----",
  "c2FmZS10ZXN0LWtleS1ub3QtYS1yZWFsLWNyZWRlbnRpYWw=",
  "-----END PRIVATE KEY-----",
].join("\n");

function validEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-ABC123XYZ9",
    GOOGLE_ANALYTICS_PROPERTY_ID: "123456789",
    GOOGLE_SEARCH_CONSOLE_SITE_URL: "sc-domain:zyroncnc.com",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "zyron-reports@example.iam.gserviceaccount.com",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey.replaceAll("\n", "\\n"),
  };
}

describe("readGoogleIntegrationConfig", () => {
  it("returns four independently configured sections for valid input", () => {
    const config = readGoogleIntegrationConfig(validEnvironment());

    expect(config.tracking).toEqual({
      state: "configured",
      value: { measurementId: "G-ABC123XYZ9" },
    });
    expect(config.ga4).toEqual({
      state: "configured",
      value: { propertyId: "123456789" },
    });
    expect(config.searchConsole).toEqual({
      state: "configured",
      value: { siteUrl: "sc-domain:zyroncnc.com" },
    });
    expect(config.credentials).toEqual({
      state: "configured",
      value: {
        clientEmail: "zyron-reports@example.iam.gserviceaccount.com",
        privateKey,
      },
    });
  });

  it.each([
    ["NEXT_PUBLIC_GA4_MEASUREMENT_ID", "tracking"],
    ["GOOGLE_ANALYTICS_PROPERTY_ID", "ga4"],
    ["GOOGLE_SEARCH_CONSOLE_SITE_URL", "searchConsole"],
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "credentials"],
    ["GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "credentials"],
  ] as const)("reports only %s as missing from its owning section", (variable, section) => {
    const environment = validEnvironment();
    delete environment[variable];

    const config = readGoogleIntegrationConfig(environment);

    expect(config[section]).toMatchObject({
      state: "not_configured",
      issues: [{ code: "MISSING_ENV", variable }],
    });
    for (const otherSection of ["tracking", "ga4", "searchConsole", "credentials"] as const) {
      if (otherSection !== section) expect(config[otherSection].state).toBe("configured");
    }
  });

  it.each([
    ["NEXT_PUBLIC_GA4_MEASUREMENT_ID", "UA-123", "tracking"],
    ["GOOGLE_ANALYTICS_PROPERTY_ID", "properties/123", "ga4"],
    ["GOOGLE_SEARCH_CONSOLE_SITE_URL", "https://www.zyroncnc.com/", "searchConsole"],
  ] as const)("rejects invalid %s without affecting unrelated sections", (variable, value, section) => {
    const environment = validEnvironment();
    environment[variable] = value;

    const config = readGoogleIntegrationConfig(environment);

    expect(config[section]).toMatchObject({
      state: "invalid",
      issues: [{ code: "INVALID_ENV", variable }],
    });
  });

  it("rejects malformed private keys without serializing their contents", () => {
    const environment = validEnvironment();
    const secretText = "super-secret-key-material";
    environment.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = secretText;

    const config = readGoogleIntegrationConfig(environment);
    const serialized = JSON.stringify(config.credentials);

    expect(config.credentials).toEqual({
      state: "invalid",
      issues: [{ code: "INVALID_ENV", variable: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" }],
    });
    expect(serialized).not.toContain(secretText);
  });
});
