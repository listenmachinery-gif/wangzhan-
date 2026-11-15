import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

import type { StorageAdapter, StoragePutInput } from "@/lib/storage/storage-adapter";

export type S3StorageConfig = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  credentials?: S3ClientConfig["credentials"];
};

export class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;

  constructor(private readonly config: S3StorageConfig) {
    const staticCredentials = config.accessKeyId && config.secretAccessKey
      ? {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        }
      : undefined;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: Boolean(config.endpoint),
      credentials: config.credentials ?? staticCredentials,
    });
  }

  async put(input: StoragePutInput) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        CacheControl: input.cacheControl,
        IfNoneMatch: "*",
      }),
    );
  }

  async getSignedUrl(key: string, expiresInSeconds = 900) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }
}

type OidcCredentialsFactory = (
  roleArn: string,
  region: string,
) => NonNullable<S3ClientConfig["credentials"]>;

export function resolveS3StorageEnvironment(
  oidcCredentialsFactory: OidcCredentialsFactory = (roleArn) =>
    awsCredentialsProvider({ roleArn }),
): S3StorageConfig {
  const staticConfiguration = {
    bucket: process.env.OBJECT_STORAGE_BUCKET,
    accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY,
  };

  if (Object.values(staticConfiguration).some(Boolean)) {
    const missing = Object.entries(staticConfiguration)
      .filter(([, value]) => !value)
      .map(([name]) => name);
    if (missing.length) {
      throw new Error(`Missing object storage configuration: ${missing.join(", ")}`);
    }

    return {
      endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
      region: process.env.OBJECT_STORAGE_REGION ?? "auto",
      bucket: staticConfiguration.bucket!,
      accessKeyId: staticConfiguration.accessKeyId!,
      secretAccessKey: staticConfiguration.secretAccessKey!,
    };
  }

  const marketplaceConfiguration = {
    bucket: process.env.S3_BUCKET_NAME,
    region: process.env.AWS_REGION,
    roleArn: process.env.AWS_ROLE_ARN,
  };
  const missing = Object.entries(marketplaceConfiguration)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing object storage configuration: ${missing.join(", ")}`);
  }

  return {
    region: marketplaceConfiguration.region!,
    bucket: marketplaceConfiguration.bucket!,
    credentials: oidcCredentialsFactory(
      marketplaceConfiguration.roleArn!,
      marketplaceConfiguration.region!,
    ),
  };
}

export function createS3StorageFromEnvironment() {
  return new S3StorageAdapter(resolveS3StorageEnvironment());
}
