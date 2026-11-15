ALTER TABLE "MediaAsset"
ADD COLUMN "usage" TEXT NOT NULL DEFAULT 'EDITORIAL_IMAGE';

ALTER TABLE "MediaAsset"
ALTER COLUMN "usage" DROP DEFAULT;

DROP INDEX IF EXISTS "MediaAsset_checksum_idx";
CREATE UNIQUE INDEX "MediaAsset_checksum_key" ON "MediaAsset"("checksum");
