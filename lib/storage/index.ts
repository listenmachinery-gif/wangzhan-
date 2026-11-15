import { LocalTestStorageAdapter } from "@/lib/storage/local-test-storage";
import { createS3StorageFromEnvironment } from "@/lib/storage/s3-storage";
import type { StorageAdapter } from "@/lib/storage/storage-adapter";

let storage: StorageAdapter | undefined;

export function getStorageAdapter(): StorageAdapter {
  if (storage) return storage;
  if (process.env.OBJECT_STORAGE_DRIVER === "local") {
    storage = new LocalTestStorageAdapter(process.env.OBJECT_STORAGE_LOCAL_DIR ?? ".storage-test");
  } else {
    storage = createS3StorageFromEnvironment();
  }
  return storage;
}
