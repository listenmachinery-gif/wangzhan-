export type StoragePutInput = {
  key: string;
  body: Uint8Array;
  contentType: string;
  cacheControl?: string;
};

export interface StorageAdapter {
  put(input: StoragePutInput): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
