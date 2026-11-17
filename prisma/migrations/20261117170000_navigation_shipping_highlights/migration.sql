CREATE TYPE "ShippingMediaRole" AS ENUM ('COVER', 'LOADING', 'EQUIPMENT', 'VIDEO');

CREATE TABLE "NavigationDocument" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "draftContent" JSONB NOT NULL,
    "publishedContent" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedVersion" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NavigationDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NavigationVersion" (
    "id" TEXT NOT NULL,
    "navigationDocumentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "NavigationVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingHighlight" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "slugLocked" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "draftContent" JSONB NOT NULL,
    "publishedContent" JSONB,
    "publishedVersion" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "publishedShipmentDate" TIMESTAMP(3),
    "publishedCountryCode" TEXT,
    "publishedCategorySlug" TEXT,
    "categoryId" TEXT,
    "productId" TEXT,
    "coverMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShippingHighlight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingHighlightVersion" (
    "id" TEXT NOT NULL,
    "shippingHighlightId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "ShippingHighlightVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingMedia" (
    "id" TEXT NOT NULL,
    "shippingHighlightId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "role" "ShippingMediaRole" NOT NULL,
    "position" INTEGER NOT NULL,
    "caption" TEXT,
    "altText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShippingMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NavigationDocument_key_key" ON "NavigationDocument"("key");
CREATE INDEX "NavigationDocument_status_updatedAt_idx" ON "NavigationDocument"("status", "updatedAt");
CREATE UNIQUE INDEX "NavigationVersion_navigationDocumentId_version_key" ON "NavigationVersion"("navigationDocumentId", "version");
CREATE INDEX "NavigationVersion_navigationDocumentId_createdAt_idx" ON "NavigationVersion"("navigationDocumentId", "createdAt");
CREATE INDEX "NavigationVersion_createdById_createdAt_idx" ON "NavigationVersion"("createdById", "createdAt");

CREATE UNIQUE INDEX "ShippingHighlight_slug_key" ON "ShippingHighlight"("slug");
CREATE INDEX "ShippingHighlight_status_publishedShipmentDate_idx" ON "ShippingHighlight"("status", "publishedShipmentDate");
CREATE INDEX "ShippingHighlight_publishedCountryCode_publishedShipmentDate_idx" ON "ShippingHighlight"("publishedCountryCode", "publishedShipmentDate");
CREATE INDEX "ShippingHighlight_publishedCategorySlug_publishedShipmentDate_idx" ON "ShippingHighlight"("publishedCategorySlug", "publishedShipmentDate");
CREATE INDEX "ShippingHighlight_categoryId_idx" ON "ShippingHighlight"("categoryId");
CREATE INDEX "ShippingHighlight_productId_idx" ON "ShippingHighlight"("productId");
CREATE INDEX "ShippingHighlight_coverMediaId_idx" ON "ShippingHighlight"("coverMediaId");

CREATE UNIQUE INDEX "ShippingHighlightVersion_shippingHighlightId_version_key" ON "ShippingHighlightVersion"("shippingHighlightId", "version");
CREATE INDEX "ShippingHighlightVersion_shippingHighlightId_createdAt_idx" ON "ShippingHighlightVersion"("shippingHighlightId", "createdAt");
CREATE INDEX "ShippingHighlightVersion_createdById_createdAt_idx" ON "ShippingHighlightVersion"("createdById", "createdAt");

CREATE UNIQUE INDEX "ShippingMedia_shippingHighlightId_role_position_key" ON "ShippingMedia"("shippingHighlightId", "role", "position");
CREATE INDEX "ShippingMedia_shippingHighlightId_position_idx" ON "ShippingMedia"("shippingHighlightId", "position");
CREATE INDEX "ShippingMedia_mediaAssetId_idx" ON "ShippingMedia"("mediaAssetId");

ALTER TABLE "NavigationVersion" ADD CONSTRAINT "NavigationVersion_navigationDocumentId_fkey" FOREIGN KEY ("navigationDocumentId") REFERENCES "NavigationDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NavigationVersion" ADD CONSTRAINT "NavigationVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShippingHighlight" ADD CONSTRAINT "ShippingHighlight_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShippingHighlight" ADD CONSTRAINT "ShippingHighlight_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShippingHighlight" ADD CONSTRAINT "ShippingHighlight_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShippingHighlightVersion" ADD CONSTRAINT "ShippingHighlightVersion_shippingHighlightId_fkey" FOREIGN KEY ("shippingHighlightId") REFERENCES "ShippingHighlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingHighlightVersion" ADD CONSTRAINT "ShippingHighlightVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShippingMedia" ADD CONSTRAINT "ShippingMedia_shippingHighlightId_fkey" FOREIGN KEY ("shippingHighlightId") REFERENCES "ShippingHighlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingMedia" ADD CONSTRAINT "ShippingMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
