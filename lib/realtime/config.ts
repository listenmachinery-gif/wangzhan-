import "server-only";

export type RealtimeEnvironment = "development" | "test" | "preview" | "production";

export type RealtimeConfig = {
  enabled: boolean;
  environment: RealtimeEnvironment;
  namespace: string;
  redisUrl: string | null;
  tokenSecret: string | null;
};

function realtimeEnvironment(): RealtimeEnvironment {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.VERCEL_ENV === "development") return "development";
  if (process.env.NODE_ENV === "test") return "test";
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

function enabledFromEnvironment(value: string | undefined) {
  if (value === undefined || value.trim() === "") return false;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error("REALTIME_ENABLED must be either true or false.");
}

function validateRedisUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("UPSTASH_REDIS_URL must be a valid rediss:// URL.");
  }
  if (url.protocol !== "rediss:") {
    throw new Error("UPSTASH_REDIS_URL must use rediss:// TLS.");
  }
  return value;
}

export function getRealtimeConfig(): RealtimeConfig {
  const enabled = enabledFromEnvironment(process.env.REALTIME_ENABLED);
  const environment = realtimeEnvironment();

  if (!enabled) {
    return {
      enabled: false,
      environment,
      namespace: `zyron:${environment}`,
      redisUrl: null,
      tokenSecret: null,
    };
  }

  const redisUrl = process.env.UPSTASH_REDIS_URL?.trim();
  if (!redisUrl) throw new Error("UPSTASH_REDIS_URL is required when realtime is enabled.");

  const tokenSecret = process.env.REALTIME_TOKEN_SECRET;
  if (!tokenSecret || Buffer.byteLength(tokenSecret, "utf8") < 32) {
    throw new Error("REALTIME_TOKEN_SECRET must contain at least 32 bytes when realtime is enabled.");
  }

  return {
    enabled: true,
    environment,
    namespace: `zyron:${environment}`,
    redisUrl: validateRedisUrl(redisUrl),
    tokenSecret,
  };
}

const CHANNEL_PART = /^[A-Za-z0-9_-]{1,128}$/;

export function buildRealtimeChannel(
  config: Pick<RealtimeConfig, "namespace">,
  kind: "conversation" | "admin" | "presence",
  scope: string,
) {
  if (!CHANNEL_PART.test(scope)) {
    throw new Error("Realtime channel scope must use only letters, numbers, underscores, and hyphens.");
  }
  return `${config.namespace}:${kind}:${scope}`;
}
