import "server-only";

import { GoogleAuth } from "google-auth-library";

export const GOOGLE_REPORTING_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
] as const;

export type AccessTokenProvider = {
  getAccessToken(): Promise<string>;
};

export function createGoogleAccessTokenProvider(credentials: {
  clientEmail: string;
  privateKey: string;
}): AccessTokenProvider {
  const auth = new GoogleAuth({
    credentials: {
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
    scopes: [...GOOGLE_REPORTING_SCOPES],
  });

  return {
    async getAccessToken() {
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      const token = typeof accessToken === "string" ? accessToken : accessToken.token;
      if (!token) throw new Error("GOOGLE_ACCESS_TOKEN_UNAVAILABLE");
      return token;
    },
  };
}
